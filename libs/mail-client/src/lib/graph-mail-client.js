var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var graph_mail_client_exports = {};
__export(graph_mail_client_exports, {
  GraphMailClient: () => GraphMailClient
});
module.exports = __toCommonJS(graph_mail_client_exports);
var https = __toESM(require("https"));
var import_url = require("url");
var import_logger = require("@transai/logger");
var import_html_to_text = require("html-to-text");
var import_mail_token = require("./mail-token");
class GraphMailClient {
  // e.g. https://graph.microsoft.com/v1.0/users/{user}
  constructor(config) {
    this.config = config;
    this.config = config;
    this.#logger = import_logger.Logger.getInstance();
    this.base = `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(
      this.config.username
    )}`;
  }
  #logger;
  async init() {
    this.#logger.info(`Initializing Graph mail for ${this.config.username}`);
    if (!this.config.tenantId || !this.config.clientId || !this.config.clientSecret) {
      throw new Error("Graph requires tenantId, clientId, and clientSecret");
    }
    this.token = await (0, import_mail_token.getAccessToken)(
      this.config.tenantId,
      this.config.clientId,
      this.config.clientSecret
    );
    await this.getFolderId("Inbox");
    this.#logger.info("Graph mail client initialized");
  }
  // ---------- Node https helper (no fetch) ----------
  async graphRequest(urlStr, method, body, extraHeaders) {
    if (!this.token)
      throw new Error("Graph token missing (call init())");
    const url = new import_url.URL(urlStr);
    const payload = body === void 0 ? void 0 : Buffer.from(JSON.stringify(body), "utf-8");
    const options = {
      method,
      hostname: url.hostname,
      path: url.pathname + url.search,
      protocol: url.protocol,
      port: url.port || 443,
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
        ...payload ? { "Content-Length": String(payload.length) } : {},
        ...extraHeaders || {}
      }
    };
    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        const chunks = [];
        res.on("data", (d) => chunks.push(Buffer.from(d)));
        res.on("end", () => {
          const status = res.statusCode || 0;
          const raw = Buffer.concat(chunks).toString("utf-8");
          if (status >= 200 && status < 300) {
            if (!raw)
              return resolve(void 0);
            try {
              resolve(JSON.parse(raw));
            } catch {
              resolve(void 0);
            }
          } else if (status === 204) {
            resolve(void 0);
          } else {
            reject(
              new Error(
                `Graph ${method} ${url.pathname}${url.search} failed: ${status} ${raw}`
              )
            );
          }
        });
      });
      req.on("error", reject);
      if (payload)
        req.write(payload);
      req.end();
    });
  }
  async getFolderId(displayName) {
    const wellKnown = displayName.toLowerCase();
    if ([
      "inbox",
      "drafts",
      "sent items",
      "deleted items",
      "archive",
      "junk email"
    ].includes(wellKnown)) {
      const url2 = `${this.base}/mailFolders/${encodeURIComponent(displayName)}`;
      const data2 = await this.graphRequest(url2, "GET");
      if (!data2?.id)
        throw new Error(`Folder not found: ${displayName}`);
      return data2.id;
    }
    const url = `${this.base}/mailFolders?$top=100`;
    const data = await this.graphRequest(url, "GET");
    const found = data?.value?.find(
      (f) => f.displayName?.toLowerCase() === wellKnown
    ) || null;
    if (!found)
      throw new Error(`Folder not found: ${displayName}`);
    return found.id;
  }
  static extractAddresses(list) {
    if (!list?.length)
      return void 0;
    const out = list.map((x) => x.emailAddress?.address).filter(Boolean);
    return out.length ? out : void 0;
  }
  static addressOne(obj) {
    const v = obj?.emailAddress?.address;
    return v ? [v] : void 0;
  }
  static toMailMessage(m) {
    const received = m.receivedDateTime ? new Date(m.receivedDateTime) : /* @__PURE__ */ new Date();
    const uid = received.getTime();
    const html = m.body?.contentType === "HTML" ? m.body.content : void 0;
    const text = m.body?.contentType === "Text" ? m.body.content : html ? (0, import_html_to_text.htmlToText)(html) : m.bodyPreview || "";
    const hdr = m.internetMessageHeaders || [];
    const inReplyTo = hdr.find(
      (h) => h.name.toLowerCase() === "in-reply-to"
    )?.value;
    const references = hdr.find(
      (h) => h.name.toLowerCase() === "references"
    )?.value;
    return {
      uid,
      attachments: [],
      subject: m.subject,
      references,
      date: received,
      to: GraphMailClient.extractAddresses(m.toRecipients),
      from: GraphMailClient.addressOne(m.from),
      cc: GraphMailClient.extractAddresses(m.ccRecipients),
      bcc: GraphMailClient.extractAddresses(m.bccRecipients),
      messageId: m.internetMessageId,
      inReplyTo,
      replyTo: GraphMailClient.extractAddresses(m.replyTo),
      text: (text || "").trim(),
      html
    };
  }
  async listMessages(folderId, fromEpochMs) {
    const iso = new Date(fromEpochMs).toISOString();
    const $select = "id,internetMessageId,subject,receivedDateTime,body,bodyPreview,from,replyTo,toRecipients,ccRecipients,bccRecipients";
    const $orderby = "receivedDateTime asc";
    const $filter = `receivedDateTime ge ${iso}`;
    let url = `${this.base}/mailFolders/${folderId}/messages?$select=${encodeURIComponent($select)}&$orderby=${encodeURIComponent($orderby)}&$filter=${encodeURIComponent($filter)}&$top=25`;
    const out = [];
    while (url) {
      const page = await this.graphRequest(url, "GET");
      if (page?.value?.length)
        out.push(...page.value);
      url = page?.["@odata.nextLink"] || "";
    }
    return out;
  }
  async loadJsonAttachments(folderId, messageId) {
    const url = `${this.base}/mailFolders/${folderId}/messages/${messageId}/attachments?$top=50`;
    const data = await this.graphRequest(url, "GET");
    const atts = [];
    for (const a of data?.value || []) {
      if (a["@odata.type"] === "#microsoft.graph.fileAttachment") {
        const ct = a.contentType || "";
        const filename = a.name || a.fileName;
        let content;
        if (ct === "application/json" && a.contentBytes) {
          const buf = Buffer.from(a.contentBytes, "base64");
          content = buf.toString("utf-8");
        }
        atts.push({
          content,
          contentType: ct,
          filename
        });
      }
    }
    return atts;
  }
  // -------- MailInterface methods --------
  async readMail(mailbox, lastSeenUid) {
    const messages = [];
    try {
      await this.init();
      const folderId = await this.getFolderId(mailbox);
      const fromEpoch = Math.max(0, (lastSeenUid || 0) + 1);
      const graphMsgs = await this.listMessages(folderId, fromEpoch);
      for (const gm of graphMsgs) {
        const mm = GraphMailClient.toMailMessage(gm);
        mm.attachments = await this.loadJsonAttachments(folderId, gm.id);
        messages.push(mm);
      }
    } catch (err) {
      this.#logger.error(
        `Graph readMail error: ${err?.message || String(err)}`
      );
      throw err;
    }
    messages.sort((a, b) => a.uid - b.uid);
    return messages;
  }
  async reply(from, mailbox, messageIdHeader, mailBody, concept = true) {
    await this.init();
    const safeMsgId = messageIdHeader.replace(/'/g, "''");
    const searchUrl = `${this.base}/messages?$filter=${encodeURIComponent(
      `internetMessageId eq '${safeMsgId}'`
    )}&$top=1`;
    const res = await this.graphRequest(searchUrl, "GET");
    const orig = res?.value?.[0];
    if (!orig)
      throw new Error(
        `Original message not found for Message-ID ${messageIdHeader}`
      );
    const createUrl = `${this.base}/messages/${orig.id}/createReply`;
    const draft = await this.graphRequest(createUrl, "POST");
    const draftId = draft?.id;
    if (!draftId)
      throw new Error("Failed to create reply draft");
    const quoted = orig.body?.contentType === "HTML" ? (0, import_html_to_text.htmlToText)(orig.body.content) : orig.body?.content || "";
    const combined = `${mailBody}

> ${quoted.split("\n").join("\n> ")}`;
    const updateUrl = `${this.base}/messages/${draftId}`;
    await this.graphRequest(updateUrl, "PATCH", {
      body: { contentType: "Text", content: combined },
      from: { emailAddress: { address: from } }
    });
    if (concept) {
      const draftsId = await this.getFolderId("Drafts");
      await this.graphRequest(`${this.base}/messages/${draftId}/move`, "POST", {
        destinationId: draftsId
      });
      return;
    }
    const sendUrl = `${this.base}/messages/${draftId}/send`;
    await this.graphRequest(sendUrl, "POST");
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  GraphMailClient
});
