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
var connector_runner_mail_source_exports = {};
__export(connector_runner_mail_source_exports, {
  ConnectorRunnerMailSource: () => ConnectorRunnerMailSource
});
module.exports = __toCommonJS(connector_runner_mail_source_exports);
var import_connector_runtime = require("@transai/connector-runtime");
var import_mailsource_processor = require("./mail-processor/mailsource-processor.service");
var import_types = require("./types");
var import_mail_client = require("@xip-online-data/mail-client");
class ConnectorRunnerMailSource extends import_connector_runtime.ConnectorRuntime {
  constructor() {
    super(...arguments);
    this.CONNECTOR_INSTANCE = "XOD_CONNECTOR_MAIL_SOURCE_CONFIG";
    this.#processors = [];
    this.init = async () => {
      if (this.offsetStoreInstance === void 0) {
        throw new Error(
          "Offset store is not defined. Please provide an temp location for the offset store."
        );
      }
      this.#processors = await Promise.all(
        this.config.mailboxes.map(async (mailSourceConfig) => {
          const mailClient = new import_mail_client.MailClient(this.config.mailConfig);
          const processor = new import_mailsource_processor.MailsourceProcessorService(
            this.config,
            mailSourceConfig,
            this.kafkaService,
            mailClient,
            this.offsetStoreInstance
          );
          await processor.init();
          return processor;
        })
      );
    };
    this.exit = async () => {
      this.#processors.forEach((service) => service.stop());
    };
    this.isValidConfig = (config) => {
      return (0, import_types.isYamlConfigType)(config);
    };
  }
  #processors;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ConnectorRunnerMailSource
});
