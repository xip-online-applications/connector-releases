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
var rdkafka_source_service_exports = {};
__export(rdkafka_source_service_exports, {
  RdKafkaSourceService: () => RdKafkaSourceService
});
module.exports = __toCommonJS(rdkafka_source_service_exports);
var import_logger = require("@transai/logger");
var import_rdkafka_base = require("./rdkafka-base.service");
class RdKafkaSourceService extends import_rdkafka_base.RdKafkaBaseService {
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
        if (message.payload && "keyField" in message.payload && message.payload.keyField) {
          import_logger.Logger.getInstance().error(
            `IndividualWentWrong: Message keyfield: ${message.payload.body[message.payload.keyField]}`
          );
        }
        success = false;
      }
    }
    return success;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  RdKafkaSourceService
});
