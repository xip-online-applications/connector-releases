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
      `OPC UA extractor service [${this.#opcUaCallConfig.name}] initialized with interval of ${this.#opcUaCallConfig.interval} seconds`
    );
  }
  async onStop() {
    await this.#opcUaClient.disconnect();
  }
  async onRun() {
    try {
      const latestOffset = await this.#sdk.offsetStore.getOffset(
        `${this.#opcUaCallConfig.offsetFilePrefix ?? "offset"}_${this.#opcUaCallConfig.name}`
      );
      await this.#opcUaClient.init();
      this.#sdk.logger.debug(
        `Executing query for: ${this.#opcUaCallConfig.name}`
      );
      await this.#performOpcUaCalls(latestOffset);
      this.#sdk.logger.debug(`Ran query for: ${this.#opcUaCallConfig.name}`);
    } catch (error) {
      this.#sdk.logger.error(
        "Failed to retrieve and process data from OPC UA source service",
        { error }
      );
    } finally {
      this.#sdk.logger.debug(
        `Disconnecting from OPCUA for: ${this.#opcUaCallConfig.name}`
      );
      await this.#opcUaClient.disconnect();
    }
  }
  async #performOpcUaCalls(latestOffset) {
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
