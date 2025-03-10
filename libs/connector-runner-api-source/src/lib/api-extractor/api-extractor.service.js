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
var import_axios = __toESM(require("axios"));
var import_handlebars = __toESM(require("handlebars"));
var import_handlebars_helpers = __toESM(require("handlebars-helpers"));
var import_logger = require("@transai/logger");
var import_helper = require("../helper.functions");
class ApiExtractorService {
  constructor(config, apiConfig, apiResultHandler, offsetStore) {
    this.config = config;
    this.apiConfig = apiConfig;
    this.apiResultHandler = apiResultHandler;
    this.offsetStore = offsetStore;
    this.processing = false;
    import_logger.Logger.getInstance().debug(
      `Api source service initialized: ${this.apiConfig.name} with interval of ${this.apiConfig.interval} seconds`
    );
    if (apiConfig.body) {
      this.handlebarsInstance = import_handlebars.default.create();
      (0, import_handlebars_helpers.default)({ handlebars: this.handlebarsInstance });
      this.handlebarsInstance.registerHelper(
        "formatISODate",
        function(timestamp, timezone) {
          const date = new Date(timestamp);
          return date.toISOString();
        }
      );
      this.handlebarsTemplate = this.handlebarsInstance.compile(
        apiConfig.body,
        { strict: true }
      );
      this.validateTemplate();
    }
    (0, import_rxjs.interval)(this.apiConfig.interval * 1e3).subscribe(async () => {
      await this.extract();
    });
  }
  async extract() {
    if (this.processing) {
      import_logger.Logger.getInstance().debug(
        "Api source service is already processing: ",
        this.apiConfig.name
      );
      return;
    }
    this.processing = true;
    try {
      await this.executeApi().catch((error) => {
        throw new Error(
          `Error while extracting data from api source service ${error.message}`
        );
      });
    } catch (error) {
    } finally {
      this.processing = false;
    }
  }
  async executeApi() {
    const latestOffset = this.offsetStore.getOffset(
      (0, import_helper.generateOffsetIdentifier)(this.apiConfig)
    );
    if (this.config.debug)
      import_logger.Logger.getInstance().debug(
        `Latest offset for ${this.apiConfig.name}: ${JSON.stringify(latestOffset)}`
      );
    const body = this.getBody(latestOffset, this.apiConfig.batchSize ?? 10);
    import_logger.Logger.getInstance().debug(
      `Executing ${this.apiConfig.method} request to ${this.apiConfig.url} with body ${body}`
    );
    const contentType = this.apiConfig.format ?? "text";
    const headers = {
      "Content-Type": contentType
    };
    if (this.apiConfig.authorization) {
      headers["Authorization"] = this.apiConfig.authorization;
    }
    const config = {
      responseType: "text",
      headers
    };
    try {
      let result;
      switch (this.apiConfig.method) {
        case "POST":
          result = await import_axios.default.post(this.apiConfig.url, body, config);
          break;
        case "GET":
          result = await import_axios.default.get(this.apiConfig.url, config);
          break;
        default:
          throw new Error(`Unsupported method ${this.apiConfig.method}`);
      }
      await this.apiResultHandler.handleResult(result, this.apiConfig);
    } catch (error) {
      import_logger.Logger.getInstance().debug(
        `Error while extracting data from api source service: ${error.message}`
      );
    }
  }
  getBody(offset, limit) {
    if (!this.handlebarsTemplate) {
      return "";
    }
    return this.handlebarsTemplate({
      ...offset,
      limit
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
