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
var my_sql_query_runner_exports = {};
__export(my_sql_query_runner_exports, {
  MySqlQueryRunner: () => MySqlQueryRunner
});
module.exports = __toCommonJS(my_sql_query_runner_exports);
var import_query_result = require("../query-result");
var import_QueryFailedError = require("../error/QueryFailedError");
class MySqlQueryRunner {
  constructor(driver) {
    this.driver = driver;
    this.connection = driver.connection;
    this.isReleased = false;
    this.isTransactionActive = false;
  }
  connect() {
    if (this.databaseConnection)
      return Promise.resolve(this.databaseConnection);
    if (this.databaseConnectionPromise) return this.databaseConnectionPromise;
    this.databaseConnectionPromise = this.driver.obtainConnection().then((connection) => {
      this.databaseConnection = connection;
      return this.databaseConnection;
    });
    return this.databaseConnectionPromise;
  }
  async query(query, parameters) {
    const databaseConnection = await this.connect();
    const queryStartTime = +/* @__PURE__ */ new Date();
    try {
      const [raw] = await databaseConnection.query(query, parameters);
      const queryEndTime = +/* @__PURE__ */ new Date();
      const queryExecutionTime = queryEndTime - queryStartTime;
      const result = new import_query_result.QueryResult();
      result.raw = raw;
      result.executionTime = queryExecutionTime;
      try {
        result.records = Array.from(raw);
      } catch {
      }
      if (raw?.hasOwnProperty("affectedRows")) {
        result.affected = raw.affectedRows;
      } else {
        result.affected = raw.length;
      }
      return result;
    } catch (error) {
      throw new import_QueryFailedError.QueryFailedError(query, parameters, error);
    }
  }
  release() {
    this.isReleased = true;
    if (this.databaseConnection) this.databaseConnection.release();
    return Promise.resolve();
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MySqlQueryRunner
});
