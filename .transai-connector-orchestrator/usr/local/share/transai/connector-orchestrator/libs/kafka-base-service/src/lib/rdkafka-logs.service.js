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
var rdkafka_logs_service_exports = {};
__export(rdkafka_logs_service_exports, {
  RdKafkaLogsService: () => RdKafkaLogsService
});
module.exports = __toCommonJS(rdkafka_logs_service_exports);
var import_logger = require("@transai/logger");
var import_types = require("@xip-online-data/types");
var import_abstract_rdkafka_service = require("./abstract-rdkafka-service");
class RdKafkaLogsService extends import_abstract_rdkafka_service.AbstractRdKafkaService {
  constructor() {
    super(...arguments);
    this.#responseCallbackWrappers = [];
    this.initialized = false;
    this.init = async () => {
      if (!this.initialized) {
        await this.producer.connect();
        await this.consumer.connect();
      }
      const topics = this.baseYamlConfig.kafka.consumerTopics ?? [];
      if (topics.length > 0 || this.connectorTopic) {
        if (this.connectorTopic) {
          import_logger.Logger.getInstance().info(
            `Default connector topic: ${this.connectorTopic}`
          );
        }
        const regexTopics = await this.getRegexTopics();
        const topicsToSubscribeTo = [
          ...this.getRegularTopics(),
          ...regexTopics
        ];
        if (this.connectorTopic) {
          topicsToSubscribeTo.push(this.connectorTopic);
        }
        await Promise.all(
          topicsToSubscribeTo.map(async (topic) => {
            import_logger.Logger.getInstance().info("Subscribing to", topic);
            await this.consumer.subscribe({ topic });
          })
        );
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
      if ((0, import_types.isXodResponseType)(message)) {
        await Promise.all(
          this.#responseCallbackWrappers.map(async (callback) => {
            await callback(message);
          })
        );
      } else {
        import_logger.Logger.getInstance().warn(
          `Message nr ${kafkaMessage.message.offset} is not a valid XodActionType`
        );
      }
    };
  }
  #responseCallbackWrappers;
  setResponseCallbackFunction(callbackFunction) {
    this.#responseCallbackWrappers.push(callbackFunction);
  }
  async send(messages, topic) {
    let success = true;
    if (!this.initialized) {
      return false;
    }
    const payload = {
      topic,
      messages: messages.map((r) => {
        return {
          value: JSON.stringify(r)
        };
      })
    };
    const response = await this.producer.send(payload).catch(async (error) => {
      import_logger.Logger.getInstance().error(
        `[KAFKA SOURCE PRODUCER] in catch: Topic: ${topic}, ${JSON.stringify(error.message)} ${messages.length} messages`
      );
      if (messages.length !== 1) {
        import_logger.Logger.getInstance().debug(
          `[KAFKA SOURCE PRODUCER]: Try sending messages individually`
        );
        success = await this.sendIndividual(messages, topic);
        if (success) {
          import_logger.Logger.getInstance().debug(
            `[KAFKA SOURCE PRODUCER]: Sending messages individually was successful`
          );
        } else {
          import_logger.Logger.getInstance().error(
            `[KAFKA SOURCE PRODUCER]: Sending messages individually failed`
          );
        }
        return [{ errorCode: 0 }];
      }
      import_logger.Logger.getInstance().error(
        `[KAFKA SOURCE PRODUCER]: Sending messages individually failed`
      );
      success = false;
      return null;
    });
    if (response === null || Array.isArray(response) && response.length > 0 && response[0]?.errorCode && response[0].errorCode !== 0) {
      import_logger.Logger.getInstance().error(
        `[KAFKA SOURCE PRODUCER]: Topic: ${topic}, ${JSON.stringify(response)} ${messages.length} messages`
      );
      return false;
    }
    return success;
  }
  async sendIndividual(messages, topic) {
    let success = true;
    for (const message of messages) {
      try {
        const singleSuccess = await this.send([message], topic);
        if (!singleSuccess) {
          success = false;
        }
      } catch (error) {
        import_logger.Logger.getInstance().error(
          `IndividualWentWrong: Topic: ${topic}, ${JSON.stringify(error)}`
        );
        success = false;
      }
    }
    return success;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  RdKafkaLogsService
});
