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
var connector_runner_file_exports = {};
__export(connector_runner_file_exports, {
  ConnectorRunnerFile: () => ConnectorRunnerFile
});
module.exports = __toCommonJS(connector_runner_file_exports);
var import_connector_runtime_sdk = require("@transai/connector-runtime-sdk");
var import_actions_handler = require("./actions-handler");
var import_processor = require("./processor");
class ConnectorRunnerFile extends import_connector_runtime_sdk.ConnectorRuntimeSDK {
  constructor(connector, connectorSDK) {
    super(connector, connectorSDK);
    this.init = async () => {
      const { config } = this.connectorSDK;
      await Promise.all(
        (config.fileSelectors ?? []).map(async (fileSelector) => {
          const processor = new import_processor.Processor(
            this.connectorSDK,
            fileSelector,
            this.#fileHandler
          );
          await this.connectorSDK.processing.registerInterval(
            fileSelector.intervalSeconds ?? import_processor.Processor.DEFAULT_INTERVAL_SECONDS,
            processor
          );
        })
      );
    };
    const { config } = this.connectorSDK;
    this.#fileHandler = this.connectorSDK.files(config.dsn);
    const actionsHandler = new import_actions_handler.ActionsHandler(
      this.connectorSDK,
      this.#fileHandler
    );
    this.callbackFunction = actionsHandler.callbackFunctionChain;
  }
  #fileHandler;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ConnectorRunnerFile
});
