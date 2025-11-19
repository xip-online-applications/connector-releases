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
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var sentry_exports = {};
__export(sentry_exports, {
  SentryFilter: () => SentryFilter,
  init: () => init,
  register: () => register
});
module.exports = __toCommonJS(sentry_exports);
var import_common = require("@nestjs/common");
var import_core = require("@nestjs/core");
var Sentry = __toESM(require("@sentry/node"));
var import_http = require("@nestjs/common/exceptions/http.exception");
function register(app, options = {}) {
  const dsn = options.dsn ?? process.env["SENTRY_DSN"];
  if (!dsn) {
    return;
  }
  const { httpAdapter } = app.get(import_core.HttpAdapterHost);
  app.useGlobalFilters(new SentryFilter(httpAdapter));
}
function init(options = {}) {
  const dsn = options.dsn ?? process.env["SENTRY_DSN"];
  if (!dsn) {
    return;
  }
  Sentry.init({
    dsn,
    environment: options.environment ?? process.env["SENTRY_ENVIRONMENT"] ?? process.env["NODE_ENV"] ?? "dev",
    release: options.release ?? process.env["SENTRY_RELEASE"] ?? "unknown",
    tracesSampleRate: options.tracesSampleRate ?? 1
  });
}
let SentryFilter = class extends import_core.BaseExceptionFilter {
  catch(exception, host) {
    if (exception instanceof import_http.HttpException) {
      const error = exception;
      const statusCode = error.getStatus();
      if (statusCode >= 500) {
        Sentry.captureException(exception, {
          tags: {
            status_code: statusCode
          }
        });
      }
    } else {
      Sentry.captureException(exception);
    }
    super.catch(exception, host);
  }
};
SentryFilter = __decorateClass([
  (0, import_common.Catch)()
], SentryFilter);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  SentryFilter,
  init,
  register
});
