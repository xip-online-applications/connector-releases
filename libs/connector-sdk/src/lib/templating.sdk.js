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
var templating_sdk_exports = {};
__export(templating_sdk_exports, {
  TemplatingSDKService: () => TemplatingSDKService
});
module.exports = __toCommonJS(templating_sdk_exports);
var import_handlebars = __toESM(require("handlebars"));
var import_handlebars_helpers = __toESM(require("handlebars-helpers"));
var import_jsonata = __toESM(require("jsonata"));
var import_moment_timezone = __toESM(require("moment-timezone"));
class TemplatingSDKService {
  #handlebarsInstance = import_handlebars.default.create();
  constructor() {
    (0, import_handlebars_helpers.default)({ handlebars: this.#handlebarsInstance });
    this.#handlebarsInstance.registerHelper(
      "getFirst",
      (inputString, delimiter) => {
        if (typeof inputString !== "string" || typeof delimiter !== "string") {
          return inputString;
        }
        if (inputString.includes(delimiter)) {
          return inputString.split(delimiter)[0];
        }
        return inputString;
      }
    );
    this.#handlebarsInstance.registerHelper(
      "formatDateInTimezone",
      (datetimeString, timezone, format) => {
        if (typeof format === "object") {
          format = void 0;
        }
        if (datetimeString === "now") {
          return (0, import_moment_timezone.default)().tz(timezone).format(format);
        }
        return (0, import_moment_timezone.default)(datetimeString).tz(timezone).format(format);
      }
    );
    this.#handlebarsInstance.registerHelper("formatISODate", (timestamp) => {
      const date = new Date(timestamp);
      return date.toISOString();
    });
    this.#handlebarsInstance.registerHelper(
      "datetimeToDecimalHours",
      (datetimeString) => {
        const datetime = import_moment_timezone.default.parseZone(datetimeString);
        const hours = datetime.hours();
        const minutes = datetime.minutes();
        const seconds = datetime.seconds();
        const decimalHours = hours + minutes / 60 + seconds / 3600;
        return decimalHours.toFixed(2);
      }
    );
    this.#handlebarsInstance.registerHelper(
      "isFalse",
      (value) => value === false || value === "false"
    );
    this.#handlebarsInstance.registerHelper(
      "isTrue",
      (value) => value === true || value === "true"
    );
    this.#handlebarsInstance.registerHelper(
      "jsonata",
      (value, expression) => {
        try {
          const expr = (0, import_jsonata.default)(expression);
          const result = expr.evaluate(value);
          if (typeof result === "string" || typeof result === "number") {
            return result;
          }
          return JSON.stringify(result);
        } catch (err) {
          return `JSONata error: ${err.message}`;
        }
      }
    );
    this.#handlebarsInstance.registerHelper(
      "jsonEscape",
      (v) => JSON.stringify(v).slice(1, -1)
    );
    this.#handlebarsInstance.registerHelper("json", (v) => JSON.stringify(v));
  }
  compile(input, options) {
    return this.#handlebarsInstance.compile(input, options);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  TemplatingSDKService
});
//# sourceMappingURL=templating.sdk.js.map
