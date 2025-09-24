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
var connector_runner_api_source_exports = {};
__export(connector_runner_api_source_exports, {
  ConnectorRunnerApiSource: () => ConnectorRunnerApiSource
});
module.exports = __toCommonJS(connector_runner_api_source_exports);
var import_connector_runtime = require("@transai/connector-runtime");
var import_api_result = require("./api-result.handler");
var import_api_extractor = require("./api-extractor/api-extractor.service");
var import_types = require("./types");
var import_kafka = require("./kafka/kafka.service");
var import_token_manager = require("./token-manager/token-manager");
var import_jsession_manager = require("./jsession-manager/jsession-manager");
var import_api = require("./api/api");
class ConnectorRunnerApiSource extends import_connector_runtime.ConnectorRuntime {
  constructor() {
    super(...arguments);
    this.CONNECTOR_INSTANCE = "XOD_CONNECTOR_API_SOURCE_CONFIG";
    this.kafkaWrapper = void 0;
    this.#apiExtractorServices = [];
    this.init = async () => {
      const store = this.offsetStoreInstance;
      if (!store) {
        throw new Error(
          "Offset store is not defined. Please provide an temp location for the offset store."
        );
      }
      const config = this.config;
      this.kafkaWrapper = new import_kafka.KafkaService(this.kafkaService);
      const apiResultHandler = new import_api_result.ApiResultHandler(
        config,
        this.kafkaWrapper,
        store
      );
      let tokenManager;
      let sessionManager;
      if (config.tokenUrl && config.clientId && config.clientSecret) {
        tokenManager = new import_token_manager.TokenManager(
          config.tokenUrl,
          config.clientId,
          config.clientSecret
        );
      }
      if (config.sessionUrl && config.sessionUsername && config.sessionPassword) {
        sessionManager = new import_jsession_manager.JsessionManager(
          config.sessionUrl,
          config.sessionUsername,
          config.sessionPassword
        );
      }
      this.#apiExtractorServices = config.apiCalls.map((apiConfig) => {
        const api = new import_api.Api(config, tokenManager, sessionManager);
        return new import_api_extractor.ApiExtractorService(
          config,
          apiConfig,
          api,
          apiResultHandler,
          store
        );
      });
    };
    this.exit = async () => {
      this.#apiExtractorServices.forEach((service) => service.stop());
      this.#apiExtractorServices = [];
    };
    this.isValidConfig = (config) => {
      return (0, import_types.isApiSourceConfigType)(config);
    };
  }
  #apiExtractorServices;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ConnectorRunnerApiSource
});
//# sourceMappingURL=connector-runner-api-source.js.map
