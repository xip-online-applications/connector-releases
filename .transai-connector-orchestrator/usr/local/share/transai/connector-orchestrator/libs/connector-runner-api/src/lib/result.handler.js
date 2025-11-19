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
var result_handler_exports = {};
__export(result_handler_exports, {
  ResultHandler: () => ResultHandler
});
module.exports = __toCommonJS(result_handler_exports);
var import_html_entities = require("html-entities");
class ResultHandler {
  #sdk;
  constructor(sdk) {
    this.#sdk = sdk;
  }
  async handleResult(result, apiConfig) {
    const parsedContent = JSON.parse((0, import_html_entities.decode)(result));
    const keys = Object.keys(parsedContent);
    if (keys.length === 0) {
      return;
    }
    if (apiConfig.listField) {
      await this.#sendBatch(parsedContent, apiConfig);
    } else {
      await this.#sendSingleRecord(parsedContent, apiConfig);
    }
  }
  async #sendBatch(parsedContent, apiConfig) {
    const list = parsedContent[apiConfig.listField ?? ""];
    if (!(list && Array.isArray(list))) {
      this.#sdk.logger.debug(
        `[API] [${apiConfig.name}] No records found, skipping. ${JSON.stringify(list)}`
      );
      return;
    }
    await this.#sendData(list, apiConfig);
    const item = list[list.length - 1];
    this.#sdk.offsetStore.setOffset(
      {
        timestamp: (apiConfig.incrementalField ? new Date(item[apiConfig.incrementalField]) : /* @__PURE__ */ new Date()).getTime(),
        id: 0,
        rawTimestamp: 0
      },
      `${apiConfig.offsetFilePrefix ?? "offset"}_${apiConfig.name}`
    );
  }
  async #sendSingleRecord(parsedContent, apiConfig) {
    const success = await this.#sendData([parsedContent], apiConfig);
    if (!success) {
      this.#sdk.logger.debug(
        `[API] [${apiConfig.name}] Error while sending record to Kafka: `,
        parsedContent
      );
      return;
    }
    this.#sdk.offsetStore.setOffset(
      {
        timestamp: Date.now(),
        id: 0,
        rawTimestamp: 0
      },
      `${apiConfig.offsetFilePrefix ?? "offset"}_${apiConfig.name}`
    );
  }
  async #sendData(list, apiConfig) {
    const collection = `${this.#sdk.config.datasourceIdentifier ?? "api"}_${apiConfig.name}`;
    const metadata = {
      ...apiConfig.metadata ?? {},
      ...apiConfig.incrementalField ? { incrementalField: apiConfig.incrementalField } : {},
      ...apiConfig.keyField ? { keyField: apiConfig.keyField } : {},
      collection
    };
    if (apiConfig.type === "metric") {
      return await this.#sdk.sender.metricsLegacy(
        list,
        metadata
      ) === true;
    }
    return await this.#sdk.sender.documents(list, metadata) === true;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ResultHandler
});
