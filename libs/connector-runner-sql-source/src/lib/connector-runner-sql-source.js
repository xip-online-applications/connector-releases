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
var connector_runner_sql_source_exports = {};
__export(connector_runner_sql_source_exports, {
  ConnectorRunnerSqlSource: () => ConnectorRunnerSqlSource
});
module.exports = __toCommonJS(connector_runner_sql_source_exports);
var import_connector_runtime = require("@transai/connector-runtime");
var import_types = require("./types");
var import_query_result = require("./query-result.handler");
var import_kafka = require("./kafka/kafka.service");
var import_datasource_extractor = require("./datasource-extractor/datasource-extractor.service");
var import_helper = require("./helper.functions");
class ConnectorRunnerSqlSource extends import_connector_runtime.ConnectorRuntime {
  constructor() {
    super(...arguments);
    this.CONNECTOR_INSTANCE = "XOD_CONNECTOR_SQL_SOURCE_CONFIG";
    this.extractors = /* @__PURE__ */ new Map();
    this.init = async () => {
      const config = this.config;
      const kafkaWrapper = new import_kafka.KafkaService(this.kafkaService);
      const queryResultHandler = new import_query_result.QueryResultHandler(
        config,
        kafkaWrapper,
        this.offsetStore
      );
      for (const queryConfig of config.queries) {
        const extractor = new import_datasource_extractor.DatasourceExtractorService(
          config,
          queryConfig,
          this.offsetStore,
          queryResultHandler,
          this.messageObservable
        );
        await extractor.init();
        this.extractors.set(
          (0, import_helper.generateCollectionName)(config, queryConfig),
          extractor
        );
      }
    };
    this.isValidConfig = (config) => {
      return (0, import_types.isSqlSourceRunnerConfigType)(config);
    };
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ConnectorRunnerSqlSource
});
