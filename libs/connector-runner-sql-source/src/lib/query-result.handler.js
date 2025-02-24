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
var query_result_handler_exports = {};
__export(query_result_handler_exports, {
  QueryResultHandler: () => QueryResultHandler
});
module.exports = __toCommonJS(query_result_handler_exports);
var import_logger = require("@transai/logger");
class QueryResultHandler {
  constructor(config, kafkaService, offsetStore) {
    this.config = config;
    this.kafkaService = kafkaService;
    this.offsetStore = offsetStore;
    this.storeTimestamp = (timestamp, queryConfig) => {
      const date = new Date(timestamp.timestamp).toISOString();
      this.offsetStore.setOffset(
        { timestamp: timestamp.timestamp, id: timestamp.id, date },
        queryConfig.queryIdentifier
      );
    };
    this.getTimestamp = (record, queryConfig) => {
      let timestamp = 0;
      const recordTimestamp = this.getOptionalRecordField(
        record,
        queryConfig.incrementalField
      );
      if (recordTimestamp) {
        timestamp = new Date(recordTimestamp).getTime();
      }
      const id = this.getOptionalRecordField(record, queryConfig.keyField) ?? 0;
      return { id, timestamp };
    };
    this.getOptionalRecordField = (record, fieldName) => {
      return Object.keys(record).indexOf(fieldName) > -1 ? record[fieldName] : null;
    };
  }
  async handleResult(result, queryConfig) {
    if (result.records.length === 0) {
      return;
    }
    let lastTimestamp = { timestamp: 0, id: 0 };
    const preparedRecords = result.records.map((r) => {
      const newField = {
        ...r
      };
      lastTimestamp = this.getTimestamp(r, queryConfig);
      if (queryConfig.ignoreFields) {
        for (const field of queryConfig.ignoreFields) {
          delete newField[field];
        }
      }
      return newField;
    });
    try {
      import_logger.Logger.getInstance().debug(
        `${queryConfig.queryIdentifier} Sending ${result.affected} records to Kafka using batch`
      );
      const success = await this.kafkaService.sendBatch(
        preparedRecords,
        this.config,
        queryConfig
      );
      if (success) {
        this.storeTimestamp(lastTimestamp, queryConfig);
      }
    } catch (e) {
      import_logger.Logger.getInstance().debug(
        `${queryConfig.queryIdentifier} Sending ${result.affected} records to Kafka using single record send`
      );
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  QueryResultHandler
});
