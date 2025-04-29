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
var winston = __toESM(require("winston"));
var LogLevels = /* @__PURE__ */ ((LogLevels2) => {
  LogLevels2["error"] = "error";
  LogLevels2["warn"] = "warn";
  LogLevels2["info"] = "info";
  LogLevels2["http"] = "http";
  LogLevels2["verbose"] = "verbose";
  LogLevels2["debug"] = "debug";
  LogLevels2["silly"] = "silly";
  return LogLevels2;
})(LogLevels || {});
class Logger {
  constructor(identifier, loglevel = "info" /* info */) {
    this.logger = winston.createLogger({
      level: loglevel,
      format: winston.format.combine(
        winston.format.label({ label: identifier }),
        winston.format.timestamp(),
        winston.format.json()
      )
    });
    let transportsAdded = false;
    if (process.env["NODE_ENV"] !== "production" || process.env["LOG_TO_CONSOLE"] === "true") {
      transportsAdded = true;
      this.logger.add(
        new winston.transports.Console({
          format: winston.format.printf(
            ({ label, level, message }) => `[${label}] ${level}: ${message}`
          )
        })
      );
    }
    if (process.env["LOG_TO_FILE"] === "true") {
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
  static getInstance(identifier, loglevel = "info" /* info */) {
    if (!Logger.instance) {
      Logger.instance = new Logger(identifier ?? "default", loglevel);
    }
    return Logger.instance;
  }
  info(message, ...args) {
    if (typeof message === "object") {
      this.logger.info(JSON.stringify(message), ...args);
    } else {
      this.logger.info(message, ...args);
    }
  }
  debug(message, ...args) {
    if (typeof message === "object") {
      this.logger.debug(JSON.stringify(message), ...args);
    } else {
      this.logger.debug(message, ...args);
    }
  }
  error(message, ...args) {
    if (typeof message === "object") {
      this.logger.error(JSON.stringify(message), ...args);
    } else {
      this.logger.error(message, ...args);
    }
  }
  warn(message, ...args) {
    if (typeof message === "object") {
      this.logger.warn(JSON.stringify(message), ...args);
    } else {
      this.logger.warn(message, ...args);
    }
  }
  trace(message, ...args) {
    if (typeof message === "object") {
      this.logger.verbose(JSON.stringify(message), ...args);
    } else {
      this.logger.verbose(message, ...args);
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  LogLevels,
  Logger
});
