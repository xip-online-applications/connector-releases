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
var connector_runner_file_sink_exports = {};
__export(connector_runner_file_sink_exports, {
  ConnectorRunnerFileSink: () => ConnectorRunnerFileSink
});
module.exports = __toCommonJS(connector_runner_file_sink_exports);
var import_connector_runtime = require("@transai/connector-runtime");
var import_kafka_base_service = require("@xip-online-data/kafka-base-service");
var import_sftp_client = require("@xip-online-data/sftp-client");
var import_handle_error = require("@xip-online-data/handle-error");
class ConnectorRunnerFileSink extends import_connector_runtime.ConnectorRuntime {
  constructor(connector, apiConfig, actionConfigs, injectedSftpInstance) {
    super(connector, apiConfig, actionConfigs);
    this.injectedSftpInstance = injectedSftpInstance;
    this.CONNECTOR_INSTANCE = "XOD_CONNECTOR_FILE_SINK_CONFIG";
    this.init = async () => {
      if (this.sftpClientInstance === void 0) {
        this.sftpClientInstance = new import_sftp_client.SftpClient(
          this.config.sftpConfig,
          this.config
        );
      }
      await this.sftpClient.init();
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
          const handleBars = action.config["parsedTemplates"];
          const parsedContent = handleBars.contents({
            inputs: message.payload
          }).trim();
          const parsedFilename = handleBars.filename({
            inputs: message.payload
          }).trim();
          try {
            if (parsedContent === void 0 || parsedFilename === void 0) {
              return (0, import_kafka_base_service.UnprocessableEntity)("Content or destination not provided")(
                message
              );
            }
            await this.sftpClient.writeFile(parsedFilename, parsedContent);
          } catch (error) {
            (0, import_handle_error.handleError)("Cannot write file", error);
          }
          return callbackFunction(message);
        };
      };
      const actionCallbackFunction = (callbackFunction) => {
        return async (m) => {
          if (m.type !== "ACTION") {
            return callbackFunction(m);
          }
          const message = m;
          try {
            if (message.payload.destination === void 0 || message.payload.content === void 0) {
              return (0, import_kafka_base_service.UnprocessableEntity)("Content or destination not provided")(
                message
              );
            }
            await this.sftpClient.writeFile(
              message.payload.destination,
              message.payload.content
            );
          } catch (error) {
            (0, import_handle_error.handleError)("Cannot write file", error);
          }
          return callbackFunction(message);
        };
      };
      this.callbackFunction = jobCallbackFunction(
        actionCallbackFunction(this.emitEventType((0, import_kafka_base_service.Created)()))
      );
    };
    this.sftpClientInstance = injectedSftpInstance;
  }
  get sftpClient() {
    if (this.sftpClientInstance === void 0) {
      throw new Error("Sftp client not initialized");
    }
    return this.sftpClientInstance;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ConnectorRunnerFileSink
});
