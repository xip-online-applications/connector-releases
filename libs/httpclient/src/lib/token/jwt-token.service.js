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
var jwt_token_service_exports = {};
__export(jwt_token_service_exports, {
  JwtTokenService: () => JwtTokenService
});
module.exports = __toCommonJS(jwt_token_service_exports);
var import_axios = __toESM(require("axios"));
var import_logger = require("@transai/logger");
class JwtTokenService {
  #options;
  #cacheService;
  #cachedTokens = void 0;
  constructor(options, cacheService) {
    this.#options = options;
    this.#cacheService = cacheService;
  }
  async getToken(options) {
    if (this.#cachedTokens === void 0) {
      this.#cachedTokens = await this.#cacheService.get("cachedTokens");
    }
    if (this.#cachedTokens === void 0 || typeof this.#cachedTokens !== "object") {
      this.#cachedTokens = {};
    }
    const cacheKey = this.getCacheArrayKey(options);
    if (this.#cachedTokens[cacheKey] && this.#cachedTokens[cacheKey].expires_at > Date.now()) {
      return this.#cachedTokens[cacheKey].token.access_token;
    }
    const audience = options.audience || this.#options.audience;
    const tenantId = options.tenantIdentifier || this.#options.tenantIdentifier;
    const requestConfig = {
      method: "POST",
      url: this.#options.tokenUrl,
      headers: { "content-type": "application/json" },
      data: JSON.stringify({
        client_id: this.#options.clientId,
        client_secret: this.#options.clientSecret,
        audience: options.audience || this.#options.audience,
        grant_type: "client_credentials",
        ...tenantId ? { tenantId } : {}
      })
    };
    import_logger.Logger.getInstance().debug(
      `Fetching new token for audience ${audience} and tenant ${tenantId}`
    );
    const { data } = await import_axios.default.request(requestConfig).catch((error) => {
      import_logger.Logger.getInstance().error("Error fetching token", error);
      throw new Error("Error fetching token");
    });
    import_logger.Logger.getInstance().debug(`Fetched new token for audience ${audience} and tenant ${tenantId}`, data);
    this.#cachedTokens[cacheKey] = {
      tenantId,
      audience,
      token: data,
      expires_at: new Date(
        (/* @__PURE__ */ new Date()).getTime() + data.expires_in * 1e3
      ).getTime()
    };
    await this.#cacheService.set("cachedTokens", this.#cachedTokens);
    return data.access_token;
  }
  getCacheArrayKey(options) {
    const tenantId = options.tenantIdentifier || "__NONE__";
    const audience = options.audience || this.#options.audience;
    return `${tenantId}_${audience}`;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  JwtTokenService
});
