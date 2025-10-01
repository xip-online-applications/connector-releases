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
var opcua_result_handler_exports = {};
__export(opcua_result_handler_exports, {
  OpcUaResultHandler: () => OpcUaResultHandler
});
module.exports = __toCommonJS(opcua_result_handler_exports);
var import_logger = require("@transai/logger");
var import_handlebars = __toESM(require("handlebars"));
var import_handlebars_helpers = __toESM(require("handlebars-helpers"));
var import_jsonata = __toESM(require("jsonata"));
var import_helper = require("./helper.functions");
class OpcUaResultHandler {
  constructor(config, kafkaService, offsetStore, opcUaClient) {
    this.config = config;
    this.kafkaService = kafkaService;
    this.offsetStore = offsetStore;
    this.opcUaClient = opcUaClient;
    this.#handlebarsInstance = import_handlebars.default.create();
    this.#logger = import_logger.Logger.getInstance();
    (0, import_handlebars_helpers.default)({ handlebars: this.#handlebarsInstance });
  }
  #handlebarsTemplate;
  #logger;
  #handlebarsInstance;
  async handleResult(result, opcUaCallConfig) {
    this.#logger.debug(`Handling result for ${opcUaCallConfig.name}`);
    if (!result.outputArguments || result.outputArguments.length === 0) {
      return;
    }
    const jsonData = result.outputArguments[1].value;
    const data = JSON.parse(jsonData);
    if (Array.isArray(data) && opcUaCallConfig.identifierSelector && opcUaCallConfig.subQuery) {
      this.#logger.debug(`Processing sub-queries for results`);
      this.#handlebarsTemplate = this.#handlebarsInstance?.compile(
        opcUaCallConfig.subQuery,
        { strict: true }
      );
      this.#logger.debug(`Compiling sub-query template ...`);
      const expression = (0, import_jsonata.default)(opcUaCallConfig.identifierSelector);
      this.#logger.debug(`Interating over results ...`);
      const messages = await Promise.all(
        data.map(async (item) => {
          this.#logger.debug(`Processing item: ${JSON.stringify(item)}`);
          const id = await expression.evaluate(item);
          const subQuery = this.getSubQuery(id);
          this.#logger.debug(`Processing sub-query: ${subQuery}`);
          let result2;
          try {
            result2 = await this.opcUaClient.callFromDsl(subQuery);
          } catch (error) {
            throw new Error(
              `Error while extracting data from opcUa source service ${error?.message ?? error}`
            );
          }
          this.#logger.debug(`Sub-query result: ${JSON.stringify(result2)}`);
          if (!result2?.outputArguments?.length) {
            this.#logger.debug(
              `No output arguments found for sub-query, sending original item`
            );
            return item;
          }
          this.#logger.debug(
            `Output arguments: ${JSON.stringify(result2.outputArguments)}`
          );
          const jsonValue = result2.outputArguments[0]?.value;
          try {
            const parsed = JSON.parse(jsonValue);
            const merged = Array.isArray(parsed) && parsed.length > 0 ? { ...item, ...parsed[0] } : { ...item, ...parsed ?? {} };
            this.#logger.debug(`Data to send: ${JSON.stringify(merged)}`);
            return merged;
          } catch (e) {
            this.#logger.warn(
              `Invalid JSON in OPC UA response; returning original item. ${e?.message ?? e}`
            );
            return item;
          }
        })
      );
      await this.sendBatch(messages, opcUaCallConfig);
      return;
    }
    await this.sendBatch(data, opcUaCallConfig);
  }
  getSubQuery(id) {
    if (!this.#handlebarsTemplate) {
      return "";
    }
    return this.#handlebarsTemplate({
      id
    });
  }
  async sendBatch(list, config) {
    this.#logger.debug(
      `Sending ${JSON.stringify(list)} with config ${JSON.stringify(config)}`
    );
    if (list && Array.isArray(list)) {
      if (config.type === "metric") {
        await this.kafkaService.sendMetric(
          list,
          this.config,
          config.metadata ?? {}
        );
      } else {
        await this.kafkaService.sendDocuments(list, this.config, config);
      }
      const item = list[list.length - 1];
      if (config.incrementalField) {
        const expression = (0, import_jsonata.default)(config.incrementalField);
        const value = await expression.evaluate(item);
        this.storeTimestamp(
          config.incrementalField ? value : "",
          config.incrementalField ? new Date(value) : /* @__PURE__ */ new Date(),
          config
        );
      }
    } else {
      this.#logger.debug(`No records found, skipping. ${JSON.stringify(list)}`);
    }
  }
  serializeVariantValue(value) {
    if (value instanceof Date) {
      return value.toISOString();
    }
    if (Buffer.isBuffer(value)) {
      return value.toString("base64");
    }
    if (Array.isArray(value)) {
      return value.map(this.serializeVariantValue.bind(this));
    }
    if (typeof value === "object" && value !== null) {
      try {
        return JSON.parse(JSON.stringify(value));
      } catch {
        return String(value);
      }
    }
    return value;
  }
  storeTimestamp(raw, timestamp, config) {
    this.offsetStore.setOffset(
      { timestamp: timestamp.getTime(), id: 0, rawTimestamp: raw },
      (0, import_helper.generateOffsetIdentifier)(config)
    );
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  OpcUaResultHandler
});
