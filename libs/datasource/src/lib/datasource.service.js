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
var datasource_service_exports = {};
__export(datasource_service_exports, {
  DatasourceService: () => DatasourceService
});
module.exports = __toCommonJS(datasource_service_exports);
var import_driver2 = require("./driver/driver.factory");
class DatasourceService {
  constructor(options) {
    this.isInitialized = false;
    this.options = options;
    this.name = options.name || "default";
    this.driver = import_driver2.DriverFactory.create(this);
  }
  get version() {
    return `${this.options.type} : ${this.driver.version}`;
  }
  async initialize() {
    if (this.isInitialized)
      throw new Error(this.name);
    await this.driver.connect();
    await this.driver.afterConnect();
    this.isInitialized = true;
    return this;
  }
  /**
   * Executes raw SQL query and returns raw database results.
   */
  async query(query, testRun = false, parameters) {
    const usedQueryRunner = this.createQueryRunner();
    let result = null;
    try {
      if (testRun)
        await usedQueryRunner.query("BEGIN");
      result = await usedQueryRunner.query(query, parameters).catch(async (error) => {
        await usedQueryRunner.release();
        throw error;
      });
    } catch (error) {
      if (error instanceof Error) {
        return {
          error: error.message
        };
      }
      return {
        error: "Unknown error occurred while executing query"
      };
    } finally {
      if (testRun)
        await usedQueryRunner.query("ROLLBACK");
      await usedQueryRunner.release();
    }
    return result;
  }
  createQueryRunner() {
    return this.driver.createQueryRunner();
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DatasourceService
});
