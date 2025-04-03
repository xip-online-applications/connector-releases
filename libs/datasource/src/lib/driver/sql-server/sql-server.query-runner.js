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
var sql_server_query_runner_exports = {};
__export(sql_server_query_runner_exports, {
  SqlServerQueryRunner: () => SqlServerQueryRunner
});
module.exports = __toCommonJS(sql_server_query_runner_exports);
var import_query_result = require("../query-result");
var import_error = require("../error");
class SqlServerQueryRunner {
  constructor(driver) {
    this.driver = driver;
    this.connection = driver.connection;
    this.isReleased = false;
    this.isTransactionActive = false;
  }
  /**
   * Creates/uses database connection from the connection pool to perform further operations.
   * Returns obtained database connection.
   */
  // eslint-disable-next-line class-methods-use-this
  connect() {
    return Promise.resolve();
  }
  /**
   * Executes a given SQL query.
   */
  async query(query, parameters) {
    if (this.isReleased)
      throw new import_error.QueryRunnerAlreadyReleasedError();
    try {
      const pool = await this.driver.obtainMasterConnection();
      const request = new this.driver.mssql.Request(pool);
      if (parameters && parameters.length) {
        parameters.forEach((parameter, index) => {
          const parameterName = index.toString();
          request.input(parameterName, parameter);
        });
      }
      const queryStartTime = +/* @__PURE__ */ new Date();
      const raw = await new Promise((ok, fail) => {
        request.query(query, (err, raw2) => {
          const { maxQueryExecutionTime } = this.driver.options;
          const queryEndTime = +/* @__PURE__ */ new Date();
          const queryExecutionTime = queryEndTime - queryStartTime;
          if (err) {
            fail(new import_error.QueryFailedError(query, parameters, err));
          }
          ok(raw2);
        });
      });
      const result = new import_query_result.QueryResult();
      if (raw?.hasOwnProperty("recordset")) {
        result.records = raw.recordset;
      }
      if (raw?.hasOwnProperty("rowsAffected")) {
        result.affected = raw.rowsAffected[0];
      }
      const queryType = query.slice(0, query.indexOf(" "));
      switch (queryType) {
        case "DELETE":
          result.raw = [raw.recordset, raw.rowsAffected[0]];
          break;
        default:
          result.raw = raw.recordset;
      }
      return result;
    } catch (err) {
      throw err;
    }
  }
  release() {
    this.isReleased = true;
    return Promise.resolve();
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  SqlServerQueryRunner
});
