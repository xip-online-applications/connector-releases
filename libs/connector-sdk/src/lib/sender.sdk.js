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
var sender_sdk_exports = {};
__export(sender_sdk_exports, {
  SenderSDKService: () => SenderSDKService
});
module.exports = __toCommonJS(sender_sdk_exports);
var import_uuid = require("uuid");
class SenderSDKService {
  #connectorConfig;
  #kafkaServiceInstance;
  constructor(apiConfig, kafkaServiceInstance) {
    this.#connectorConfig = apiConfig;
    this.#kafkaServiceInstance = kafkaServiceInstance;
  }
  metrics(metrics, metadata, context) {
    const kafkaPayload = metrics.map(
      (body) => ({
        type: "SOURCE",
        eventId: (0, import_uuid.v4)(),
        eventType: "event.metric",
        created: context.timestamp?.getTime() ?? Date.now(),
        ttl: context.ttl ?? -1,
        tenantIdentifier: this.#connectorConfig.tenantIdentifier,
        payload: {
          ...context.extraPayload ?? {},
          body: {
            [body.key]: body.value
          },
          metadata
        }
      })
    );
    return this.#kafkaServiceInstance.send(
      kafkaPayload,
      `${this.#connectorConfig.tenantIdentifier}_SOURCE_${this.#connectorConfig.datasourceIdentifier}`
    );
  }
  metricsLegacy(metrics, metadata, context) {
    const kafkaPayload = metrics.map(
      (body) => ({
        type: "SOURCE",
        eventId: (0, import_uuid.v4)(),
        eventType: "event.metric",
        created: context.timestamp?.getTime() ?? Date.now(),
        ttl: context.ttl ?? -1,
        tenantIdentifier: this.#connectorConfig.tenantIdentifier,
        payload: {
          ...context.extraPayload ?? {},
          body,
          metadata
        }
      })
    );
    return this.#kafkaServiceInstance.send(
      kafkaPayload,
      `${this.#connectorConfig.tenantIdentifier}_SOURCE_${this.#connectorConfig.datasourceIdentifier}`
    );
  }
  documents(records, metadata, context) {
    const kafkaPayload = records.map((record) => {
      return {
        type: "SOURCE",
        eventId: (0, import_uuid.v4)(),
        eventType: "event.source-sink.kafka",
        created: context.timestamp?.getTime() ?? Date.now(),
        ttl: context.ttl ?? 36e5,
        // 1 month
        tenantIdentifier: this.#connectorConfig.tenantIdentifier,
        payload: {
          ...context.extraPayload ?? {},
          body: record,
          metadata
        }
      };
    });
    return this.#kafkaServiceInstance.send(
      kafkaPayload,
      `${this.#connectorConfig.tenantIdentifier}_SOURCE_${this.#connectorConfig.datasourceIdentifier}`
    );
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  SenderSDKService
});
