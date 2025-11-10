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
  #folderCache = {};
  #mailCache = {};
  #attachmentsCache = {};
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
    if (this.#folderCache[loweredDisplayName]) {
      return this.#folderCache[loweredDisplayName];
    }
    if (import_office365_types.WELL_KNOWN_EMAIL_BOXES.includes(loweredDisplayName)) {
      const data2 = await this.#graphRequest(
        `${this.#base}/mailFolders/${encodeURIComponent(displayName)}`
      );
      if (data2?.id) {
        this.#folderCache[loweredDisplayName] = data2;
        return data2;
      }
    }
    const data = await this.#graphRequest(
      `${this.#base}/mailFolders?$top=${topMailboxes}`
    );
    const folder = data?.value?.find(
      (folder2) => folder2.displayName?.toLowerCase() === loweredDisplayName
    ) ?? null;
    this.#folderCache[loweredDisplayName] = folder;
    return folder;
  }
  async getMail(messageId) {
    if (this.#mailCache[messageId]) {
      return this.#mailCache[messageId];
    }
    const params = new URLSearchParams();
    params.set("$filter", `internetMessageId eq '${messageId}'`);
    const searchResult = await this.#graphRequest(
      `${this.#base}/messages?${params.toString()}`
    );
    const mail = searchResult.value?.[0] ?? null;
    this.#mailCache[messageId] = mail;
    return mail;
  }
  async getMails(folder, prevDeltaLink, limit = 10) {
    const params = new URLSearchParams();
    params.set("$select", import_office365_types.EMAIL_SELECTABLE_FIELD.join(","));
    params.set("$top", limit.toString());
    if (!prevDeltaLink) {
      params.set("$orderby", "receivedDateTime DESC");
      params.set("$filter", `receivedDateTime ge ${(/* @__PURE__ */ new Date()).toISOString()}`);
    }
    let url = prevDeltaLink ?? `${this.#base}/mailFolders/${folder.id}/messages/delta?${params.toString()}`;
    const mails = [];
    let deltaLink;
    while (url) {
      const page = await this.#graphRequest(url);
      mails.push(...(page?.value ?? []).filter((item) => !item["@removed"]));
      if (page?.["@odata.deltaLink"]) {
        deltaLink = page?.["@odata.deltaLink"];
      }
      url = page?.["@odata.nextLink"];
    }
    return {
      mails,
      deltaLink: deltaLink ?? prevDeltaLink ?? `${this.#base}/mailFolders/${folder.id}/messages/delta?${params.toString()}`
    };
  }
  async getFullMail(folder, mail) {
    let mimeBuf = null;
    if (this.#emlTestMode !== false) {
      mimeBuf = await this.#tryGetEmlBuffer(folder.id, mail);
    }
    if (!mimeBuf) {
      mimeBuf = await this.#downloadMessageMime(folder.id, mail.id);
    }
    return (0, import_mailparser.simpleParser)(mimeBuf);
  }
  async getExtraData(folder, mail) {
    return this.#tryGetJsonExtraDataBuffer(folder.id, mail);
  }
  async getMailCategories(mail) {
    return this.#graphRequest(
      `${this.#base}/messages/${encodeURIComponent(
        mail.id
      )}?$select=categories`,
      "GET",
      void 0,
      {
        Prefer: 'outlook.body-content-type="text"'
      }
    );
  }
  async updateMailCategories(mail, categories) {
    await this.#graphRequest(
      `${this.#base}/messages/${encodeURIComponent(mail.id)}`,
      "PATCH",
      categories
    );
  }
  async createReply(mail, body, from) {
    const draft = await this.#graphRequest(
      `${this.#base}/messages/${encodeURIComponent(mail.id)}/createReply`,
      "POST"
    );
    if (!body && !from) {
      return draft;
    }
    await this.#graphRequest(
      `${this.#base}/messages/${encodeURIComponent(draft.id)}`,
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
  sendMail(mail) {
    return this.#graphRequest(
      `${this.#base}/messages/${encodeURIComponent(mail.id)}/send`,
      "POST"
    );
  }
  moveMailToFolder(mail, folder) {
    return this.#graphRequest(
      `${this.#base}/messages/${encodeURIComponent(mail.id)}/move`,
      "POST",
      {
        destinationId: folder.id
      }
    );
  }
  async listAttachments(mail, limit = 50) {
    if (this.#attachmentsCache[mail.id]) {
      return this.#attachmentsCache[mail.id];
    }
    const params = new URLSearchParams();
    params.set("$top", limit.toString());
    const data = await this.#graphRequest(
      `${this.#base}/messages/${encodeURIComponent(mail.id)}/attachments?${params.toString()}`,
      "GET"
    );
    const attachments = data?.value || [];
    this.#attachmentsCache[mail.id] = attachments;
    return attachments;
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
  async #tryGetEmlBuffer(folderId, mail) {
    const attachments = await this.listAttachments(mail);
    const fileEml = attachments.find(
      (attachment) => attachment["@odata.type"] === "#microsoft.graph.fileAttachment" && ((attachment.contentType || "").toLowerCase() === "message/rfc822" || String(attachment.name || attachment.fileName || "").toLowerCase().endsWith(".eml"))
    );
    if (fileEml?.contentBytes) {
      return Buffer.from(fileEml.contentBytes, "base64");
    }
    if (fileEml?.id) {
      return this.#graphRequest(
        `${this.#base}/mailFolders/${folderId}/messages/${mail.id}/attachments/${encodeURIComponent(fileEml.id)}/$value`
      );
    }
    const item = attachments.find(
      (a) => a["@odata.type"] === "#microsoft.graph.itemAttachment" && (a.item?.["@odata.type"] === "#microsoft.graph.message" || a.contentType === "message/rfc822")
    );
    if (item?.id) {
      return this.#graphRequest(
        `${this.#base}/mailFolders/${folderId}/messages/${mail.id}/attachments/${encodeURIComponent(item.id)}/$value`
      );
    }
    return null;
  }
  async #tryGetJsonExtraDataBuffer(folderId, mail) {
    const attachments = await this.listAttachments(mail);
    const fileJson = attachments.find(
      (attachment) => attachment["@odata.type"] === "#microsoft.graph.fileAttachment" && (attachment.contentType || "").toLowerCase() === "application/json" && String(attachment.name || attachment.fileName || "").toLowerCase() === "extradata.json"
    );
    if (fileJson?.contentBytes) {
      return Buffer.from(fileJson.contentBytes, "base64");
    }
    if (fileJson?.id) {
      return this.#graphRequest(
        `${this.#base}/mailFolders/${folderId}/messages/${mail.id}/attachments/${encodeURIComponent(fileJson.id)}/$value`
      );
    }
    const item = attachments.find(
      (a) => a["@odata.type"] === "#microsoft.graph.itemAttachment" && (a.item?.["@odata.type"] === "#microsoft.graph.message" || a.contentType === "application/json")
    );
    if (item?.id) {
      return this.#graphRequest(
        `${this.#base}/mailFolders/${folderId}/messages/${mail.id}/attachments/${encodeURIComponent(item.id)}/$value`
      );
    }
    return null;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Office365Client
});
