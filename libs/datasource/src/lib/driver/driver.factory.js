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
var driver_factory_exports = {};
__export(driver_factory_exports, {
  DriverFactory: () => DriverFactory
});
module.exports = __toCommonJS(driver_factory_exports);
var import_my_sql_connection = require("./my-sql/my-sql-connection.driver");
var import_postgres_connection = require("./postgres/postgres-connection.driver");
class DriverFactory {
  static create(connection) {
    const { type } = connection.options;
    switch (type) {
      case "mysql":
        return new import_my_sql_connection.MySqlConnectionDriver(connection);
      case "postgres":
        return new import_postgres_connection.PostgresConnectionDriver(connection);
      case "mariadb":
        return new import_my_sql_connection.MySqlConnectionDriver(connection);
      default:
        throw new Error("Not applicable" + type);
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DriverFactory
});
