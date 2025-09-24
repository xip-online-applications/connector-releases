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
var connector_runner_samba_source_exports = {};
__export(connector_runner_samba_source_exports, {
  ConnectorRunnerSambaSource: () => ConnectorRunnerSambaSource
});
module.exports = __toCommonJS(connector_runner_samba_source_exports);
var import_connector_runtime = require("@transai/connector-runtime");
var import_types = require("./types");
var import_samba_filesource_processor = require("./filesource-processor/samba-filesource-processor.service");
class ConnectorRunnerSambaSource extends import_connector_runtime.ConnectorRuntime {
  constructor() {
    super(...arguments);
    this.CONNECTOR_INSTANCE = "XOD_CONNECTOR_SAMBA_SOURCE_CONFIG";
    this.#processors = [];
    this.init = async () => {
      for (const sambaSourceConfig of this.config.directories) {
        const processor = new import_samba_filesource_processor.SambaFilesourceProcessorService(
          this.config,
          sambaSourceConfig,
          this.kafkaService
        );
        await processor.init();
      }
    };
    this.exit = async () => {
      this.#processors.forEach((service) => service.stop());
      this.#processors = [];
    };
    this.isValidConfig = (config) => {
      return (0, import_types.isSambaSourceConnectorConfigType)(config);
    };
  }
  #processors;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ConnectorRunnerSambaSource
});
