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
var import_logger = require("@transai/logger");
class HttpClient {
  #config;
  constructor(config) {
    this.#config = config;
  }
  async init() {
    import_logger.Logger.getInstance().info("Initializing http: ", this.#config.host);
  }
  async post(destination, content) {
    try {
      const url = `${this.#config.host}${destination}`;
      import_logger.Logger.getInstance().debug(`POSTing to ${url} with content: ${content}`);
      const res = await import_axios.default.post(url, content, {
        timeout: this.#config.timeout ?? 5e3,
        headers: {
          // Overwrite Axios's automatically set Content-Type
          "Content-Type": this.#config.contentType ?? "application/json"
        }
      });
      import_logger.Logger.getInstance().debug(
        `Response from ${url}: ${JSON.stringify(res.data)}`
      );
      return {
        success: res.status >= 200 && res.status < 300,
        status: res.status,
        data: JSON.stringify(res.data)
      };
    } catch (error) {
      const err = error;
      return {
        success: false,
        status: err.response?.status ?? 500,
        data: JSON.stringify(err.response?.data) ?? err.message
      };
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  HttpClient
});
//# sourceMappingURL=http-client.js.map
