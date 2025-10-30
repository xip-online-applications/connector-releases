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
var samba_filehandler_exports = {};
__export(samba_filehandler_exports, {
  SambaFile: () => SambaFile,
  SambaFilehandler: () => SambaFilehandler
});
module.exports = __toCommonJS(samba_filehandler_exports);
var fs = __toESM(require("node:fs"));
var import_node_path = __toESM(require("node:path"));
var import_samba_client = require("@xip-online-data/samba-client");
var import_uuid = require("uuid");
var import_types = require("../types");
const mapFileInfo = (fileInfo) => {
  return {
    name: fileInfo.name,
    size: fileInfo.size,
    modifyTime: fileInfo.modifyTime,
    type: fileInfo.type === "D" ? import_types.FileInfoEnum.DIRECTORY : import_types.FileInfoEnum.FILE
  };
};
class SambaFile {
  #file;
  #tempFile;
  constructor(file, tempFile) {
    this.#file = file;
    this.#tempFile = tempFile;
  }
  get() {
    return this.#file;
  }
  close() {
    let success = false;
    fs.unlink(this.#tempFile, (err) => {
      success = err === null;
    });
    return success;
  }
}
class SambaFilehandler {
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
    this.#sambaClient = new import_samba_client.SambaClient(this.#sambaConfig);
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
      type: "samba",
      processedAction: url.searchParams.get("processedAction") ?? "move",
      address: decodeURIComponent(url.hostname),
      port: url.port === "" ? SambaFilehandler.DEFAULT_PORT : url.port,
      directory: decodeURIComponent(directory),
      username: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      domain: domain ? decodeURIComponent(domain) : void 0,
      tmpDirectory: url.searchParams.get("tmpDirectory") ?? SambaFilehandler.DEFAULT_TMP_DIR,
      timeout: url.searchParams.get("timeout") ?? void 0,
      maskCmd: url.searchParams.get("maskCmd") !== null,
      maxProtocol: url.searchParams.get("maxProtocol") ?? void 0
    };
    return new SambaFilehandler(config);
  }
  get config() {
    return this.#sambaConfig;
  }
  async init() {
  }
  async list(dir) {
    const list = await this.#sambaClient.list(dir);
    const directories = list.filter(
      (r) => !(r.type === "D" && (r.name === "." || r.name === ".."))
    );
    return directories.map(mapFileInfo);
  }
  async readFile(remoteFile) {
    const tempFilename = `${(0, import_uuid.v4)()}.tmp`;
    const localFile = `${this.#sambaConfig.tmpDirectory}/${tempFilename}`;
    await this.#sambaClient.getFile(remoteFile, localFile);
    const buffer = fs.readFileSync(localFile);
    return new SambaFile(buffer, localFile);
  }
  async writeFile(data, remotePath, filename) {
    console.log(
      `Writing file ${filename} to ${remotePath}, checking if directory exists`
    );
    let directoryExists = false;
    try {
      const exist = await this.#sambaClient.fileExists(remotePath);
      directoryExists = exist;
    } catch (e) {
      console.error(e);
    }
    if (!directoryExists) {
      await this.#sambaClient.mkdir(remotePath);
    }
    const buffer = data.get();
    const tempFilename = `${(0, import_uuid.v4)()}.tmp`;
    const localFile = `${this.#sambaConfig.tmpDirectory}/${tempFilename}`;
    fs.writeFileSync(localFile, new Uint8Array(buffer));
    let success = false;
    try {
      const path2 = remotePath === "" ? filename : `${remotePath}/${filename}`;
      await this.#sambaClient.sendFile(localFile, path2);
      success = true;
    } catch (e) {
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
  fileExists(location) {
    return this.#sambaClient.fileExists(location);
  }
  pathAsDsn(filepath) {
    const fullPath = import_node_path.default.join(
      encodeURIComponent(this.#sambaConfig.domain ?? ""),
      this.#sambaConfig.directory ?? "",
      filepath
    );
    return `smb://${encodeURIComponent(this.#sambaConfig.address)}:${this.#sambaConfig.port}/${fullPath}`;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  SambaFile,
  SambaFilehandler
});
