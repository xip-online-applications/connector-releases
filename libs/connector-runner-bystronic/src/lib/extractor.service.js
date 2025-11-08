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
var extractor_service_exports = {};
__export(extractor_service_exports, {
  ExtractorService: () => ExtractorService
});
module.exports = __toCommonJS(extractor_service_exports);
var import_node_opcua = require("node-opcua");
class ExtractorService {
  #sdk;
  #opcUaCallConfig;
  #opcUaClient;
  #opcUaResultHandler;
  constructor(sdk, opcUaCallConfig, opcUaClient, apiResultHandler) {
    this.#sdk = sdk;
    this.#opcUaCallConfig = opcUaCallConfig;
    this.#opcUaClient = opcUaClient;
    this.#opcUaResultHandler = apiResultHandler;
    this.#sdk.logger.info(
      `[OPC UA] [${this.#opcUaCallConfig.name}] Extractor service initialized with interval of ${this.#opcUaCallConfig.interval} seconds`
    );
  }
  get name() {
    return `extractor-bystronic-${this.#opcUaCallConfig.name}`;
  }
  async onInit() {
    await this.#opcUaClient.init().catch((error) => {
      this.#sdk.logger.error(
        `[OPC UA] [${this.#opcUaCallConfig.name}] Failed to initialize client during onInit.`,
        { error }
      );
    });
  }
  async onRun() {
    await this.#opcUaClient.init().catch((error) => {
      this.#sdk.logger.error(
        `[OPC UA] [${this.#opcUaCallConfig.name}] Failed to initialize client.`,
        { error }
      );
      throw error;
    });
    const latestOffset = await this.#sdk.offsetStore.getOffset(
      `${this.#opcUaCallConfig.offsetFilePrefix ?? "offset"}_${this.#opcUaCallConfig.name}`
    );
    this.#sdk.logger.verbose(
      `[OPC UA] [${this.#opcUaCallConfig.name}] Executing query`
    );
    await this.#performOpcUaCalls(latestOffset).catch((error) => {
      this.#sdk.logger.error(
        `[OPC UA] [${this.#opcUaCallConfig.name}] Failed to perform calls`,
        { error }
      );
      throw error;
    });
    this.#sdk.logger.debug(
      `[OPC UA] [${this.#opcUaCallConfig.name}] Ran query`
    );
  }
  async onStop() {
    await this.#opcUaClient.disconnect();
  }
  async #performOpcUaCalls(latestOffset) {
    if (!await this.#opcUaClient.isConnected()) {
      this.#sdk.logger.warn(
        `[OPC UA] [${this.#opcUaCallConfig.name}] Skipping run because client is not connected`
      );
      return;
    }
    const result = await this.#opcUaClient.callMethod(
      `History`,
      "GetRunPartHistory",
      [
        new import_node_opcua.Variant({
          dataType: import_node_opcua.DataType.DateTime,
          value: new Date(latestOffset.timestamp)
        }),
        new import_node_opcua.Variant({
          dataType: import_node_opcua.DataType.DateTime,
          value: /* @__PURE__ */ new Date()
        }),
        new import_node_opcua.Variant({
          dataType: import_node_opcua.DataType.Int32,
          value: 0
        }),
        new import_node_opcua.Variant({
          dataType: import_node_opcua.DataType.Int32,
          value: 100
        })
      ]
    );
    await this.#opcUaResultHandler.handleResult(
      result[1],
      this.#opcUaCallConfig
    );
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ExtractorService
});
