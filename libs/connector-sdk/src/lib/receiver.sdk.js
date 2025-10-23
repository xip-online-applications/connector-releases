var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var receiver_sdk_exports = {};
__export(receiver_sdk_exports, {
  ReceiverSDKService: () => ReceiverSDKService
});
module.exports = __toCommonJS(receiver_sdk_exports);
var process = __toESM(require("node:process"));
var import_helper_functions = require("@xip-online-data/helper-functions");
var import_kafka_base_service = require("@xip-online-data/kafka-base-service");
class ReceiverSDKService {
  constructor(apiConfig, kafkaServiceInstance, actions) {
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
    this.#actionConfigs = actions;
  }
  #IPC_CHANNEL;
  #connectorConfig;
  #kafkaServiceInstance;
  #actionConfigs;
  registerCallback(callbackFunction, eventType, identifier) {
    this.#kafkaServiceInstance.setCallbackFunction(
      this.#validateJobMessage(
        (0, import_helper_functions.expirationValidatorInLine)(
          this.#connectorConfig.action?.timeSensitive === true,
          callbackFunction
        )
      ),
      eventType,
      identifier
    );
  }
  getActionConfig(message) {
    if (!message.actionVersion || message.actionVersion === "latest") {
      return this.#getLatestActionConfig(message);
    }
    return this.#getSpecificActionConfig(message);
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
  #getLatestActionConfig(message) {
    const actions = this.#actionConfigs.filter(
      (action) => action.identifier === message.actionIdentifier
    );
    if (actions.length === 0) {
      return null;
    }
    return actions.sort((a, b) => {
      return a.createdAt > b.createdAt ? -1 : 1;
    })[0];
  }
  #getSpecificActionConfig(message) {
    const actions = this.#actionConfigs.filter((action) => {
      return action.identifier === message.actionIdentifier && action.version === message.actionVersion;
    });
    if (actions.length !== 1) {
      return null;
    }
    return actions[0];
  }
  #validateJobMessage(callbackFunction) {
    return async (message) => {
      if (message.type !== "JOB") {
        throw new Error("BAD REQUEST, INVALID MESSAGE TYPE");
      }
      return callbackFunction(message);
    };
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ReceiverSDKService
});
