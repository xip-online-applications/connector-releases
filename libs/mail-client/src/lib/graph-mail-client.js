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
var fs = __toESM(require("fs"));
var https = __toESM(require("https"));
var os = __toESM(require("os"));
var path = __toESM(require("path"));
var import_url = require("url");
var import_logger = require("@transai/logger");
var import_html_to_text = require("html-to-text");
var import_mailparser = require("mailparser");
var import_mail_attachments = require("./mail-attachments");
var import_mail_token = require("./mail-token");
const OVERLAP_MS = 6 * 60 * 60 * 1e3;
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
        Accept: "application/json",
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
            const ct = (res.headers["content-type"] || "").toString().split(";")[0].trim();
            if (ct === "application/json") {
              try {
                return resolve(JSON.parse(raw));
              } catch {
                return resolve(void 0);
              }
            } else {
              return resolve(raw);
            }
          } else if (status === 204) {
            return resolve(void 0);
          } else {
            return reject(
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
  async downloadMessageMime(folderId, messageId) {
    const url = `${this.base}/mailFolders/${folderId}/messages/${messageId}/$value`;
    return this.graphDownload(url);
  }
  async graphDownload(urlStr, extraHeaders) {
    if (!this.token)
      throw new Error("Graph token missing (call init())");
    const url = new import_url.URL(urlStr);
    const options = {
      method: "GET",
      hostname: url.hostname,
      path: url.pathname + url.search,
      protocol: url.protocol,
      port: url.port || 443,
      headers: {
        Authorization: `Bearer ${this.token}`,
        ...extraHeaders || {}
      }
    };
    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        const chunks = [];
        res.on("data", (d) => chunks.push(Buffer.from(d)));
        res.on("end", () => {
          const status = res.statusCode || 0;
          if (status >= 200 && status < 300) {
            resolve(Buffer.concat(chunks));
          } else {
            const raw = Buffer.concat(chunks).toString("utf-8");
            reject(
              new Error(
                `Graph GET (download) ${url.pathname}${url.search} failed: ${status} ${raw}`
              )
            );
          }
        });
      });
      req.on("error", reject);
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
      deltaTimestamp: (/* @__PURE__ */ new Date()).getTime(),
      deltaId: "",
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
  async listMessages(folderId, fromEpochMs, limit) {
    const iso = new Date(fromEpochMs).toISOString();
    const $select = "id,internetMessageId,subject,receivedDateTime,lastModifiedDateTime,body,bodyPreview,from,replyTo,toRecipients,ccRecipients,bccRecipients,internetMessageHeaders";
    const $orderby = "lastModifiedDateTime asc";
    const $filter = `lastModifiedDateTime ge ${iso}`;
    let url = `${this.base}/mailFolders/${folderId}/messages?$select=${encodeURIComponent($select)}&$orderby=${encodeURIComponent($orderby)}&$filter=${encodeURIComponent($filter)}&$top=${limit}`;
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
  // ---------------- EML TEST MODE SUPPORT ----------------
  /** Returns attachment listing for a message (raw graph payload). */
  async listAttachments(folderId, messageId) {
    const url = `${this.base}/mailFolders/${folderId}/messages/${messageId}/attachments?$expand=microsoft.graph.itemAttachment/item&$top=50`;
    const data = await this.graphRequest(url, "GET");
    return data?.value || [];
  }
  /** Try to obtain an EML buffer from either fileAttachment (.eml / message/rfc822) or itemAttachment ($value). */
  async tryGetEmlBuffer(folderId, messageId) {
    const attachments = await this.listAttachments(folderId, messageId);
    const fileEml = attachments.find(
      (a) => a["@odata.type"] === "#microsoft.graph.fileAttachment" && ((a.contentType || "").toLowerCase() === "message/rfc822" || String(a.name || a.fileName || "").toLowerCase().endsWith(".eml"))
    );
    if (fileEml?.contentBytes) {
      return Buffer.from(fileEml.contentBytes, "base64");
    }
    if (fileEml?.id) {
      const url = `${this.base}/mailFolders/${folderId}/messages/${messageId}/attachments/${encodeURIComponent(fileEml.id)}/$value`;
      return await this.graphDownload(url);
    }
    const item = attachments.find(
      (a) => a["@odata.type"] === "#microsoft.graph.itemAttachment" && (a.item?.["@odata.type"] === "#microsoft.graph.message" || a.contentType === "message/rfc822")
    );
    if (item?.id) {
      const url = `${this.base}/mailFolders/${folderId}/messages/${messageId}/attachments/${encodeURIComponent(item.id)}/$value`;
      return await this.graphDownload(url);
    }
    return null;
  }
  /** Map a parsed EML into our MailMessage shape. */
  static parsedEmlToMailMessage(parsed, receivedFallback) {
    function extractAddrList(field) {
      if (!field)
        return void 0;
      const pluck = (x) => {
        if (!x || typeof x !== "object")
          return [];
        if ("address" in x && typeof x.address === "string" && x.address) {
          return [x.address];
        }
        if ("group" in x && Array.isArray(x.group)) {
          return x.group.flatMap(pluck);
        }
        return [];
      };
      if ("value" in field && Array.isArray(field.value)) {
        const out2 = field.value.flatMap(pluck).filter(Boolean);
        return out2.length ? out2 : void 0;
      }
      if (Array.isArray(field)) {
        const out2 = field.flatMap(pluck).filter(Boolean);
        return out2.length ? out2 : void 0;
      }
      const out = pluck(field).filter(Boolean);
      return out.length ? out : void 0;
    }
    const received = parsed.date ?? receivedFallback;
    const headersArr = [];
    const headerLinesArr = [];
    if (parsed.headers) {
      for (const [key, value] of parsed.headers.entries()) {
        headersArr.push({
          key: String(key),
          header: Array.isArray(value) ? value.join(", ") : String(value)
        });
      }
    }
    if (parsed.headerLines) {
      for (const h of parsed.headerLines)
        headerLinesArr.push({ key: h.key, line: h.line });
    }
    const toList = extractAddrList(parsed.to);
    const ccList = extractAddrList(parsed.cc);
    const bccList = extractAddrList(parsed.bcc);
    const fromList = extractAddrList(parsed.from);
    const replyToList = extractAddrList(parsed.replyTo);
    const html = typeof parsed.html === "string" ? parsed.html : void 0;
    const text = parsed.text || (html ? (0, import_html_to_text.htmlToText)(html) : "");
    return {
      deltaTimestamp: (/* @__PURE__ */ new Date()).getTime(),
      deltaId: "",
      attachments: parsed.attachments.map((attachment) => ({
        text: attachment.contentType === "application/json" ? attachment.content.toString() : void 0,
        contentType: attachment.contentType,
        filename: attachment.filename
      })),
      headers: headersArr,
      headerLines: headerLinesArr,
      subject: parsed.subject || void 0,
      references: parsed.references || void 0,
      date: received instanceof Date ? received : new Date(received),
      to: toList?.length ? toList : void 0,
      from: fromList?.length ? fromList : void 0,
      cc: ccList?.length ? ccList : void 0,
      bcc: bccList?.length ? bccList : void 0,
      messageId: parsed.messageId || void 0,
      inReplyTo: parsed.inReplyTo || void 0,
      replyTo: replyToList?.length ? replyToList : void 0,
      text: (text || "").trim(),
      html
    };
  }
  /** Extract PDF attachments from a parsed EML as file paths (temp dir) for downstream processing. */
  static extractPdfAttachments(parsed) {
    const out = [];
    if (!parsed.attachments?.length)
      return out;
    const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "eml-pdfs-"));
    for (const att of parsed.attachments) {
      const ct = (att.contentType || "").toLowerCase();
      const name = att.filename || "attachment";
      if (ct === "application/pdf" || name.toLowerCase().endsWith(".pdf")) {
        const target = path.join(tmpRoot, name);
        fs.writeFileSync(target, att.content);
        out.push({
          contentType: att.contentType || "application/pdf",
          filename: name,
          path: target
        });
      }
    }
    return out;
  }
  async readMail(mailbox, lastSeenTimestamp, lastSeenId, limit) {
    function isAfterCursor(t, id, lastTime, lastId) {
      if (t > lastTime)
        return true;
      if (t < lastTime)
        return false;
      if (!lastId)
        return true;
      return id > lastId;
    }
    const messages = [];
    try {
      await this.init();
      const folderId = await this.getFolderId(mailbox);
      const fromEpoch = Math.max(0, (lastSeenTimestamp || 0) - OVERLAP_MS);
      const graphMsgs = await this.listMessages(folderId, fromEpoch, limit);
      const seenIds = /* @__PURE__ */ new Set();
      for (const gm of graphMsgs) {
        const receivedMs = gm.receivedDateTime ? new Date(gm.receivedDateTime).getTime() : gm.sentDateTime ? new Date(gm.sentDateTime).getTime() : 0;
        if (!isAfterCursor(receivedMs, gm.id, lastSeenTimestamp || 0, lastSeenId))
          continue;
        if (seenIds.has(gm.id))
          continue;
        seenIds.add(gm.id);
        let mimeBuf = null;
        try {
          if (this.config.emlTestMode !== false) {
            this.#logger.info("EML test mode");
            mimeBuf = await this.tryGetEmlBuffer(folderId, gm.id);
          }
          if (!mimeBuf) {
            this.#logger.info("Production mode");
            mimeBuf = await this.downloadMessageMime(folderId, gm.id);
          }
          const parsed = await (0, import_mailparser.simpleParser)(mimeBuf);
          this.#logger.info(`parsed subject: ${parsed.subject}`);
          await (0, import_mail_attachments.addPdfJsonAttachments)(parsed);
          const mm = GraphMailClient.parsedEmlToMailMessage(
            parsed,
            new Date(receivedMs)
          );
          mm.deltaTimestamp = receivedMs;
          mm.deltaId = gm.id;
          const attachments = [];
          for (const att of parsed.attachments || []) {
            const ct = (att.contentType || "").toLowerCase();
            const fn = (att.filename || "attachment").toLowerCase();
            const isJson = ct === "application/json" || fn.endsWith(".json");
            if (!isJson)
              continue;
            const buf = Buffer.isBuffer(att.content) ? att.content : await new Promise((resolve, reject) => {
              const chunks = [];
              att.content?.on?.(
                "data",
                (c) => chunks.push(Buffer.from(c))
              );
              att.content?.once?.(
                "end",
                () => resolve(Buffer.concat(chunks))
              );
              att.content?.once?.("error", reject);
            });
            attachments.push({
              filename: att.filename || "attachment.json",
              contentType: "application/json",
              content: buf.toString("utf-8")
            });
          }
          mm.attachments = attachments;
          mm.originalMessageId = gm.internetMessageId;
          messages.push(mm);
        } catch (e) {
          this.#logger.warn?.(
            `MIME parse failed for ${gm.id}: ${e?.message || String(e)}`
          );
          continue;
        }
      }
    } catch (err) {
      this.#logger.error(
        `Graph readMail error: ${err?.message || String(err)}`
      );
      throw err;
    }
    messages.sort((a, b) => {
      if (a.deltaTimestamp !== b.deltaTimestamp)
        return a.deltaTimestamp - b.deltaTimestamp;
      return a.deltaId.localeCompare(b.deltaId);
    });
    return messages;
  }
  async reply(from, messageId, mailBody, concept = true) {
    await this.init();
    const orig = await this.getMessage(messageId);
    const origFrom = orig.from?.emailAddress?.address || "";
    const origTo = orig.toRecipients?.map((r) => r.emailAddress?.address).filter(Boolean).join("; ") || "";
    const origSubject = orig.subject || "";
    const origDate = orig.sentDateTime ? new Date(orig.sentDateTime).toLocaleString() : "";
    const separator = `<br><hr style="border:none;border-top:solid #b1b1b1 1px;height:1px;margin:16px 0 8px 0;" /><br>From: ${origFrom}<br>Sent: ${origDate}<br>To: ${origTo}<br>Subject: ${origSubject}<br><br>`;
    const origBody = orig.body?.content || "";
    const createUrl = `${this.base}/messages/${orig.id}/createReply`;
    const draft = await this.graphRequest(createUrl, "POST");
    const draftId = draft?.id;
    if (!draftId)
      throw new Error("Failed to create reply draft");
    const updateUrl = `${this.base}/messages/${draftId}`;
    await this.graphRequest(updateUrl, "PATCH", {
      body: {
        contentType: "html",
        content: `${mailBody}${separator}${origBody}`
      },
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
  // inside GraphMailClient
  async addCategory(messageId, category) {
    this.#logger.debug(`Adding category ${category} to message ${messageId}`);
    await this.init();
    const orig = await this.getMessage(messageId);
    const url = `${this.base}/messages/${encodeURIComponent(orig.id)}`;
    const data = await this.graphRequest(url, "GET", void 0, {
      Prefer: 'outlook.body-content-type="text"'
    });
    const current = data?.categories || [];
    const updated = current.includes(category) ? current : [...current, category];
    await this.graphRequest(url, "PATCH", {
      categories: updated
    });
  }
  // inside GraphMailClient
  async removeCategory(messageId, category) {
    await this.init();
    const orig = await this.getMessage(messageId);
    const url = `${this.base}/messages/${encodeURIComponent(orig.id)}`;
    const data = await this.graphRequest(url, "GET", void 0, {
      Prefer: 'outlook.body-content-type="text"'
    });
    const current = data?.categories || [];
    const updated = current.filter((c) => c !== category);
    await this.graphRequest(url, "PATCH", { categories: updated });
  }
  async getMessage(messageId) {
    const filter = `internetMessageId eq '${messageId}'`;
    const searchUrl = `${this.base}/messages?$filter=${encodeURIComponent(filter)}`;
    const searchResult = await this.graphRequest(searchUrl, "GET");
    const found = searchResult.value?.[0];
    if (!found) {
      throw new Error(`Original message not found for id ${messageId}`);
    }
    const url = `${this.base}/messages/${found.id}`;
    const orig = await this.graphRequest(url, "GET");
    if (!orig) {
      throw new Error(`Original message not found for id ${messageId}`);
    }
    return orig;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  GraphMailClient
});
