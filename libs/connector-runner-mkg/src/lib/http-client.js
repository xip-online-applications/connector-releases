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
var http_client_exports = {};
__export(http_client_exports, {
  HttpClient: () => HttpClient
});
module.exports = __toCommonJS(http_client_exports);
var import_http_client = require("@xip-online-data/http-client");
var import_types = require("./types");
class HttpClient extends import_http_client.HttpClient {
  #sessionToken;
  constructor(config) {
    super(config);
  }
  get config() {
    return super.config;
  }
  async request(method, url, options) {
    return super.request(method, url, {
      ...options ?? {},
      headers: {
        ...options?.headers ?? {},
        Cookie: `${import_types.SESSION_COOKIE_NAME}=${await this.#getSessionCookie()}`,
        "X-CustomerID": this.config.apiToken
      }
    });
  }
  async #getSessionCookie() {
    const token = this.#sessionToken;
    if (token && token.expiresAt > Date.now()) {
      return token.token;
    }
    const response = await this.doRequest(
      "POST",
      "/static/auth/j_spring_security_check",
      {
        data: {
          j_username: this.config.username,
          j_password: this.config.password
        },
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );
    if (!response) {
      throw new Error("Failed to authenticate and retrieve session cookie");
    }
    const cookies = response.headers["set-cookie"] ?? response.headers["Set-Cookie"] ?? [];
    const sessionCookie = cookies.find(
      (cookie) => cookie.startsWith(`${import_types.SESSION_COOKIE_NAME}=`)
    );
    if (!sessionCookie) {
      throw new Error("Session cookie not found in authentication response");
    }
    const sessionToken = sessionCookie.split(";")[0]?.substring(`${import_types.SESSION_COOKIE_NAME}=`.length);
    this.#sessionToken = {
      token: sessionToken,
      expiresAt: Date.now() + import_types.SESSION_EXPIRATION_SECONDS - 1e3
    };
    return sessionToken;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  HttpClient
});
