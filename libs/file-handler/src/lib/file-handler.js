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
var file_handler_exports = {};
__export(file_handler_exports, {
  FileHandler: () => FileHandler
});
module.exports = __toCommonJS(file_handler_exports);
var import_xml2js = __toESM(require("xml2js"));
var import_csvtojson = __toESM(require("csvtojson"));
var path = __toESM(require("path"));
var import_logger = require("@transai/logger");
var import_stream = require("stream");
class FileHandler {
  #delimiter;
  #logger;
  constructor(delimiter = void 0) {
    this.#delimiter = delimiter;
    this.#logger = import_logger.Logger.getInstance();
    this.#logger.info(`FileHandler initialized with delimiter: ${delimiter}`);
  }
  async handleBuffer(file, content, optionalHeaders, optionalSettings) {
    let parsedContent;
    const fileType = FileHandler.getExtension(file);
    switch (fileType) {
      case ".csv":
        parsedContent = await this.parseCSV(
          content,
          optionalHeaders,
          optionalSettings
        );
        break;
      default:
        return this.handle(
          file,
          content.toString(),
          optionalHeaders,
          optionalSettings
        );
    }
    return parsedContent;
  }
  async handle(file, content, optionalHeaders, optionalSettings) {
    let parsedContent;
    const fileType = FileHandler.getExtension(file);
    switch (fileType) {
      case ".xml":
        parsedContent = await this.parseXML(content, optionalHeaders);
        break;
      case ".json":
        parsedContent = JSON.parse(content);
        break;
      default:
        import_logger.Logger.getInstance().error(`Unsupported file type: ${file}`);
    }
    return parsedContent;
  }
  async parseXML(content, optionalHeaders) {
    try {
      const data = await import_xml2js.default.parseStringPromise(content, {
        explicitArray: false
      });
      return this.xmlOptions(data, optionalHeaders);
    } catch (error) {
      throw new Error(`Error parsing XML content: ${error.message}`);
    }
  }
  async parseCSV(content, optionalHeaders, optionalSettings) {
    try {
      const stream = import_stream.Readable.from(content);
      let noHeader = true;
      const optionalSettingsKeys = Object.keys(optionalSettings ?? {});
      if (optionalSettingsKeys.includes("noHeader")) {
        noHeader = optionalSettings?.noHeader;
      }
      const options = {
        delimiter: this.#delimiter ?? ",",
        noheader: noHeader
      };
      return (0, import_csvtojson.default)(options).fromStream(stream);
    } catch (error) {
      this.#logger.error(`Error parsing CSV: ${error.message}`);
      throw new Error(`Error parsing CSV content: ${error.message}`);
    }
  }
  xmlOptions(content, headersRequiredAsArray) {
    const processElement = (element) => {
      if (typeof element === "object") {
        for (const key of Object.keys(element)) {
          const value = element[key];
          if (headersRequiredAsArray.includes(key)) {
            if (!Array.isArray(value)) {
              element[key] = [value];
            }
          } else if (key !== "_text") {
            element[key] = processElement(value);
          }
        }
      }
      return element;
    };
    return processElement(content);
  }
  csvOptions(content, optionalHeaders) {
    let option;
    if (Array.isArray(optionalHeaders) && optionalHeaders.length > 0) {
      option = { headers: optionalHeaders };
    } else {
      const lines = content.split("\n");
      const firstLine = lines[0].trim();
      const headers = firstLine.split(",");
      option = headers.length > 1 ? { headers: true } : { noheader: true };
    }
    return option;
  }
  stringify(destination) {
    return JSON.stringify(destination, null, 2);
  }
  static getPath(file) {
    return path.dirname(file);
  }
  static getFileName(file) {
    return path.basename(file);
  }
  static getExtension(file) {
    return path.extname(file).toLowerCase();
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  FileHandler
});
