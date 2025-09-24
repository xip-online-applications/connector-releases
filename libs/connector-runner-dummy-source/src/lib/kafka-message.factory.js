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
var kafka_message_factory_exports = {};
__export(kafka_message_factory_exports, {
  buildKafkaMessage: () => buildKafkaMessage,
  generateKafkaTopic: () => generateKafkaTopic
});
module.exports = __toCommonJS(kafka_message_factory_exports);
var import_uuid = require("uuid");
const payloadFactory = (body, metadata, config, eventType) => ({
  type: "SOURCE",
  eventId: (0, import_uuid.v4)(),
  eventType,
  created: Date.now(),
  ttl: -1,
  tenantIdentifier: config.tenantIdentifier,
  payload: {
    body,
    metadata
  }
});
const buildKafkaMessage = (body, metadata, config, eventType, amount = 10) => {
  const kafkaPayload = Array.from(Array(amount).keys()).map(() => payloadFactory(body, metadata, config, eventType));
  const topic = generateKafkaTopic(config);
  return [kafkaPayload, topic];
};
function generateKafkaTopic(connectorConfig) {
  return `${connectorConfig.tenantIdentifier}_SOURCE_${connectorConfig.datasourceIdentifier}`;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  buildKafkaMessage,
  generateKafkaTopic
});
