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
var logger_exports = {};
__export(logger_exports, {
  LogLevels: () => LogLevels,
  Logger: () => Logger
});
module.exports = __toCommonJS(logger_exports);
var import_node_process = __toESM(require("node:process"));
var winston = __toESM(require("winston"));
var LogLevels = /* @__PURE__ */ ((LogLevels2) => {
  LogLevels2["error"] = "error";
  LogLevels2["warn"] = "warn";
  LogLevels2["info"] = "info";
  LogLevels2["http"] = "http";
  LogLevels2["debug"] = "debug";
  return LogLevels2;
})(LogLevels || {});
class Logger {
  #datadogTransport;
  constructor(identifier = "default", loglevel = "info" /* info */) {
    this.logger = winston.createLogger({
      level: loglevel,
      format: winston.format.combine(
        winston.format.label({ label: identifier }),
        winston.format.timestamp(),
        winston.format.json()
      )
    });
    let transportsAdded = false;
    if (import_node_process.default.env["NODE_ENV"] !== "production" || import_node_process.default.env["LOG_TO_CONSOLE"] === "true") {
      transportsAdded = true;
      this.logger.add(
        new winston.transports.Console({
          format: winston.format.printf(
            ({ label, level, message }) => `[${label}] ${level}: ${message}`
          )
        })
      );
    }
    if (import_node_process.default.env["LOG_TO_FILE"] === "true") {
      transportsAdded = true;
      this.logger.add(
        new winston.transports.File({
          filename: "error.log",
          level: "error" /* error */
        })
      );
      this.logger.add(
        new winston.transports.File({ filename: "combined.log" })
      );
    }
    if (!transportsAdded) {
      this.logger.add(
        new winston.transports.Console({
          format: winston.format.printf(
            ({ label, level, message }) => `[${label}] ${level}: ${message}`
          )
        })
      );
    }
  }
  static getInstance(identifier, loglevel) {
    if (!Logger.instance) {
      Logger.instance = new Logger(
        identifier ?? "default",
        Logger.#getLogLevel(loglevel)
      );
    }
    return Logger.instance;
  }
  setDatadogTransport(context) {
    const apiKey = context?.apiKey ?? import_node_process.default.env["DATADOG_API_KEY"];
    if (!apiKey) {
      this.debug("DATADOG_API_KEY is not set, cannot add Datadog transport");
      return this;
    }
    const searchParams = new URLSearchParams({
      "dd-api-key": apiKey,
      ddsource: context?.source ?? import_node_process.default.env["DD_SOURCE"] ?? "nodejs",
      service: context?.service ?? import_node_process.default.env["DD_SERVICE"] ?? "unknown",
      env: context?.env ?? import_node_process.default.env["DD_ENV"] ?? "prod"
    });
    if (context?.tags) {
      searchParams.append(
        "ddtags",
        Object.entries(context.tags).map(([key, value]) => `${key}:${value}`).join(",")
      );
    }
    const httpTransportOptions = {
      host: `http-intake.logs.${import_node_process.default.env["DD_SITE"] ?? "datadoghq.eu"}`,
      path: `/api/v2/logs?${searchParams.toString()}`,
      ssl: true,
      batch: true,
      format: winston.format.json()
    };
    if (this.#datadogTransport) {
      this.logger.remove(this.#datadogTransport);
    }
    this.#datadogTransport = new winston.transports.Http(httpTransportOptions);
    this.logger.add(this.#datadogTransport);
    return this;
  }
  info(...args) {
    this.#logFunction(this.logger.info, ...args);
  }
  debug(...args) {
    this.#logFunction(this.logger.debug, ...args);
  }
  error(...args) {
    this.#logFunction(this.logger.error, ...args);
  }
  warn(...args) {
    this.#logFunction(this.logger.warn, ...args);
  }
  verbose(...args) {
    this.#logFunction(this.logger.verbose, ...args);
  }
  #logFunction(func, ...meta) {
    try {
      const message = meta.map(
        (param) => typeof param === "object" ? JSON.stringify(param) : String(param)
      );
      func(message.join(" "), ...meta);
    } catch (error) {
      console.error("unknown error in log, function", error);
    }
  }
  static #getLogLevel = (givenLevel) => {
    if (givenLevel !== void 0) {
      return givenLevel;
    }
    let logLevel = import_node_process.default.env["LOG_LEVEL"] || "info" /* info */;
    const validLogLevels = Object.values(LogLevels);
    const faultyLogLevel = !validLogLevels.includes(logLevel);
    if (faultyLogLevel) {
      logLevel = "info" /* info */;
    }
    if (faultyLogLevel) {
      console.error(
        `Invalid log level: ${logLevel} only allow; 'error', 'warn', 'info', 'debug', 'trace'. Using info as default.`
      );
    }
    return logLevel;
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  LogLevels,
  Logger
});
