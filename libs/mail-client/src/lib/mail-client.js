var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var mail_client_exports = {};
__export(mail_client_exports, {
  MailClient: () => MailClient
});
module.exports = __toCommonJS(mail_client_exports);
var import_logger = require("@transai/logger");
var import_imapflow = require("imapflow");
var import_mailparser = require("mailparser");
var import_mail_token = require("./mail-token");
var import_mail_attachments = require("./mail-attachments");
var import_html_to_text = require("html-to-text");
class MailClient {
  constructor(config) {
    this.config = config;
    this.config = config;
    this.#logger = import_logger.Logger.getInstance();
  }
  #logger;
  async init() {
    import_logger.Logger.getInstance().info(
      `Initializing mail: ${this.config.host}:${this.config.port}`
    );
    let accessToken;
    if (this.config.tenantId && this.config.clientId && this.config.clientSecret) {
      accessToken = await (0, import_mail_token.getAccessToken)(
        this.config.tenantId,
        this.config.clientId,
        this.config.clientSecret
      );
    }
    const imapFlowConfig = {
      host: this.config.host,
      port: this.config.port,
      secure: this.config.secure ?? true,
      logger: import_logger.Logger.getInstance()
    };
    if (accessToken) {
      imapFlowConfig.auth = {
        user: this.config.username,
        accessToken
      };
    }
    if (this.config.password) {
      imapFlowConfig.auth = {
        user: this.config.username,
        pass: this.config.password
      };
    }
    this.mailClient = new import_imapflow.ImapFlow(imapFlowConfig);
    await this.mailClient.connect();
    import_logger.Logger.getInstance().info("Mail client initialized");
  }
  async readMail(mailbox, lastSeenUid) {
    const parsedMessages = [];
    try {
      await this.init();
      if (this.mailClient === void 0) {
        throw new Error("Mail client not initialized");
      }
      const lock = await this.mailClient.getMailboxLock(mailbox, {
        readOnly: true
      });
      try {
        let maxUid = lastSeenUid;
        const fromUid = maxUid + 1;
        const range = `${fromUid}:*`;
        this.#logger.debug("Fetching messages with range: " + range);
        for await (const msg of this.mailClient.fetch(
          range,
          {
            uid: true,
            flags: true,
            envelope: true,
            internalDate: true,
            size: true,
            source: true
          },
          { uid: true }
        )) {
          if (!msg.source) {
            this.#logger.warn(
              `Message with UID ${msg.uid} has no source, skipping`
            );
            continue;
          }
          if (msg.uid <= maxUid) {
            this.#logger.debug(
              `Message with UID ${msg.uid} already processed, skipping`
            );
            continue;
          }
          const parsed = await (0, import_mailparser.simpleParser)(msg.source);
          await (0, import_mail_attachments.addPdfJsonAttachments)(parsed);
          const message = this.toJson(parsed, msg.uid);
          parsedMessages.push(message);
          if (message.uid > maxUid)
            maxUid = message.uid;
        }
      } catch (err) {
        if (err instanceof Error) {
          this.#logger.error(err.message);
        } else {
          this.#logger.error(String(err));
        }
      } finally {
        try {
          lock.release();
        } catch (_) {
          this.#logger.error("[lock:error] Failed to release mailbox lock");
        }
      }
    } catch (err) {
      if (err instanceof Error) {
        this.#logger.error(err.message);
      } else {
        this.#logger.error(String(err));
      }
      try {
        await this.mailClient?.logout();
      } catch (_) {
        this.#logger.error("[logout:error] Failed to logout from mail server");
      }
      this.mailClient = void 0;
    }
    return parsedMessages;
  }
  toJson(parsed, uid) {
    const extractAddresses = (addrObj) => {
      if (!addrObj)
        return void 0;
      if (Array.isArray(addrObj.value)) {
        return addrObj.value.map((a) => a.address).filter(Boolean);
      }
      return typeof addrObj.text === "string" ? [addrObj.text] : void 0;
    };
    const headersObj = parsed.headers ? Array.from(parsed.headers.entries()).map(([key, header]) => ({
      key,
      header: Array.isArray(header) ? header.join(", ") : String(header)
    })) : void 0;
    const headerLinesObj = parsed.headerLines ? parsed.headerLines.map((line) => ({
      key: line.key,
      line: line.line
    })) : void 0;
    return {
      uid,
      attachments: parsed.attachments.map((attachment) => ({
        content: attachment.contentType === "application/json" ? attachment.content.toString() : void 0,
        contentType: attachment.contentType,
        filename: attachment.filename
      })),
      // headers: headersObj,
      // headerLines: headerLinesObj,
      subject: parsed.subject,
      references: parsed.references,
      date: parsed.date,
      to: extractAddresses(parsed.to),
      from: extractAddresses(parsed.from),
      cc: extractAddresses(parsed.cc),
      bcc: extractAddresses(parsed.bcc),
      messageId: parsed.messageId,
      inReplyTo: parsed.inReplyTo,
      replyTo: extractAddresses(parsed.replyTo),
      text: (parsed.text || parsed.html ? (0, import_html_to_text.htmlToText)(parsed.html) : "").trim()
      // html: !parsed.html ? undefined : parsed.html,
      // textAsHtml: parsed.textAsHtml,
    };
  }
  async reply(from, mailbox, messageId, mailBody, concept = true) {
    await this.init();
    if (this.mailClient === void 0) {
      throw new Error("Mail client not initialized");
    }
    await this.mailClient.mailboxOpen(mailbox);
    const message = await this.mailClient.fetchOne(messageId, {
      headers: true,
      source: true,
      envelope: true
    });
    if (!message || !message.source) {
      throw new Error(`Message with ID ${messageId} not found`);
    }
    const domain = from.split("@")[1] || "transai.com";
    const parsed = await (0, import_mailparser.simpleParser)(message.source);
    const origMessageId = parsed.messageId;
    const references = parsed.references || [];
    const subject = parsed.subject || "";
    const to = parsed.from?.text;
    const replyTo = parsed.replyTo?.text || to;
    const replyHeaders = {
      "In-Reply-To": origMessageId,
      References: [...references, origMessageId].join(" ")
    };
    const body = `${mailBody}}

> ${parsed.text?.split("\n").join("\n> ")}`;
    const raw = [
      `From: me@example.com`,
      `To: ${replyTo}`,
      `Subject: ${subject.startsWith("Re:") ? subject : `Re: ${subject}`}`,
      `Message-ID: <${Date.now()}.draft@${domain}`,
      `Date: ${(/* @__PURE__ */ new Date()).toUTCString()}`,
      `In-Reply-To: ${replyHeaders["In-Reply-To"]}`,
      `References: ${replyHeaders["References"]}`,
      `MIME-Version: 1.0`,
      `Content-Type: text/plain; charset=utf-8`,
      ``,
      body
    ].join("\r\n");
    await this.mailClient.mailboxOpen("Drafts");
    await this.mailClient.append("Drafts", raw, ["\\Draft"]);
    if (!concept) {
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MailClient
});
