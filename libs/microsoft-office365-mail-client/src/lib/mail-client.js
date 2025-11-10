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
var import_office365_client = require("./office365-client");
var import_office365_mail_parser = require("./office365-mail-parser");
class MailClient {
  #office365Client;
  #office365Parser;
  #config;
  #logger;
  constructor(config, office365Client, office365Parser) {
    this.#config = config;
    this.#logger = import_logger.Logger.getInstance();
    this.#office365Client = office365Client ?? new import_office365_client.Office365Client(
      this.#config.username,
      this.#config.emlTestMode ?? false
    );
    this.#office365Parser = office365Parser ?? new import_office365_mail_parser.Office365MailParser();
    if (!this.#config.tenantId || !this.#config.clientId || !this.#config.clientSecret) {
      throw new Error("Graph requires tenantId, clientId, and clientSecret");
    }
  }
  async readMailbox(mailbox, lastDelta, limit = 10) {
    try {
      await this.#init();
      const folder = await this.#office365Client.getFolder(mailbox);
      if (!folder) {
        throw new Error(`Mailbox folder not found: ${mailbox}`);
      }
      const { mails, deltaLink } = await this.#office365Client.getMails(
        folder,
        lastDelta,
        limit
      );
      const results = [];
      for (const office365Mail of mails.filter(Boolean)) {
        const msg = await this.#parseEmail(office365Mail, folder, deltaLink);
        if (msg) {
          results.push(msg);
        }
      }
      return results.sort((a, b) => a.date.getTime() - b.date.getTime());
    } catch (err) {
      const message = `Failed to read email from mailbox ${mailbox}`;
      this.#logger.warn(message, err);
      throw new Error(message);
    }
  }
  async getAttachments(messageId) {
    const mail = await this.#office365Client.getMail(messageId);
    if (!mail) {
      throw new Error(`Message with ID ${messageId} not found`);
    }
    const attachments = await this.#office365Client.listAttachments(mail);
    return attachments.filter((attachment) => attachment.isInline !== true).map((attachment) => ({
      id: attachment.cid ?? attachment.id,
      contentType: attachment.contentType,
      filename: attachment.fileName ?? attachment.name,
      content: attachment.contentBytes ? (
        // @ts-expect-error contentBytes is base64-encoded string
        Buffer.from(attachment.contentBytes, "base64").toString("utf-8")
      ) : void 0,
      contentBytes: attachment.contentBytes ? (
        // @ts-expect-error contentBytes is base64-encoded string
        Buffer.from(attachment.contentBytes, "base64")
      ) : void 0
    }));
  }
  async reply(messageId, from, body, concept = true) {
    await this.#init();
    const originalMail = await this.#office365Client.getMail(messageId);
    if (!originalMail) {
      throw new Error(`Message with ID ${messageId} not found`);
    }
    const draftMail = await this.#office365Client.createReply(
      originalMail,
      this.#office365Parser.formatMailReplyBody(originalMail, body),
      from
    );
    if (!concept) {
      return this.#office365Client.sendMail(draftMail);
    }
    const draftsFolder = await this.#office365Client.getFolder("Drafts");
    if (!draftsFolder) {
      throw new Error("Folder not found: Drafts");
    }
    return this.#office365Client.moveMailToFolder(draftMail, draftsFolder);
  }
  async addCategory(messageId, ...category) {
    await this.#init();
    const originalMail = await this.#office365Client.getMail(messageId);
    if (!originalMail) {
      throw new Error(`Message with ID ${messageId} not found`);
    }
    const categories = await this.#office365Client.getMailCategories(originalMail);
    const current = categories?.categories || [];
    await this.#office365Client.updateMailCategories(originalMail, {
      categories: Array.from((/* @__PURE__ */ new Set([...current, ...category])).values())
    });
  }
  async removeCategory(messageId, ...category) {
    await this.#init();
    const originalMail = await this.#office365Client.getMail(messageId);
    if (!originalMail) {
      throw new Error(`Message with ID ${messageId} not found`);
    }
    const categories = await this.#office365Client.getMailCategories(originalMail);
    const current = categories?.categories || [];
    await this.#office365Client.updateMailCategories(originalMail, {
      categories: current.filter((c) => !category.includes(c))
    });
  }
  async #init() {
    this.#logger.verbose(
      `Initializing Microsoft Office 365 mail client for ${this.#config.username}`
    );
    await this.#office365Client.init(
      this.#config.tenantId,
      this.#config.clientId,
      this.#config.clientSecret
    );
    this.#logger.debug(
      `Microsoft Office 365 mail client initialized for ${this.#config.username}`
    );
  }
  async #parseEmail(office365Mail, office365Folder, deltaLink) {
    try {
      const fullMail = await this.#office365Client.getFullMail(
        office365Folder,
        office365Mail
      );
      let extraData = null;
      if (this.#config.emlTestMode) {
        const extraDataBuf = await this.#office365Client.getExtraData(office365Folder, office365Mail).catch(() => {
          return null;
        });
        extraData = extraDataBuf?.toString();
      }
      return this.#office365Parser.parsedToMailMessage(
        office365Mail,
        fullMail,
        deltaLink,
        extraData
      );
    } catch (err) {
      this.#logger.warn(
        `Failed to read full mail and parse: [${office365Folder.id}] ${office365Folder.displayName} // [${office365Mail.id}] ${office365Mail.subject}`,
        err
      );
      return void 0;
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MailClient
});
