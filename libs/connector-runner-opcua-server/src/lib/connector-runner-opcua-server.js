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
var connector_runner_opcua_server_exports = {};
__export(connector_runner_opcua_server_exports, {
  ConnectorRunnerOpcuaServer: () => ConnectorRunnerOpcuaServer
});
module.exports = __toCommonJS(connector_runner_opcua_server_exports);
var import_connector_runtime = require("@transai/connector-runtime");
var import_logger = require("@transai/logger");
var import_node_opcua = require("node-opcua");
class ConnectorRunnerOpcuaServer extends import_connector_runtime.ConnectorRuntime {
  constructor(connector, apiConfig, actionConfigs) {
    super(connector, apiConfig, actionConfigs);
    this.CONNECTOR_INSTANCE = "XOD_CONNECTOR_OPCUA_SERVER_CONFIG";
    this.#variableStates = /* @__PURE__ */ new Map();
    this.init = async () => {
      try {
        this.#server = new import_node_opcua.OPCUAServer({
          port: 4334,
          resourcePath: "/UA/MyLittleServer",
          buildInfo: {
            productName: "MyOPCUAServer",
            buildNumber: "1.0.0",
            buildDate: /* @__PURE__ */ new Date()
          }
        });
        await this.#server.start();
        this.#logger.info(
          `OPC UA Server started at: ${this.#server.endpoints[0].endpointDescriptions()[0].endpointUrl}`
        );
        const { addressSpace } = this.#server.engine;
        if (!addressSpace) {
          this.#logger.error("AddressSpace is not available.");
          return;
        }
        this.#namespace = addressSpace.getOwnNamespace();
        this.#device = this.#namespace.addObject({
          organizedBy: addressSpace.rootFolder.objects,
          browseName: "MyDevice"
        });
        const variableConfigs = [
          { name: "Temperature", initialValue: 20 },
          { name: "Humidity", initialValue: 50 },
          { name: "Pressure", initialValue: 1013 },
          { name: "Voltage", initialValue: 220 }
        ];
        variableConfigs.forEach(({ name, initialValue }) => {
          this.createVariable(name, initialValue);
        });
      } catch (error) {
        this.#logger.error("Failed to initialize OPC UA server", error);
      }
    };
    this.#logger = import_logger.Logger.getInstance();
  }
  #logger;
  #server;
  #namespace;
  #device;
  #variableStates;
  createVariable(name, initialValue) {
    if (!this.#namespace || !this.#device) {
      this.#logger.error("Namespace or Device is not initialized.");
      throw new Error("Namespace or Device is not initialized.");
    }
    this.#variableStates.set(name, initialValue);
    const variable = this.#namespace.addVariable({
      componentOf: this.#device,
      browseName: name,
      dataType: import_node_opcua.DataType.Double,
      value: {
        get: () => new import_node_opcua.Variant({
          dataType: import_node_opcua.DataType.Double,
          value: this.#variableStates.get(name) || 0
        }),
        set: (variant) => {
          this.#variableStates.set(name, variant.value);
          this.#logger.info(`${name} updated to ${variant.value}`);
          return import_node_opcua.StatusCodes.Good;
        }
      }
    });
    this.#logger.info(
      `Variable "${name}" initialized with value: ${initialValue}`
    );
    return variable;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ConnectorRunnerOpcuaServer
});
