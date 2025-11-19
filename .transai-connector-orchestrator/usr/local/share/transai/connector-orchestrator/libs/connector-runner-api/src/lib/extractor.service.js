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
var extractor_service_exports = {};
__export(extractor_service_exports, {
  ExtractorService: () => ExtractorService
});
module.exports = __toCommonJS(extractor_service_exports);
var import_http_client_authentication = require("./http-client-authentication");
class ExtractorService {
  #sdk;
  #apiConfig;
  #resultHandler;
  #httpClient;
  #requestMethod;
  #urlDelegate;
  #bodyDelegate;
  constructor(sdk, apiConfig, resultHandler, httpClient) {
    this.#sdk = sdk;
    this.#apiConfig = apiConfig;
    this.#resultHandler = resultHandler;
    const { config } = this.#sdk;
    this.#requestMethod = this.#apiConfig.method ?? config.method ?? "GET";
    this.#urlDelegate = this.#apiConfig.url ? this.#sdk.templating.compile(this.#apiConfig.url) : void 0;
    this.#bodyDelegate = this.#apiConfig.body ? this.#sdk.templating.compile(this.#apiConfig.body) : void 0;
    if (this.#apiConfig.url) {
      this.#httpClient = this.#sdk.httpClient().setRequestOptionsFormatter(
        import_http_client_authentication.HttpClientAuthentication.createForAuthConfig(
          this.#apiConfig,
          this.#sdk.httpClient()
        )
      );
    } else if (httpClient) {
      this.#httpClient = httpClient;
    } else {
      throw new Error(
        `No HTTP client or URL provided for API extractor: ${apiConfig.name}`
      );
    }
  }
  get name() {
    return `api-extractor-${this.#apiConfig.name}`;
  }
  async onRun() {
    const latestOffset = await this.#sdk.offsetStore.getOffset(
      `${this.#apiConfig.offsetFilePrefix ?? "offset"}_${this.#apiConfig.name}`
    );
    this.#sdk.logger.verbose(`[API] [${this.#apiConfig.name}] Executing query`);
    const compileOptions = {
      ...latestOffset,
      limit: this.#apiConfig.batchSize ?? 10
    };
    const result = await this.#httpClient.request(
      this.#requestMethod,
      this.#urlDelegate?.(compileOptions) ?? "",
      {
        data: this.#bodyDelegate?.(compileOptions),
        headers: {
          "Content-Type": this.#apiConfig.format ?? "text"
        }
      }
    );
    await this.#resultHandler.handleResult(result.data, this.#apiConfig);
    this.#sdk.logger.debug(`[API] [${this.#apiConfig.name}] Ran query`);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ExtractorService
});
