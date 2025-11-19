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
var http_client_authentication_exports = {};
__export(http_client_authentication_exports, {
  HttpClientAuthentication: () => HttpClientAuthentication
});
module.exports = __toCommonJS(http_client_authentication_exports);
class HttpClientAuthentication {
  #config;
  #tokenHttpClient;
  #sessionToken;
  constructor(config, tokenHttpClient) {
    this.#config = config;
    this.#tokenHttpClient = tokenHttpClient;
  }
  static createForAuthConfig(config, tokenHttpClient) {
    const instance = new HttpClientAuthentication(config, tokenHttpClient);
    return instance.format.bind(instance);
  }
  async format(requestOptions) {
    if (this.#config.authorization) {
      return {
        ...requestOptions,
        headers: {
          ...requestOptions.headers,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          Authorization: this.#config.authorization
        }
      };
    }
    if (this.#config.tokenUrl && this.#config.clientId && this.#config.clientSecret) {
      return {
        ...requestOptions,
        headers: {
          ...requestOptions.headers,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          Authorization: await this.#formatTokenAuth()
        }
      };
    }
    return requestOptions;
  }
  async #formatTokenAuth() {
    const token = this.#sessionToken;
    if (token && token.expiresAt > Date.now()) {
      return token.token;
    }
    const response = await this.#tokenHttpClient.post(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.#config.tokenUrl,
      {
        grant_type: "client_credentials",
        client_id: this.#config.clientId,
        client_secret: this.#config.clientSecret
      },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );
    if (!response) {
      throw new Error(
        "Failed to authenticate and retrieve authentication token"
      );
    }
    const { access_token: accessToken, expires_in: expiresIn } = response.data;
    this.#sessionToken = {
      token: accessToken,
      expiresAt: Date.now() + expiresIn * 1e3 - 1e3
    };
    return accessToken;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  HttpClientAuthentication
});
