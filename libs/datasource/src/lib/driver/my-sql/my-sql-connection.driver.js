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
var my_sql_connection_driver_exports = {};
__export(my_sql_connection_driver_exports, {
  MySqlConnectionDriver: () => MySqlConnectionDriver
});
module.exports = __toCommonJS(my_sql_connection_driver_exports);
var mysql = __toESM(require("mysql2/promise"));
var import_my_sql = require("./my-sql.query-runner");
class MySqlConnectionDriver {
  constructor(connection) {
    this.options = connection.options;
    this.connection = connection;
    this.database = this.options.database;
  }
  async connect() {
    this.pool = await this.createPool(
      this.createConnectionOptions(this.options, this.options)
    );
    const queryRunner = this.createQueryRunner();
    const result = await queryRunner.query(`SELECT VERSION() AS \`version\``);
    this.version = result.records[0].version;
    await queryRunner.release();
  }
  afterConnect() {
    return Promise.resolve(void 0);
  }
  disconnect() {
    return Promise.resolve(void 0);
  }
  /**
   * Creates a new connection pool for a given database credentials.
   */
  createConnectionOptions(options, credentials) {
    return {
      charset: options.charset,
      connectTimeout: options.connectTimeout,
      insecureAuth: options.insecureAuth,
      supportBigNumbers: options.supportBigNumbers !== void 0 ? options.supportBigNumbers : true,
      bigNumberStrings: options.bigNumberStrings !== void 0 ? options.bigNumberStrings : true,
      dateStrings: options.dateStrings,
      debug: options.debug,
      trace: options.trace,
      multipleStatements: options.multipleStatements,
      flags: options.flags,
      host: credentials.host,
      user: credentials.username,
      password: credentials.password,
      database: credentials.database,
      port: credentials.port,
      ssl: options.ssl,
      socketPath: credentials.socketPath,
      connectionLimit: options.poolSize
    };
  }
  /**
   * Creates a new connection pool for a given database credentials.
   */
  // eslint-disable-next-line class-methods-use-this
  async createPool(connectionOptions) {
    const pool = mysql.createPool(connectionOptions);
    const conn = (
      // Ignore the IDE message cause it is a mysql2 promise connection,
      // and not the regular mysql2 that the ide thinks. IT WORKS!
      await pool.getConnection()
    );
    conn.release();
    return pool;
  }
  /**
   * Obtains a new database connection to a master server.
   * Used for replication.
   * If replication is not setup then returns default connection's database connection.
   */
  obtainConnection() {
    return this.pool.getConnection();
  }
  /**
   * Creates a query runner used to execute database queries.
   */
  createQueryRunner() {
    return new import_my_sql.MySqlQueryRunner(this);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MySqlConnectionDriver
});
