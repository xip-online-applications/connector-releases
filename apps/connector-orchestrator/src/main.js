var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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
var import_cluster = __toESM(require("cluster"));
var import_rxjs = require("rxjs");
var import_handle_error = require("@xip-online-data/handle-error");
var import_types = require("@xip-online-data/types");
var import_logger = require("@transai/logger");
var import_connector_runner_api_sink = require("@transai/connector-runner-api-sink");
var import_connector_runner_dummy_sink = require("@transai/connector-runner-dummy-sink");
var import_connector_runner_dummy_source = require("@transai/connector-runner-dummy-source");
var import_management_api_client = require("@transai/management-api-client");
var import_connector_runner_api_source = require("@transai/connector-runner-api-source");
var import_connector_runner_file_copy = require("@transai/connector-runner-file-copy");
var import_connector_runner_file_sink = require("@transai/connector-runner-file-sink");
var import_connector_runner_samba_sink = require("@transai/connector-runner-samba-sink");
var import_connector_runner_file_source = require("@transai/connector-runner-file-source");
var import_connector_runner_sql_sink = require("@transai/connector-runner-sql-sink");
var import_connector_runner_samba_source = require("@transai/connector-runner-samba-source");
var import_connector_runner_sql_source = require("@transai/connector-runner-sql-source");
var import_connector_runner_cube_query = require("@transai/connector-runner-cube-query");
var import_connector_runner_dummy_node = require("@transai/connector-runner-dummy-node");
var import_connector_runner_mqtt_source = require("@transai/connector-runner-mqtt-source");
var import_check_two_arrays = require("./check-two-arrays");
const getConnectorType = (connectorConfig) => {
  switch (connectorConfig.connectorType) {
    case import_types.ConfiguredConnectorTypes.API_SINK:
      return new import_connector_runner_api_sink.ConnectorRunnerApiSink(
        connectorConfig,
        connectorConfig.config,
        connectorConfig.actions
      );
    case import_types.ConfiguredConnectorTypes.API_SOURCE:
      return new import_connector_runner_api_source.ConnectorRunnerApiSource(
        connectorConfig,
        connectorConfig.config,
        connectorConfig.actions
      );
    case import_types.ConfiguredConnectorTypes.DUMMY_SINK:
      return new import_connector_runner_dummy_sink.ConnectorRunnerDummySink(
        connectorConfig,
        connectorConfig.config,
        connectorConfig.actions
      );
    case import_types.ConfiguredConnectorTypes.DUMMY_SOURCE:
      return new import_connector_runner_dummy_source.ConnectorRunnerDummySource(
        connectorConfig,
        connectorConfig.config,
        connectorConfig.actions
      );
    case import_types.ConfiguredConnectorTypes.DUMMY_NODE:
      return new import_connector_runner_dummy_node.ConnectorRunnerDummyNode(
        connectorConfig,
        connectorConfig.config,
        connectorConfig.actions
      );
    case import_types.ConfiguredConnectorTypes.FILE_COPY:
      return new import_connector_runner_file_copy.ConnectorRunnerFileCopy(
        connectorConfig,
        connectorConfig.config,
        connectorConfig.actions
      );
    case import_types.ConfiguredConnectorTypes.FILE_SINK:
      return new import_connector_runner_file_sink.ConnectorRunnerFileSink(
        connectorConfig,
        connectorConfig.config,
        connectorConfig.actions
      );
    case import_types.ConfiguredConnectorTypes.FILE_SOURCE:
      return new import_connector_runner_file_source.ConnectorRunnerFileSource(
        connectorConfig,
        connectorConfig.config,
        connectorConfig.actions
      );
    case import_types.ConfiguredConnectorTypes.SAMBA_SINK:
      return new import_connector_runner_samba_sink.ConnectorRunnerSambaSink(
        connectorConfig,
        connectorConfig.config,
        connectorConfig.actions
      );
    case import_types.ConfiguredConnectorTypes.SAMBA_SOURCE:
      return new import_connector_runner_samba_source.ConnectorRunnerSambaSource(
        connectorConfig,
        connectorConfig.config,
        connectorConfig.actions
      );
    case import_types.ConfiguredConnectorTypes.SQL_SINK:
      return new import_connector_runner_sql_sink.ConnectorRunnerSqlSink(
        connectorConfig,
        connectorConfig.config,
        connectorConfig.actions
      );
    case import_types.ConfiguredConnectorTypes.SQL_SOURCE:
      return new import_connector_runner_sql_source.ConnectorRunnerSqlSource(
        connectorConfig,
        connectorConfig.config,
        connectorConfig.actions
      );
    case import_types.ConfiguredConnectorTypes.CUBE_QUERY_RUNNER:
      return new import_connector_runner_cube_query.ConnectorRunnerCubeQuery(
        connectorConfig,
        connectorConfig.config,
        connectorConfig.actions
      );
    case import_types.ConfiguredConnectorTypes.MQTT_SOURCE:
      return new import_connector_runner_mqtt_source.ConnectorRunnerMqttSource(
        connectorConfig,
        connectorConfig.config,
        connectorConfig.actions
      );
    default:
      throw new Error(
        `Unknown connector type ${connectorConfig.connectorType}`
      );
  }
};
async function startCluster() {
  const log = import_logger.Logger.getInstance("connector-orchestrator");
  const managementApiClient = new import_management_api_client.ConnectorApiClient();
  let lastUpdatedTimestamp;
  let enabledConnectors = [];
  const startedConnectorProcesses = [];
  const broadcastMessage = (message) => {
    for (const id in import_cluster.default.workers) {
      if (import_cluster.default.workers[id]) {
        import_cluster.default.workers[id].send(message);
      }
    }
  };
  const startProcess = (connector) => {
    const newProcess = import_cluster.default.fork({
      CONNECTOR: JSON.stringify(connector)
    });
    newProcess.on("message", (message) => {
      broadcastMessage(message);
    });
    newProcess.on("exit", (code, signal) => {
      const processStats = startedConnectorProcesses.find(
        (p) => p.pid === newProcess.process.pid
      );
      const startedOn = processStats ? processStats.startedOn : /* @__PURE__ */ new Date();
      const processIndex = startedConnectorProcesses.findIndex(
        (p) => p.pid === newProcess.process.pid
      );
      if (processIndex !== -1) {
        log.debug(
          `Removing process for connector ${connector.identifier}, ${connector.connectorType}`
        );
        startedConnectorProcesses.splice(processIndex, 1);
      }
      if (code !== 0) {
        log.warn(
          `Worker ${newProcess.process.pid} died with code ${code} and signal ${signal}`
        );
      }
      const runtime = (/* @__PURE__ */ new Date()).getTime() - startedOn.getTime();
      const timeoutTime = Math.max(0, 5e3 - runtime);
      log.debug(
        `Runtime of process ${runtime}, Restarting process for connector ${connector.identifier}, ${connector.connectorType} in ${timeoutTime} ms`
      );
      setTimeout(() => {
        const connectorEnabled = enabledConnectors.some(
          (c) => c.connectorType === connector.connectorType && c.identifier === connector.identifier
        );
        if (!connectorEnabled) {
          console.error(
            `Could not find connector ${connector.identifier}, ${connector.connectorType}. Not enabled so not restarting.`
          );
        } else {
          startProcess(connector);
        }
      }, timeoutTime);
    });
    startedConnectorProcesses.push({
      connectorType: connector.connectorType,
      identifier: connector.identifier,
      pid: newProcess.process.pid,
      worker: newProcess,
      startedOn: /* @__PURE__ */ new Date()
    });
  };
  const stopProcess = (connector) => {
    const process2 = startedConnectorProcesses.find(
      (p) => p.connectorType === connector.connectorType && p.identifier === connector.identifier
    );
    log.info(
      `Stopping process for connector ${connector.identifier}, ${connector.connectorType}`
    );
    if (process2) {
      process2.worker.kill();
    } else {
      log.error(`Could not find process for connector ${connector.identifier}`);
    }
  };
  const checkConnectors = async () => {
    let test = 0;
    for (const id in import_cluster.default.workers) {
      if (import_cluster.default.workers[id]) {
        test += 1;
      }
    }
    log.trace(
      `Number of workers: ${test}, Number of configured workes ${enabledConnectors.length}, number of started workers ${startedConnectorProcesses.length}`
    );
    if (test !== enabledConnectors.length) {
      log.info(
        `Number of workers: ${test}, Number of configured workes ${enabledConnectors.length}, number of started workers ${startedConnectorProcesses.length}`
      );
      console.error(
        "Number of workers is not equal to number of configured workers"
      );
    }
    const newLastUpdatedTimestamp = await managementApiClient.getLastUpdatedTimestamp().catch((error) => {
      log.error("Error while getting last updated timestamp", error);
      return lastUpdatedTimestamp;
    });
    if (newLastUpdatedTimestamp !== lastUpdatedTimestamp) {
      log.info(
        "Last updated timestamp has changed. Check for new or changed connectors"
      );
      lastUpdatedTimestamp = newLastUpdatedTimestamp;
      const newEnabledConnectors = await managementApiClient.getActiveConnectors().catch((error) => {
        log.error("Error while getting active connectors", error);
        return enabledConnectors;
      });
      const comparisonResult = (0, import_check_two_arrays.checkTwoArrays)(
        enabledConnectors,
        newEnabledConnectors
      );
      enabledConnectors = newEnabledConnectors;
      const toRemove = comparisonResult.onlyInA;
      const toAdd = comparisonResult.onlyInB;
      toRemove.forEach(stopProcess);
      toAdd.forEach(startProcess);
    }
  };
  (0, import_rxjs.timer)(0, 0.1 * 60 * 1e3).subscribe(() => {
    try {
      checkConnectors();
    } catch (error) {
      log.error("Error while checking connectors", error);
    }
  });
}
async function startConnector() {
  const connectorData = JSON.parse(
    process.env.CONNECTOR
  );
  const log = import_logger.Logger.getInstance(connectorData.identifier);
  log.info(
    `Worker ${connectorData.connectorType}, ${connectorData.identifier} ${process.pid} started`
  );
  const connector = getConnectorType(connectorData);
  await connector.start();
  process.on("SIGINT", async () => {
    log.warn(
      `Worker ${connectorData.connectorType}, ${connectorData.identifier} ${process.pid} received SIGINT`
    );
    await connector.stop();
    process.exit(0);
  });
  process.on("SIGTERM", async () => {
    log.warn(
      `Worker ${connectorData.connectorType}, ${connectorData.identifier} ${process.pid} received SIGTERM`
    );
    await connector.stop();
    process.exit(0);
  });
  process.on("uncaughtException", async (error) => {
    log.warn(
      `Worker ${connectorData.connectorType}, ${connectorData.identifier} ${process.pid} received uncaughtException`
    );
    (0, import_handle_error.handleError)("Uncaught exception in worker", error);
    await connector.stop();
    process.exit(1);
  });
}
async function main() {
  if (import_cluster.default.isPrimary) {
    await startCluster();
  } else {
    await startConnector();
  }
}
main().catch((error) => {
  (0, import_handle_error.handleError)("Error while initializing the app", error);
});
