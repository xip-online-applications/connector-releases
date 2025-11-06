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
  #OPCUA_ID_JSONATA_EXPRESSION = "JobGuid";
  #INCREMENTAL_FIELD_JSONATA_EXPRESSION = "TimeStamp";
  #sdk;
  #opcuaClient;
  #idExpression = (0, import_jsonata.default)(this.#OPCUA_ID_JSONATA_EXPRESSION);
  constructor(sdk, opcuaClient) {
    this.#sdk = sdk;
    this.#opcuaClient = opcuaClient;
  }
  async handleResult(result, opcUaCallConfig) {
    this.#sdk.logger.verbose(
      `[OPC UA] [${opcUaCallConfig.name}] Handling result`
    );
    const data = JSON.parse(
      result
    );
    if (!Array.isArray(data)) {
      await this.#sendBatch(data, opcUaCallConfig);
      return;
    }
    const dataWithIds = data.map((item) => ({
      ...item,
      Id: `${item.JobGuid}_${item.PartId}_${item.PartNumber}`
    }));
    const messages = await this.#processResultItemsIntoMessages(
      dataWithIds,
      opcUaCallConfig
    );
    await this.#sendBatch(messages, opcUaCallConfig);
  }
  async #processResultItemsIntoMessages(data, opcUaCallConfig) {
    this.#sdk.logger.verbose(
      `[OPC UA] [${opcUaCallConfig.name}] Processing sub-queries for results`
    );
    return Promise.all(
      data.map(async (item) => {
        this.#sdk.logger.verbose(
          `[OPC UA] [${opcUaCallConfig.name}] Processing item`,
          item
        );
        const id = await this.#idExpression.evaluate(item);
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
            `[OPC UA] [${opcUaCallConfig.name}] No output arguments found for sub-query, sending original item`
          );
          return item;
        }
        try {
          const parsed = JSON.parse(
            result[0]
          );
          const matchingPart = parsed.find((pi) => pi.PartId === item.PartId) ?? {};
          return { ...item, ...matchingPart };
        } catch (error) {
          this.#sdk.logger.warn(
            `[OPC UA] [${opcUaCallConfig.name}] Invalid JSON in OPC UA response; returning original item`,
            { error, jsonPreview: result[0]?.slice(0, 200) }
          );
          return item;
        }
      })
    );
  }
  async #sendBatch(list, opcUaCallConfig) {
    if (!(list && Array.isArray(list))) {
      this.#sdk.logger.debug(
        `[OPC UA] [${opcUaCallConfig.name}] No records found, skipping. ${JSON.stringify(list)}`
      );
      return;
    }
    let { incrementalField } = opcUaCallConfig;
    if (!incrementalField || incrementalField.length === 0) {
      incrementalField = this.#INCREMENTAL_FIELD_JSONATA_EXPRESSION;
    }
    const collection = `${this.#sdk.config.datasourceIdentifier}_${opcUaCallConfig.name}`;
    this.#sdk.logger.debug(
      `[OPC UA] [${opcUaCallConfig.name}] Sending ${list.length} items, total size ${JSON.stringify(list).length}, to collection ${collection} with config ${JSON.stringify(opcUaCallConfig)}`
    );
    this.#sdk.logger.verbose({
      list: list[0],
      keyField: opcUaCallConfig.keyField ?? "JobGuid",
      collection,
      incrementalField
    });
    try {
      let result;
      if (opcUaCallConfig.type === "metric") {
        result = await this.#sdk.sender.metricsLegacy(list, {
          ...opcUaCallConfig.metadata ?? {},
          keyField: opcUaCallConfig.keyField ?? "JobGuid",
          collection,
          incrementalField
        }).catch((error) => {
          this.#sdk.logger.error(
            `[OPC UA] [${opcUaCallConfig.name}] Error sending metrics`,
            { error }
          );
          throw error;
        });
      } else {
        result = await this.#sdk.sender.documents(list, {
          ...opcUaCallConfig.metadata ?? {},
          keyField: opcUaCallConfig.keyField ?? "Id",
          collection,
          incrementalField
        }).catch((error) => {
          this.#sdk.logger.error(
            `[OPC UA] [${opcUaCallConfig.name}] Error sending documents`,
            { error }
          );
          throw error;
        });
      }
      this.#sdk.logger.debug(
        `[OPC UA] [${opcUaCallConfig.name}] Documents have been sent, updating offset`,
        result
      );
    } catch (error) {
      this.#sdk.logger.error(
        `[OPC UA] [${opcUaCallConfig.name}] Failed to send data batch`,
        {
          error,
          list: list[0],
          keyField: opcUaCallConfig.keyField ?? "Id",
          collection,
          incrementalField
        }
      );
      throw error;
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
      `${opcUaCallConfig.offsetFilePrefix ?? "offset"}_${opcUaCallConfig.name}`
    );
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ResultHandler
});
