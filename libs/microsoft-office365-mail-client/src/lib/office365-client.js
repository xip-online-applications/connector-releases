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
var office365_client_exports = {};
__export(office365_client_exports, {
  Office365Client: () => Office365Client
});
module.exports = __toCommonJS(office365_client_exports);
var import_node_https = __toESM(require("node:https"));
var querystring = __toESM(require("node:querystring"));
var import_pdf2md = __toESM(require("@opendocsg/pdf2md"));
var import_mailparser = require("mailparser");
var import_office365_types = require("./office365-types");
class Office365Client {
  /**
   * The base URL in the MS Graph API for the user.
   *
   * @example https://graph.microsoft.com/v1.0/users/{user}
   */
  #base;
  #emlTestMode = false;
  #token;
  constructor(userPrincipalName, emlTestMode = false) {
    this.#base = `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(
      userPrincipalName
    )}`;
    this.#emlTestMode = emlTestMode;
  }
  async init(tenantId, clientId, clientSecret) {
    this.#token = await this.#getAccessToken(tenantId, clientId, clientSecret);
  }
  async getFolder(displayName, topMailboxes = 100) {
    const loweredDisplayName = displayName.toLowerCase();
    if (import_office365_types.WELL_KNOWN_EMAIL_BOXES.includes(loweredDisplayName)) {
      const data2 = await this.#graphRequest(
        `${this.#base}/mailFolders/${encodeURIComponent(displayName)}`
      );
      if (data2?.id) {
        return data2;
      }
    }
    const data = await this.#graphRequest(
      `${this.#base}/mailFolders?$top=${topMailboxes}`
    );
    return data?.value?.find(
      (folder) => folder.displayName?.toLowerCase() === loweredDisplayName
    ) ?? null;
  }
  async getMail(messageId) {
    const params = new URLSearchParams();
    params.set("$filter", `internetMessageId eq '${messageId}'`);
    const searchResult = await this.#graphRequest(
      `${this.#base}/messages?${params.toString()}`
    );
    return searchResult.value?.[0] ?? null;
  }
  async getMails(folderId, limit = 100, fromEpochMs = 0) {
    const iso = new Date(fromEpochMs).toISOString();
    const params = new URLSearchParams();
    params.set("$select", import_office365_types.EMAIL_SELECTABLE_FIELD.join(","));
    params.set("$orderby", "lastModifiedDateTime asc");
    params.set("$filter", `lastModifiedDateTime ge ${iso}`);
    params.set("$top", limit.toString());
    const out = [];
    let url = `${this.#base}/mailFolders/${folderId}/messages?${params.toString()}`;
    while (url && url !== "") {
      const page = await this.#graphRequest(url);
      if (page?.value?.length) {
        out.push(...page.value);
      }
      url = page?.["@odata.nextLink"] || null;
    }
    return out;
  }
  async getFullMail(folderId, mailId) {
    let mimeBuf = null;
    if (this.#emlTestMode !== false) {
      mimeBuf = await this.#tryGetEmlBuffer(folderId, mailId);
    }
    if (!mimeBuf) {
      mimeBuf = await this.#downloadMessageMime(folderId, mailId);
    }
    const parsed = await (0, import_mailparser.simpleParser)(mimeBuf);
    parsed.attachments = await this.#addPdfJsonAttachments(parsed);
    return parsed;
  }
  getMailCategories(messageId) {
    return this.#graphRequest(
      `${this.#base}/messages/${encodeURIComponent(
        messageId
      )}?$select=categories`,
      "GET",
      void 0,
      {
        Prefer: 'outlook.body-content-type="text"'
      }
    );
  }
  async updateMailCategories(messageId, categories) {
    await this.#graphRequest(
      `${this.#base}/messages/${encodeURIComponent(messageId)}`,
      "PATCH",
      categories
    );
  }
  async createReply(messageId, body, from) {
    const draft = await this.#graphRequest(
      `${this.#base}/messages/${encodeURIComponent(messageId)}/createReply`,
      "POST"
    );
    if (!body && !from) {
      return draft;
    }
    await this.#graphRequest(
      `${this.#base}/messages/${encodeURIComponent(messageId)}`,
      "PATCH",
      {
        body: body ? {
          contentType: "html",
          content: body
        } : void 0,
        from: from ? { emailAddress: { address: from } } : void 0
      }
    );
    return draft;
  }
  sendMail(messageId) {
    return this.#graphRequest(
      `${this.#base}/messages/${encodeURIComponent(messageId)}/send`,
      "POST"
    );
  }
  moveMailToFolder(messageId, folderId) {
    return this.#graphRequest(
      `${this.#base}/messages/${encodeURIComponent(messageId)}/move`,
      "POST",
      {
        destinationId: folderId
      }
    );
  }
  #getAccessToken(tenantId, clientId, clientSecret) {
    return new Promise((resolve, reject) => {
      const postData = querystring.stringify({
        client_id: clientId,
        scope: "https://graph.microsoft.com/.default",
        client_secret: clientSecret,
        grant_type: "client_credentials"
      });
      const options = {
        hostname: "login.microsoftonline.com",
        path: `/${tenantId}/oauth2/v2.0/token`,
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(postData)
        }
      };
      const req = import_node_https.default.request(options, (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          try {
            const parsed = JSON.parse(data);
            resolve(parsed.access_token);
          } catch (err) {
            reject(err);
          }
        });
      });
      req.on("error", (e) => {
        reject(e);
      });
      req.write(postData);
      req.end();
    });
  }
  async #graphRequest(urlStr, method = "GET", body = void 0, extraHeaders = void 0) {
    if (!this.#token) {
      throw new Error("Graph token missing (call init())");
    }
    const url = new URL(urlStr);
    const payload = body === void 0 ? void 0 : Buffer.from(JSON.stringify(body), "utf-8");
    const options = {
      method,
      hostname: url.hostname,
      path: url.pathname + url.search,
      protocol: url.protocol,
      port: url.port || 443,
      headers: {
        Authorization: `Bearer ${this.#token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        ...payload ? { "Content-Length": String(payload.length) } : {},
        ...extraHeaders || {}
      }
    };
    return new Promise((resolve, reject) => {
      const req = import_node_https.default.request(options, (res) => {
        const chunks = [];
        res.on("data", (d) => chunks.push(Buffer.from(d)));
        res.on("end", () => {
          const status = res.statusCode || 0;
          const raw = Buffer.concat(
            chunks
          ).toString("utf-8");
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
  async #downloadMessageMime(folderId, messageId) {
    return this.#graphRequest(
      `${this.#base}/mailFolders/${folderId}/messages/${messageId}/$value`
    );
  }
  async #tryGetEmlBuffer(folderId, messageId) {
    const attachments = await this.#listAttachments(folderId, messageId);
    const fileEml = attachments.find(
      (attachment) => attachment["@odata.type"] === "#microsoft.graph.fileAttachment" && ((attachment.contentType || "").toLowerCase() === "message/rfc822" || String(attachment.name || attachment.fileName || "").toLowerCase().endsWith(".eml"))
    );
    if (fileEml?.contentBytes) {
      return Buffer.from(fileEml.contentBytes, "base64");
    }
    if (fileEml?.id) {
      return this.#graphRequest(
        `${this.#base}/mailFolders/${folderId}/messages/${messageId}/attachments/${encodeURIComponent(fileEml.id)}/$value`
      );
    }
    const item = attachments.find(
      (a) => a["@odata.type"] === "#microsoft.graph.itemAttachment" && (a.item?.["@odata.type"] === "#microsoft.graph.message" || a.contentType === "message/rfc822")
    );
    if (item?.id) {
      return this.#graphRequest(
        `${this.#base}/mailFolders/${folderId}/messages/${messageId}/attachments/${encodeURIComponent(item.id)}/$value`
      );
    }
    return null;
  }
  async #listAttachments(folderId, messageId, limit = 50) {
    const data = await this.#graphRequest(
      `${this.#base}/mailFolders/${folderId}/messages/${messageId}/attachments?$expand=microsoft.graph.itemAttachment/item&$top=${limit}`,
      "GET"
    );
    return data?.value || [];
  }
  async #addPdfJsonAttachments(parsed) {
    if (!Array.isArray(parsed.attachments) || parsed.attachments.length === 0) {
      return [];
    }
    const jsonAtts = await Promise.all(
      parsed.attachments.map(async (attachment) => {
        const isPdf = attachment.contentType?.toLowerCase().includes("application/pdf") || attachment.filename?.toLowerCase().endsWith(".pdf");
        if (!isPdf) {
          return null;
        }
        const buf = await this.#streamToBuffer(attachment.content);
        const pdfParsed = await (0, import_pdf2md.default)(buf);
        const filename = `${attachment.filename?.replace(/\.pdf$/i, "") || "attachment"}.json`;
        return {
          ...attachment,
          filename,
          contentType: "application/json",
          content: Buffer.from(pdfParsed)
        };
      })
    );
    return jsonAtts.filter((attachment) => !!attachment);
  }
  async #streamToBuffer(stream) {
    if (Buffer.isBuffer(stream)) {
      return stream;
    }
    return new Promise((resolve, reject) => {
      const chunks = [];
      stream.on("data", (c) => chunks.push(c));
      stream.once(
        "end",
        () => resolve(Buffer.concat(chunks))
      );
      stream.once("error", reject);
    });
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Office365Client
});
