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
var builder_service_exports = {};
__export(builder_service_exports, {
  HttpServiceBuilder: () => HttpServiceBuilder
});
module.exports = __toCommonJS(builder_service_exports);
var import_http = require("./http.service");
var import_token = require("./token");
var import_cache = require("./cache");
var import_filesystem_cache = require("./cache/filesystem-cache.service");
class HttpServiceBuilder {
  static build(options) {
    const cacheService = HttpServiceBuilder.buildCacheService(
      options.cache ?? {}
    );
    const jwtTokenService = HttpServiceBuilder.buildJwtTokenService(
      options.jwt,
      cacheService
    );
    return new import_http.HttpService(jwtTokenService, {
      baseUrl: options.baseUrl,
      tenantIdentifier: options.jwt.tenantIdentifier
    });
  }
  static buildFromEnv(options) {
    return HttpServiceBuilder.build({
      baseUrl: options.baseUrl,
      jwt: {
        tokenUrl: process.env["AUTH0_TOKEN_URL"],
        clientId: process.env["AUTH0_CLIENT_ID"],
        clientSecret: process.env["AUTH0_CLIENT_SECRET"],
        audience: options.audience,
        tenantIdentifier: options.tenantIdentifier
      },
      cache: {
        type: process.env["REDIS_URL"] ? "redis" : "memory",
        redisUrl: process.env["REDIS_URL"],
        keyPrefix: process.env["CACHE_KEY_PREFIX"]
      }
    });
  }
  static buildJwtTokenService(options, cacheService) {
    return new import_token.JwtTokenService(options, cacheService);
  }
  static buildCacheService(options = {}) {
    switch (options.type) {
      case "redis":
        return new import_cache.RedisCacheService(String(options.redisUrl), {
          cacheKeyPrefix: options.keyPrefix
        });
      case "filesystem":
        return new import_filesystem_cache.FileSystemCacheService({
          path: options.path ?? "./cache",
          keyPrefix: options.keyPrefix
        });
      default:
        return new import_cache.ArrayCacheService();
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  HttpServiceBuilder
});
//# sourceMappingURL=builder.service.js.map
