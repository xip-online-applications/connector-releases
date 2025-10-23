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
var connector_runner_bystronic_exports = {};
__export(connector_runner_bystronic_exports, {
  ConnectorRunnerBystronic: () => ConnectorRunnerBystronic
});
module.exports = __toCommonJS(connector_runner_bystronic_exports);
var import_connector_runtime_sdk = require("@transai/connector-runtime-sdk");
var import_opcua_client = require("@transai/opcua-client");
var import_extractor = require("./extractor.service");
var import_result = require("./result.handler");
class ConnectorRunnerBystronic extends import_connector_runtime_sdk.ConnectorRuntimeSDK {
  constructor() {
    super(...arguments);
    this.#OPCUA_NAMESPACE = "http://bystronic.com/ByVisionCutting/";
    this.start = async () => {
      const { config } = this.connectorSDK;
      const opcUaClient = new import_opcua_client.OpcuaClient({
        namespace: this.#OPCUA_NAMESPACE,
        ...this.connectorSDK.config.opcuaConfig
      });
      const opcUaResultHandler = new import_result.ResultHandler(
        this.connectorSDK,
        opcUaClient
      );
      config.opcUaCalls.forEach((opcUaCallConfig) => {
        this.connectorSDK.processing.registerInterval(
          opcUaCallConfig.interval,
          new import_extractor.ExtractorService(
            this.connectorSDK,
            opcUaCallConfig,
            opcUaClient,
            opcUaResultHandler
          )
        );
      });
    };
  }
  #OPCUA_NAMESPACE;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ConnectorRunnerBystronic
});
