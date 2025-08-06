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
var management_api_client_exports = {};
__export(management_api_client_exports, {
  AbstractManagementApiClient: () => AbstractManagementApiClient
});
module.exports = __toCommonJS(management_api_client_exports);
var import_httpclient = require("@xip-online-data/httpclient");
class AbstractManagementApiClient {
  #clientId;
  #clientSecret;
  #tenantIdentifier;
  #managementApiUrl;
  #audience;
  #identityProviderUrl;
  #auth0_orgIdentifier;
  #client;
  constructor() {
    this.#clientId = process.env["MANAGEMENT_API_CLIENT_ID"] ?? "";
    this.#clientSecret = process.env["MANAGEMENT_API_CLIENT_SECRET"] ?? "";
    this.#managementApiUrl = process.env["MANAGEMENT_API_URL"] ?? "";
    this.#audience = process.env["AUDIENCE"] ?? "";
    this.#identityProviderUrl = process.env["IDENTITY_PROVIDER_URL"] ?? "";
    this.#auth0_orgIdentifier = process.env["AUTH0_ORG_IDENTIFIER"] ?? "";
    this.#tenantIdentifier = process.env["TENANT_IDENTIFIER"] ?? "";
    if (!this.#clientId || !this.#clientSecret || !this.#managementApiUrl || !this.#audience || !this.#identityProviderUrl || !this.#auth0_orgIdentifier || !this.#tenantIdentifier) {
      throw new Error("Missing required environment variables");
    }
    this.#client = import_httpclient.HttpServiceBuilder.build({
      baseUrl: this.#managementApiUrl,
      jwt: {
        tokenUrl: `${this.#identityProviderUrl}/oauth/token`,
        clientId: this.#clientId,
        clientSecret: this.#clientSecret,
        audience: this.#audience,
        tenantIdentifier: this.#tenantIdentifier
      },
      cache: this.#getCacheOptions()
    });
  }
  async get(path, queryParams) {
    return this.#client.get(path, {}, queryParams);
  }
  async put(path, body) {
    return this.#client.put(path, body);
  }
  async post(path, body) {
    return this.#client.post(path, body);
  }
  #getCacheOptions() {
    switch (process.env["TOKEN_CACHE"]) {
      case "memory":
        return { type: "memory" };
      case "redis":
        return {
          type: "redis",
          redisUrl: process.env["REDIS_URL"] ?? "",
          keyPrefix: process.env["REDIS_KEY_PREFIX"] ?? ""
        };
      case "filesystem":
        return {
          type: "filesystem",
          path: process.env["FILESYSTEM_CACHE_PATH"] ?? "./cache",
          keyPrefix: process.env["FILESYSTEM_CACHE_PREFIX"]
        };
      default:
        return { type: "memory" };
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AbstractManagementApiClient
});
//# sourceMappingURL=management-api-client.js.map
