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
var datasource_extractor_service_exports = {};
__export(datasource_extractor_service_exports, {
  DatasourceExtractorService: () => DatasourceExtractorService
});
module.exports = __toCommonJS(datasource_extractor_service_exports);
var import_datasource = require("@xip-online-data/datasource");
var import_handlebars = __toESM(require("handlebars"));
var import_rxjs = require("rxjs");
var import_handle_error = require("@xip-online-data/handle-error");
var import_logger = require("@transai/logger");
class DatasourceExtractorService {
  #datasourceInstance;
  get #datasource() {
    if (!this.#datasourceInstance) {
      throw new Error("Datasource service is not initialized");
    }
    return this.#datasourceInstance;
  }
  #initialized = false;
  #processing = false;
  #handlebarsTemplate;
  #config;
  #queryConfig;
  #offsetStore;
  #queryResultHandler;
  #ipcBus;
  constructor(config, queryConfig, offsetStore, queryResultHandler, ipcBus) {
    this.#config = config;
    this.#queryConfig = queryConfig;
    this.#offsetStore = offsetStore;
    this.#queryResultHandler = queryResultHandler;
    this.#ipcBus = ipcBus;
    import_logger.Logger.getInstance().debug(
      `Creating data sink service: ${queryConfig.queryIdentifier}`
    );
    this.#handlebarsTemplate = import_handlebars.default.compile(queryConfig.query, {
      strict: true
    });
    this.#validateTemplate();
    import_logger.Logger.getInstance().debug(
      `Sink Service build. Go init now: ${queryConfig.queryIdentifier}`
    );
  }
  async init() {
    import_logger.Logger.getInstance().debug(
      `Initializing data sink service: ${this.#queryConfig.queryIdentifier}`
    );
    this.#datasourceInstance = new import_datasource.DatasourceService(this.#config.database);
    import_logger.Logger.getInstance().debug(
      `Connected!: ${this.#queryConfig.queryIdentifier}`
    );
    await this.#datasourceInstance.initialize().catch((error) => {
      import_logger.Logger.getInstance().error(
        `Error while initializing data sink service, ${JSON.stringify(error)}`
      );
      throw new Error(
        `Error while initializing data sink service, ${JSON.stringify(error)}`
      );
    });
    if (this.#queryConfig.runAfterEvents !== void 0 && this.#queryConfig.runAfterEvents.length !== 0) {
      import_logger.Logger.getInstance().debug(
        "Run after DBusMessage: ",
        this.#queryConfig.runAfterEvents
      );
      this.#ipcBus.subscribe((values) => {
        if (this.#config.debug)
          import_logger.Logger.getInstance().debug(
            "[SQL source] received values: ",
            values,
            this.#queryConfig.queryName,
            this.#queryConfig.runAfterEvents
          );
        if (values.some((v) => this.#queryConfig.runAfterEvents.includes(v))) {
          import_logger.Logger.getInstance().debug(
            `${this.#queryConfig.queryIdentifier} Execute based on finished events: Finished Events ${values}, Run after ${this.#queryConfig.runAfterEvents}`
          );
          this.extract();
        }
      });
    }
    import_logger.Logger.getInstance().debug(
      `Data sink service initialized: ${this.#queryConfig.queryIdentifier}`
    );
    this.#initialized = true;
    this.setInterval();
  }
  setInterval() {
    (0, import_rxjs.timer)(0, this.#queryConfig.interval * 1e3).subscribe(async () => {
      await this.extract();
    });
  }
  async extract() {
    if (!this.#initialized) {
      return;
    }
    if (this.#processing) {
      import_logger.Logger.getInstance().debug(
        `Data sink service is already processing: ${this.#queryConfig.queryIdentifier}`
      );
      return;
    }
    import_logger.Logger.getInstance().debug(
      `Start query: ${this.#queryConfig.queryIdentifier}`
    );
    this.#processing = true;
    try {
      await this.#executeQuery().catch((error) => {
        import_logger.Logger.getInstance().error(
          `Error while extracting data from data sink service ${error.message}`
        );
        throw new Error(
          `Error while extracting data from data sink service ${error.message}`
        );
      });
    } catch (error) {
      if (error instanceof Error) {
        import_logger.Logger.getInstance().error(
          `Error while extracting data from data sink service ${error.message}`
        );
      }
      (0, import_handle_error.handleError)("Error while querying datasource", error);
    } finally {
      this.#processing = false;
    }
  }
  async #executeQuery(runCount = 0) {
    const latestOffset = await this.#offsetStore.getOffset(
      this.#queryConfig.queryIdentifier
    );
    const query = this.#getQuery(latestOffset, this.#queryConfig.batchSize);
    const result = await this.#datasource.query(query).catch((error) => {
      import_logger.Logger.getInstance().error(
        `Error while querying datasource ${this.#queryConfig.queryIdentifier} ${query} ${JSON.stringify(error)}`
      );
      return null;
    });
    if (result === null) {
      import_logger.Logger.getInstance().debug(
        `Error while querying datasource ${this.#queryConfig.queryIdentifier}`
      );
      return;
    }
    const success = await this.#queryResultHandler.handleResult(
      result,
      this.#queryConfig,
      latestOffset
    );
    if (result.affected === this.#queryConfig.batchSize && success && runCount < 10) {
      const newRunCount = runCount + 1;
      await this.#executeQuery(newRunCount);
    }
    if (runCount >= 10) {
      import_logger.Logger.getInstance().warn(
        `${this.#queryConfig.queryIdentifier} Limiting query since it exceeded 10 runs`
      );
    }
  }
  #validateTemplate() {
    this.#getQuery({ timestamp: 0, id: 0, rawTimestamp: 0 }, 0);
  }
  #getQuery(offset, limit) {
    const payload = {
      ...offset,
      limit
    };
    return this.#handlebarsTemplate(payload);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DatasourceExtractorService
});
