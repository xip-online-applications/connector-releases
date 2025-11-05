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
var samba_handler_exports = {};
__export(samba_handler_exports, {
  SambaFile: () => SambaFile,
  SambaFileHandler: () => SambaFileHandler
});
module.exports = __toCommonJS(samba_handler_exports);
var fs = __toESM(require("node:fs"));
var import_node_path = __toESM(require("node:path"));
var import_logger = require("@transai/logger");
var import_samba_client = require("@xip-online-data/samba-client");
var import_uuid = require("uuid");
var import_active_file = require("../active-file.handle");
var import_types = require("../types");
const mapFileInfo = (fileInfo) => {
  return {
    name: fileInfo.name,
    size: fileInfo.size,
    modifyTime: fileInfo.modifyTime,
    type: fileInfo.type === "D" ? import_types.FileInfoEnum.DIRECTORY : import_types.FileInfoEnum.FILE
  };
};
class SambaFile extends import_active_file.ActiveFileHandle {
  #tempFile;
  constructor(file, tempFile) {
    super(file);
    this.#tempFile = tempFile;
  }
  close() {
    let success = false;
    fs.unlink(this.#tempFile, (err) => {
      success = err === null;
    });
    return success;
  }
}
class SambaFileHandler {
  static {
    this.DEFAULT_PORT = "445";
  }
  static {
    this.DEFAULT_TMP_DIR = "/tmp/transai/samba";
  }
  #sambaClient;
  #sambaConfig;
  constructor(sambaConfig) {
    this.#sambaConfig = sambaConfig;
    fs.mkdirSync(this.#sambaConfig.tmpDirectory, { recursive: true });
    this.#sambaClient = new import_samba_client.SambaClient(
      // @ts-expect-error this is correct!
      Object.fromEntries(
        Object.entries(this.#sambaConfig).filter(
          ([key]) => key !== "directory"
        )
      )
    );
  }
  static fromDsn(dsn) {
    if (!dsn.startsWith("smb:")) {
      return null;
    }
    const url = new URL(dsn);
    const pathnameWithoutPrefixSlash = url.pathname.replace(/^\//, "");
    const domain = pathnameWithoutPrefixSlash.split("/", 2)[0];
    const directory = pathnameWithoutPrefixSlash.substring(domain.length);
    const config = {
      address: decodeURIComponent(url.hostname),
      port: url.port === "" ? SambaFileHandler.DEFAULT_PORT : url.port,
      username: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      domain: domain ? decodeURIComponent(domain) : void 0,
      directory: decodeURIComponent(directory),
      tmpDirectory: url.searchParams.get("tmpDirectory") ?? SambaFileHandler.DEFAULT_TMP_DIR,
      timeout: url.searchParams.get("timeout") ?? void 0,
      maskCmd: url.searchParams.get("mask") !== null,
      maxProtocol: url.searchParams.get("protocol") ?? void 0
    };
    return new SambaFileHandler(config);
  }
  get config() {
    return this.#sambaConfig;
  }
  async list(dir) {
    const list = await this.#sambaClient.list(this.#fullPath(dir));
    const directories = list.filter(
      (r) => !(r.type === "D" && (r.name === "." || r.name === ".."))
    );
    return directories.map(mapFileInfo);
  }
  async readFile(remoteFile) {
    const tempFilename = `${(0, import_uuid.v4)()}.tmp`;
    const localFile = `${this.#sambaConfig.tmpDirectory}/${tempFilename}`;
    await this.#sambaClient.getFile(this.#fullPath(remoteFile), localFile);
    const buffer = fs.readFileSync(localFile);
    return new SambaFile(buffer, localFile);
  }
  async writeFile(remotePath, data) {
    let directoryExists = false;
    try {
      directoryExists = await this.fileExists(import_node_path.default.dirname(remotePath));
    } catch (error) {
      import_logger.Logger.getInstance().error("Error checking for existing file", { error });
    }
    if (directoryExists !== true) {
      await this.#mkdir(import_node_path.default.dirname(remotePath)).catch((error) => {
        import_logger.Logger.getInstance().error("Error creating directory on samba:", {
          error
        });
      });
    }
    const buffer = data.get();
    const tempFilename = `${(0, import_uuid.v4)()}.tmp`;
    const localFile = `${this.#sambaConfig.tmpDirectory}/${tempFilename}`;
    fs.writeFileSync(localFile, new Uint8Array(buffer));
    let success = false;
    try {
      await this.#sambaClient.sendFile(localFile, this.#fullPath(remotePath)).catch((error) => {
        import_logger.Logger.getInstance().error(
          `Error writing local file ${localFile} file to ${remotePath}:`,
          {
            error
          }
        );
      });
      success = true;
    } catch (e) {
      import_logger.Logger.getInstance().error("Error writing file to samba:");
      console.error(e);
    } finally {
      fs.unlinkSync(localFile);
    }
    return success;
  }
  async deleteFile(remoteFile) {
    try {
      await this.#sambaClient.deleteFile(remoteFile);
    } catch (e) {
      console.log(e);
      return false;
    }
    return true;
  }
  async fileExists(remoteFile) {
    try {
      return await this.#sambaClient.fileExists(this.#fullPath(remoteFile));
    } catch {
      return false;
    }
  }
  pathAsDsn(filepath) {
    const fullPath = import_node_path.default.join(
      encodeURIComponent(this.#sambaConfig.domain ?? ""),
      this.#sambaConfig.directory ?? "",
      filepath
    );
    return `smb://${encodeURIComponent(this.#sambaConfig.address)}:${this.#sambaConfig.port}/${fullPath}`;
  }
  #fullPath(filepath) {
    return import_node_path.default.join(this.#sambaConfig.directory ?? "", filepath);
  }
  async #mkdir(dirpath) {
    const splittedPath = dirpath.split("/");
    for (let i = 1; i <= splittedPath.length; i++) {
      const segment = splittedPath.slice(0, i).join("/");
      await this.#sambaClient.mkdir(this.#fullPath(segment)).catch(() => {
      });
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  SambaFile,
  SambaFileHandler
});
