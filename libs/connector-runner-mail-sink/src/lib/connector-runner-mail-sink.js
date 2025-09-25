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
var connector_runner_mail_sink_exports = {};
__export(connector_runner_mail_sink_exports, {
  ConnectorRunnerMailSink: () => ConnectorRunnerMailSink
});
module.exports = __toCommonJS(connector_runner_mail_sink_exports);
var import_connector_runtime = require("@transai/connector-runtime");
var import_kafka_base_service = require("@xip-online-data/kafka-base-service");
var import_logger = require("@transai/logger");
var import_src = require("../../../mail-client/src");
class ConnectorRunnerMailSink extends import_connector_runtime.ConnectorRuntime {
  constructor(connector, mailSinkConfig, actionConfigs, injectedMailClientInstance) {
    super(connector, mailSinkConfig, actionConfigs);
    this.injectedMailClientInstance = injectedMailClientInstance;
    this.CONNECTOR_INSTANCE = "XOD_CONNECTOR_MAIL_SINK_CONFIG";
    this.init = async () => {
      if (this.mailClientInstance === void 0) {
        this.mailClientInstance = new import_src.GraphMailClient(this.config.mailConfig);
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
            const parsedBodyJson = JSON.parse(parsedBody);
            switch (parsedBodyJson.actionType) {
              case "REPLY":
                this.mailClientInstance.reply(
                  parsedBodyJson.from,
                  parsedBodyJson.Malbox,
                  parsedBodyJson.messageId,
                  parsedBodyJson.mailBody,
                  true
                );
                break;
              case "FORWARD":
                break;
              case "SEND":
                break;
              case "TAG_ADD":
                break;
              case "TAG_REMOVE":
                break;
              default:
                throw new Error(
                  `Unknown action type: ${parsedBodyJson.actionType}`
                );
            }
            const result = { success: true, data: "Not implemented yet" };
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
            const result = { success: true, data: "Not implemented yet" };
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
    this.mailClientInstance = injectedMailClientInstance;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ConnectorRunnerMailSink
});
