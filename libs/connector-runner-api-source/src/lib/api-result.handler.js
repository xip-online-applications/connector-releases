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
var api_result_handler_exports = {};
__export(api_result_handler_exports, {
  ApiResultHandler: () => ApiResultHandler
});
module.exports = __toCommonJS(api_result_handler_exports);
var import_html_entities = require("html-entities");
var import_logger = require("@transai/logger");
var import_helper = require("./helper.functions");
var import_jsonata = __toESM(require("jsonata"));
class ApiResultHandler {
  constructor(config, kafkaService, offsetStore) {
    this.config = config;
    this.kafkaService = kafkaService;
    this.offsetStore = offsetStore;
    this.#logger = import_logger.Logger.getInstance();
  }
  #logger;
  async handleResult(result, apiConfig) {
    this.#logger.debug("Handling result for API:", apiConfig.name);
    this.#logger.debug(result);
    const parsedContent = JSON.parse((0, import_html_entities.decode)(result.data));
    const keys = Object.keys(parsedContent);
    if (keys.length === 0) {
      return;
    }
    if (keys.length === 1) {
      import_logger.Logger.getInstance().debug("Handling Betech way", apiConfig.name, keys);
      await this.handleBetechWay(result, apiConfig);
    } else if (apiConfig.listField) {
      await this.sendBatch(parsedContent, apiConfig);
    } else {
      await this.handleSingleRecord(parsedContent, apiConfig);
    }
  }
  async handleBetechWay(result, apiConfig) {
    const parsedContent = JSON.parse((0, import_html_entities.decode)(result.data));
    const keys = Object.keys(parsedContent);
    const metadata = {
      machine: apiConfig.name,
      cnc: keys[0]
    };
    let success = false;
    if (apiConfig.type === "document") {
      success = await this.kafkaService.sendDocuments(
        [parsedContent[keys[0]]],
        this.config,
        apiConfig,
        metadata
      );
    } else {
      success = await this.kafkaService.sendMetric(
        [parsedContent[keys[0]]],
        this.config,
        apiConfig,
        metadata
      );
    }
    if (!success) {
      import_logger.Logger.getInstance().debug(
        "Error while sending record to Kafka: ",
        parsedContent
      );
    }
  }
  async sendBatch(parsedContent, apiConfig) {
    const list = parsedContent[apiConfig.listField ?? ""];
    if (list && Array.isArray(list)) {
      import_logger.Logger.getInstance().debug(
        `Found ${list.length} records in list field ${apiConfig.listField}`
      );
      if (apiConfig.type === "metric") {
        await this.kafkaService.sendMetric(list, this.config, apiConfig);
      } else {
        await this.kafkaService.sendDocuments(list, this.config, apiConfig);
      }
      const item = list[list.length - 1];
      let lastupdatedstring = void 0;
      if (apiConfig.incrementalField) {
        const expr = (0, import_jsonata.default)(apiConfig.incrementalField);
        lastupdatedstring = await expr.evaluate(item);
        this.#logger.debug(`Found last updated string: ${lastupdatedstring} using expression ${apiConfig.incrementalField}`);
      }
      this.storeTimestamp(
        lastupdatedstring ? new Date(lastupdatedstring) : /* @__PURE__ */ new Date(),
        apiConfig
      );
    } else {
      import_logger.Logger.getInstance().debug(
        `No records found in list field ${apiConfig.listField}, skipping. ${JSON.stringify(parsedContent)}`
      );
    }
  }
  async handleSingleRecord(parsedContent, apiConfig) {
    let success = false;
    if (apiConfig.type === "metric") {
      success = await this.kafkaService.sendMetric(
        [parsedContent],
        this.config,
        apiConfig
      );
    } else {
      success = await this.kafkaService.sendDocuments(
        [parsedContent],
        this.config,
        apiConfig
      );
    }
    if (!success) {
      import_logger.Logger.getInstance().debug(
        "Error while sending record to Kafka: ",
        parsedContent
      );
    }
    if (success) {
      this.storeTimestamp(/* @__PURE__ */ new Date(), apiConfig);
    }
  }
  storeTimestamp(timestamp, apiConfig) {
    this.offsetStore.setOffset(
      { timestamp: timestamp.getTime(), id: 0, rawTimestamp: 0 },
      (0, import_helper.generateOffsetIdentifier)(apiConfig)
    );
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ApiResultHandler
});
