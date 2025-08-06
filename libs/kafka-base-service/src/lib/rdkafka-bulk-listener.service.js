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
var import_types = require("@xip-online-data/types");
var import_logger = require("@transai/logger");
var import_abstract_rdkafka_service = require("./abstract-rdkafka-service");
class RdKafkaBulkListenerService extends import_abstract_rdkafka_service.AbstractRdKafkaService {
  constructor(baseYamlConfig, callbackFunction, bulkApplicable = () => true) {
    super(baseYamlConfig);
    this.callbackFunction = callbackFunction;
    this.bulkApplicable = bulkApplicable;
    this.init = async () => {
      const regexTopics = this.baseYamlConfig.kafka.consumerTopics?.filter(
        (topic) => (0, import_types.isTopicRegex)(topic)
      ) ?? [];
      const regularTopics = this.baseYamlConfig.kafka.consumerTopics?.filter(
        (topic) => !(0, import_types.isTopicRegex)(topic)
      ) ?? [];
      await Promise.all([
        ...regexTopics.map(async (topic) => {
          await this.consumer.subscribe({
            topic: new RegExp(topic.pattern, topic.flags)
          });
        }),
        ...regularTopics.map(async (topic) => {
          const t = topic.indexOf(this.baseYamlConfig.tenantIdentifier) !== 0 ? `${this.baseYamlConfig.tenantIdentifier}_${topic}` : topic;
          await this.consumer.subscribe({ topic: t });
        })
      ]);
      if (this.baseYamlConfig.kafka.autoCommitThreshold) {
        import_logger.Logger.getInstance().error(
          "autoCommitThreshold is not supported in bulk listener. Please use autoCommitInterval instead"
        );
      }
      await this.consumer.run({
        partitionsConsumedConcurrently: this.baseYamlConfig.kafka.partitionsConsumedConcurrently ?? 1,
        eachBatchAutoResolve: true,
        eachBatch: this.consumeBatch
      });
    };
    this.consumeBatch = async ({
      batch,
      resolveOffset,
      heartbeat,
      pause,
      commitOffsetsIfNecessary,
      uncommittedOffsets,
      isRunning,
      isStale
    }) => {
      const messages = batch.messages.map(
        (message) => JSON.parse(message.value.toString())
      );
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
  RdKafkaBulkListenerService
});
