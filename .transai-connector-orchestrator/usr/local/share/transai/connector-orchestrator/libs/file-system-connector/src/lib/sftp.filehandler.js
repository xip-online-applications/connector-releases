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
var sftp_filehandler_exports = {};
__export(sftp_filehandler_exports, {
  SftpFilehandler: () => SftpFilehandler
});
module.exports = __toCommonJS(sftp_filehandler_exports);
var import_logger = require("@transai/logger");
var import_types = require("./types");
var import_generic_active_file = require("./generic-active-file.active-file-handler");
const sftp = require("ssh2-sftp-client");
const mapFileInfo = (fileInfo) => {
  return {
    name: fileInfo.name,
    size: fileInfo.size,
    modifyTime: new Date(fileInfo.modifyTime),
    type: fileInfo.type === "-" ? import_types.FileInfoEnum.FILE : import_types.FileInfoEnum.DIRECTORY
  };
};
class SftpFilehandler {
  constructor(config) {
    this.config = config;
    import_logger.Logger.getInstance().info("SFTP File handler setup!");
    config.privateKey = config.privateKey?.replace(/\\n/g, "\n");
    this.sftpClient = new sftp(config.sftpIdentifier);
  }
  async init() {
    import_logger.Logger.getInstance().info("Initializing sftp: ", this.config.host);
    await this.sftpClient.connect(this.config);
    import_logger.Logger.getInstance().info("SFTP client initialized");
  }
  async list(dir) {
    const listings = await this.sftpClient.list(dir);
    return listings.filter((entity) => entity.type !== "l").map(mapFileInfo);
  }
  async readFile(filepath) {
    const content = await this.sftpClient.get(filepath);
    if (typeof content === "string") {
      return new import_generic_active_file.GenericActiveFileActiveFileHandler(
        Buffer.from(content, "utf-8")
      );
    }
    if (Buffer.isBuffer(content)) {
      return new import_generic_active_file.GenericActiveFileActiveFileHandler(content);
    }
    throw new Error(
      `Unexpected content type received from SFTP: ${typeof content}`
    );
  }
  async writeFile(data, remotePath, filename) {
    await this.sftpClient.put(data.get(), `${remotePath}/${filename}`, {
      writeStreamOptions: {
        flags: "w",
        // w - write and a - append
        mode: 438
        // mode to use for created file (rwx)
      }
    });
    return true;
  }
  async deleteFile(filepath) {
    try {
      await this.sftpClient.delete(filepath);
      return true;
    } catch (error) {
      if (error instanceof Error) {
        import_logger.Logger.getInstance().error(`Error removing file: ${error.message}`);
      }
      return false;
    }
  }
  async fileExists(filepath) {
    import_logger.Logger.getInstance().info(`Checking if file exists: ${filepath}`);
    const file = await this.sftpClient.exists(filepath);
    return file !== false;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  SftpFilehandler
});
