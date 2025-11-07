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
var connector_runner_mkg_exports = {};
__export(connector_runner_mkg_exports, {
  ConnectorRunnerMkg: () => ConnectorRunnerMkg
});
module.exports = __toCommonJS(connector_runner_mkg_exports);
var import_connector_runtime_sdk = require("@transai/connector-runtime-sdk");
var import_extractor = require("./extractor.service");
var import_http_client = require("./http-client");
var import_all = require("./tables/_all");
class ConnectorRunnerMkg extends import_connector_runtime_sdk.ConnectorRuntimeSDK {
  constructor() {
    super(...arguments);
    this.init = async () => {
      const { config } = this.connectorSDK;
      const httpClient = new import_http_client.HttpClient({
        baseUrl: `https://${config.server}:${config.port ?? 443}/${(config.path ?? "/mkg").replace(/^\/+/, "")}`,
        username: config.username,
        password: config.password,
        apiToken: config.apiToken
      });
      Object.entries(config.tables ?? {}).forEach(
        ([tableIdentifier, configOrTrue]) => {
          const table = import_all.MKG_TABLES[tableIdentifier];
          if (!table) {
            this.connectorSDK.logger.warn(
              `Unknown table identifier "${tableIdentifier}", skipping configuration.`
            );
            return;
          }
          this.connectorSDK.processing.registerInterval(
            table.interval,
            new import_extractor.ExtractorService(
              this.connectorSDK,
              httpClient,
              tableIdentifier,
              table.cloneFromTableConfig(configOrTrue)
            ),
            { immediate: table.immediate }
          );
        }
      );
    };
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ConnectorRunnerMkg
});
