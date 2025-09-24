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
var api_exports = {};
__export(api_exports, {
  Api: () => Api
});
module.exports = __toCommonJS(api_exports);
var import_logger = require("@transai/logger");
var import_helper = require("../helper.functions");
class Api {
  constructor(config, tokenManager, sessionManager) {
    this.config = config;
    this.#logger = import_logger.Logger.getInstance();
    this.#config = config;
    this.#tokenManager = tokenManager;
    this.#sessionManager = sessionManager;
  }
  #config;
  #logger;
  #tokenManager;
  #sessionManager;
  async executeApi(url, body = "", method = "GET", format = "json") {
    import_logger.Logger.getInstance().debug(
      `Executing ${method} request to ${url} with body ${body}`
    );
    const contentType = format;
    const headers = {};
    if (contentType && method !== "GET") {
      headers["Content-Type"] = contentType;
    }
    if (this.#tokenManager) {
      this.#logger.debug("Initialising token manager");
      const token = await this.#tokenManager.getAccessToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }
    if (this.#sessionManager) {
      this.#logger.debug("Initialising session manager");
      const sessionCookie = await this.#sessionManager.getSessionCooky();
      if (sessionCookie) {
        headers["Cookie"] = sessionCookie;
        headers["X-CustomerID"] = this.#config.apiKey;
      }
      this.#logger.debug(`Session cookie: ${sessionCookie}`);
    }
    if (this.#config.authorization) {
      headers["Authorization"] = this.#config.authorization;
    }
    if (headers["Cookie"]) {
      const jsessionMatch = headers["Cookie"].match(/JSESSIONID=([^;]+)/);
      if (jsessionMatch) {
        headers["Cookie"] = `JSESSIONID=${jsessionMatch[1]}`;
      } else {
        delete headers["Cookie"];
      }
    }
    let responseText = "";
    this.#logger.debug("Making request to", url, headers, body);
    responseText = await (0, import_helper.makeNodeRequest)(
      url,
      method,
      headers,
      body,
      !!this.#config.forceTls12
    );
    const responseObj = {
      data: responseText,
      status: 200,
      statusText: "OK",
      headers,
      config: {}
    };
    return responseObj;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Api
});
