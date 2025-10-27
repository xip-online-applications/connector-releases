var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var result_handler_exports = {};
__export(result_handler_exports, {
  ResultHandler: () => ResultHandler
});
module.exports = __toCommonJS(result_handler_exports);
var import_jsonata = __toESM(require("jsonata"));
var import_node_opcua = require("node-opcua");
class ResultHandler {
  constructor(sdk, opcuaClient) {
    this.DEFAULT_DATASOURCE_IDENTIFIER = "bystronic";
    this.#OPCUA_ID_JSONATA_EXPRESSION = "JobGuid";
    this.#INCREMENTAL_FIELD_JSONATA_EXPRESSION = "TimeStamp";
    this.#idExpression = (0, import_jsonata.default)(this.#OPCUA_ID_JSONATA_EXPRESSION);
    this.#sdk = sdk;
    this.#opcuaClient = opcuaClient;
  }
  #OPCUA_ID_JSONATA_EXPRESSION;
  #INCREMENTAL_FIELD_JSONATA_EXPRESSION;
  #sdk;
  #opcuaClient;
  #idExpression;
  async handleResult(result, opcUaCallConfig) {
    this.#sdk.logger.debug(`Handling result for ${opcUaCallConfig.name}`);
    const data = JSON.parse(
      result
    );
    if (!Array.isArray(data)) {
      await this.#sendBatch(data, opcUaCallConfig);
      return;
    }
    const messages = await this.#processResultItemsIntoMessages(data);
    await this.#sendBatch(messages, opcUaCallConfig);
  }
  async #processResultItemsIntoMessages(data) {
    this.#sdk.logger.debug(`Processing sub-queries for results`);
    return Promise.all(
      data.map(async (item) => {
        this.#sdk.logger.debug("Processing item", item);
        const id = await this.#idExpression.evaluate(item);
        this.#sdk.logger.debug({ id }, "Extracted id");
        const result = await this.#opcuaClient.callMethod(
          `History`,
          "GetPartInfos",
          [
            new import_node_opcua.Variant({
              dataType: import_node_opcua.DataType.Guid,
              value: id
            })
          ]
        );
        if (!result || result.length === 0) {
          this.#sdk.logger.debug(
            "No output arguments found for sub-query, sending original item"
          );
          return item;
        }
        try {
          const parsed = JSON.parse(
            result[0]
          );
          const matchingPart = parsed.find((pi) => pi.PartId === item.PartId) ?? {};
          const merged = { ...item, ...matchingPart };
          this.#sdk.logger.debug({ merged }, "Data to send");
          return merged;
        } catch (e) {
          this.#sdk.logger.warn(
            "Invalid JSON in OPC UA response; returning original item",
            { err: e, jsonPreview: result[0].slice(0, 200) }
          );
          return item;
        }
      })
    );
  }
  async #sendBatch(list, config) {
    this.#sdk.logger.debug(
      `Sending ${JSON.stringify(list)} with config ${JSON.stringify(config)}`
    );
    if (!(list && Array.isArray(list))) {
      this.#sdk.logger.debug(
        `No records found, skipping. ${JSON.stringify(list)}`
      );
      return;
    }
    let { incrementalField } = config;
    if (!incrementalField || incrementalField.length === 0) {
      incrementalField = this.#INCREMENTAL_FIELD_JSONATA_EXPRESSION;
    }
    const metadata = {
      ...config.metadata ? config.metadata : {},
      ...config.keyField ? { keyField: config.keyField } : {},
      collection: this.#sdk.config.datasourceIdentifier ?? this.DEFAULT_DATASOURCE_IDENTIFIER,
      incrementalField
    };
    if (config.type === "metric") {
      await this.#sdk.sender.metricsLegacy(list, metadata);
    } else {
      await this.#sdk.sender.documents(list, metadata);
    }
    const item = list[list.length - 1];
    const expression = (0, import_jsonata.default)(incrementalField);
    const value = await expression.evaluate(item);
    this.#sdk.offsetStore.setOffset(
      {
        timestamp: (value ? new Date(value) : /* @__PURE__ */ new Date()).getTime(),
        id: 0,
        rawTimestamp: value || ""
      },
      `${config.offsetFilePrefix ?? "offset"}_${config.name}`
    );
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ResultHandler
});
