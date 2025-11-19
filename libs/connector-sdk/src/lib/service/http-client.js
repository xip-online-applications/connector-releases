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
var http_client_exports = {};
__export(http_client_exports, {
  HttpClientSDK: () => HttpClientSDK
});
module.exports = __toCommonJS(http_client_exports);
var import_http_client = require("@xip-online-data/http-client");
class HttpClientSDK {
  #httpClient;
  #telemetryService;
  #requestOptionsFormatter = (options) => options;
  constructor(httpConfig, telemetry) {
    this.#httpClient = new import_http_client.HttpClient(
      httpConfig ?? {}
    );
    this.#telemetryService = telemetry;
  }
  get(destination, options) {
    return this.request("GET", destination, options);
  }
  post(destination, data, options) {
    return this.request("POST", destination, {
      ...options ?? {},
      data: typeof data === "string" ? data : JSON.stringify(data)
    });
  }
  put(destination, data, options) {
    return this.request("PUT", destination, {
      ...options ?? {},
      data: typeof data === "string" ? data : JSON.stringify(data)
    });
  }
  patch(destination, data, options) {
    return this.request("PATCH", destination, {
      ...options ?? {},
      data: typeof data === "string" ? data : JSON.stringify(data)
    });
  }
  delete(destination, options) {
    return this.request("DELETE", destination, options);
  }
  request(method, url, options) {
    return new Promise(async (resolve, reject) => {
      const response = await this.#httpClient.request(
        method,
        url,
        await this.#requestOptionsFormatter(
          options ?? {},
          method,
          url
        )
      ).catch((error) => ({
        status: error.status ?? 500,
        error: error.message ?? "Unknown error"
      }));
      this.#telemetryService.increment(
        `sdk.http.request.${method.toLowerCase()}`
      );
      if ("error" in response) {
        this.#telemetryService.increment(
          `sdk.http.request.${method.toLowerCase()}.error`
        );
        reject({
          status: response.status,
          error: response.error
        });
      } else {
        resolve({
          status: response.status,
          // @ts-expect-error data is here....
          data: response.data,
          // @ts-expect-error headers are here....
          headers: response.headers
        });
      }
    });
  }
  setRequestOptionsFormatter(formatter) {
    this.#requestOptionsFormatter = formatter;
    return this;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  HttpClientSDK
});
