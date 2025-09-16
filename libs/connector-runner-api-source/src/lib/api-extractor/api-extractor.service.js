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
var api_extractor_service_exports = {};
__export(api_extractor_service_exports, {
  ApiExtractorService: () => ApiExtractorService
});
module.exports = __toCommonJS(api_extractor_service_exports);
var import_rxjs = require("rxjs");
var import_logger = require("@transai/logger");
var import_handlebars = __toESM(require("handlebars"));
var import_handlebars_helpers = __toESM(require("handlebars-helpers"));
var import_html_entities = require("html-entities");
var import_jsonata = __toESM(require("jsonata"));
var import_helper = require("../helper.functions");
var import_asyncHelpers = require("../../../../helper-functions/src/lib/asyncHelpers");
class ApiExtractorService {
  #api;
  #config;
  #apiConfig;
  #apiResultHandler;
  #offsetStore;
  #handlebarsTemplate;
  #urlTemplate;
  #urlDetailTemplate;
  #processing = false;
  #handlebarsInstance;
  #logger;
  #subscriptions = [];
  constructor(config, apiConfig, api, apiResultHandler, offsetStore) {
    this.#config = config;
    this.#apiConfig = apiConfig;
    this.#apiResultHandler = apiResultHandler;
    this.#offsetStore = offsetStore;
    this.#api = api;
    if (!apiConfig.url) {
      throw new Error("URL is not defined in apiConfig");
    }
    this.#logger = import_logger.Logger.getInstance();
    this.#logger.debug(
      `Api source service initialized: ${this.#apiConfig.name} with interval of ${this.#apiConfig.interval} seconds`
    );
    const handlebars = import_handlebars.default.create();
    this.#handlebarsInstance = (0, import_asyncHelpers.wrapAsync)(handlebars, true);
    (0, import_handlebars_helpers.default)({ handlebars: this.#handlebarsInstance });
    this.#handlebarsInstance?.registerHelper(
      "formatISODate",
      (timestamp) => {
        const date = new Date(timestamp);
        return date.toISOString();
      }
    );
    this.#handlebarsInstance.registerHelper(
      "jsonata",
      function(exprStr) {
        const expr = (0, import_jsonata.default)(exprStr);
        return expr.evaluate(this);
      }
    );
    if (apiConfig.body) {
      this.#handlebarsInstance?.compile(apiConfig.body, {
        strict: true
      });
      this.validateTemplate();
    }
    if (apiConfig.detailApiUrl) {
      this.#urlDetailTemplate = this.#handlebarsInstance?.compile(
        apiConfig.detailApiUrl,
        { strict: true }
      );
    }
    this.#urlTemplate = this.#handlebarsInstance?.compile(apiConfig.url, {
      strict: true
    });
    this.#logger.debug(
      "HB instance id",
      this.#handlebarsInstance.__ASYNC_WRAPPED__,
      import_handlebars.default.VERSION
    );
    this.#logger.debug(
      "Has jsonata helper?",
      typeof this.#handlebarsInstance.helpers?.jsonata
    );
    for (const [name, fn] of Object.entries(import_handlebars.default.helpers)) {
      this.#logger.debug(name, "wrapped?", !!fn.__ASYNC_WRAPPED__);
    }
    this.#subscriptions.push(
      (0, import_rxjs.interval)(this.#apiConfig.interval * 1e3).subscribe(async () => {
        await this.extract();
      })
    );
  }
  stop() {
    this.#subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
  async extract() {
    if (this.#processing) {
      this.#logger.debug(
        "Api source service is already processing: ",
        this.#apiConfig.name
      );
      return;
    }
    this.#processing = true;
    try {
      const latestOffset = await this.#offsetStore.getOffset(
        (0, import_helper.generateOffsetIdentifier)(this.#apiConfig)
      );
      if (this.#config.debug)
        import_logger.Logger.getInstance().debug(
          `Latest offset for ${this.#apiConfig.name}: ${JSON.stringify(latestOffset)}`
        );
      const body = await this.getBody(
        latestOffset,
        this.#apiConfig.batchSize ?? 10
      );
      const url = await this.getUrl(
        latestOffset,
        this.#apiConfig.batchSize ?? 10
      );
      try {
        const result = await this.#api.executeApi(url, body);
        const parsedContent = JSON.parse((0, import_html_entities.decode)(result.data));
        if (this.#apiConfig.detailApiUrl) {
          this.#logger.debug(
            "Detail API URL is set, fetching details for each item"
          );
          const selector = (0, import_jsonata.default)(this.#apiConfig.listField ?? "");
          const resultList = await selector.evaluate(parsedContent);
          for (const row of resultList) {
            const detailUrl = await this.getDetailUrl(row);
            const detailResult = await this.#api.executeApi(detailUrl);
            await this.#apiResultHandler.handleResult(
              detailResult,
              this.#apiConfig
            );
          }
        } else {
          await this.#apiResultHandler.handleResult(result, this.#apiConfig);
        }
      } catch (error) {
        this.#logger.debug(error);
        this.#logger.debug(
          `Error while extracting data from api source service: ${JSON.stringify(error)}`
        );
      }
    } catch (error) {
      import_logger.Logger.getInstance().debug(JSON.stringify(error));
    } finally {
      this.#processing = false;
    }
  }
  async getBody(offset, limit) {
    if (!this.#handlebarsTemplate) {
      return "";
    }
    return this.#handlebarsTemplate({
      ...offset,
      limit
    });
  }
  async getUrl(offset, limit) {
    if (!this.#urlTemplate)
      return "";
    const maybe = this.#urlTemplate({ ...offset, limit });
    this.#logger.debug("template() returned thenable?", !!maybe?.then);
    const out = await maybe;
    this.#logger.debug("rendered url (type):", typeof out, out);
    return String(out);
  }
  async getDetailUrl(item) {
    if (!this.#urlDetailTemplate) {
      return "";
    }
    return this.#urlDetailTemplate({
      item
    });
  }
  validateTemplate() {
    this.getBody({ timestamp: 0, id: 0, rawTimestamp: 0 }, 0);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ApiExtractorService
});
