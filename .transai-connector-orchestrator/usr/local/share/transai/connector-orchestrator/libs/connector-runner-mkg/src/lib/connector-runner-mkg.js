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
var connector_runner_mkg_exports = {};
__export(connector_runner_mkg_exports, {
  ConnectorRunnerMkg: () => ConnectorRunnerMkg
});
module.exports = __toCommonJS(connector_runner_mkg_exports);
var import_connector_runtime_sdk = require("@transai/connector-runtime-sdk");
var import_actions_handler = require("./actions-handler");
var import_extractor = require("./extractor.service");
var import_all = require("./tables/_all");
var import_types2 = require("./types");
class ConnectorRunnerMkg extends import_connector_runtime_sdk.ConnectorRuntimeSDK {
  constructor(connector, connectorSDK) {
    super(connector, connectorSDK);
    this.init = async () => {
      const { config } = this.connectorSDK;
      Object.entries(config.tables ?? {}).forEach(
        ([tableIdentifier, configOrTrue]) => {
          const table = import_all.MKG_TABLES[tableIdentifier];
          if (!table) {
            this.connectorSDK.logger.warn(
              `[MKG] Unknown table identifier "${tableIdentifier}", skipping configuration.`
            );
            return;
          }
          if (!table.interval || table.interval <= 0) {
            this.connectorSDK.logger.verbose(
              `[MKG] Table "${tableIdentifier}" does not have a valid interval configured, skipping registration.`
            );
            return;
          }
          this.connectorSDK.processing.registerInterval(
            table.interval,
            new import_extractor.ExtractorService(
              this.connectorSDK,
              this.#mkgHttpClient,
              tableIdentifier,
              table.cloneFromTableConfig(configOrTrue)
            ),
            { immediate: table.immediate }
          );
        }
      );
    };
    this.#requestOptionsFormatter = async (options) => {
      const { config } = this.connectorSDK;
      return {
        ...options,
        headers: {
          ...options?.headers ?? {},
          Cookie: `${import_types2.SESSION_COOKIE_NAME}=${await this.#getSessionCookie(config.username, config.password)}`,
          "X-CustomerID": config.apiToken
        }
      };
    };
    const { config } = this.connectorSDK;
    this.#sessionTokenHttpClient = this.connectorSDK.httpClient({
      baseUrl: `https://${config.server}:${config.port ?? 443}/${(config.path ?? "/mkg").replace(/^\/+/, "")}`
    });
    this.#mkgHttpClient = this.connectorSDK.httpClient({
      baseUrl: `https://${config.server}:${config.port ?? 443}/${(config.path ?? "/mkg").replace(/^\/+/, "")}`
    }).setRequestOptionsFormatter(this.#requestOptionsFormatter);
    this.#actionsHandler = new import_actions_handler.ActionsHandler(
      this.connectorSDK,
      this.#mkgHttpClient
    );
    this.callbackFunction = this.#actionsHandler.callbackFunctionChain;
  }
  #actionsHandler;
  #mkgHttpClient;
  #sessionTokenHttpClient;
  #sessionToken;
  #requestOptionsFormatter;
  async #getSessionCookie(j_username, j_password) {
    const token = this.#sessionToken;
    if (token && token.expiresAt > Date.now()) {
      return token.token;
    }
    const response = await this.#sessionTokenHttpClient.post(
      "/static/auth/j_spring_security_check",
      {
        j_username,
        j_password
      },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );
    if (!response) {
      throw new Error("Failed to authenticate and retrieve session cookie");
    }
    const cookies = response.headers?.["set-cookie"] ?? response.headers?.["Set-Cookie"] ?? [];
    const sessionCookie = cookies.find(
      (cookie) => cookie.startsWith(`${import_types2.SESSION_COOKIE_NAME}=`)
    );
    if (!sessionCookie) {
      throw new Error("Session cookie not found in authentication response");
    }
    const sessionToken = sessionCookie.split(";")[0]?.substring(`${import_types2.SESSION_COOKIE_NAME}=`.length);
    this.#sessionToken = {
      token: sessionToken,
      expiresAt: Date.now() + import_types2.SESSION_EXPIRATION_SECONDS - 1e3
    };
    return sessionToken;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ConnectorRunnerMkg
});
