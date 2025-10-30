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
var connector_runner_microsoft_office365_email_exports = {};
__export(connector_runner_microsoft_office365_email_exports, {
  ConnectorRunnerMicrosoftOffice365Email: () => ConnectorRunnerMicrosoftOffice365Email
});
module.exports = __toCommonJS(connector_runner_microsoft_office365_email_exports);
var import_connector_runtime_sdk = require("@transai/connector-runtime-sdk");
var import_microsoft_office365_mail_client = require("@xip-online-data/microsoft-office365-mail-client");
var import_actions_handler = require("./actions-handler");
var import_mail_processor = require("./mail-processor");
class ConnectorRunnerMicrosoftOffice365Email extends import_connector_runtime_sdk.ConnectorRuntimeSDK {
  constructor(connector, connectorSDK) {
    super(connector, connectorSDK);
    this.init = async () => {
      const { config } = this.connectorSDK;
      await Promise.all(
        config.mailboxes.map(async (mailSourceConfig) => {
          const mailProcessor = new import_mail_processor.MailProcessor(
            this.connectorSDK,
            mailSourceConfig,
            this.#mailClient
          );
          await this.connectorSDK.processing.registerInterval(
            mailSourceConfig.interval ?? mailProcessor.DEFAULT_INTERVAL_SECONDS,
            mailProcessor,
            { immediate: true }
          );
        })
      );
    };
    const { config } = this.connectorSDK;
    this.#mailClient = new import_microsoft_office365_mail_client.MailClient(config.mailConfig);
    this.#actionsHandler = new import_actions_handler.ActionsHandler(
      this.connectorSDK,
      this.#mailClient
    );
    this.callbackFunction = this.#actionsHandler.callbackFunctionChain;
  }
  #mailClient;
  #actionsHandler;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ConnectorRunnerMicrosoftOffice365Email
});
