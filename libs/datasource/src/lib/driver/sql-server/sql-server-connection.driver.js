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
var sql_server_connection_driver_exports = {};
__export(sql_server_connection_driver_exports, {
  SqlServerConnectionDriver: () => SqlServerConnectionDriver
});
module.exports = __toCommonJS(sql_server_connection_driver_exports);
var msSql = __toESM(require("mssql"));
var import_logger = require("@transai/logger");
var import_sql_server = require("./sql-server.query-runner");
class SqlServerConnectionDriver {
  constructor(connection) {
    this.database = "";
    /**
     * We store all created query runners because we need to release them.
     */
    this.connectedQueryRunners = [];
    this.connection = connection;
    this.options = connection.options;
    this.loadDependencies();
  }
  loadDependencies() {
    try {
      this.mssql = msSql;
    } catch (e) {
      throw new Error("SQL Server mssql not loaded");
    }
  }
  async connect() {
    this.master = await this.createPool(this.options, this.options);
    const queryRunner = this.createQueryRunner();
    await queryRunner.release();
  }
  async afterConnect() {
    return Promise.resolve();
  }
  disconnect() {
    return Promise.resolve(void 0);
  }
  createQueryRunner() {
    return new import_sql_server.SqlServerQueryRunner(this);
  }
  /**
   * Obtains a new database connection to a master server.
   * Used for replication.
   * If replication is not setup then returns default connection's database connection.
   */
  async obtainMasterConnection() {
    if (!this.master) {
      return Promise.reject(new Error("Driver not Connected"));
    }
    return Promise.resolve(this.master);
  }
  /**
   * Creates a new connection pool for a given database credentials.
   */
  createPool(options, credentials) {
    const connectionOptions = {
      connectionTimeout: this.options.connectionTimeout,
      requestTimeout: this.options.requestTimeout,
      stream: this.options.stream,
      pool: this.options.pool,
      options: this.options.options,
      server: credentials.host,
      database: credentials.database,
      port: credentials.port,
      user: credentials.username,
      password: credentials.password,
      authentication: credentials.authentication
    };
    if (!connectionOptions.options) {
      connectionOptions.options = { useUTC: false };
    } else if (!connectionOptions.options.useUTC) {
      Object.assign(connectionOptions.options, { useUTC: false });
    }
    Object.assign(connectionOptions.options, { enableArithAbort: true });
    return new Promise((ok, fail) => {
      const pool = new this.mssql.ConnectionPool(connectionOptions);
      const poolErrorHandler = options.pool && options.pool.errorHandler || ((error) => import_logger.Logger.getInstance().warn(`MSSQL pool raised an error. ${error}`));
      pool.on("error", poolErrorHandler);
      const connection = pool.connect((err) => {
        if (err)
          return fail(err);
        ok(connection);
      });
    });
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  SqlServerConnectionDriver
});
