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
var sftp_client_exports = {};
__export(sftp_client_exports, {
  SftpClient: () => SftpClient
});
module.exports = __toCommonJS(sftp_client_exports);
var import_logger = require("@transai/logger");
const sftp = require("ssh2-sftp-client");
class SftpClient {
  constructor(config, baseYamlConfig) {
    this.config = config;
    this.baseYamlConfig = baseYamlConfig;
    config.privateKey = config.privateKey?.replace(/\\n/g, "\n");
    this.sftpClient = new sftp(baseYamlConfig.processIdentifier);
  }
  async init() {
    import_logger.Logger.getInstance().info("Initializing sftp: ", this.config.host);
    await this.sftpClient.connect(this.config);
    import_logger.Logger.getInstance().info("SFTP client initialized");
  }
  writeFile(destination, content) {
    return this.sftpClient.put(Buffer.from(content, "utf-8"), destination, {
      writeStreamOptions: {
        flags: "w",
        // w - write and a - append
        mode: 438
        // mode to use for created file (rwx)
      }
    });
  }
  async readFile(destination) {
    const content = await this.sftpClient.get(destination);
    if (typeof content === "string") {
      return Buffer.from(content, "utf-8");
    }
    if (Buffer.isBuffer(content)) {
      return content;
    }
    throw new Error(
      `Unexpected content type received from SFTP: ${typeof content}`
    );
  }
  async moveFile(path, file, destination) {
    try {
      await this.sftpClient.mkdir(destination, true);
      await this.sftpClient.rename(path, `${destination}/${file.name}`);
      import_logger.Logger.getInstance().info(
        `File renamed/moved from: ${path} to: ${destination}/${file.name}`
      );
    } catch (error) {
      if (error instanceof Error) {
        import_logger.Logger.getInstance().error(
          `Error renaming/moving file: ${error.message}`
        );
      }
    }
  }
  async deleteFile(path) {
    try {
      await this.sftpClient.delete(path);
      import_logger.Logger.getInstance().info(`File removed from: ${path}`);
    } catch (error) {
      if (error instanceof Error) {
        import_logger.Logger.getInstance().error(`Error removing file: ${error.message}`);
      }
    }
  }
  async list(destination) {
    return this.sftpClient.list(destination);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  SftpClient
});
