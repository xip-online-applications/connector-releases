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
  /**
   * 6 hours (tune if needed)
   */
  #OVERLAP_MS = 216e5;
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
  async readMailbox(mailbox, lastSeenTimestamp = 0, lastSeenId = void 0, limit = 10) {
    try {
      await this.#init();
      const fromEpoch = Math.max(
        0,
        (lastSeenTimestamp || 0) - this.#OVERLAP_MS
      );
      const folder = await this.#office365Client.getFolder(mailbox);
      if (!folder) {
        throw new Error(`Mailbox folder not found: ${mailbox}`);
      }
      const mails = await this.#office365Client.getMails(
        folder.id,
        limit,
        fromEpoch
      );
      const seenIds = /* @__PURE__ */ new Set();
      const messages = await Promise.all(
        mails.filter((office365Mail) => !!office365Mail).filter((office365Mail) => !seenIds.has(office365Mail.id)).map(
          async (office365Mail) => this.#parseEmail(
            office365Mail,
            folder,
            seenIds,
            lastSeenTimestamp,
            lastSeenId
          )
        )
      );
      return messages.filter((gm) => !!gm).sort((a, b) => {
        if (a.deltaTimestamp !== b.deltaTimestamp) {
          return a.deltaTimestamp - b.deltaTimestamp;
        }
        return a.deltaId.localeCompare(b.deltaId);
      });
    } catch (err) {
      const message = `Failed to read email from mailbox ${mailbox}`;
      this.#logger.warn(message, err);
      throw new Error(message);
    }
  }
  async reply(messageId, from, body, concept = true) {
    await this.#init();
    const originalMail = await this.#office365Client.getMail(messageId);
    const draftMail = await this.#office365Client.createReply(
      originalMail.id,
      this.#office365Parser.formatMailReplyBody(originalMail, body),
      from
    );
    if (!concept) {
      return this.#office365Client.sendMail(draftMail.id);
    }
    const draftsFolder = await this.#office365Client.getFolder("Drafts");
    if (!draftsFolder) {
      throw new Error("Folder not found: Drafts");
    }
    return this.#office365Client.moveMailToFolder(
      draftMail.id,
      draftsFolder.id
    );
  }
  async addCategory(messageId, ...category) {
    await this.#init();
    const categories = await this.#office365Client.getMailCategories(messageId);
    const current = categories?.categories || [];
    await this.#office365Client.updateMailCategories(messageId, {
      categories: Array.from((/* @__PURE__ */ new Set([...current, ...category])).values())
    });
  }
  async removeCategory(messageId, ...category) {
    await this.#init();
    const categories = await this.#office365Client.getMailCategories(messageId);
    const current = categories?.categories || [];
    await this.#office365Client.updateMailCategories(messageId, {
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
  #isAfterCursor(t, id, lastTime, lastId) {
    if (t > lastTime)
      return true;
    if (t < lastTime)
      return false;
    if (!lastId)
      return true;
    return id > lastId;
  }
  async #parseEmail(office365Mail, office365Folder, seenIds, lastSeenTimestamp, lastSeenId) {
    const receivedMs = office365Mail.receivedDateTime ? new Date(office365Mail.receivedDateTime).getTime() : office365Mail.sentDateTime ? new Date(office365Mail.sentDateTime).getTime() : 0;
    if (!this.#isAfterCursor(
      receivedMs,
      office365Mail.id,
      lastSeenTimestamp,
      lastSeenId
    )) {
      return void 0;
    }
    try {
      const fullMail = await this.#office365Client.getFullMail(
        office365Folder.id,
        office365Mail.id
      );
      seenIds.add(office365Mail.id);
      return this.#office365Parser.parsedToMailMessage(
        office365Mail,
        fullMail,
        new Date(receivedMs)
      );
    } catch (err) {
      seenIds.delete(office365Mail.id);
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
