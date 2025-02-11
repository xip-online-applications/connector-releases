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
var postgres_query_runner_exports = {};
__export(postgres_query_runner_exports, {
  PostgresQueryRunner: () => PostgresQueryRunner
});
module.exports = __toCommonJS(postgres_query_runner_exports);
var import_query_result = require("../query-result");
class PostgresQueryRunner {
  constructor(driver) {
    this.driver = driver;
    this.connection = driver.connection;
    this.isReleased = false;
    this.isTransactionActive = false;
  }
  connect() {
    if (this.databaseConnection)
      return Promise.resolve(this.databaseConnection);
    if (this.databaseConnectionPromise)
      return this.databaseConnectionPromise;
    this.databaseConnectionPromise = this.driver.obtainMasterConnection().then(([connection, release]) => {
      this.driver.connectedQueryRunners.push(this);
      this.databaseConnection = connection;
      const onErrorCallback = (err) => this.releasePostgresConnection(err);
      this.releaseCallback = (err) => {
        this.databaseConnection.removeListener("error", onErrorCallback);
        release(err);
      };
      this.databaseConnection.on("error", onErrorCallback);
      return this.databaseConnection;
    });
    return this.databaseConnectionPromise;
  }
  async query(query, parameters) {
    if (this.isReleased)
      throw new Error();
    const databaseConnection = await this.connect();
    try {
      const queryStartTime = +/* @__PURE__ */ new Date();
      const raw = await databaseConnection.query(query, parameters);
      const maxQueryExecutionTime = this.driver.options.maxQueryExecutionTime;
      const queryEndTime = +/* @__PURE__ */ new Date();
      const queryExecutionTime = queryEndTime - queryStartTime;
      const result = new import_query_result.QueryResult();
      if (raw) {
        if (raw.hasOwnProperty("rows")) {
          result.records = raw.rows;
        }
        if (raw.hasOwnProperty("rowCount")) {
          result.affected = raw.rowCount;
        }
        switch (raw.command) {
          case "DELETE":
          case "UPDATE":
            result.raw = [raw.rows, raw.rowCount];
            break;
          default:
            result.raw = raw.rows;
        }
      }
      return result;
    } catch (err) {
      throw err;
    }
  }
  release() {
    return this.releasePostgresConnection();
  }
  async releasePostgresConnection(err) {
    if (this.isReleased) {
      return;
    }
    this.isReleased = true;
    if (this.releaseCallback) {
      this.releaseCallback(err);
      this.releaseCallback = void 0;
    }
    const index = this.driver.connectedQueryRunners.indexOf(this);
    if (index !== -1) {
      this.driver.connectedQueryRunners.splice(index, 1);
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  PostgresQueryRunner
});
