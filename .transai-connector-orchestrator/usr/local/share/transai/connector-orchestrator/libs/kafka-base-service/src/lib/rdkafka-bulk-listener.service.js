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
var rdkafka_bulk_listener_service_exports = {};
__export(rdkafka_bulk_listener_service_exports, {
  RdKafkaBulkListenerService: () => RdKafkaBulkListenerService
});
module.exports = __toCommonJS(rdkafka_bulk_listener_service_exports);
var import_abstract_rdkafka_service = require("./abstract-rdkafka-service");
class RdKafkaBulkListenerService extends import_abstract_rdkafka_service.AbstractRdKafkaService {
  constructor(baseYamlConfig, callbackFunction, bulkApplicable = () => true) {
    super(baseYamlConfig);
    this.callbackFunction = callbackFunction;
    this.bulkApplicable = bulkApplicable;
    this.init = async () => {
      await this.consumer.connect().catch((e) => {
        this.logger.error(`Failed to connect to Kafka consumer: ${e.message}`);
        throw new Error(`Failed to connect to Kafka consumer: ${e.message}`);
      });
      const topics = [
        ...await this.getRegexTopics(),
        ...this.getRegularTopics()
      ];
      await Promise.all([
        ...topics.map(async (t) => {
          await this.consumer.subscribe({ topic: t });
        })
      ]);
      if (this.baseYamlConfig.kafka.autoCommitThreshold) {
        this.logger.error(
          "autoCommitThreshold is not supported in bulk listener. Please use autoCommitInterval instead"
        );
      }
      await this.consumer.run({
        partitionsConsumedConcurrently: this.baseYamlConfig.kafka.partitionsConsumedConcurrently ?? 1,
        eachBatchAutoResolve: true,
        eachBatch: this.#consumeBatch
      });
    };
    this.#consumeBatch = async ({
      batch,
      resolveOffset
    }) => {
      const messages = batch.messages.map(
        (message) => JSON.parse(message.value?.toString() ?? "")
      );
      this.logger.debug(
        "Received batch of messages",
        messages.length,
        batch.topic
      );
      if (this.bulkApplicable(messages)) {
        try {
          await this.callbackFunction(messages).catch((error) => {
            this.logger.error(
              `Error in callback function for bulk processing, ${JSON.stringify(error)}`
            );
            throw error;
          });
          const { offset } = batch.messages[batch.messages.length - 1];
          resolveOffset(offset);
        } catch (error) {
          this.logger.error(
            `Error in callback function. Continue as single batch ${JSON.stringify(error)}`
          );
          this.logger.error(
            `${messages.map((m) => m.value?.toString()).join(",\n")}`
          );
          await this.#consumeBatchAsSingle(batch.messages, resolveOffset);
        }
      } else {
        this.logger.debug(
          "Batch processing not applicable. Continue as single batch"
        );
        await this.#consumeBatchAsSingle(batch.messages, resolveOffset);
      }
    };
    this.#consumeBatchAsSingle = async (messages, resolveOffset) => {
      for (const message of messages) {
        try {
          const parsedMessage = JSON.parse(message.value?.toString() ?? "{}");
          await this.callbackFunction([parsedMessage]).catch((error) => {
            this.logger.error(
              `Error in callback function for single message processing, ${JSON.stringify(
                error
              )}`
            );
            throw error;
          });
          resolveOffset(message.offset);
        } catch (error) {
          this.logger.error("Error in callback function", error);
          this.logger.error(`${message.value?.toString()}`);
          resolveOffset(message.offset);
        }
      }
    };
  }
  #consumeBatch;
  #consumeBatchAsSingle;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  RdKafkaBulkListenerService
});
