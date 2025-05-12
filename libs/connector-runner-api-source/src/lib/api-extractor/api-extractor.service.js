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
  #config;
  #apiConfig;
  #apiResultHandler;
  #offsetStore;
  #handlebarsTemplate;
  #urlTemplate;
  #processing = false;
  #handlebarsInstance;
  #logger;
  #token;
  #tokenExpiresAt;
  constructor(config, apiConfig, apiResultHandler, offsetStore) {
    this.#config = config;
    this.#apiConfig = apiConfig;
    this.#apiResultHandler = apiResultHandler;
    this.#offsetStore = offsetStore;
    if (!apiConfig.url) {
      throw new Error("URL is not defined in apiConfig");
    }
    this.#logger = import_logger.Logger.getInstance();
    this.#logger.debug(
      `Api source service initialized: ${this.#apiConfig.name} with interval of ${this.#apiConfig.interval} seconds`
    );
    this.#handlebarsInstance = import_handlebars.default.create();
    (0, import_handlebars_helpers.default)({ handlebars: this.#handlebarsInstance });
    this.#handlebarsInstance.registerHelper(
      "formatISODate",
      function(timestamp, timezone) {
        const date = new Date(timestamp);
        return date.toISOString();
      }
    );
    if (apiConfig.body) {
      this.#handlebarsTemplate = this.#handlebarsInstance.compile(
        apiConfig.body,
        { strict: true }
      );
      this.validateTemplate();
    }
    this.#urlTemplate = this.#handlebarsInstance.compile(apiConfig.url, {
      strict: true
    });
    if (this.#apiConfig.tokenUrl) {
      this.getAccessToken().then((token) => {
        if (token) {
          this.#logger.debug(
            `Access token retrieved successfully for ${this.#apiConfig.name}`
          );
        } else {
          this.#logger.error(
            `Failed to retrieve access token for ${this.#apiConfig.name}`
          );
        }
      }).catch((error) => {
        this.#logger.error(
          `Error retrieving access token for ${this.#apiConfig.name}: ${error}`
        );
      });
    }
    (0, import_rxjs.interval)(this.#apiConfig.interval * 1e3).subscribe(async () => {
      await this.extract();
    });
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
      await this.executeApi().catch((error) => {
        throw new Error(
          `Error while extracting data from api source service ${error.message}`
        );
      });
    } catch (error) {
      import_logger.Logger.getInstance().debug(JSON.stringify(error));
    } finally {
      this.#processing = false;
    }
  }
  async executeApi() {
    const latestOffset = await this.#offsetStore.getOffset(
      (0, import_helper.generateOffsetIdentifier)(this.#apiConfig)
    );
    if (this.#config.debug)
      import_logger.Logger.getInstance().debug(
        `Latest offset for ${this.#apiConfig.name}: ${JSON.stringify(latestOffset)}`
      );
    const body = this.getBody(latestOffset, this.#apiConfig.batchSize ?? 10);
    const url = this.getUrl(latestOffset, this.#apiConfig.batchSize ?? 10);
    import_logger.Logger.getInstance().debug(
      `Executing ${this.#apiConfig.method} request to ${url} with body ${body}`
    );
    const contentType = this.#apiConfig.format ?? "text";
    const headers = {
      "Content-Type": contentType
    };
    if (this.#apiConfig.tokenUrl) {
      const token = await this.getAccessToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }
    if (this.#apiConfig.authorization) {
      headers["Authorization"] = this.#apiConfig.authorization;
    }
    const config = {
      responseType: "text",
      headers
    };
    try {
      let result;
      switch (this.#apiConfig.method) {
        case "POST":
          result = await import_axios.default.post(url, body, config);
          break;
        case "GET":
          result = await import_axios.default.get(url, config);
          break;
        default:
          throw new Error(`Unsupported method ${this.#apiConfig.method}`);
      }
      await this.#apiResultHandler.handleResult(result, this.#apiConfig);
    } catch (error) {
      this.#logger.debug(
        `Error while extracting data from api source service: ${JSON.stringify(error)}`
      );
    }
  }
  getBody(offset, limit) {
    if (!this.#handlebarsTemplate) {
      return "";
    }
    return this.#handlebarsTemplate({
      ...offset,
      limit
    });
  }
  getUrl(offset, limit) {
    return this.#urlTemplate({
      ...offset,
      limit
    });
  }
  validateTemplate() {
    this.getBody({ timestamp: 0, id: 0, rawTimestamp: 0 }, 0);
  }
  async getAccessToken() {
    const { tokenUrl, clientId, clientSecret } = this.#apiConfig;
    if (!tokenUrl || !clientId || !clientSecret)
      return void 0;
    const now = Date.now();
    if (this.#token && this.#tokenExpiresAt && now < this.#tokenExpiresAt) {
      return this.#token;
    }
    try {
      const response = await import_axios.default.post(tokenUrl, null, {
        params: {
          grant_type: "client_credentials",
          client_id: clientId,
          client_secret: clientSecret
        }
      });
      const { access_token: accesToken, expires_in: expiresIn } = response.data;
      const expiresInMiliseconds = expiresIn * 1e3;
      this.#token = accesToken;
      this.#tokenExpiresAt = now + expiresInMiliseconds - 1e4;
      return this.#token;
    } catch (error) {
      this.#logger.error(`Failed to retrieve access token: ${error}`);
      return void 0;
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ApiExtractorService
});
