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
var http_client_exports = {};
__export(http_client_exports, {
  HttpClient: () => HttpClient
});
module.exports = __toCommonJS(http_client_exports);
var import_axios = __toESM(require("axios"));
class HttpClient {
  #config;
  #axios;
  constructor(config) {
    this.#config = config;
    this.#axios = import_axios.default.create({
      baseURL: this.#config.baseUrl,
      timeout: this.#config.timeout
    });
  }
  get config() {
    return this.#config;
  }
  async get(destination, options) {
    return this.request("GET", destination, options);
  }
  async post(destination, data, options) {
    return this.request("POST", destination, {
      ...options ?? {},
      data: typeof data === "string" ? data : JSON.stringify(data)
    });
  }
  async put(destination, data, options) {
    return this.request("PUT", destination, {
      ...options ?? {},
      data: typeof data === "string" ? data : JSON.stringify(data)
    });
  }
  async delete(destination, options) {
    return this.request("DELETE", destination, options);
  }
  async request(method, url, options) {
    try {
      const response = await this.doRequest(method, url, options);
      return {
        success: response.status >= 200 && response.status < 300,
        status: response.status,
        data: response.data,
        headers: response.headers
      };
    } catch (error) {
      const err = error;
      return {
        success: false,
        status: err.response?.status ?? 500,
        error: JSON.stringify(err.response?.data) ?? err.message
      };
    }
  }
  async doRequest(method, url, options) {
    return this.#axios.request({
      method,
      url,
      ...options ?? {},
      headers: {
        "Content-Type": this.#config.contentType ?? "application/json",
        ...options?.headers ?? {}
      }
    });
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  HttpClient
});
