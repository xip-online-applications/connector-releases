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
var connector_runner_file_copy_exports = {};
__export(connector_runner_file_copy_exports, {
  ConnectorRunnerFileCopy: () => ConnectorRunnerFileCopy
});
module.exports = __toCommonJS(connector_runner_file_copy_exports);
var import_connector_runtime = require("@transai/connector-runtime");
var import_kafka_base_service = require("@xip-online-data/kafka-base-service");
var import_file_system_connector = require("@xip-online-data/file-system-connector");
var import_logger = require("@transai/logger");
var import_file_handler = require("./file-handler.factory");
class ConnectorRunnerFileCopy extends import_connector_runtime.ConnectorRuntime {
  constructor() {
    super(...arguments);
    this.CONNECTOR_INSTANCE = "XOD_CONNECTOR_FILE_LOCAL_COPY_CONFIG";
    this.transferFunction = async (file, requestedPath, sourcePath) => {
      if (file.type !== import_file_system_connector.FileInfoEnum.FILE) {
        import_logger.Logger.getInstance().debug(`${file.name} is not a file. Skipping`);
        return false;
      }
      const filePath = sourcePath !== "" ? `${sourcePath}/${file.name}` : file.name;
      const fileData = await this.source.readFile(filePath);
      let success = false;
      try {
        const desiredDestination = (this.config.destination.remoteDirectory ?? "") === "" ? requestedPath : `${this.config.destination.remoteDirectory}/${requestedPath}`;
        import_logger.Logger.getInstance().debug(
          `Transferring ${file.name} from ${filePath} to ${desiredDestination}`
        );
        success = await this.destination.writeFile(
          fileData,
          desiredDestination,
          file.name
        );
        if (!success) {
          import_logger.Logger.getInstance().error(
            `Error while transferring ${file.name} from ${filePath} to ${desiredDestination}`
          );
        }
        if (this.config.source.processedAction === "move" && success) {
          const processedFilename = (this.config.source.processedPrefix ?? "") === "" ? file.name : `${this.config.source.processedPrefix}_${file.name}`;
          success = await this.source.writeFile(
            fileData,
            this.config.source.processedDirectory,
            processedFilename
          );
        }
        if (success) {
          success = await this.source.deleteFile(filePath);
        }
      } catch (error) {
        if (error instanceof Error) {
          import_logger.Logger.getInstance().error(
            `Error while transferring ${file.name} from ${filePath} to ${requestedPath}: ${error.message}`
          );
        } else {
          import_logger.Logger.getInstance().error(
            `Unknown error while transferring ${file.name} from ${filePath} to ${requestedPath}`
          );
        }
      } finally {
        fileData.close();
      }
      return success;
    };
    this.copyFunction = async (fileRegex, sourcePath, destinationPath, testRun = false) => {
      import_logger.Logger.getInstance().debug(
        `Checking for files in ${sourcePath} with regex ${fileRegex}`
      );
      const list = await this.source.list(sourcePath);
      const directories = list.filter((entity) => entity.type === import_file_system_connector.FileInfoEnum.DIRECTORY).filter((directory) => {
        if ((this.config.source.processedDirectory ?? "") === "") {
          return true;
        }
        const fullPath = sourcePath === "" ? directory.name : `${sourcePath}/${directory.name}`;
        const processedDirectory = (this.config.source.remoteDirectory ?? "") === "" ? this.config.source.processedDirectory : `${this.config.source.remoteDirectory}/${this.config.source.processedDirectory}`;
        return fullPath !== processedDirectory;
      });
      const allFiles = list.filter((entity) => entity.type === import_file_system_connector.FileInfoEnum.FILE);
      const regex = new RegExp(fileRegex, "gi");
      const files = allFiles.filter((file) => {
        const fullPath = sourcePath === "" ? file.name : `${sourcePath}/${file.name}`;
        return fullPath.match(regex) !== null;
      });
      if (files.length !== 0) {
        import_logger.Logger.getInstance().debug(
          `Found ${files.length} to transfer in ${sourcePath}`
        );
        import_logger.Logger.getInstance().debug(files.map((file) => file.name).join(", "));
      }
      for (const file of files) {
        if (!testRun) {
          await this.transferFunction(file, destinationPath, sourcePath);
        } else {
          import_logger.Logger.getInstance().info(
            `Test run: Would have transferred ${file.name} from ${sourcePath} to ${destinationPath}. NOTHING DONE DUE TO TESTRUN!`
          );
        }
      }
      for (const directory of directories) {
        const newDir = sourcePath === "" ? directory.name : `${sourcePath}/${directory.name}`;
        if (newDir !== this.config.destination.remoteDirectory) {
          return;
        }
        await this.copyFunction(
          fileRegex,
          `${sourcePath}/${directory.name}`,
          destinationPath,
          testRun
        );
      }
    };
    this.init = async () => {
      this.sourceInstance = (0, import_file_handler.fileHandlerFactory)(this.config.source);
      this.destinationInstance = (0, import_file_handler.fileHandlerFactory)(this.config.destination);
      await this.source.init();
      await this.destination.init();
      const jobCallbackFunction = (callbackFunction) => {
        return async (m) => {
          if (m.type !== "JOB") {
            return callbackFunction(m);
          }
          const message = m;
          let action;
          try {
            action = this.getActionConfig(message);
          } catch (error) {
            if (error instanceof Error) {
              return (0, import_kafka_base_service.BadRequest)(`No action found: ${error.message}`)(message);
            }
            return (0, import_kafka_base_service.BadRequest)("Unknown error occured")(message);
          }
          try {
            const handleBars = action.config["parsedTemplates"];
            const parsedLocalPath = handleBars.localPath({
              inputs: message.payload
            }).trim();
            const parsedRemotePath = handleBars.remotePath({
              inputs: message.payload
            }).trim();
            const parsedFileRegex = handleBars.fileRegex({
              inputs: message.payload
            }).trim();
            if (message.testRun) {
              import_logger.Logger.getInstance().info(
                `Test run for ${message.eventId} with parsedLocalPath ${parsedLocalPath}, parsedRemotePath ${parsedRemotePath}, parsedFileRegex ${parsedFileRegex}`
              );
            }
            await this.copyFunction(
              parsedFileRegex,
              parsedLocalPath,
              parsedRemotePath,
              message.testRun
            );
            return callbackFunction(m);
          } catch (error) {
            if (error instanceof Error) {
              return (0, import_kafka_base_service.InternalServerError)(error.message)(message);
            }
            return (0, import_kafka_base_service.InternalServerError)("Unknown Error")(message);
          }
        };
      };
      const actionCallbackFunction = (callbackFunction) => {
        return async (m) => {
          if (m.type !== "ACTION") {
            return callbackFunction(m);
          }
          const message = m;
          try {
            if (message.payload.content === void 0 || message.payload.destination === void 0) {
              return (0, import_kafka_base_service.UnprocessableEntity)("Content or destination not provided")(
                message
              );
            }
            await this.copyFunction(
              message.payload.content.trim(),
              this.config.source.remoteDirectory ?? "",
              message.payload.destination
            );
            return callbackFunction(message);
          } catch (error) {
            if (error instanceof Error) {
              return (0, import_kafka_base_service.InternalServerError)(error.message)(message);
            }
            return (0, import_kafka_base_service.InternalServerError)("Unknown Error")(message);
          }
        };
      };
      this.callbackFunction = jobCallbackFunction(
        actionCallbackFunction(this.emitEventType((0, import_kafka_base_service.Created)()))
      );
    };
  }
  get source() {
    if (!this.sourceInstance) {
      throw new Error("Source FileHandlerInterface not initialized");
    }
    return this.sourceInstance;
  }
  get destination() {
    if (!this.destinationInstance) {
      throw new Error("Destination FileHandlerInterface not initialized");
    }
    return this.destinationInstance;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ConnectorRunnerFileCopy
});
