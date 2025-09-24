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
var connector_runner_samba_sink_exports = {};
__export(connector_runner_samba_sink_exports, {
  ConnectorRunnerSambaSink: () => ConnectorRunnerSambaSink
});
module.exports = __toCommonJS(connector_runner_samba_sink_exports);
var import_connector_runtime = require("@transai/connector-runtime");
var import_kafka_base_service = require("@xip-online-data/kafka-base-service");
var import_logger = require("@transai/logger");
var import_samba_file_writer = require("./samba-fire-writer/samba-file-writer.service");
class ConnectorRunnerSambaSink extends import_connector_runtime.ConnectorRuntime {
  constructor(connector, apiConfig, actionConfigs, injectedSambaInstance) {
    super(connector, apiConfig, actionConfigs);
    this.injectedSambaInstance = injectedSambaInstance;
    this.CONNECTOR_INSTANCE = "XOD_CONNECTOR_SAMBA_SINK_CONFIG";
    this.init = async () => {
      if (this.sambaFileWriterInstance === void 0) {
        this.sambaFileWriterInstance = new import_samba_file_writer.SambaFileWriterService(
          this.config.samba
        );
      }
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
            const parsedContent = handleBars.contents({
              inputs: message.payload
            }).trim();
            const parsedFilename = handleBars.filename({
              inputs: message.payload
            }).trim();
            if (message.testRun) {
              import_logger.Logger.getInstance().info(
                `Test run for ${message.eventId} with payload ${parsedContent} to path ${parsedFilename}`
              );
              return callbackFunction(message);
            }
            const response = await this.sambaFileWriter.write(
              message,
              parsedFilename,
              parsedContent
            );
            if (response.success) {
              return callbackFunction(message);
            }
            return (0, import_kafka_base_service.InternalServerError)(response.message)(message);
          } catch (error) {
            if (error instanceof Error) {
              return (0, import_kafka_base_service.InternalServerError)(error.message)(message);
            }
            return (0, import_kafka_base_service.InternalServerError)("Unknown error")(message);
          }
        };
      };
      const actionCallbackFunction = (callbackFunction) => {
        return async (m) => {
          if (m.type !== "ACTION") {
            return callbackFunction(m);
          }
          const message = m;
          if (message.payload.destination === void 0 || message.payload.content === void 0) {
            return (0, import_kafka_base_service.UnprocessableEntity)("Content or destination not provided")(
              message
            );
          }
          const response = await this.sambaFileWriter.write(
            message,
            message.payload.destination,
            message.payload.content
          );
          if (response.success) {
            return callbackFunction(message);
          }
          return (0, import_kafka_base_service.InternalServerError)(response.message)(message);
        };
      };
      this.callbackFunction = jobCallbackFunction(
        actionCallbackFunction(this.emitEventType((0, import_kafka_base_service.Created)()))
      );
    };
    this.sambaFileWriterInstance = injectedSambaInstance;
  }
  get sambaFileWriter() {
    if (this.sambaFileWriterInstance === void 0) {
      throw new Error("Samba client not initialized");
    }
    return this.sambaFileWriterInstance;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ConnectorRunnerSambaSink
});
//# sourceMappingURL=connector-runner-samba-sink.js.map
