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
var connector_runner_file_source_exports = {};
__export(connector_runner_file_source_exports, {
  ConnectorRunnerFileSource: () => ConnectorRunnerFileSource
});
module.exports = __toCommonJS(connector_runner_file_source_exports);
var import_connector_runtime = require("@transai/connector-runtime");
var import_sftp_client = require("@xip-online-data/sftp-client");
var import_filesource_processor = require("./filesource-processor/filesource-processor.service");
var import_types = require("./types");
class ConnectorRunnerFileSource extends import_connector_runtime.ConnectorRuntime {
  constructor() {
    super(...arguments);
    this.CONNECTOR_INSTANCE = "XOD_CONNECTOR_FILE_SOURCE_CONFIG";
    this.init = async () => {
      if (!this.offsetStoreInstance) {
        throw new Error(
          "Offset store is not defined. Please provide an temp location for the offset store."
        );
      }
      const sftpClient = new import_sftp_client.SftpClient(this.config.sftpConfig, this.config);
      await sftpClient.init();
      await Promise.all(
        this.config.directories.map(async (fileSourceConfig) => {
          const processor = new import_filesource_processor.FilesourceProcessorService(
            fileSourceConfig,
            this.config,
            this.kafkaService,
            sftpClient
          );
          await processor.init();
        })
      );
    };
    // eslint-disable-next-line class-methods-use-this
    this.isValidConfig = (config) => {
      return (0, import_types.isYamlConfigType)(config);
    };
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ConnectorRunnerFileSource
});
