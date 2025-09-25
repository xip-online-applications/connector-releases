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
var connector_runner_opcua_source_exports = {};
__export(connector_runner_opcua_source_exports, {
  ConnectorRunnerOpcuaSource: () => ConnectorRunnerOpcuaSource
});
module.exports = __toCommonJS(connector_runner_opcua_source_exports);
var import_connector_runtime = require("@transai/connector-runtime");
var import_logger = require("@transai/logger");
var import_kafka = require("./kafka/kafka.service");
var import_opcua_extractor = require("./opcua-extractor/opcua-extractor.service");
var import_opcua_result = require("./opcua-result.handler");
class ConnectorRunnerOpcuaSource extends import_connector_runtime.ConnectorRuntime {
  constructor(connector, upcUaConnectorConfig, actionConfigs) {
    super(connector, upcUaConnectorConfig, actionConfigs);
    this.CONNECTOR_INSTANCE = "XOD_CONNECTOR_OPCUA_SOURCE_CONFIG";
    this.kafkaWrapper = void 0;
    this.#opcuaExtractorServices = [];
    this.init = async () => {
      const store = this.offsetStoreInstance;
      if (!store) {
        throw new Error(
          "Offset store is not defined. Please provide an temp location for the offset store."
        );
      }
      const config = await this.getConfig();
      this.kafkaWrapper = new import_kafka.KafkaService(this.kafkaService);
      const opcUaResultHandler = new import_opcua_result.OpcUaResultHandler(
        config,
        this.kafkaWrapper,
        store
      );
      this.#opcuaExtractorServices = config.opcUaCalls.map(
        (opcUaCallConfig) => new import_opcua_extractor.OpcuaExtractorService(
          opcUaCallConfig,
          config,
          opcUaResultHandler,
          store
        )
      );
    };
    this.#logger = import_logger.Logger.getInstance();
  }
  #logger;
  #opcuaExtractorServices;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ConnectorRunnerOpcuaSource
});
