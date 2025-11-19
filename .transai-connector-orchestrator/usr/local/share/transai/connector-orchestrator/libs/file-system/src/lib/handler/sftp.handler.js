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
var sftp_handler_exports = {};
__export(sftp_handler_exports, {
  SftpFileHandler: () => SftpFileHandler
});
module.exports = __toCommonJS(sftp_handler_exports);
var fs = __toESM(require("node:fs"));
var import_node_os = __toESM(require("node:os"));
var import_node_path = __toESM(require("node:path"));
var import_logger = require("@transai/logger");
var import_uuid = require("uuid");
var import_active_referenced_file = require("../active-referenced-file.handle");
var import_types = require("../types");
const sftp = require("ssh2-sftp-client");
const mapFileInfo = (fileInfo) => {
  return {
    name: fileInfo.name,
    size: fileInfo.size,
    modifyTime: new Date(fileInfo.modifyTime),
    type: fileInfo.type === "-" ? import_types.FileInfoEnum.FILE : import_types.FileInfoEnum.DIRECTORY
  };
};
class SftpFileHandler {
  static {
    this.DEFAULT_PORT = 22;
  }
  #config;
  constructor(config) {
    this.#config = config;
    this.#config.privateKey = this.#config.privateKey?.replace(/\\n/g, "\n");
    this.sftpClient = new sftp(this.#config.host);
  }
  static fromDsn(dsn) {
    if (!dsn.startsWith("sftp:")) {
      return null;
    }
    const url = new URL(dsn);
    const keepaliveInterval = url.searchParams.get("keepaliveInterval");
    const config = {
      host: decodeURIComponent(url.hostname),
      port: url.port ? Number.parseInt(url.port, 10) : SftpFileHandler.DEFAULT_PORT,
      username: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      directory: url.pathname,
      privateKey: url.searchParams.get("privateKey") ?? void 0,
      keepaliveInterval: keepaliveInterval ? Number.parseInt(keepaliveInterval, 10) : void 0
    };
    return new SftpFileHandler(config);
  }
  get config() {
    return this.#config;
  }
  async init() {
    await this.sftpClient.connect(this.#config);
  }
  async list(dir) {
    await this.init();
    const listings = await this.sftpClient.list(this.#getFullPath(dir));
    return listings.filter((entity) => entity.type !== "l").map(mapFileInfo);
  }
  async readFile(filepath) {
    await this.init();
    const content = await this.sftpClient.get(this.#getFullPath(filepath));
    const activeFileHandle = new import_active_referenced_file.ActiveReferencedFileHandle(
      `${import_node_os.default.tmpdir()}/${(0, import_uuid.v4)()}.tmp`
    );
    if (typeof content === "string") {
      fs.writeFileSync(activeFileHandle.filePath, content);
      return activeFileHandle;
    }
    if (Buffer.isBuffer(content)) {
      fs.writeFileSync(
        activeFileHandle.filePath,
        Buffer.from(content).toString("utf-8")
      );
      return activeFileHandle;
    }
    throw new Error(
      `Unexpected content type received from SFTP: ${typeof content}`
    );
  }
  async writeFile(filepath, data) {
    await this.init();
    const fullPath = this.#getFullPath(filepath);
    if (!await this.sftpClient.exists(import_node_path.default.dirname(fullPath))) {
      await this.sftpClient.mkdir(import_node_path.default.dirname(fullPath), true);
    }
    await this.sftpClient.put(data.get(), fullPath, {
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
    await this.init();
    try {
      await this.sftpClient.delete(this.#getFullPath(filepath));
      return true;
    } catch (error) {
      if (error instanceof Error) {
        import_logger.Logger.getInstance().error(`Error removing file: ${error.message}`);
      }
      return false;
    }
  }
  async fileExists(filepath) {
    await this.init();
    const file = await this.sftpClient.exists(this.#getFullPath(filepath));
    return file !== false;
  }
  pathAsDsn(filepath) {
    return `sftp://${encodeURIComponent(this.#config.host)}:${this.#config.port}${this.#getFullPath(filepath)}`;
  }
  #getFullPath(filepath) {
    const fullPath = import_node_path.default.normalize(
      import_node_path.default.join(this.#config.directory ?? "", filepath)
    );
    if (fullPath.startsWith("/")) {
      return fullPath;
    }
    return `/${fullPath}`;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  SftpFileHandler
});
