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
var jsession_manager_exports = {};
__export(jsession_manager_exports, {
  JsessionManager: () => JsessionManager
});
module.exports = __toCommonJS(jsession_manager_exports);
var import_axios = __toESM(require("axios"));
var import_qs = __toESM(require("qs"));
var import_logger = require("@transai/logger");
class JsessionManager {
  constructor(authUrl, username, password) {
    this.authUrl = authUrl;
    this.username = username;
    this.password = password;
    this.#logger = import_logger.Logger.getInstance();
    this.getSessionCookie().then((token) => {
      if (token) {
        this.#logger.debug(`Access token retrieved successfully`);
      } else {
        this.#logger.error(`Failed to retrieve access token`);
      }
    }).catch((error) => {
      this.#logger.error(`Error retrieving access token: ${error}`);
    });
  }
  #sessionCookie;
  #sessionExpiresAt;
  #logger;
  async getSessionCookie() {
    const now = Date.now();
    if (this.#sessionCookie && this.#sessionExpiresAt && now < this.#sessionExpiresAt) {
      return this.#sessionCookie;
    }
    try {
      const response = await import_axios.default.post(
        this.authUrl,
        import_qs.default.stringify({
          j_username: this.username,
          j_password: this.password
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          }
        }
      );
      this.#sessionCookie = response.headers["set-cookie"] ? response.headers["set-cookie"][0] : void 0;
      this.#sessionExpiresAt = now + 1800 * 1e3 - 1e4;
      return this.#sessionCookie;
    } catch (err) {
      this.#logger.error(`Failed to retrieve access token: ${err}`);
      return void 0;
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  JsessionManager
});
