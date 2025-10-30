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
var connector_runner_api_sink_exports = {};
__export(connector_runner_api_sink_exports, {
  ConnectorRunnerApiSink: () => ConnectorRunnerApiSink
});
module.exports = __toCommonJS(connector_runner_api_sink_exports);
var import_connector_runtime = require("@transai/connector-runtime");
var import_logger = require("@transai/logger");
var import_http_client = require("@xip-online-data/http-client");
var import_kafka_base_service = require("@xip-online-data/kafka-base-service");
class ConnectorRunnerApiSink extends import_connector_runtime.ConnectorRuntime {
  constructor(connector, apiConfig, actionConfigs, injectedHttpClientInstance) {
    super(connector, apiConfig, actionConfigs);
    this.injectedHttpClientInstance = injectedHttpClientInstance;
    this.CONNECTOR_INSTANCE = "XOD_CONNECTOR_API_SINK_CONFIG";
    this.init = async () => {
      if (this.httpClientInstance === void 0) {
        this.httpClientInstance = new import_http_client.HttpClient(this.config.http);
      }
      await this.httpClient.init();
      const jobCallbackFunction = (callbackFunction) => {
        return async (m) => {
          if (m.type !== "JOB") {
            return callbackFunction(m);
          }
          const message = m;
          let action;
          try {
            action = this.getActionConfig(message);
          } catch (error) {
            if (error instanceof Error) {
              return (0, import_kafka_base_service.BadRequest)(`No action found: ${error.message}`)(message);
            }
            return (0, import_kafka_base_service.BadRequest)("Unknown error occured")(message);
          }
          try {
            const handleBars = action.config["parsedTemplates"];
            const parsedUrl = handleBars.url({
              inputs: message.payload
            }).trim();
            const parsedBody = handleBars.body({
              inputs: message.payload
            }).trim();
            if (message.testRun) {
              import_logger.Logger.getInstance().info(
                `Test run for ${message.eventId} with payload ${parsedBody} to path ${parsedUrl}`
              );
              return callbackFunction(message);
            }
            import_logger.Logger.getInstance().debug(
              `Sending request to ${parsedUrl}: ${JSON.stringify(parsedBody)}`
            );
            const result = await this.httpClient.post(parsedUrl, parsedBody);
            if (result.success) {
              return callbackFunction(message);
            }
            return (0, import_kafka_base_service.InternalServerError)(result.data)(message);
          } catch (error) {
            if (error instanceof Error) {
              return (0, import_kafka_base_service.InternalServerError)(error.message)(message);
            }
            return (0, import_kafka_base_service.InternalServerError)("Unknown error occured")(message);
          }
        };
      };
      const actionCallbackFunction = (callbackFunction) => {
        return async (m) => {
          if (m.type !== "ACTION") {
            return callbackFunction(m);
          }
          const message = m;
          try {
            if (!message.payload.destination || !message.payload.content) {
              return (0, import_kafka_base_service.BadRequest)("Destination or content not found")(message);
            }
            const result = await this.httpClient.post(
              message.payload.destination,
              message.payload.content
            );
            if (result.success) {
              return callbackFunction(message);
            }
            return (0, import_kafka_base_service.InternalServerError)(result.data)(message);
          } catch (error) {
            if (error instanceof Error) {
              return (0, import_kafka_base_service.InternalServerError)(error.message)(message);
            }
            return (0, import_kafka_base_service.InternalServerError)("Unknown error occurred")(message);
          }
        };
      };
      this.callbackFunction = jobCallbackFunction(
        actionCallbackFunction(this.emitEventType((0, import_kafka_base_service.Created)()))
      );
    };
    this.httpClientInstance = injectedHttpClientInstance;
  }
  get httpClient() {
    if (this.httpClientInstance === void 0) {
      throw new Error("API client not initialized");
    }
    return this.httpClientInstance;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ConnectorRunnerApiSink
});
//# sourceMappingURL=connector-runner-api-sink.js.map
