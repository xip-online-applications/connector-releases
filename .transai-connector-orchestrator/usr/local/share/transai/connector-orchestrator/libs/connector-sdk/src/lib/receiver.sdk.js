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
var receiver_sdk_exports = {};
__export(receiver_sdk_exports, {
  ReceiverSDKService: () => ReceiverSDKService
});
module.exports = __toCommonJS(receiver_sdk_exports);
var import_helper_functions = require("@xip-online-data/helper-functions");
var import_kafka_base_service = require("@xip-online-data/kafka-base-service");
class ReceiverSDKService {
  constructor(apiConfig, kafkaServiceInstance, telemetryService, actions) {
    this.#IPC_CHANNEL = "connector-runtime";
    this.responses = {
      ok: import_kafka_base_service.Ok,
      created: import_kafka_base_service.Created,
      badRequest: import_kafka_base_service.BadRequest,
      unprocessableEntity: import_kafka_base_service.UnprocessableEntity,
      notFound: import_kafka_base_service.NotFound,
      internalServerError: import_kafka_base_service.InternalServerError
    };
    this.#connectorConfig = apiConfig;
    this.#kafkaServiceInstance = kafkaServiceInstance;
    this.#telemetryService = telemetryService;
    this.#actionConfigs = actions;
  }
  #IPC_CHANNEL;
  #connectorConfig;
  #kafkaServiceInstance;
  #telemetryService;
  #actionConfigs;
  registerCallback(callbackFunction, eventType, identifier) {
    this.#kafkaServiceInstance.setCallbackFunction(
      this.#receivedMessageTelemetry(
        this.#validateJobMessage(
          (0, import_helper_functions.expirationValidatorInLine)(
            this.#connectorConfig.action?.timeSensitive === true,
            callbackFunction
          )
        )
      ),
      eventType,
      identifier
    );
  }
  getActionConfig(message) {
    const actions = this.#actionConfigs.filter((action) => {
      return action.identifier === message.actionIdentifier && action.version === message.actionVersion;
    });
    if (actions.length !== 1) {
      return null;
    }
    return actions[0];
  }
  emitEventType(callbackFunction) {
    return (message) => {
      this.#emitToIPCChannel(message.eventType);
      return callbackFunction(message);
    };
  }
  #emitToIPCChannel(message) {
    if (process.send) {
      process.send({
        cmd: this.#IPC_CHANNEL,
        message
      });
    }
  }
  #receivedMessageTelemetry(callbackFunction) {
    return async (message) => {
      this.#telemetryService.increment(
        `sdk.receiver.message.${message.type.toLowerCase()}`
      );
      return callbackFunction(message);
    };
  }
  #validateJobMessage(callbackFunction) {
    return async (message) => {
      if (message.type !== "JOB") {
        return this.responses.badRequest("Only Accept JOB types")(message);
      }
      return callbackFunction(message);
    };
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ReceiverSDKService
});
