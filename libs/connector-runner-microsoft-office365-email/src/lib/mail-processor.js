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
var mail_processor_exports = {};
__export(mail_processor_exports, {
  MailProcessor: () => MailProcessor
});
module.exports = __toCommonJS(mail_processor_exports);
var import_file_system = require("@xip-online-data/file-system");
class MailProcessor {
  constructor(sdk, config, mailClient) {
    this.DEFAULT_EVENT_TTL = 36e5;
    this.DEFAULT_INTERVAL_SECONDS = 60;
    this.MAX_PROCESSING_TRIES = 10;
    this.#processing = false;
    this.#processingTries = 0;
    this.#sdk = sdk;
    this.#mailClient = mailClient;
    this.#mailboxConfig = config;
    this.#logger = this.#sdk.logger;
    const attachmentDestination = this.#mailboxConfig.attachmentDestination ?? this.#sdk.config.attachmentDestination;
    this.#fileHandler = attachmentDestination ? import_file_system.FileSystem.fromDsn(attachmentDestination) : void 0;
  }
  #sdk;
  #mailClient;
  #mailboxConfig;
  #logger;
  #fileHandler;
  #processing;
  #processingTries;
  get name() {
    return `mail-processor-${this.#mailboxConfig.mailboxIdentifier}-${this.#mailboxConfig.mailbox}`;
  }
  async onRun() {
    if (this.#processing) {
      if (this.#processingTries > this.MAX_PROCESSING_TRIES) {
        this.#logger.error(
          `Exceeded processingTries for mailbox processor: ${this.#mailboxConfig.mailboxIdentifier}/${this.#mailboxConfig.mailbox}`
        );
        process.exit(1);
      }
      this.#logger.debug(
        `Mailsource processor service is already processing: ${this.#mailboxConfig.mailboxIdentifier}/${this.#mailboxConfig.mailbox}`
      );
      this.#processingTries += 1;
      return;
    }
    this.#processing = true;
    try {
      await this.#processMailbox(this.#mailboxConfig);
    } catch (error) {
      this.#logger.warn(
        `Error processing mailbox: ${this.#mailboxConfig.mailboxIdentifier}/${this.#mailboxConfig.mailbox}`,
        JSON.stringify(error)
      );
      this.#processing = false;
      this.#processingTries += 1;
      return;
    }
    this.#processing = false;
    this.#processingTries = 0;
  }
  async #processMailbox(config) {
    this.#logger.debug(
      `Processing mailbox: ${this.#mailboxConfig.mailboxIdentifier}/${this.#mailboxConfig.mailbox}`
    );
    const lastOffset = await this.#sdk.offsetStore.getOffset(
      `${this.#mailboxConfig.offsetFilePrefix ?? "offset"}_${this.#mailboxConfig.mailboxIdentifier}`
    );
    const lastMessageId = lastOffset?.id || "";
    const lastMessageTimestamp = lastOffset?.timestamp || 0;
    this.#logger.verbose(
      `Last message ID of mailbox ${this.#mailboxConfig.mailboxIdentifier}/${this.#mailboxConfig.mailbox}:`,
      lastMessageId
    );
    const messages = await this.#mailClient.readMailbox(
      config.mailbox,
      lastMessageTimestamp,
      lastMessageId,
      config.limit ?? 10
    );
    if (messages.length === 0) {
      this.#logger.debug(
        `No new messages found for mailbox: ${this.#mailboxConfig.mailboxIdentifier}/${this.#mailboxConfig.mailbox}`
      );
      return;
    }
    await this.#storeAttachments(config.mailbox, ...messages);
    const preparedMessages = messages.map((message) => ({
      ...message,
      attachments: (message.attachments ?? []).map((attachment) => ({
        ...attachment,
        content: attachment.contentType === "application/json" ? attachment.content : void 0,
        contentBytes: void 0
      }))
    }));
    this.#logger.debug(
      `Fetched ${preparedMessages.length} new messages for mailbox ${this.#mailboxConfig.mailboxIdentifier}/${this.#mailboxConfig.mailbox}, sending as ${this.#mailboxConfig.type}`
    );
    if (this.#mailboxConfig.type === "metric") {
      await this.#sdk.sender.metricsLegacy(
        preparedMessages,
        {
          keyField: "messageId",
          collection: this.#sdk.config.datasourceIdentifier
        },
        {
          ttl: this.DEFAULT_EVENT_TTL
        }
      );
    } else {
      await this.#sdk.sender.documents(
        preparedMessages,
        {
          keyField: "messageId",
          collection: this.#sdk.config.datasourceIdentifier
        },
        {
          ttl: this.DEFAULT_EVENT_TTL
        }
      );
    }
    this.#logger.info(
      `Fetched ${preparedMessages.length} new messages for mailbox ${this.#mailboxConfig.mailboxIdentifier}/${this.#mailboxConfig.mailbox}, sent as ${this.#mailboxConfig.type}`
    );
    const lastMessage = preparedMessages[preparedMessages.length - 1];
    this.#sdk.offsetStore.setOffset(
      {
        timestamp: lastMessage.deltaTimestamp,
        id: lastMessage.deltaId,
        rawTimestamp: (/* @__PURE__ */ new Date()).toISOString()
      },
      `${this.#mailboxConfig.offsetFilePrefix ?? "offset"}_${this.#mailboxConfig.mailboxIdentifier}`
    );
  }
  async #storeAttachments(mailbox, ...messages) {
    if (!this.#fileHandler) {
      return;
    }
    const messagesWithAttachments = messages.filter(
      (message) => message.attachmentsCount > 0
    );
    if (messagesWithAttachments.length === 0) {
      return;
    }
    this.#logger.verbose(
      `Storing attachments for ${messagesWithAttachments.length} messages in mailbox ${this.#mailboxConfig.mailboxIdentifier}/${mailbox}...`
    );
    await Promise.all(
      messagesWithAttachments.map(async (message) => {
        let attachments;
        try {
          attachments = await this.#mailClient.getAttachments(message.id);
        } catch (error) {
          this.#logger.error(
            `Failed to fetch attachments for mail ${this.#mailboxConfig.mailboxIdentifier}/${mailbox}/${message.id} due to: ${error.message}`,
            error
          );
          return;
        }
        if (attachments.length === 0) {
          this.#logger.info(
            `Somehow found ${attachments.length} of ${message.attachmentsCount} expected attachments for mail ${this.#mailboxConfig.mailboxIdentifier}/${mailbox}/${message.id}`
          );
          return;
        }
        this.#logger.verbose(
          `Found ${attachments.length} attachments for mail ${this.#mailboxConfig.mailboxIdentifier}/${mailbox}/${message.id}, storing to ${typeof this.#fileHandler}`
        );
        const storedAttachments = await Promise.all(
          attachments.map(async (attachment) => {
            if (!attachment.contentBytes && !attachment.content) {
              return;
            }
            const file = new import_file_system.ActiveFileHandle(
              attachment.contentBytes ?? Buffer.from(attachment.content)
            );
            const path = `${mailbox}/${encodeURIComponent(message.id)}/${attachment.filename}`;
            this.#logger.verbose(
              `Storing mail ${this.#mailboxConfig.mailboxIdentifier}/${mailbox}/${message.id} attachment "${path}"...`
            );
            const success = await this.#fileHandler.writeFile(path, file).catch((err) => {
              this.#logger.error(
                `Failed to store attachment to ${path} due to: ${err.message}`,
                err
              );
            });
            if (!success) {
              return null;
            }
            this.#logger.debug(
              `Stored mail ${this.#mailboxConfig.mailboxIdentifier}/${mailbox}/${message.id} attachment "${path}"`
            );
            return {
              id: attachment.id,
              dsn: this.#fileHandler.pathAsDsn(path),
              filename: attachment.filename,
              contentType: attachment.contentType
            };
          }).filter(Boolean)
        );
        this.#logger.debug(
          `Stored ${storedAttachments.length} attachments for mail ${this.#mailboxConfig.mailboxIdentifier}/${mailbox}/${message.id}`
        );
        message.storedAttachments = [
          ...message.storedAttachments ?? [],
          ...storedAttachments
        ];
      })
    );
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MailProcessor
});
