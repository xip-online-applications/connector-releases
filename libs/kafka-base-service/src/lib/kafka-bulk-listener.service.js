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
var kafka_bulk_listener_service_exports = {};
__export(kafka_bulk_listener_service_exports, {
  KafkaBulkListenerService: () => KafkaBulkListenerService
});
module.exports = __toCommonJS(kafka_bulk_listener_service_exports);
var import_types = require("@xip-online-data/types");
var import_logger = require("@transai/logger");
var import_abstract_kafka_service = require("./abstract-kafka-service");
class KafkaBulkListenerService extends import_abstract_kafka_service.AbstractKafkaService {
  constructor(baseYamlConfig, callbackFunction, bulkApplicable = () => true) {
    super(baseYamlConfig);
    this.callbackFunction = callbackFunction;
    this.bulkApplicable = bulkApplicable;
    this.init = async () => {
      for (const topic of this.baseYamlConfig.kafka.consumerTopics ?? []) {
        if ((0, import_types.isTopicRegex)(topic)) {
          await this.consumer.subscribe({
            topic: new RegExp(topic.pattern, topic.flags),
            fromBeginning: true
          });
        } else if (typeof topic === "string") {
          await this.consumer.subscribe({ topic, fromBeginning: true });
        } else {
          throw new Error("Invalid topic type");
        }
      }
      await this.consumer.run({
        partitionsConsumedConcurrently: this.baseYamlConfig.kafka.partitionsConsumedConcurrently ?? 1,
        autoCommitInterval: this.baseYamlConfig.kafka.autoCommitInterval,
        autoCommitThreshold: this.baseYamlConfig.kafka.autoCommitThreshold,
        eachBatchAutoResolve: true,
        eachBatch: this.consumeBatch
      });
    };
    this.consumeBatch = async ({ batch, resolveOffset }) => {
      const messages = batch.messages.filter((message) => message.value !== null).map((message) => {
        if (message.value === null) {
          return {};
        }
        const m = message.value;
        return JSON.parse(m.toString());
      });
      import_logger.Logger.getInstance().debug(
        "Received batch of messages",
        messages.length,
        batch.topic
      );
      if (this.bulkApplicable(messages)) {
        try {
          await this.callbackFunction(messages);
          const { offset } = batch.messages[batch.messages.length - 1];
          resolveOffset(offset);
        } catch (error) {
          import_logger.Logger.getInstance().error(
            "Error in callback function. Continue as single batch",
            error
          );
          await this.consumeBatchAsSingle(batch.messages, resolveOffset);
        }
      } else {
        import_logger.Logger.getInstance().debug(
          "Batch processing not applicable. Continue as single batch"
        );
        await this.consumeBatchAsSingle(batch.messages, resolveOffset);
      }
    };
    this.consumeBatchAsSingle = async (messages, resolveOffset) => {
      for (const message of messages) {
        if (message.value === null) {
          import_logger.Logger.getInstance().error("Received null message");
          resolveOffset(message.offset);
          continue;
        }
        try {
          const parsedMessage = JSON.parse(message.value.toString());
          await this.callbackFunction([parsedMessage]);
          resolveOffset(message.offset);
        } catch (error) {
          import_logger.Logger.getInstance().error("Error in callback function", error);
          resolveOffset(message.offset);
        }
      }
    };
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  KafkaBulkListenerService
});
