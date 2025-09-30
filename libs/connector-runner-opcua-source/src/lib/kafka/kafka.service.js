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
var kafka_service_exports = {};
__export(kafka_service_exports, {
  KafkaService: () => KafkaService
});
module.exports = __toCommonJS(kafka_service_exports);
var import_uuid = require("uuid");
var import_helper = require("../helper.functions");
class KafkaService {
  constructor(kafkaSourceService) {
    this.kafkaSourceService = kafkaSourceService;
  }
  async sendDocuments(records, config, queryConfig, metadata = {}) {
    const kafkaPayload = records.map((record) => {
      return {
        type: "SOURCE",
        eventId: (0, import_uuid.v4)(),
        eventType: "event.source-sink.kafka",
        created: Date.now(),
        ttl: 36e5,
        // 1 month
        tenantIdentifier: config.tenantIdentifier,
        payload: {
          keyField: queryConfig.keyField,
          incrementalField: queryConfig.incrementalField,
          collection: (0, import_helper.generateCollectionName)(config, queryConfig),
          body: record,
          metadata: {
            ...metadata
          }
        }
      };
    });
    const topic = (0, import_helper.generateKafkaTopic)(config);
    return this.kafkaSourceService.send(kafkaPayload, topic);
  }
  async sendMetric(records, config, metadata = {}) {
    const kafkaPayload = records.map((body) => {
      return {
        type: "SOURCE",
        eventId: (0, import_uuid.v4)(),
        eventType: "event.metric",
        created: Date.now(),
        ttl: -1,
        tenantIdentifier: config.tenantIdentifier,
        payload: {
          body,
          metadata: {
            ...metadata
          }
        }
      };
    });
    const topic = (0, import_helper.generateKafkaTopic)(config);
    return this.kafkaSourceService.send(kafkaPayload, topic);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  KafkaService
});
