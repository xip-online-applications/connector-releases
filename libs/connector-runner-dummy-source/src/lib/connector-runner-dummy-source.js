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
var connector_runner_dummy_source_exports = {};
__export(connector_runner_dummy_source_exports, {
  ConnectorRunnerDummySource: () => ConnectorRunnerDummySource
});
module.exports = __toCommonJS(connector_runner_dummy_source_exports);
var import_connector_runtime = require("@transai/connector-runtime");
var import_dummy_data_generator = require("./dummy-data-generator.service");
class ConnectorRunnerDummySource extends import_connector_runtime.ConnectorRuntime {
  constructor() {
    super(...arguments);
    this.CONNECTOR_INSTANCE = "XOD_CONNECTOR_DUMMY_SINK_CONFIG";
    this.getConfig = async () => ({
      processIdentifier: this.CONNECTOR_IDENTIFIER,
      tenantIdentifier: "dummy-tenant",
      datasourceIdentifier: "dummy-source",
      kafka: {
        brokers: ["localhost:9092"],
        groupId: "dummy-source",
        clientId: "dummy-source"
      }
    });
    this.init = async () => {
      this.#generator = new import_dummy_data_generator.DummyDataGeneratorService(
        this.kafkaService,
        this.config,
        this.offsetStore
      );
    };
    this.exit = async () => {
      this.#generator?.stop();
    };
  }
  #generator;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ConnectorRunnerDummySource
});
//# sourceMappingURL=connector-runner-dummy-source.js.map
