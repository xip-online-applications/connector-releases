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
class MailProcessor {
  constructor(sdk, config, mailClient) {
    this.DEFAULT_EVENT_TTL = 36e5;
    this.DEFAULT_INTERVAL_SECONDS = 60;
    this.MAX_PROCESSING_TRIES = 10;
    this.#processing = false;
    this.#processingTries = 0;
    this.#buildPayload = (parsedContent) => {
      return {
        keyField: "messageId",
        body: {
          ...parsedContent
        },
        collection: `${this.#sdk.config.datasourceIdentifier}_${this.#mailboxConfig.mailboxIdentifier}`
      };
    };
    this.#sdk = sdk;
    this.#mailClient = mailClient;
    this.#mailboxConfig = config;
    this.#logger = this.#sdk.logger;
  }
  #sdk;
  #mailClient;
  #mailboxConfig;
  #logger;
  #processing;
  #processingTries;
  async onRun() {
    if (this.#processing) {
      if (this.#processingTries > this.MAX_PROCESSING_TRIES) {
        this.#logger.error(
          `Exceeded processingTries for mailbox processor: ${this.#mailboxConfig.mailboxIdentifier} ${this.#mailboxConfig.mailbox}`
        );
        process.exit(1);
      }
      this.#logger.debug(
        `Mailsource processor service is already processing: ${this.#mailboxConfig.mailboxIdentifier} ${this.#mailboxConfig.mailbox}`
      );
      this.#processingTries += 1;
      return;
    }
    this.#processing = true;
    try {
      await this.#processMailbox(this.#mailboxConfig);
    } catch (error) {
      this.#logger.error(
        `Error processing mailbox: ${this.#mailboxConfig.mailboxIdentifier} ${this.#mailboxConfig.mailbox}`,
        error
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
      `Processing mailbox: ${this.#mailboxConfig.mailboxIdentifier} ${this.#mailboxConfig.mailbox}`
    );
    const lastOffset = await this.#sdk.offsetStore.getOffset(
      `${this.#mailboxConfig.offsetFilePrefix ?? "offset"}_${this.#mailboxConfig.mailboxIdentifier}`
    );
    const lastMessageId = lastOffset?.id || "";
    const lastMessageTimestamp = lastOffset?.timestamp || 0;
    this.#logger.debug("Last message ID", lastMessageId);
    const messages = await this.#mailClient.readMailbox(
      config.mailbox,
      lastMessageTimestamp,
      lastMessageId,
      config.limit ?? 10
    );
    if (messages.length === 0) {
      this.#logger.debug(
        `No new messages found for mailbox: ${this.#mailboxConfig.mailboxIdentifier} ${this.#mailboxConfig.mailbox}`
      );
      return;
    }
    const messagesAsPayload = messages.map(
      (message) => this.#buildPayload(message)
    );
    if (this.#mailboxConfig.type === "metric") {
      await this.#sdk.sender.metricsLegacy(
        messagesAsPayload,
        {},
        {
          ttl: this.DEFAULT_EVENT_TTL
        }
      );
    } else {
      await this.#sdk.sender.documents(
        messagesAsPayload,
        {},
        {
          ttl: this.DEFAULT_EVENT_TTL
        }
      );
    }
    const lastMessage = messages[messages.length - 1];
    this.#sdk.offsetStore.setOffset(
      {
        timestamp: lastMessage.deltaTimestamp,
        id: lastMessage.deltaId,
        rawTimestamp: (/* @__PURE__ */ new Date()).toISOString()
      },
      `${this.#mailboxConfig.offsetFilePrefix ?? "offset"}_${this.#mailboxConfig.mailboxIdentifier}`
    );
  }
  #buildPayload;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MailProcessor
});
