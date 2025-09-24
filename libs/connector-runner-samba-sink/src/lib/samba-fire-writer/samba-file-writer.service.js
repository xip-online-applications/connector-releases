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
var samba_file_writer_service_exports = {};
__export(samba_file_writer_service_exports, {
  SambaFileWriterService: () => SambaFileWriterService
});
module.exports = __toCommonJS(samba_file_writer_service_exports);
var import_samba_client = require("@xip-online-data/samba-client");
var fs = __toESM(require("fs"));
var import_logger = require("@transai/logger");
class SambaFileWriterService {
  constructor(sambaConfig) {
    this.sambaConfig = sambaConfig;
    this.sambaClient = new import_samba_client.SambaClient(sambaConfig);
  }
  async write(message, path, content) {
    const tmpFileLoc = `${this.sambaConfig.tmpDirectory}/${message.eventId}.tmp`;
    let success = await this.writeToFileSystem(tmpFileLoc, content);
    if (!success) {
      return {
        success: false,
        message: "Error while writing file to local temporary location"
      };
    }
    try {
      import_logger.Logger.getInstance().debug(
        `Handle message ${message.eventId}, writing file ${content} to samba server`
      );
      await this.sambaClient.sendFile(tmpFileLoc, path);
    } catch (error) {
      import_logger.Logger.getInstance().error(
        `${message.eventId} Error while sending file to samba server`,
        error
      );
      let errorMessage = "unknown error";
      const keys = Object.keys(error);
      if (keys.includes("stdout")) {
        errorMessage = error.stdout || "unknown error";
      }
      return {
        success: false,
        message: `Error while sending file to samba server: ${errorMessage}`
      };
    } finally {
      success = await this.removeTempFileFromFileSystem(tmpFileLoc);
    }
    if (!success) {
      return {
        success: false,
        message: "Error while removing file from local temporary location"
      };
    }
    return {
      success: true,
      message: "Message processed successfully"
    };
  }
  writeToFileSystem(tmpFileLoc, content) {
    return new Promise((resolve) => {
      fs.writeFile(tmpFileLoc, content, (err) => {
        resolve(err == void 0);
      });
    });
  }
  removeTempFileFromFileSystem(tmpFileLoc) {
    return new Promise((resolve) => {
      fs.unlink(tmpFileLoc, (err) => {
        resolve(err == void 0);
      });
    });
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  SambaFileWriterService
});
//# sourceMappingURL=samba-file-writer.service.js.map
