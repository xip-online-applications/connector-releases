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
var opcua_extractor_service_exports = {};
__export(opcua_extractor_service_exports, {
  OpcuaExtractorService: () => OpcuaExtractorService
});
module.exports = __toCommonJS(opcua_extractor_service_exports);
var import_logger = require("@transai/logger");
var import_dayjs = __toESM(require("dayjs"));
var import_handlebars = __toESM(require("handlebars"));
var import_handlebars_helpers = __toESM(require("handlebars-helpers"));
var import_rxjs = require("rxjs");
var import_helper = require("../helper.functions");
class OpcuaExtractorService {
  #config;
  #opcUaClient;
  #opcUaResultHandler;
  #offsetStore;
  #handlebarsTemplate;
  #processing = false;
  #handlebarsInstance;
  #logger;
  #subscription;
  constructor(opcUaCallConfig, opcUaClient, apiResultHandler, offsetStore) {
    this.#config = opcUaCallConfig;
    this.#opcUaResultHandler = apiResultHandler;
    this.#offsetStore = offsetStore;
    this.#logger = import_logger.Logger.getInstance();
    this.#logger.debug(
      `Opcua source service initialized: ${this.#config.name} with interval of ${this.#config.interval} seconds`
    );
    this.#opcUaClient = opcUaClient;
    this.#handlebarsInstance = import_handlebars.default.create();
    (0, import_handlebars_helpers.default)({ handlebars: this.#handlebarsInstance });
    this.#handlebarsInstance.registerHelper(
      "formatISODate",
      function(timestamp) {
        const date = timestamp === "now" ? /* @__PURE__ */ new Date() : new Date(timestamp);
        return date.toISOString();
      }
    );
    this.#logger.debug(`Compiling query template for: ${this.#config.name}`);
    if (this.#config.query) {
      this.#handlebarsTemplate = this.#handlebarsInstance.compile(
        this.#config.query,
        { strict: true }
      );
      try {
        this.validateTemplate();
      } catch (error) {
        this.#logger.error("Error in query template", error);
        throw error;
      }
    }
    this.#logger.debug(`Starting OPCUA extractor for: ${this.#config.name}`);
    this.#subscription = (0, import_rxjs.interval)(this.#config.interval * 1e3).pipe((0, import_rxjs.filter)(() => !this.#processing)).subscribe(async () => {
      await this.extract();
    });
  }
  stop() {
    this.#opcUaClient.disconnect();
    this.#subscription?.unsubscribe();
  }
  validateTemplate() {
    const oneWeekAgoISO = (0, import_dayjs.default)().subtract(1, "week").toISOString();
    const offset = { timestamp: 0, id: 0, rawTimestamp: oneWeekAgoISO };
    this.#logger.debug(
      `Validating template with offset: ${JSON.stringify(offset)}`
    );
    this.getQuery({ timestamp: 0, id: 0, rawTimestamp: oneWeekAgoISO }, 0);
  }
  getQuery(offset, limit) {
    if (!this.#handlebarsTemplate) {
      return "";
    }
    return this.#handlebarsTemplate({
      ...offset,
      limit
    });
  }
  async extract() {
    if (this.#processing) {
      this.#logger.debug(
        "Upcua source service is already processing: ",
        this.#config.name
      );
      return;
    }
    const latestOffset = await this.#offsetStore.getOffset(
      (0, import_helper.generateOffsetIdentifier)(this.#config)
    );
    this.#processing = true;
    await this.#opcUaClient.init();
    try {
      this.#logger.debug(`Building query for: ${this.#config.name}`);
      const opcUaQuery = this.getQuery(latestOffset, this.#config.limit ?? 100);
      this.#logger.debug(
        `Executing query: ${opcUaQuery}, for: ${this.#config.name}`
      );
      const result = await this.#opcUaClient.callFromDsl(opcUaQuery).catch((error) => {
        throw new Error(
          `Error while extracting data from opcUa source service ${error.message}`
        );
      });
      await this.#opcUaResultHandler.handleResult(result, this.#config);
    } catch (error) {
      this.#logger.error(JSON.stringify(error));
    } finally {
      this.#logger.debug(`Disconnecting from OPCUA for: ${this.#config.name}`);
      await this.#opcUaClient.disconnect();
      this.#processing = false;
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  OpcuaExtractorService
});
