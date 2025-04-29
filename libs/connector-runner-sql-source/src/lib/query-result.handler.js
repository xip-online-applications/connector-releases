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
    this.storeTimestamp = (timestamp, queryConfig) => {
      const date = new Date(timestamp.timestamp).toISOString();
      this.#offsetStore.setOffset(
        {
          timestamp: timestamp.timestamp,
          id: timestamp.id,
          date,
          rawTimestamp: timestamp.rawTimestamp
        },
        queryConfig.queryIdentifier
      );
    };
    this.getTimestamp = (record, queryConfig) => {
      let timestamp = 0;
      let isoDate = "";
      let rawTimestamp;
      const recordTimestamp = this.getOptionalRecordField(
        record,
        queryConfig.incrementalField
      );
      if (recordTimestamp) {
        const dateObject = new Date(recordTimestamp);
        timestamp = dateObject.getTime();
        isoDate = dateObject.toISOString();
      }
      if (typeof recordTimestamp === "string" || typeof recordTimestamp === "number") {
        rawTimestamp = recordTimestamp;
      } else {
        import_logger.Logger.getInstance().warn(
          `${queryConfig.queryIdentifier} rawTimestamp is invalid. Not a string or number.`
        );
      }
      const id = this.getOptionalRecordField(record, queryConfig.keyField) ?? 0;
      return { id, timestamp, rawTimestamp, isoDate };
    };
    // eslint-disable-next-line class-methods-use-this
    this.getOptionalRecordField = (record, fieldName) => {
      return Object.keys(record).indexOf(fieldName) > -1 ? record[fieldName] : null;
    };
    this.#config = config;
    this.#kafkaService = kafkaService;
    this.#offsetStore = offsetStore;
  }
  #config;
  #kafkaService;
  #offsetStore;
  async handleResult(result, queryConfig, previousOffset, priority = false) {
    import_logger.Logger.getInstance().debug(
      `${queryConfig.queryIdentifier} runned successfully. Gotten ${result.records.length} records`
    );
    if (result.records.length === 0) {
      return true;
    }
    const newestTimeStamp = this.getTimestamp(
      result.records[result.records.length - 1],
      queryConfig
    );
    const preparedRecords = result.records.map((r) => {
      const newField = {
        ...r
      };
      if (queryConfig.ignoreFields) {
        for (const field of queryConfig.ignoreFields) {
          delete newField[field];
        }
      }
      return newField;
    });
    if (queryConfig.incrementalField !== "" && newestTimeStamp.id === previousOffset?.id && newestTimeStamp.timestamp === previousOffset?.timestamp && result.affected !== 0) {
      import_logger.Logger.getInstance().error(
        `${queryConfig.queryIdentifier} runned successfully. But offset is not changed ${JSON.stringify(newestTimeStamp)}`
      );
      return false;
    }
    try {
      import_logger.Logger.getInstance().debug(
        `${queryConfig.queryIdentifier} Sending ${result.affected} records to Kafka using batch`
      );
      const success = await this.#kafkaService.sendBatch(
        preparedRecords,
        this.#config,
        queryConfig,
        priority
      );
      if (success) {
        this.storeTimestamp(newestTimeStamp, queryConfig);
      }
      return success;
    } catch (e) {
      import_logger.Logger.getInstance().debug(
        `${queryConfig.queryIdentifier} Sending ${result.affected} records going wrong.`
      );
      return false;
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  QueryResultHandler
});
