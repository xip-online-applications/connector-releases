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
var cluster_manager_exports = {};
__export(cluster_manager_exports, {
  ClusterManager: () => ClusterManager
});
module.exports = __toCommonJS(cluster_manager_exports);
var import_logger = require("@transai/logger");
var import_rxjs = require("rxjs");
var import_check_two_arrays = require("../util/check-two-arrays");
class ClusterManager {
  constructor(node, managementApiClient) {
    this.#enabledConnectors = [];
    this.#startedConnectorProcesses = [];
    this.start = () => {
      const broadcastMessage = (message) => {
        Object.values(this.#node.cluster.workers ?? {}).forEach((worker) => {
          worker.send(message);
        });
      };
      const startProcess = (connector) => {
        this.#logger.info(
          `Starting process type: ${connector.connectorType}, Identifier: ${connector.identifier}`,
          {
            CONNECTOR: JSON.stringify(connector).length,
            ORCHESTRATOR_CONFIG: JSON.stringify(this.#orchestratorConfig).length
          }
        );
        const newProcess = this.#node.cluster.fork({
          TENANT_IDENTIFIER: connector.tenantIdentifier,
          CONNECTOR_IDENTIFIER: connector.identifier,
          DATADOG_API_KEY: this.#orchestratorConfig.datadogApiKey,
          ORCHESTRATOR_CONFIG: JSON.stringify(this.#orchestratorConfig)
        });
        newProcess.on("message", (message) => {
          broadcastMessage(message);
        });
        newProcess.on("exit", (code, signal) => {
          this.#logger.info(
            `Connector ${connector.connectorType} - ${connector.identifier} - pid ${newProcess.process.pid} process exited`
          );
          const processStats = this.#startedConnectorProcesses.find(
            (p) => p.pid === newProcess.process.pid
          );
          const startedOn = processStats ? processStats.startedOn : /* @__PURE__ */ new Date();
          const processIndex = this.#startedConnectorProcesses.findIndex(
            (p) => p.pid === newProcess.process.pid
          );
          if (processIndex !== -1) {
            this.#logger.debug(
              `Removing process for connector ${connector.identifier}, ${connector.connectorType}`
            );
            this.#startedConnectorProcesses.splice(processIndex, 1);
          }
          if (code !== 0) {
            this.#logger.warn(
              `Worker ${newProcess.process.pid} died with code ${code} and signal ${signal}`
            );
          } else {
            this.#logger.debug(
              `Worker ${newProcess.process.pid} exited with code ${code} and signal ${signal}`
            );
          }
          const runtime = (/* @__PURE__ */ new Date()).getTime() - startedOn.getTime();
          const timeoutTime = Math.max(100, 6e4 - runtime);
          this.#logger.debug(
            `Runtime of process ${runtime}, Restarting process for connector ${connector.identifier}, ${connector.connectorType} in ${timeoutTime} ms`
          );
          setTimeout(() => {
            const isAlreadyStarted = this.#startedConnectorProcesses.some(
              (p) => p.connectorType === connector.connectorType && p.identifier === connector.identifier
            );
            if (isAlreadyStarted) {
              this.#logger.warn(
                `There is already a connector running with ${connector.identifier}, ${connector.connectorType}. Do not start this again.`
              );
              return;
            }
            const connectorEnabled = this.#enabledConnectors.some(
              (c) => c.connectorType === connector.connectorType && c.identifier === connector.identifier
            );
            if (!connectorEnabled) {
              this.#logger.warn(
                `Could not find connector ${connector.identifier}, ${connector.connectorType}. Not enabled so not restarting.`
              );
            } else {
              this.#logger.info(
                `Restarting process FROM EXIT LOOP for connector ${connector.identifier}, ${connector.connectorType}, ${newProcess.process.pid}`
              );
              startProcess(connector);
            }
          }, timeoutTime);
        });
        this.#startedConnectorProcesses.push({
          connectorType: connector.connectorType,
          identifier: connector.identifier,
          pid: newProcess.process.pid,
          worker: newProcess,
          startedOn: /* @__PURE__ */ new Date()
        });
      };
      const stopProcess = (connector) => {
        this.#logger.info(
          `Stopping process for connector ${connector.identifier}, ${connector.connectorType}`
        );
        const process2 = this.#startedConnectorProcesses.find(
          (p) => p.connectorType === connector.connectorType && p.identifier === connector.identifier
        );
        if (process2) {
          try {
            process2.worker.kill();
            this.#logger.info(
              `${connector.identifier} - ${connector.connectorType} Process killed`
            );
          } catch (error) {
            this.#logger.error(
              `Error while killing process for connector ${connector.identifier}, ${connector.connectorType} ${JSON.stringify(error)}`
            );
          }
        } else {
          this.#logger.error(
            `Could not find process for connector ${connector.identifier}`
          );
        }
      };
      const checkConnectors = async () => {
        const currentWorkersAmount = this.#numberOfAliveWorkers();
        if (currentWorkersAmount !== this.#enabledConnectors.length || this.#startedConnectorProcesses.length !== this.#enabledConnectors.length) {
          this.#logger.warn(
            `Number of running workers doesn't match expected: ${currentWorkersAmount}/${this.#enabledConnectors.length} (${this.#startedConnectorProcesses.length})`
          );
        }
        const newLastUpdatedTimestamp = await this.#managementApiClient.getLastUpdatedTimestamp().catch((error) => {
          this.#logger.error(
            "Error while getting last updated timestamp",
            error
          );
          return (/* @__PURE__ */ new Date()).toISOString();
        });
        this.#lastCheckTimestamp = (/* @__PURE__ */ new Date()).toISOString();
        if (newLastUpdatedTimestamp === this.#lastUpdatedTimestamp) {
          this.#logger.verbose(
            `Last updated timestamp has not changed. Current number of connector running: ${currentWorkersAmount}/${this.#enabledConnectors.length}`
          );
          return;
        }
        this.#logger.verbose(
          "Last updated timestamp has changed. Check for new or changed connectors"
        );
        const fullOrchestratorConfig = await this.#managementApiClient.getActiveConnectors().catch((error) => {
          this.#logger.error("Error while getting active connectors", error);
          return null;
        });
        if (fullOrchestratorConfig === null) {
          return;
        }
        this.#orchestratorConfig = fullOrchestratorConfig.config;
        if (this.#orchestratorConfig.datadogApiKey) {
          this.#logger.setDatadogTransport({
            apiKey: this.#orchestratorConfig.datadogApiKey,
            service: "cluster-manager",
            source: "connector-orchestrator",
            tags: {
              tenantIdentifier: process.env["TENANT_IDENTIFIER"]
            }
          });
        }
        const newConnectors = fullOrchestratorConfig.connectors ?? this.#enabledConnectors;
        const comparisonResult = (0, import_check_two_arrays.checkTwoArrays)(
          this.#enabledConnectors,
          newConnectors
        );
        this.#logger.info(
          `Received ${newConnectors.length} enabled connectors, stopping ${comparisonResult.onlyInA.length}, starting ${comparisonResult.onlyInB.length}`
        );
        const toRemove = comparisonResult.onlyInA;
        const toAdd = comparisonResult.onlyInB;
        toRemove.forEach((config) => {
          try {
            stopProcess(config);
          } catch (error) {
            this.#logger.error(
              `Error while stopping process for connector ${config.identifier}, ${config.connectorType} ${JSON.stringify(
                error
              )}`
            );
          }
        });
        toAdd.forEach((config) => {
          try {
            startProcess(config);
          } catch (error) {
            this.#logger.error(
              `Error while starting process for connector ${config.identifier}, ${config.connectorType} ${JSON.stringify(
                error
              )}`
            );
          }
        });
        this.#enabledConnectors = [...newConnectors];
        this.#lastUpdatedTimestamp = newLastUpdatedTimestamp;
      };
      let mutex = false;
      this.#logger.debug("Starting process to check connectors...");
      const telemetryTimer = (0, import_rxjs.timer)(0, 60 * 1e3).pipe(
        (0, import_rxjs.map)((num) => `Telemetry tick ${num}`),
        (0, import_rxjs.tap)(() => this.#emitTelemetry())
      );
      const checkConnectorsTimer = (0, import_rxjs.timer)(0, 60 * 1e3).pipe(
        (0, import_rxjs.map)((num) => `Check connectors tick ${num}`),
        (0, import_rxjs.catchError)((e) => {
          this.#logger.error(`Error while checking connectors ${e?.message}`, e);
          return (0, import_rxjs.of)(null);
        }),
        (0, import_rxjs.tap)(() => {
          try {
            if (mutex) {
              this.#logger.error("Mutex is set, skipping check");
              return;
            }
            mutex = true;
            checkConnectors().then(() => {
              mutex = false;
              this.#logger.verbose("Checked connectors");
            }).catch((e) => {
              mutex = false;
              this.#logger.error(
                `Error while checking connectors, ${JSON.stringify(e)}`
              );
              return null;
            });
          } catch (error) {
            this.#logger.error("Error while checking connectors", error);
          }
        })
      );
      return (0, import_rxjs.merge)(telemetryTimer, checkConnectorsTimer);
    };
    this.#node = node;
    this.#managementApiClient = managementApiClient;
    this.#logger = import_logger.Logger.getInstance();
  }
  #node;
  #managementApiClient;
  #logger;
  #lastCheckTimestamp;
  #lastUpdatedTimestamp;
  #orchestratorConfig;
  #enabledConnectors;
  #startedConnectorProcesses;
  #emitTelemetry() {
    this.#logger.info("cluster_manager.telemetry", {
      tenantIdentifier: process.env["TENANT_IDENTIFIER"] ?? null,
      lastUpdatedTimestamp: this.#lastUpdatedTimestamp,
      lastCheckTimestamp: this.#lastCheckTimestamp,
      workers: this.#numberOfAliveWorkers(),
      connectors: this.#enabledConnectors.length,
      startedProcesses: this.#startedConnectorProcesses.length
    });
  }
  #numberOfAliveWorkers() {
    return Object.values(this.#node.cluster.workers ?? {}).filter(
      (worker) => worker.isConnected() && !worker.isDead()
    ).length;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ClusterManager
});
