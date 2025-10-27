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
var filesource_processor_service_exports = {};
__export(filesource_processor_service_exports, {
  FilesourceProcessorService: () => FilesourceProcessorService
});
module.exports = __toCommonJS(filesource_processor_service_exports);
var import_file_handler = require("@xip-online-data/file-handler");
var import_rxjs = require("rxjs");
var import_types = require("@xip-online-data/types");
var import_handle_error = require("@xip-online-data/handle-error");
var import_uuid = require("uuid");
var import_logger = require("@transai/logger");
var import_helper = require("../helper.functions");
class FilesourceProcessorService {
  constructor(fileSourceConfig, config, kafkaService, sftpClient) {
    this.#processing = false;
    this.#numberOfImportedFilesPerSession = 0;
    this.sendMetricsToKafka = async (contents, path) => {
      let kafkaPayload;
      if (Array.isArray(contents)) {
        kafkaPayload = contents.map((content) => ({
          type: "SOURCE",
          eventId: (0, import_uuid.v4)(),
          eventType: "event.metric",
          created: Date.now(),
          ttl: 36e5,
          // 1 month
          tenantIdentifier: this.#config.tenantIdentifier,
          payload: this.buildPayload(content, path)
        }));
      } else {
        kafkaPayload = [
          {
            type: "SOURCE",
            eventId: (0, import_uuid.v4)(),
            eventType: "event.metric",
            created: Date.now(),
            ttl: 36e5,
            // 1 month
            tenantIdentifier: this.#config.tenantIdentifier,
            payload: this.buildPayload(contents, path)
          }
        ];
      }
      await this.#kafkaService.send(
        kafkaPayload,
        (0, import_helper.generateKafkaTopic)(this.#config, this.#fileSourceConfig)
      );
    };
    this.sendDocumentsToKafka = async (parsedContent, path) => {
      const kafkaPayload = {
        type: "SOURCE",
        eventId: (0, import_uuid.v4)(),
        eventType: `${this.#config.tenantIdentifier}_SOURCE_${this.#fileSourceConfig.ftpIdentifier}`,
        created: Date.now(),
        ttl: 36e5,
        // 1 month
        tenantIdentifier: this.#config.tenantIdentifier,
        payload: this.buildPayload(parsedContent, path)
      };
      await this.#kafkaService.send(
        [kafkaPayload],
        (0, import_helper.generateKafkaTopic)(this.#config, this.#fileSourceConfig)
      );
    };
    this.buildPayload = (parsedContent, path) => {
      return {
        body: {
          ...parsedContent,
          _filename: import_file_handler.FileHandler.getFileName(path)
        },
        keyField: "_filename",
        indexes: this.#fileSourceConfig.indexes ?? [],
        incrementalField: "",
        collection: (0, import_helper.generateCollectionName)(this.#config, this.#fileSourceConfig)
      };
    };
    this.#fileSourceConfig = fileSourceConfig;
    this.#config = config;
    this.#kafkaService = kafkaService;
    this.#sftpClient = sftpClient;
    this.#fileHandler = new import_file_handler.FileHandler(this.#fileSourceConfig.delimiter);
    this.#logger = import_logger.Logger.getInstance();
  }
  #processing;
  #numberOfImportedFilesPerSession;
  #fileHandler;
  #fileSourceConfig;
  #config;
  #kafkaService;
  #sftpClient;
  #logger;
  #subscription;
  async init() {
    this.#subscription = (0, import_rxjs.interval)(
      this.#fileSourceConfig.interval * 1e3
    ).subscribe(async () => {
      await this.process().catch((error) => {
        this.#logger.error(
          `Error while processing files from filesource processor service ${error.message}`
        );
      });
    });
  }
  stop() {
    this.#subscription?.unsubscribe();
  }
  async process() {
    if (this.#processing) {
      this.#logger.debug(
        `Filesource processor service is already processing: ${this.#fileSourceConfig.ftpIdentifier}`
      );
      return;
    }
    this.#numberOfImportedFilesPerSession = 0;
    this.#processing = true;
    try {
      let dir = this.#fileSourceConfig.root;
      if (!dir.endsWith("/")) {
        dir += "/";
      }
      await this.processDirectory(
        `${dir}${this.#fileSourceConfig.directory}`,
        this.#fileSourceConfig.fileSelector
      );
    } catch (error) {
      if (error instanceof Error) {
        import_logger.Logger.getInstance().error(error.message);
      } else {
        import_logger.Logger.getInstance().error(
          `Error while processing files ${JSON.stringify(error)}`
        );
      }
    } finally {
      this.#processing = false;
    }
  }
  async processDirectory(directory, fileSelector) {
    this.#logger.debug(
      `Processing directory: ${directory} with ${fileSelector?.pattern}`
    );
    let files = await this.#sftpClient.list(directory);
    this.#logger.debug(
      `Number Files in directory ${directory}: ${files.map((f) => f.name).join(", ")}`
    );
    if (fileSelector) {
      const regex = new RegExp(fileSelector.pattern, fileSelector.flags);
      files = files.filter((f) => regex.test(f.name) || f.type === "d");
      this.#logger.debug(
        `Number Files in directory after regex filtering: ${files.length}`
      );
    }
    await this.processFile(directory, files, fileSelector).catch((error) => {
      (0, import_handle_error.handleError)("Error while initializing the app", error);
    });
  }
  async processFile(directory, files, fileSelector) {
    for (const file of files) {
      const path = `${directory}/${file.name}`;
      if (this.#fileSourceConfig.recursive === true) {
        if (file.type === "d") {
          await this.processDirectory(path, fileSelector);
          continue;
        }
      }
      if (file.type === "l") {
        continue;
      }
      if (file.type === "-") {
        this.#logger.debug(`Processing file: ${path}`);
        this.#numberOfImportedFilesPerSession += 1;
        const contentBuffer = await this.#sftpClient.readFile(path);
        this.#logger.debug(`File ${path} read successfully`);
        const parsedContent = await this.#fileHandler.handleBuffer(
          path,
          contentBuffer,
          this.#fileSourceConfig.optionalHeaders ?? [],
          this.#fileSourceConfig.optionalSettings
        );
        this.#logger.debug(`File ${path} Parsed successfully`);
        if (!parsedContent) {
          continue;
        }
        if (this.#fileSourceConfig.type === "metric") {
          await this.sendMetricsToKafka(parsedContent, path);
        } else {
          await this.sendDocumentsToKafka(parsedContent, path);
        }
        await this.handleAction(
          this.#fileSourceConfig.action,
          path,
          file,
          `${this.#fileSourceConfig.root}/${this.#fileSourceConfig.processedDirectory}`
        );
      }
    }
  }
  async handleAction(action, filePath, file, destinationPath) {
    switch (action) {
      case import_types.FileActionType.ACTION_NOTHING:
        return Promise.resolve();
      case import_types.FileActionType.ACTION_MOVE:
        return this.#sftpClient.moveFile(filePath, file, destinationPath);
      case import_types.FileActionType.ACTION_DELETE:
        return this.#sftpClient.deleteFile(filePath);
      default:
        throw new Error("Unknown action");
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  FilesourceProcessorService
});
//# sourceMappingURL=filesource-processor.service.js.map
