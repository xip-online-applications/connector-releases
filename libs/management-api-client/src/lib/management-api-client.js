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
var management_api_client_exports = {};
__export(management_api_client_exports, {
  AbstractManagementApiClient: () => AbstractManagementApiClient
});
module.exports = __toCommonJS(management_api_client_exports);
var import_axios = __toESM(require("axios"));
var import_logger = require("@transai/logger");
class AbstractManagementApiClient {
  #clientId;
  #clientSecret;
  #tenantIdentifier;
  #managementApiUrl;
  #audience;
  #identityProviderUrl;
  #auth0_orgIdentifier;
  #currentAccessToken = void 0;
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
  }
  async #obtainAccessToken() {
    const tokenUrl = `${this.#identityProviderUrl}/oauth/token`;
    const tokenResponse = await import_axios.default.post(
      tokenUrl,
      {
        client_id: this.#clientId,
        client_secret: this.#clientSecret,
        audience: this.#audience,
        grant_type: "client_credentials",
        organization_id: this.#auth0_orgIdentifier,
        tenantId: this.#tenantIdentifier
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    ).catch((error) => {
      import_logger.Logger.getInstance().error(error);
      throw error;
    });
    this.#currentAccessToken = tokenResponse.data.access_token;
  }
  async get(path, queryParams) {
    if (!this.#currentAccessToken) {
      await this.#obtainAccessToken();
    }
    const url = `${this.#managementApiUrl}${path}`;
    import_logger.Logger.getInstance().debug(url);
    const response = await import_axios.default.get(url, {
      headers: {
        Authorization: `Bearer ${this.#currentAccessToken}`
      },
      params: queryParams
    }).catch(async (error) => {
      if (error.response?.status === 401) {
        await this.#obtainAccessToken();
        return import_axios.default.get(`${this.#managementApiUrl}${path}`, {
          headers: {
            Authorization: `Bearer ${this.#currentAccessToken}`
          },
          params: queryParams
        });
      }
      import_logger.Logger.getInstance().error(error);
      throw error;
    });
    return response.data;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AbstractManagementApiClient
});
