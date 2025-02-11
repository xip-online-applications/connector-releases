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
var rdkafka_base_service_exports = {};
__export(rdkafka_base_service_exports, {
  RdKafkaBaseService: () => RdKafkaBaseService
});
module.exports = __toCommonJS(rdkafka_base_service_exports);
var import_types = require("@xip-online-data/types");
var import_logger = require("@transai/logger");
var import_abstract_rdkafka_service = require("./abstract-rdkafka-service");
class RdKafkaBaseService extends import_abstract_rdkafka_service.AbstractRdKafkaService {
  constructor() {
    super(...arguments);
    this.callbackWrappers = /* @__PURE__ */ new Map();
    this.initialized = false;
    this.init = async () => {
      if (!this.initialized) {
        await this.producer.connect();
        await this.consumer.connect();
      }
      const topics = this.baseYamlConfig.kafka.consumerTopics ?? [];
      if (this.connectorTopic) {
        import_logger.Logger.getInstance().info(
          `Default connector topic: ${this.connectorTopic}`
        );
        topics.push(this.connectorTopic);
      }
      if (topics.length > 0) {
        const regexTopics = await this.getRegexTopics();
        const topicsToSubscribeTo = [...this.getRegularTopics(), ...regexTopics];
        for (const topic of topicsToSubscribeTo) {
          import_logger.Logger.getInstance().debug("subscribing to", topic);
          await this.consumer.subscribe({ topic });
        }
        if (this.baseYamlConfig.kafka.autoCommitThreshold) {
          import_logger.Logger.getInstance().error(
            "autoCommitThreshold is not supported in bulk listener. Please use autoCommitInterval instead"
          );
        }
        await this.consumer.run({
          partitionsConsumedConcurrently: this.baseYamlConfig.kafka.partitionsConsumedConcurrently ?? 1,
          eachMessage: this.consume
        });
      }
      this.initialized = true;
    };
    this.consume = async (kafkaMessage) => {
      const message = JSON.parse(
        kafkaMessage.message?.value?.toString() || "{}"
      );
      if ((0, import_types.isXodBaseMessageType)(message)) {
        const interval = setInterval(() => {
          kafkaMessage.heartbeat();
        }, 5e3);
        try {
          let callbackIdentifier = `${message.tenantIdentifier}_${message.eventType}`;
          if (this.baseYamlConfig.debug)
            import_logger.Logger.getInstance().debug(
              `Received message from topic ${callbackIdentifier}: ${JSON.stringify(message)}`
            );
          if (!this.callbackWrappers.has(callbackIdentifier)) {
            callbackIdentifier = RdKafkaBaseService.DEFAULT_CALLBACK_EVENT_TYPE;
          }
          const callbackWrapper = this.callbackWrappers.get(callbackIdentifier);
          if (!callbackWrapper) {
            if (this.baseYamlConfig.debug)
              import_logger.Logger.getInstance().debug(
                `Callback function for topic ${callbackIdentifier} not set`
              );
            return;
          }
          for (const callback of callbackWrapper) {
            const result = await callback.callback(message);
            await this.reportResult(message, result, callback.identifier);
          }
        } catch (error) {
          import_logger.Logger.getInstance().debug(
            `Error processing message: ${error.message}`
          );
        } finally {
          clearInterval(interval);
        }
      } else {
        import_logger.Logger.getInstance().debug(
          `Message nr ${kafkaMessage.message.offset} is not a valid XodActionType`
        );
      }
    };
    this.reportResult = async (message, result, responseSource) => {
      if (this.disableLogs) {
        return;
      }
      const returnMessage = {
        type: message.type,
        message,
        result,
        responseSource,
        timestamp: (/* @__PURE__ */ new Date()).getTime()
      };
      const topic = `${message.tenantIdentifier}${this.processedTopic}`;
      if (this.baseYamlConfig.debug)
        import_logger.Logger.getInstance().debug(
          `Sending message to logs topic ${topic} ${JSON.stringify(returnMessage)}`
        );
      await this.producer.send({
        topic,
        messages: [
          {
            value: JSON.stringify(returnMessage)
          }
        ]
      });
    };
  }
  setCallbackFunction(callbackFunction, eventType = RdKafkaBaseService.DEFAULT_CALLBACK_EVENT_TYPE, identifier = "") {
    if (!this.callbackWrappers.has(eventType)) {
      this.callbackWrappers.set(eventType, []);
    }
    let callback = callbackFunction;
    if (this.messageMonitor !== void 0) {
      callback = this.messageMonitor.processMessage(callback);
    }
    this.callbackWrappers.get(eventType).push({
      callback,
      identifier: eventType === RdKafkaBaseService.DEFAULT_CALLBACK_EVENT_TYPE ? this.baseYamlConfig.processIdentifier : identifier
    });
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  RdKafkaBaseService
});
