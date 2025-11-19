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
var disk_handler_exports = {};
__export(disk_handler_exports, {
  DiskFileHandler: () => DiskFileHandler
});
module.exports = __toCommonJS(disk_handler_exports);
var fs = __toESM(require("node:fs"));
var import_node_path = __toESM(require("node:path"));
var import_active_referenced_file = require("../active-referenced-file.handle");
var import_types = require("../types");
class DiskFileHandler {
  #config;
  constructor(config) {
    this.#config = config;
  }
  static fromDsn(dsn) {
    if (!dsn.startsWith("file:")) {
      return null;
    }
    const url = new URL(dsn);
    return new DiskFileHandler({
      path: url.pathname
    });
  }
  get config() {
    return this.#config;
  }
  async list(dir) {
    const fullPath = this.#getFullPath(dir);
    return new Promise((resolve, reject) => {
      fs.readdir(fullPath, (err, files) => {
        if (err) {
          return reject(err);
        }
        const fileInfos = files.map((file) => {
          const fileInfo = fs.statSync(`${fullPath}/${file}`);
          return {
            type: fileInfo.isFile() ? import_types.FileInfoEnum.FILE : import_types.FileInfoEnum.DIRECTORY,
            name: file,
            size: fileInfo.size,
            modifyTime: fileInfo.mtime
          };
        });
        return resolve(fileInfos);
      });
    });
  }
  async readFile(filepath) {
    const fullPath = this.#getFullPath(filepath);
    fs.statSync(fullPath);
    return new import_active_referenced_file.ActiveReferencedFileHandle(fullPath);
  }
  async writeFile(filepath, data) {
    const fullPath = this.#getFullPath(filepath);
    return new Promise((resolve, reject) => {
      fs.mkdirSync(import_node_path.default.dirname(fullPath), { recursive: true });
      fs.writeFile(fullPath, data.get(), (err) => {
        if (err) {
          return reject(err);
        }
        return resolve(true);
      });
    });
  }
  async deleteFile(filepath) {
    const fullPath = this.#getFullPath(filepath);
    return new Promise((resolve, reject) => {
      fs.rm(fullPath, (err) => {
        if (err) {
          return reject(err);
        }
        return resolve(true);
      });
    });
  }
  async fileExists(location) {
    const fullPath = this.#getFullPath(location);
    return new Promise((resolve) => {
      fs.stat(fullPath, (err) => {
        if (err) {
          return resolve(false);
        }
        return resolve(true);
      });
    });
  }
  pathAsDsn(filepath) {
    return `file://${this.#getFullPath(filepath)}`;
  }
  #getFullPath(filepath) {
    const fullPath = import_node_path.default.normalize(
      import_node_path.default.join(this.#config.path ?? "", filepath)
    );
    if (fullPath.startsWith("/")) {
      return fullPath;
    }
    return `/${fullPath}`;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DiskFileHandler
});
