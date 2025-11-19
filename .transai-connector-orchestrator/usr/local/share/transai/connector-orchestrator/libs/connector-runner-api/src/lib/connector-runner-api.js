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
var connector_runner_api_exports = {};
__export(connector_runner_api_exports, {
  ConnectorRunnerApi: () => ConnectorRunnerApi
});
module.exports = __toCommonJS(connector_runner_api_exports);
var import_connector_runtime_sdk = require("@transai/connector-runtime-sdk");
var import_extractor = require("./extractor.service");
var import_http_client_authentication = require("./http-client-authentication");
var import_result = require("./result.handler");
class ConnectorRunnerApi extends import_connector_runtime_sdk.ConnectorRuntimeSDK {
  constructor(connector, connectorSDK) {
    super(connector, connectorSDK);
    this.#httpClient = void 0;
    this.init = async () => {
      const { config } = this.connectorSDK;
      const resultHandler = new import_result.ResultHandler(this.connectorSDK);
      (config.apiCalls ?? []).forEach((apiConfig) => {
        this.connectorSDK.processing.registerInterval(
          apiConfig.interval,
          new import_extractor.ExtractorService(
            this.connectorSDK,
            apiConfig,
            resultHandler,
            this.#httpClient
          )
        );
      });
    };
    const { config } = this.connectorSDK;
    if (config.url) {
      this.#httpClient = this.connectorSDK.httpClient({
        baseUrl: config.url
      }).setRequestOptionsFormatter(
        import_http_client_authentication.HttpClientAuthentication.createForAuthConfig(
          config,
          this.connectorSDK.httpClient()
        )
      );
    }
  }
  #httpClient;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ConnectorRunnerApi
});
