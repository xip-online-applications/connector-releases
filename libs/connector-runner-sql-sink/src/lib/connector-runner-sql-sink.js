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
var connector_runner_sql_sink_exports = {};
__export(connector_runner_sql_sink_exports, {
  ConnectorRunnerSqlSink: () => ConnectorRunnerSqlSink
});
module.exports = __toCommonJS(connector_runner_sql_sink_exports);
var import_connector_runtime = require("@transai/connector-runtime");
var import_logger = require("@transai/logger");
var import_datasource = require("@xip-online-data/datasource");
var import_handle_error = require("@xip-online-data/handle-error");
var import_kafka_base_service = require("@xip-online-data/kafka-base-service");
function trimTrailingSemicolon(input) {
  return input.endsWith(";") ? input.slice(0, -1) : input;
}
class ConnectorRunnerSqlSink extends import_connector_runtime.ConnectorRuntime {
  constructor(connector, connectorConfig, actionConfigs, injectedDataSinkInstance) {
    super(connector, connectorConfig, actionConfigs);
    this.injectedDataSinkInstance = injectedDataSinkInstance;
    this.CONNECTOR_INSTANCE = "XOD_CONNECTOR_SQL_SINK_CONFIG";
    this.init = async () => {
      if (this.dataSinkInstance === void 0) {
        this.dataSinkInstance = new import_datasource.DatasourceService(this.config.database);
      }
      await this.dataSinkService.initialize().catch((error) => {
        (0, import_handle_error.handleError)("Error while initializing data sink service", error);
      });
      const mainJobProcessFunction = (callbackFunction) => {
        return async (m) => {
          if (m.type !== "JOB") {
            return callbackFunction(m);
          }
          try {
            const message = m;
            const actionConfig = this.getActionConfig(message);
            if (!actionConfig) {
              return (0, import_kafka_base_service.BadRequest)("Action config not found")(message);
            }
            const config = actionConfig.config;
            const inputParams = actionConfig.inputParameters.map(
              (input) => input.name
            );
            const query = message.testRun ? `START TRANSACTION; ${trimTrailingSemicolon(config.query)}; ROLLBACK;` : `${trimTrailingSemicolon(config.query)};`;
            const params = inputParams.map((param) => message.payload[param]);
            if (message.testRun) {
              this.log.info(
                `Handle message ${message.eventId} with query ${query} and params ${params}`
              );
            } else {
              this.log.debug(
                `Handle message ${message.eventId} with query ${query} and params ${params}`
              );
            }
            try {
              this.log.debug(`executing query, ${query}`);
              const result = await this.dataSinkService.query(query, params);
              if (result === null) {
                this.log.error(`Query failed, no result`);
                return (0, import_kafka_base_service.InternalServerError)("Query failed, no result")(message);
              }
              if (typeof result === "object" && "error" in result && result.error) {
                this.log.error(`Query failed with error: ${result.error}`);
                return (0, import_kafka_base_service.InternalServerError)(
                  typeof result === "object" && "error" in result && result.error ? result.error : "Unknown error"
                )(message);
              }
              this.log.debug("query done");
              if (result) {
                return callbackFunction(message);
              }
              return (0, import_kafka_base_service.InternalServerError)("Query failed, no result")(message);
            } catch (error) {
              if (error instanceof Error) {
                return (0, import_kafka_base_service.InternalServerError)(JSON.stringify(error))(message);
              }
              return (0, import_kafka_base_service.InternalServerError)("Query failed, no result")(message);
            }
          } catch (error) {
            if (error instanceof Error) {
              return (0, import_kafka_base_service.InternalServerError)(JSON.stringify(error))(m);
            }
            return (0, import_kafka_base_service.InternalServerError)(
              "Process to build query failed, Unknown error"
            )(m);
          }
        };
      };
      const mainActionProcessFunction = (callbackFunction) => {
        return async (m) => {
          if (m.type !== "ACTION") {
            return callbackFunction(m);
          }
          const message = m;
          if (!message.payload.content) {
            return (0, import_kafka_base_service.BadRequest)("Query not found")(message);
          }
          const cleanedQuery = message.payload.content.replace(/\s+/g, " ").trim();
          import_logger.Logger.getInstance().debug(
            `Handle message ${message.eventId} with query ${cleanedQuery}`
          );
          try {
            const result = await this.dataSinkService.query(cleanedQuery);
            if (result === null) {
              this.log.error(`Query failed, no result`);
              return (0, import_kafka_base_service.InternalServerError)("Query failed, no result")(message);
            }
            if (typeof result === "object" && "error" in result && result.error) {
              this.log.error(`Query failed with error: ${result.error}`);
              return (0, import_kafka_base_service.InternalServerError)(
                typeof result === "object" && "error" in result && result.error ? result.error : "Unknown error"
              )(message);
            }
            this.log.debug("query done");
            if (result) {
              return callbackFunction(message);
            }
            return (0, import_kafka_base_service.InternalServerError)("Query failed, no result")(message);
          } catch (error) {
            if (error instanceof Error) {
              return (0, import_kafka_base_service.InternalServerError)(JSON.stringify(error))(m);
            }
            return (0, import_kafka_base_service.InternalServerError)(
              "Process to build query failed, Unknown error"
            )(m);
          }
        };
      };
      this.callbackFunction = mainActionProcessFunction(
        mainJobProcessFunction(this.emitEventType((0, import_kafka_base_service.Created)()))
      );
    };
    this.dataSinkInstance = injectedDataSinkInstance;
  }
  get dataSinkService() {
    if (this.dataSinkInstance === void 0) {
      throw new Error("Samba client not initialized");
    }
    return this.dataSinkInstance;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ConnectorRunnerSqlSink
});
//# sourceMappingURL=connector-runner-sql-sink.js.map
