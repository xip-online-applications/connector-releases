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
var connector_runtime_exports = {};
__export(connector_runtime_exports, {
  ConnectorRuntimeSDK: () => ConnectorRuntimeSDK
});
module.exports = __toCommonJS(connector_runtime_exports);
var process = __toESM(require("node:process"));
class ConnectorRuntimeSDK {
  constructor(connector, connectorSDK) {
    this.#IPC_CHANNEL = "connector-runtime";
    this.init = () => Promise.resolve();
    this.start = () => Promise.resolve();
    this.stop = () => Promise.resolve();
    this.#connectorSDK = connectorSDK;
    if (process.on) {
      process.on("message", (message) => {
        if (message.cmd === this.#IPC_CHANNEL) {
          connectorSDK.logger.verbose(
            `${process.pid} Received message from parent process:`,
            message
          );
        }
      });
    } else {
      connectorSDK.logger.warn(
        "IPC channel is not available. process.on is undefined."
      );
    }
    if (!process.send) {
      connectorSDK.logger.warn(
        "IPC channel is not available. process.send is undefined."
      );
    }
    connector.actions?.forEach((action) => {
      if (action.config["templates"] === void 0) {
        return;
      }
      const containers = {};
      Object.entries(action.config["templates"]).forEach(([key, value]) => {
        try {
          containers[key] = connectorSDK.templating.compile(value);
        } catch (error) {
          connectorSDK.logger.error(
            `Error compiling template ${key} for action ${action.identifier}`,
            error
          );
        }
      });
      action.config["parsedTemplates"] = containers;
    });
  }
  #IPC_CHANNEL;
  #connectorSDK;
  set callbackFunction(callback) {
    this.connectorSDK.receiver.registerCallback(
      this.#enrichWithActionConfig(callback)
    );
  }
  get connectorSDK() {
    return this.#connectorSDK;
  }
  #enrichWithActionConfig(callbackFunction) {
    return async (message) => {
      const action = this.#connectorSDK.receiver.getActionConfig(message);
      if (!action) {
        return this.#connectorSDK.receiver.responses.badRequest(
          "Action not found"
        )(message);
      }
      return callbackFunction(message, action);
    };
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ConnectorRuntimeSDK
});
