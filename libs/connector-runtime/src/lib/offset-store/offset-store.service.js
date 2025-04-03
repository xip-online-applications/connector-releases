var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from2, except, desc) => {
  if (from2 && typeof from2 === "object" || typeof from2 === "function") {
    for (let key of __getOwnPropNames(from2))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from2[key], enumerable: !(desc = __getOwnPropDesc(from2, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var offset_store_service_exports = {};
__export(offset_store_service_exports, {
  OffsetStoreService: () => OffsetStoreService
});
module.exports = __toCommonJS(offset_store_service_exports);
var import_fs = require("fs");
var import_logger = require("@transai/logger");
var import_rxjs = require("rxjs");
var import_types2 = require("./types");
class OffsetStoreService {
  #offsetDirectory;
  #offsetCache = /* @__PURE__ */ new Map();
  #cloudOffsetCache = /* @__PURE__ */ new Map();
  #log = import_logger.Logger.getInstance();
  get offsetValues() {
    return Array.from(this.#offsetCache.keys());
  }
  constructor(offsetDirectory) {
    this.#offsetDirectory = offsetDirectory;
  }
  async init() {
    let locExist = true;
    await import_fs.promises.stat(this.#offsetDirectory).catch((error) => {
      if (error.code === "ENOENT") {
        locExist = false;
      } else {
        throw error;
      }
    });
    if (!locExist) {
      this.#log.debug(`OffsetStore create ${this.#offsetDirectory}`);
      await import_fs.promises.mkdir(this.#offsetDirectory);
    }
    this.#startStoreInterval();
  }
  async deInit() {
    await this.#storeOffsetFileSystem();
  }
  async getOffset(identifier) {
    if (this.#offsetCache.has(identifier)) {
      return this.#offsetCache.get(identifier);
    }
    try {
      const offsetFile = await import_fs.promises.readFile(
        this.#getOffsetFilePath(identifier),
        "utf8"
      );
      const offsetStore = JSON.parse(offsetFile);
      const isValidOffset = (0, import_types2.isOffsetStoreType)(offsetStore);
      if (isValidOffset) {
        return offsetStore;
      }
      if (this.#cloudOffsetCache.has(identifier)) {
        return this.#cloudOffsetCache.get(identifier);
      }
      return { id: 0, timestamp: 0, rawTimestamp: 0 };
    } catch (error) {
      return { id: 0, timestamp: 0, rawTimestamp: 0 };
    }
  }
  setOffset(offset, identifier) {
    this.#offsetCache.set(identifier, offset);
    this.#log.debug(
      `storing offset for ${identifier} in cache, ${JSON.stringify(offset)}`
    );
  }
  writeFile(fileName, data) {
    return import_fs.promises.writeFile(
      this.#getOffsetFilePath(fileName),
      JSON.stringify(data)
    );
  }
  initCloudOffsets(offsets) {
    offsets.forEach((o) => {
      const { identifier, offset } = o;
      this.#log.debug(`Initializing offset for ${identifier}`);
      this.#cloudOffsetCache.set(identifier, offset);
      if (offset.userOverwrite) {
        this.#offsetCache.set(identifier, offset);
      }
    });
  }
  #startStoreInterval() {
    (0, import_rxjs.interval)(60 * 1e3).pipe(
      (0, import_rxjs.switchMap)(() => {
        return (0, import_rxjs.from)(this.#storeOffsetFileSystem());
      }),
      (0, import_rxjs.catchError)((error) => {
        this.#log.error(`Error storing offsets: ${JSON.stringify(error)}`);
        return (0, import_rxjs.of)(null);
      })
    ).subscribe((v) => {
      if (v !== null) {
        this.#log.debug("Offsets stored on disk completed.");
      }
    });
  }
  #storeOffsetFileSystem() {
    const keys = Array.from(this.#offsetCache.keys());
    this.#log.debug(
      `storing offset for ${keys.length} in filesystem, ${keys.join(", ")}`
    );
    return Promise.all(
      keys.map((key) => {
        const offset = this.#offsetCache.get(key);
        return import_fs.promises.writeFile(
          this.#getOffsetFilePath(key),
          JSON.stringify(offset)
        );
      })
    );
  }
  #getOffsetFilePath(identifier) {
    return `${this.#offsetDirectory}/${identifier}.json`;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  OffsetStoreService
});
