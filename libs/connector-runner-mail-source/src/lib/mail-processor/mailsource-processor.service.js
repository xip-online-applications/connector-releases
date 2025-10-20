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
var mailsource_processor_service_exports = {};
__export(mailsource_processor_service_exports, {
  MailsourceProcessorService: () => MailsourceProcessorService
});
module.exports = __toCommonJS(mailsource_processor_service_exports);
var import_logger = require("@transai/logger");
var import_handle_error = require("@xip-online-data/handle-error");
var import_rxjs = require("rxjs");
var import_uuid = require("uuid");
var import_helper = require("../helper.functions");
class MailsourceProcessorService {
  constructor(mailSourceConfig, config, kafkaService, mailClient, offsetStore) {
    this.#processing = false;
    this.#processingTries = 0;
    this.sendMetricsToKafka = async (contents) => {
      let kafkaPayload;
      if (Array.isArray(contents)) {
        kafkaPayload = contents.map((content) => ({
          type: "SOURCE",
          eventId: (0, import_uuid.v4)(),
          eventType: "event.metric",
          created: Date.now(),
          ttl: 36e5,
          // 1 month
          tenantIdentifier: this.#mailSourceConfig.tenantIdentifier,
          payload: this.buildPayload(content)
        }));
      } else {
        kafkaPayload = [
          {
            type: "SOURCE",
            eventId: (0, import_uuid.v4)(),
            eventType: "event.metric",
            created: Date.now(),
            ttl: 36e5,
            // 1 month
            tenantIdentifier: this.#mailSourceConfig.tenantIdentifier,
            payload: this.buildPayload(contents)
          }
        ];
      }
      await this.#kafkaService.send(
        kafkaPayload,
        (0, import_helper.generateKafkaTopic)(this.#mailSourceConfig, this.#mailboxConfig)
      );
    };
    this.sendDocumentsToKafka = async (contents) => {
      let kafkaPayload;
      if (Array.isArray(contents)) {
        kafkaPayload = contents.map((content) => ({
          type: "SOURCE",
          eventId: (0, import_uuid.v4)(),
          eventType: `${this.#mailSourceConfig.tenantIdentifier}_SOURCE_${this.#mailboxConfig.mailboxIdentifier}`,
          created: Date.now(),
          ttl: 36e5,
          // 1 month
          tenantIdentifier: this.#mailSourceConfig.tenantIdentifier,
          payload: this.buildPayload(content)
        }));
      } else {
        kafkaPayload = [
          {
            type: "SOURCE",
            eventId: (0, import_uuid.v4)(),
            eventType: `${this.#mailSourceConfig.tenantIdentifier}_SOURCE_${this.#mailboxConfig.mailboxIdentifier}`,
            created: Date.now(),
            ttl: 36e5,
            // 1 month
            tenantIdentifier: this.#mailSourceConfig.tenantIdentifier,
            payload: this.buildPayload(contents)
          }
        ];
      }
      await this.#kafkaService.send(
        kafkaPayload,
        (0, import_helper.generateKafkaTopic)(this.#mailSourceConfig, this.#mailboxConfig)
      );
    };
    this.buildPayload = (parsedContent) => {
      return {
        keyField: "messageId",
        body: {
          ...parsedContent
        },
        collection: (0, import_helper.generateCollectionName)(
          this.#mailSourceConfig,
          this.#mailboxConfig
        )
      };
    };
    this.#mailSourceConfig = mailSourceConfig;
    this.#mailboxConfig = config;
    this.#kafkaService = kafkaService;
    this.#mailClient = mailClient;
    this.#logger = import_logger.Logger.getInstance();
    this.#offsetStore = offsetStore;
  }
  #processing;
  #processingTries;
  #mailboxConfig;
  #mailSourceConfig;
  #kafkaService;
  #mailClient;
  #logger;
  #subscription;
  #offsetStore;
  async init() {
    this.#subscription = (0, import_rxjs.interval)(
      this.#mailboxConfig.interval * 1e3
    ).subscribe(async () => {
      await this.process().catch((error) => {
        this.#logger.error(
          `Error while processing message from mailsource processor service ${error.message}`
        );
      });
    });
  }
  stop() {
    this.#subscription?.unsubscribe();
  }
  async process() {
    if (this.#processing) {
      if (this.#processingTries > 10) {
        (0, import_handle_error.handleError)("Exceeded processingTries. Exit");
        return;
      }
      this.#logger.debug(
        `Mailsource processor service is already processing: ${this.#mailboxConfig.mailboxIdentifier} ${this.#mailboxConfig.mailbox}`
      );
      this.#processingTries += 1;
      return;
    }
    this.#processing = true;
    this.#processingTries = 0;
    try {
      await this.processMailbox(this.#mailboxConfig);
    } finally {
      this.#processing = false;
      this.#processingTries = 0;
    }
  }
  async processMailbox(config) {
    this.#logger.debug(
      `Processing mailbox: ${this.#mailboxConfig.mailboxIdentifier} ${this.#mailboxConfig.mailbox}`
    );
    const lastOffset = await this.#offsetStore.getOffset(
      (0, import_helper.generateOffsetIdentifier)(this.#mailboxConfig)
    );
    const lastMessageId = lastOffset?.id || "";
    const lastMessageTimestamp = lastOffset?.timestamp || 0;
    this.#logger.info("Last message ID", lastMessageId);
    const messages = await this.#mailClient.readMail(
      config.mailbox,
      lastMessageTimestamp,
      lastMessageId,
      config.limit ?? 10
    );
    if (this.#mailboxConfig.type === "metric") {
      await this.sendMetricsToKafka(messages);
    } else {
      await this.sendDocumentsToKafka(messages);
    }
    if (messages.length === 0) {
      this.#logger.debug(
        `No new messages found for mailbox: ${this.#mailboxConfig.mailboxIdentifier} ${this.#mailboxConfig.mailbox}`
      );
      return;
    }
    this.storeId(
      messages[messages.length - 1].deltaTimestamp,
      messages[messages.length - 1].deltaId
    );
  }
  storeId(timestamp, id) {
    this.#offsetStore.setOffset(
      { timestamp, id, rawTimestamp: (/* @__PURE__ */ new Date()).toISOString() },
      (0, import_helper.generateOffsetIdentifier)(this.#mailboxConfig)
    );
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MailsourceProcessorService
});
