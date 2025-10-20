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
var import_logger = require("@transai/logger");
var import_html_entities = require("html-entities");
var import_jsonata = __toESM(require("jsonata"));
var import_helper = require("./helper.functions");
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
    const parsedContent = JSON.parse((0, import_html_entities.decode)(result.data));
    const keys = Object.keys(parsedContent);
    if (keys.length === 0) {
      return;
    }
    if (apiConfig.listField) {
      await this.sendBatch(parsedContent, apiConfig);
    } else if (keys.length === 1) {
      import_logger.Logger.getInstance().debug("Handling Betech way", apiConfig.name, keys);
      await this.handleBetechWay(result, apiConfig);
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
    const expression = (0, import_jsonata.default)(apiConfig.listField ?? "");
    const list = await expression.evaluate(parsedContent);
    if (list && Array.isArray(list) && list.length > 0) {
      import_logger.Logger.getInstance().debug(
        `Found ${list.length} records in list field ${apiConfig.listField}`
      );
      if (apiConfig.type === "metric") {
        await this.kafkaService.sendMetric(list, this.config, apiConfig);
      } else {
        await this.kafkaService.sendDocuments(list, this.config, apiConfig);
      }
      await this.storeTimestamp(list[list.length - 1], apiConfig);
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
      await this.storeTimestamp(parsedContent, apiConfig);
    }
  }
  async storeTimestamp(item, apiConfig) {
    let lastupdatedstring = "";
    let lastid = "";
    if (apiConfig.incrementalField) {
      const expr = (0, import_jsonata.default)(apiConfig.incrementalField);
      lastupdatedstring = await expr.evaluate(item);
      this.#logger.debug(
        `Found last updated string: ${lastupdatedstring} using expression ${apiConfig.incrementalField}`
      );
    }
    if (apiConfig.keyField) {
      const expr = (0, import_jsonata.default)(apiConfig.keyField);
      lastid = await expr.evaluate(item);
      this.#logger.debug(
        `Found last id: ${lastid} using expression ${apiConfig.keyField}`
      );
    }
    const date = lastupdatedstring === "" ? /* @__PURE__ */ new Date() : new Date(lastupdatedstring);
    this.offsetStore.setOffset(
      {
        timestamp: date.getTime(),
        date: date.toDateString(),
        id: lastid,
        rawTimestamp: lastupdatedstring
      },
      (0, import_helper.generateOffsetIdentifier)(apiConfig)
    );
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ApiResultHandler
});
