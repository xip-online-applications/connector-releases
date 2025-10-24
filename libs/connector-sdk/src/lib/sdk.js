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
var sdk_exports = {};
__export(sdk_exports, {
  TransAIConnectorSDK: () => TransAIConnectorSDK
});
module.exports = __toCommonJS(sdk_exports);
var import_connector_runtime = require("@transai/connector-runtime");
var import_helper_functions = require("@xip-online-data/helper-functions");
var import_kafka_base_service = require("@xip-online-data/kafka-base-service");
var import_processing = require("./processing.sdk");
var import_receiver = require("./receiver.sdk");
var import_sender = require("./sender.sdk");
var import_templating = require("./templating.sdk");
class TransAIConnectorSDK {
  #DEFAULT_OFFSETS_DIR = "/var/transai/offsets";
  #apiConfig;
  #logger;
  #kafkaServiceInstance;
  #sender;
  #templating;
  #offsetStore;
  #processing;
  #receiver;
  constructor(connector, logger) {
    this.#logger = logger;
    this.#apiConfig = connector.config;
    const connectorTopic = (0, import_helper_functions.buildConnectorTopic)({
      tenantIdentifier: connector.tenantIdentifier,
      identifier: connector.identifier,
      location: connector.location || "default"
    });
    this.#kafkaServiceInstance = new import_kafka_base_service.RdKafkaSourceService(
      this.#apiConfig,
      connectorTopic
    );
    this.#sender = new import_sender.SenderSDKService(
      this.#apiConfig,
      this.#kafkaServiceInstance
    );
    this.#templating = new import_templating.TemplatingSDKService();
    this.#processing = new import_processing.ProcessingSDKService(this.logger);
    this.#receiver = new import_receiver.ReceiverSDKService(
      this.#apiConfig,
      this.#kafkaServiceInstance,
      connector.actions
    );
    this.#offsetStore = new import_connector_runtime.CloudOffsetStoreService(
      process.env["TRANSAI_TMP_DIR"] ?? this.#DEFAULT_OFFSETS_DIR,
      this.#apiConfig,
      connector.identifier
    );
    this.#offsetStore.init().then(async () => {
      this.logger.debug("Offset store initialized. write start time");
      try {
        await this.#offsetStore.writeFile(connector.identifier, {
          start: (/* @__PURE__ */ new Date()).toISOString()
        });
      } catch (err) {
        this.logger.error("Error writing start time");
        throw err;
      }
      this.logger.debug("Start time written");
    }).catch((err) => {
      this.logger.error("Error init offset store");
      throw err;
    });
  }
  async stop() {
    await Promise.all([
      this.#processing.stopAll(),
      this.#kafkaServiceInstance.exitProcess("stop"),
      this.#offsetStore.deInit()
    ]);
  }
  get logger() {
    return this.#logger;
  }
  get sender() {
    return this.#sender;
  }
  get receiver() {
    return this.#receiver;
  }
  get config() {
    return this.#apiConfig;
  }
  get templating() {
    return this.#templating;
  }
  get processing() {
    return this.#processing;
  }
  get offsetStore() {
    return this.#offsetStore;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  TransAIConnectorSDK
});
