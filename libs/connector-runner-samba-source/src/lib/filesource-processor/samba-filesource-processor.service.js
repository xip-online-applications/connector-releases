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
var samba_filesource_processor_service_exports = {};
__export(samba_filesource_processor_service_exports, {
  SambaFilesourceProcessorService: () => SambaFilesourceProcessorService
});
module.exports = __toCommonJS(samba_filesource_processor_service_exports);
var import_rxjs = require("rxjs");
var import_samba_client = require("@xip-online-data/samba-client");
var fs = __toESM(require("fs"));
var import_file_handler = require("@xip-online-data/file-handler");
var import_types = require("@xip-online-data/types");
var import_uuid = require("uuid");
var import_logger = require("@transai/logger");
var import_helper = require("../helper.functions");
class SambaFilesourceProcessorService {
  #sambaClientInstance;
  get #sambaClient() {
    if (!this.#sambaClientInstance) {
      throw new Error("Samba client is not initialized");
    }
    return this.#sambaClientInstance;
  }
  #sambaConfig;
  #fileHandler = new import_file_handler.FileHandler();
  #sambaSourceConfig;
  #kafkaService;
  #config;
  #logger;
  #processing = false;
  #numberOfImportedFilesPerSession = 0;
  #subscription;
  constructor(config, sambaSourceConfig, kafkaService) {
    this.#config = config;
    this.#sambaSourceConfig = sambaSourceConfig;
    this.#kafkaService = kafkaService;
    this.#sambaConfig = config.samba;
    this.#logger = import_logger.Logger.getInstance();
  }
  async init() {
    this.#sambaClientInstance = new import_samba_client.SambaClient(this.#sambaConfig);
    this.setInterval();
  }
  stop() {
    this.#subscription?.unsubscribe();
  }
  setInterval() {
    this.#subscription = (0, import_rxjs.interval)(this.#sambaSourceConfig.interval * 1e3).pipe((0, import_rxjs.filter)(() => !this.#processing)).subscribe(async () => {
      await this.process().catch((error) => {
        throw new Error(
          `Error while processing files from filesource processor service ${error.message}`
        );
      });
    });
  }
  async process() {
    if (this.#processing) {
      import_logger.Logger.getInstance().info(
        "Filesource processor service is already processing: ",
        this.#sambaConfig.address
      );
      return;
    }
    this.#numberOfImportedFilesPerSession = 0;
    this.#processing = true;
    try {
      this.#numberOfImportedFilesPerSession = await this.listDirectory(
        this.#sambaSourceConfig.directory,
        this.#sambaSourceConfig.fileSelector
      ).catch((error) => {
        import_logger.Logger.getInstance().error(
          `Error while listing directory ${this.#sambaSourceConfig.directory}: ${error.message}`
        );
        throw error;
      });
      import_logger.Logger.getInstance().verbose(
        `Imported ${this.#numberOfImportedFilesPerSession} files from ${this.#sambaConfig.address}`
      );
    } catch (error) {
      import_logger.Logger.getInstance().debug(JSON.stringify(error));
    } finally {
      this.#processing = false;
    }
  }
  async listDirectory(location, fileSelector) {
    let imported = 0;
    const listResult = await this.#sambaClient.list(location);
    let files = listResult.filter((r) => r.type === "A");
    this.#logger.debug(
      `Total files in ${location}: ${files.map((f) => f.name).join(", ")}`
    );
    if (fileSelector) {
      const regex = new RegExp(fileSelector.pattern, fileSelector.flags);
      files = files.filter((f) => regex.test(f.name));
      this.#logger.debug(
        `Files in ${location} after regex filter: ${files.map((f) => f.name).join(", ")}`
      );
    }
    for (const f of files) {
      const success = await this.getFile(f, location);
      if (success) {
        imported += 1;
      }
    }
    const directories = listResult.filter(
      (r) => r.type === "D" && r.name !== "." && r.name !== ".."
    );
    if (this.#sambaSourceConfig.recursive === true) {
      for (const d of directories) {
        const subImport = await this.listDirectory(
          `${location + d.name}/`,
          fileSelector
        );
        imported += subImport;
      }
    }
    return imported;
  }
  async getFile(file, location) {
    const remoteFile = `${location}${file.name}`;
    const localFile = `${this.#sambaConfig.tmpDirectory}/${file.name}`;
    let success = false;
    try {
      await this.#sambaClient.getFile(remoteFile, localFile).catch((error) => {
        import_logger.Logger.getInstance().error(
          `Error while getting file ${remoteFile}: ${error.message}`
        );
        throw error;
      });
      success = await this.handleLocalFile(file, localFile);
      if (this.#sambaSourceConfig.action !== import_types.FileActionType.ACTION_NOTHING) {
        await this.deleteRemoteFile(remoteFile);
        if (this.#sambaSourceConfig.action === import_types.FileActionType.ACTION_MOVE) {
          await this.moveFileToRemoteLocation(localFile, file);
        }
      }
      this.#deleteLocalFile(localFile);
    } catch (e) {
      import_logger.Logger.getInstance().error(JSON.stringify(e));
      return false;
    }
    return success;
  }
  async deleteRemoteFile(remoteFile) {
    try {
      const feedback = await this.#sambaClient.deleteFile(remoteFile);
      import_logger.Logger.getInstance().debug(feedback);
    } catch (e) {
      import_logger.Logger.getInstance().error(JSON.stringify(e));
      return false;
    }
    return true;
  }
  async moveFileToRemoteLocation(localFile, file) {
    try {
      const remotePath = this.#sambaSourceConfig.processedDirectory;
      if (!await this.#sambaClient.fileExists(remotePath)) {
        await this.#sambaClient.mkdir(remotePath);
      }
      const feedback = await this.#sambaClient.sendFile(
        localFile,
        `${remotePath}${file.name}`
      );
      import_logger.Logger.getInstance().debug(feedback);
    } catch (e) {
      import_logger.Logger.getInstance().error(JSON.stringify(e));
    }
  }
  async handleLocalFile(file, location) {
    try {
      const content = fs.readFileSync(location, "utf-8");
      const parsedContent = await this.#fileHandler.handle(
        file.name,
        content,
        this.#sambaSourceConfig.optionalHeaders ?? []
      );
      const payload = {
        body: {
          ...parsedContent,
          _filename: file.name
        },
        keyField: "_filename",
        indexes: this.#sambaSourceConfig.indexes ?? [],
        incrementalField: "",
        collection: (0, import_helper.generateCollectionName)(
          this.#config,
          this.#sambaSourceConfig
        )
      };
      const parsedRecords = [
        {
          type: "SOURCE",
          eventId: (0, import_uuid.v4)(),
          eventType: `${this.#config.tenantIdentifier}_SOURCE_${this.#sambaSourceConfig.sambaIdentifier}`,
          created: Date.now(),
          ttl: 36e5,
          // 1 month
          tenantIdentifier: this.#config.tenantIdentifier,
          payload
        }
      ];
      const topic = (0, import_helper.generateKafkaTopic)(this.#config, this.#sambaSourceConfig);
      await this.#kafkaService.send(parsedRecords, topic);
      return true;
    } catch (e) {
      import_logger.Logger.getInstance().error(JSON.stringify(e));
      return false;
    }
  }
  #deleteLocalFile(location) {
    let success = false;
    fs.unlink(location, (err) => {
      success = err === null;
    });
    return success;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  SambaFilesourceProcessorService
});
