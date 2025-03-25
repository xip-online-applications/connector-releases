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
var filesystem_cache_service_exports = {};
__export(filesystem_cache_service_exports, {
  FileSystemCacheService: () => FileSystemCacheService
});
module.exports = __toCommonJS(filesystem_cache_service_exports);
var import_fs = require("fs");
var import_logger = require("@transai/logger");
class FileSystemCacheService {
  #options;
  #logger;
  #initRun = false;
  constructor(options) {
    this.#options = options;
    this.#logger = import_logger.Logger.getInstance();
    this.#logger.info("Loaded filesystem-cache");
  }
  async get(key) {
    await this.#init();
    const value = await import_fs.promises.readFile(`${this.#options.path}/${this.#getKey(key)}`, "utf8").catch((e) => {
      this.#logger.error(e);
      return void 0;
    });
    return value ? JSON.parse(value) : void 0;
  }
  async set(key, value) {
    await this.#init();
    await import_fs.promises.writeFile(
      `${this.#options.path}/${this.#getKey(key)}`,
      JSON.stringify(value)
    ).catch((e) => {
      this.#logger.error(e);
      return void 0;
    });
  }
  // eslint-disable-next-line class-methods-use-this
  async clear() {
    return Promise.resolve();
  }
  async #init() {
    this.#logger.debug("try to init FileSystemCacheService");
    if (this.#initRun) {
      return;
    }
    let locExist = true;
    await import_fs.promises.stat(this.#options.path).catch((error) => {
      if (error.code === "ENOENT") {
        locExist = false;
        this.#logger.debug("Directory does not exist");
      } else {
        this.#logger.debug("Error occured");
        throw error;
      }
    });
    if (!locExist) {
      import_logger.Logger.getInstance().debug(`OffsetStore create ${this.#options.path}`);
      await import_fs.promises.mkdir(this.#options.path);
    }
    this.#logger.debug("Init run successfully. directory exists");
    this.#initRun = true;
  }
  #getKey(key) {
    return `${this.#options.keyPrefix ? `${this.#options.keyPrefix}_` : ""}${key}.json`;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  FileSystemCacheService
});
