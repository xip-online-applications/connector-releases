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
  #kafkaSourceService;
  constructor(kafkaSourceService) {
    this.#kafkaSourceService = kafkaSourceService;
  }
  async sendBatch(record, config, sinkConfig, priority = false) {
    const resultSize = record.length;
    const { batchSize } = sinkConfig;
    const endOfBatch = resultSize !== batchSize;
    const parsedRecords = record.map((r) => {
      return {
        type: "SOURCE",
        eventId: (0, import_uuid.v4)(),
        eventType: "event.source-sink.kafka",
        created: Date.now(),
        ttl: 36e5,
        // 1 month
        tenantIdentifier: config.tenantIdentifier,
        payload: {
          keyField: sinkConfig.keyField,
          incrementalField: sinkConfig.incrementalField,
          collection: (0, import_helper.generateCollectionName)(config, sinkConfig),
          body: r,
          priority,
          endOfBatch
        }
      };
    });
    const topic = (0, import_helper.generateKafkaTopic)(config, sinkConfig);
    return this.#kafkaSourceService.send(parsedRecords, topic);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  KafkaService
});
//# sourceMappingURL=kafka.service.js.map
