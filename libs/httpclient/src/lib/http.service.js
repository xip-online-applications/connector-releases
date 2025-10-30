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
var http_service_exports = {};
__export(http_service_exports, {
  HttpService: () => HttpService
});
module.exports = __toCommonJS(http_service_exports);
var import_axios = __toESM(require("axios"));
class HttpService {
  #tokenService;
  #options;
  constructor(tokenService, options) {
    this.#tokenService = tokenService;
    this.#options = options;
  }
  async get(url, options = {}, queryParams = {}) {
    const baseUrl = options.baseUrl || this.#options.baseUrl;
    const token = await this.#tokenService.getToken({
      ...this.#options,
      ...options
    });
    const { data } = await import_axios.default.get(`${baseUrl}${url}`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: queryParams
    });
    return data;
  }
  async post(url, body, options = {}) {
    const baseUrl = options.baseUrl || this.#options.baseUrl;
    const token = await this.#tokenService.getToken({
      ...this.#options,
      ...options
    });
    const { data } = await import_axios.default.post(`${baseUrl}${url}`, body, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return data;
  }
  async put(url, body, options = {}) {
    const baseUrl = options.baseUrl || this.#options.baseUrl;
    const token = await this.#tokenService.getToken({
      ...this.#options,
      ...options
    });
    const { data } = await import_axios.default.put(`${baseUrl}${url}`, body, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return data;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  HttpService
});
//# sourceMappingURL=http.service.js.map
