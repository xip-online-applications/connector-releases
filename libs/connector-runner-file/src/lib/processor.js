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
var processor_exports = {};
__export(processor_exports, {
  Processor: () => Processor
});
module.exports = __toCommonJS(processor_exports);
var import_path = __toESM(require("path"));
var import_file_handler = require("@xip-online-data/file-handler");
class Processor {
  static {
    this.DEFAULT_INTERVAL_SECONDS = 60;
  }
  #connectorSDK;
  #fileSelector;
  #fileHandler;
  #destinationFileHandler;
  #fileReader;
  #fileSelectionRegex;
  constructor(connectorSDK, fileSelector, fileHandler) {
    this.#connectorSDK = connectorSDK;
    this.#fileSelector = fileSelector;
    this.#fileHandler = fileHandler;
    this.#fileReader = new import_file_handler.FileHandler(fileSelector.delimiter);
    const { selector } = this.#fileSelector;
    this.#fileSelectionRegex = new RegExp(
      typeof selector !== "string" ? selector.pattern : selector,
      typeof selector !== "string" && selector.flags ? selector.flags : "i"
    );
    if (this.#fileSelector.destinationDsn) {
      this.#destinationFileHandler = this.#connectorSDK.files(
        this.#fileSelector.destinationDsn
      );
    } else if (this.#fileSelector.action === "move") {
      throw new Error(
        `Destination DSN must be provided for 'move' action in file selector: ${this.name}`
      );
    }
  }
  get name() {
    const { selector } = this.#fileSelector;
    return `file-processor-${typeof selector === "string" ? selector : selector.pattern}`;
  }
  async onRun() {
    const processedFiles = await this.#listDirectory();
    this.#connectorSDK.telemetry.increment(
      "files.processed.count",
      processedFiles
    );
  }
  async #listDirectory(dirPath = "/") {
    const contents = await this.#fileHandler.list(dirPath);
    const numberOfProcessedFilesList = await Promise.all(
      contents.map(async (fileInfo) => {
        if (fileInfo.type === "FILE") {
          const processed = await this.#processFile(fileInfo, dirPath);
          return processed ? 1 : 0;
        }
        if (this.#fileSelector.recursive === true) {
          return this.#listDirectory(import_path.default.join(dirPath, fileInfo.name));
        }
        return Promise.resolve(0);
      })
    );
    return numberOfProcessedFilesList.reduce((acc, curr) => acc + curr, 0);
  }
  async #processFile(fileInfo, dirPath) {
    const filePath = import_path.default.join(dirPath, fileInfo.name);
    if (!this.#fileSelectionRegex.test(fileInfo.name)) {
      this.#connectorSDK.logger.verbose(
        `Skipping file at path: ${filePath} as it does not match selector regex`
      );
      return false;
    }
    this.#connectorSDK.logger.debug(`Processing file at path: ${filePath}`);
    let fileContent;
    let parsedContent;
    try {
      fileContent = await this.#fileHandler.read(filePath);
      parsedContent = await this.#fileReader.handleBuffer(
        filePath,
        fileContent.get(),
        this.#fileSelector.optionalHeaders ?? [],
        this.#fileSelector.optionalSettings
      );
      if (!parsedContent) {
        this.#connectorSDK.logger.info(
          `Failed to parse file at path: ${filePath}`
        );
        fileContent.close();
        return false;
      }
      this.#connectorSDK.logger.debug(
        `Parsed file successfully at path: ${filePath}`
      );
    } catch (error) {
      this.#connectorSDK.logger.error(
        `Error parsing file at path: ${filePath}, error: ${error}`
      );
      fileContent?.close();
      return false;
    }
    try {
      const data = [
        {
          ...parsedContent,
          _filename: import_file_handler.FileHandler.getFileName(filePath) ?? fileInfo.name
        }
      ];
      const metadata = {
        keyField: "_filename",
        collection: `${this.#connectorSDK.config.datasourceIdentifier ?? "file"}_${this.#fileSelector.identifier ?? this.#fileSelectionRegex.source}`
      };
      if (this.#fileSelector.type === "metric") {
        await this.#connectorSDK.sender.metricsLegacy(
          data,
          metadata
        );
      } else {
        await this.#connectorSDK.sender.documents(data, metadata);
      }
    } catch (error) {
      this.#connectorSDK.logger.error(
        `Error sending parsed file from path: ${filePath}, error: ${error}`
      );
      fileContent?.close();
      return false;
    }
    try {
      switch (this.#fileSelector.action) {
        case "move":
          await this.#destinationFileHandler?.write(fileInfo.name, fileContent);
          await this.#fileHandler.delete(filePath);
          this.#connectorSDK.logger.debug(
            `"Moved" file at path: ${filePath} to ${this.#destinationFileHandler?.pathAsDsn(fileInfo.name)} after processing`
          );
          break;
        case "delete":
          await this.#fileHandler.delete(filePath);
          this.#connectorSDK.logger.debug(
            `Deleted file at path: ${filePath} after processing`
          );
          break;
      }
    } finally {
      fileContent?.close();
    }
    return true;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Processor
});
