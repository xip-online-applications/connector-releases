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
var postgres_connection_driver_exports = {};
__export(postgres_connection_driver_exports, {
  PostgresConnectionDriver: () => PostgresConnectionDriver
});
module.exports = __toCommonJS(postgres_connection_driver_exports);
var postgres = __toESM(require("pg"));
var import_pg_types = require("pg-types");
var import_postgres = require("./postgres.query-runner");
var import_error = require("../error");
var import_logger = require("@transai/logger");
const { types } = postgres;
class PostgresConnectionDriver {
  constructor(connection) {
    /**
     * We store all created query runners because we need to release them.
     */
    this.connectedQueryRunners = [];
    this.connection = connection;
    this.options = connection.options;
    this.database = this.options.database;
    this.loadDependencies();
  }
  loadDependencies() {
    try {
      import_logger.Logger.getInstance().info("Loading Postgres driver");
      if (this.options.disableParsing) {
        import_logger.Logger.getInstance().info("Disable parsing of datetime types");
        const overrideTypes = [
          import_pg_types.builtins.DATE,
          import_pg_types.builtins.TIME,
          import_pg_types.builtins.TIMETZ,
          import_pg_types.builtins.TIMESTAMP,
          import_pg_types.builtins.TIMESTAMPTZ
        ];
        overrideTypes.forEach((type) => {
          types.setTypeParser(type, (value) => {
            return value;
          });
        });
      } else {
        import_logger.Logger.getInstance().info("Enable parsing of datetime types (DEFAULT)");
      }
      this.postgres = postgres;
    } catch (e) {
    }
  }
  async connect() {
    this.master = await this.createPool(this.options, this.options);
  }
  async afterConnect() {
    const [connection, release] = await this.obtainMasterConnection();
    const results = await this.executeQuery(
      connection,
      "SELECT version();"
    );
    this.version = results.rows[0].version.replace(
      /^PostgreSQL ([\d\.]+) .*$/,
      "$1"
    );
    await release();
  }
  disconnect() {
    return Promise.resolve(void 0);
  }
  /**
   * Creates a new connection pool for a given database credentials.
   */
  async createPool(options, credentials) {
    credentials = { ...credentials };
    const connectionOptions = {
      host: credentials.host,
      user: credentials.username,
      password: credentials.password,
      database: credentials.database,
      port: credentials.port,
      ssl: credentials.ssl,
      connectionTimeoutMillis: options.connectTimeoutMS,
      application_name: options.applicationName,
      max: options.poolSize
    };
    const pool = new this.postgres.Pool(connectionOptions);
    return new Promise((ok, fail) => {
      pool.connect((err, connection, release) => {
        if (err)
          return fail(err);
        release();
        ok(pool);
      });
    });
  }
  /**
   * Obtains a new database connection to a master server.
   * Used for replication.
   * If replication is not setup then returns default connection's database connection.
   */
  async obtainMasterConnection() {
    if (!this.master) {
      throw new import_error.TypeORMError("Driver not Connected");
    }
    return new Promise((ok, fail) => {
      this.master.connect((err, connection, release) => {
        err ? fail(err) : ok([connection, release]);
      });
    });
  }
  /**
   * Executes given query.
   */
  executeQuery(connection, query) {
    return new Promise((ok, fail) => {
      connection.query(
        query,
        (err, result) => err ? fail(err) : ok(result)
      );
    });
  }
  createQueryRunner() {
    return new import_postgres.PostgresQueryRunner(this);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  PostgresConnectionDriver
});
