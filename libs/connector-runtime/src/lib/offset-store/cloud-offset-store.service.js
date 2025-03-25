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
var __copyProps = (to, from2, except, desc) => {
  if (from2 && typeof from2 === "object" || typeof from2 === "function") {
    for (let key of __getOwnPropNames(from2))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from2[key], enumerable: !(desc = __getOwnPropDesc(from2, key)) || desc.enumerable });
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
var cloud_offset_store_service_exports = {};
__export(cloud_offset_store_service_exports, {
  CloudOffsetStoreService: () => CloudOffsetStoreService
});
module.exports = __toCommonJS(cloud_offset_store_service_exports);
var import_management_api_client = require("@transai/management-api-client");
var import_rxjs = require("rxjs");
var process = __toESM(require("node:process"));
var import_logger = require("@transai/logger");
var import_offset_store = require("./offset-store.service");
class CloudOffsetStoreService {
  #managementApiClient = new import_management_api_client.ConnectorApiClient();
  #log = import_logger.Logger.getInstance();
  #connectorIdentifier;
  #offsetStore;
  #initialized = false;
  constructor(offsetDirectory, connectorIdentifier) {
    this.#offsetStore = new import_offset_store.OffsetStoreService(offsetDirectory);
    this.#connectorIdentifier = connectorIdentifier;
  }
  async init() {
    await this.#offsetStore.init();
    await this.#initializeOffsets();
    this.#startSyncInterval();
  }
  async deInit() {
    await this.#offsetStore.deInit();
    this.#syncOffsets().then(() => {
      this.#log.info("Successfully synced offsets.");
    }).catch((error) => {
      this.#log.error("Error syncing offsets.", error);
    });
  }
  getOffset(identifier) {
    return this.#offsetStore.getOffset(identifier);
  }
  writeFile(fileName, data) {
    return this.#offsetStore.writeFile(fileName, data);
  }
  setOffset(offset, identifier) {
    this.#offsetStore.setOffset(offset, identifier);
  }
  async #initializeOffsets() {
    this.#log.info(`Initializing offset for ${this.#connectorIdentifier}`);
    await this.#initOffsetsFromCloud();
    if (!this.#initialized) {
      await new Promise((resolve) => {
        setTimeout(resolve, 5e3);
      });
      return this.#initializeOffsets();
    }
    this.#log.info(
      `Initializing offset successfully for ${this.#connectorIdentifier}`
    );
    return Promise.resolve();
  }
  #startSyncInterval() {
    (0, import_rxjs.interval)(
      Number(process.env["MANAGEMENT_API_OFFSET_SYNC_INTERVAL"] ?? 60 * 1e3)
    ).pipe(
      (0, import_rxjs.mergeMap)(() => (0, import_rxjs.from)(this.#syncAllOffsets())),
      (0, import_rxjs.catchError)((error) => {
        this.#log.error("Error syncing offsets:", error);
        return (0, import_rxjs.of)(null);
      })
    ).subscribe((v) => {
      if (v !== null)
        this.#log.info("Offsets sync completed.");
    });
  }
  async #syncAllOffsets() {
    await this.#updateUserOverruledOffsets();
    await this.#syncOffsets();
  }
  async #syncOffsets() {
    try {
      const offsetsValues = this.#offsetStore.offsetValues;
      if (offsetsValues.length === 0) {
        this.#log.debug("No offsets to sync.");
        return;
      }
      const offsets = await Promise.all(
        offsetsValues.map(async (o) => ({
          identifier: o,
          offset: await this.#offsetStore.getOffset(o)
        }))
      );
      await this.#managementApiClient.writeAllOffsets(
        this.#connectorIdentifier,
        offsets
      );
      this.#log.debug(
        `Successfully synced ${offsets.length} offsets for ${this.#connectorIdentifier}.`
      );
    } catch (error) {
      this.#log.error("Error syncing offsets.", error);
    }
  }
  async #updateUserOverruledOffsets() {
    try {
      const offsets = await this.#managementApiClient.getAllOffset(this.#connectorIdentifier).catch((error) => {
        this.#log.error("Error loading offsets:", error);
        return [];
      });
      const userOverridesOffsets = offsets.filter(
        (offset) => offset.userOverwrite
      );
      if (userOverridesOffsets.length === 0) {
        this.#log.debug("No user overriding offsets to sync.");
        return;
      }
      this.#log.info(
        `Successfully synced ${userOverridesOffsets.length} user overriding offsets.`
      );
      this.#log.debug(
        `Overridden offsets: ${userOverridesOffsets.map((o) => o.identifier).join(", ")}`
      );
      userOverridesOffsets.forEach((offset) => {
        this.#offsetStore.setOffset(offset.offset, offset.identifier);
      });
    } catch (error) {
      this.#log.error("Error caching offsets:", error);
    }
  }
  async #initOffsetsFromCloud() {
    try {
      this.#managementApiClient.getAllOffset(this.#connectorIdentifier).then((offsets) => {
        this.#log.info(`Successfully synced ${offsets.length} offsets.`);
        this.#log.debug(
          `Overridden offsets: ${offsets.map((o) => o.identifier).join(", ")}`
        );
        this.#offsetStore.initCloudOffsets(offsets);
        this.#initialized = true;
      }).catch((error) => this.#log.error("Error loading offsets:", error));
    } catch (error) {
      this.#log.error("Error caching offsets:", error);
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CloudOffsetStoreService
});
