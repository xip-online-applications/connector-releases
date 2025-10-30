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
var token_manager_exports = {};
__export(token_manager_exports, {
  TokenManager: () => TokenManager
});
module.exports = __toCommonJS(token_manager_exports);
var import_axios = __toESM(require("axios"));
var import_qs = __toESM(require("qs"));
var import_logger = require("@transai/logger");
class TokenManager {
  constructor(tokenUrl, clientId, clientSecret) {
    this.tokenUrl = tokenUrl;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.#logger = import_logger.Logger.getInstance();
    this.getAccessToken().then((token) => {
      if (token) {
        this.#logger.debug(`Access token retrieved successfully`);
      } else {
        this.#logger.error(`Failed to retrieve access token`);
      }
    }).catch((error) => {
      this.#logger.error(`Error retrieving access token: ${error}`);
    });
  }
  #token;
  #tokenExpiresAt;
  #logger;
  async getAccessToken() {
    const now = Date.now();
    if (this.#token && this.#tokenExpiresAt && now < this.#tokenExpiresAt) {
      return this.#token;
    }
    try {
      const response = await import_axios.default.post(
        this.tokenUrl,
        import_qs.default.stringify({
          grant_type: "client_credentials",
          client_id: this.clientId,
          client_secret: this.clientSecret
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          }
        }
      );
      const { access_token: accessToken, expires_in: expiresIn } = response.data;
      this.#token = accessToken;
      this.#tokenExpiresAt = now + expiresIn * 1e3 - 1e4;
      return this.#token;
    } catch (err) {
      this.#logger.error(`Failed to retrieve access token: ${err}`);
      return void 0;
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  TokenManager
});
//# sourceMappingURL=token-manager.js.map
