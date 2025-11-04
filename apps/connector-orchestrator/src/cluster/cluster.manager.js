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
    // As a backup we use eu-west-1 as default region
    this.#DEFAULT_AWS_REGION = "eu-west-1";
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
          `Starting process type: ${connector.connectorType}, Identifier: ${connector.identifier}`
        );
        const newProcess = this.#node.cluster.fork({
          CONNECTOR: JSON.stringify(connector),
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
              this.#logger.info(
                `There is already a connector running with ${connector.identifier}, ${connector.connectorType}. Do not start this again.`
              );
              return;
            }
            const connectorEnabled = this.#enabledConnectors.some(
              (c) => c.connectorType === connector.connectorType && c.identifier === connector.identifier
            );
            if (!connectorEnabled) {
              this.#logger.info(
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
        const test = Object.entries(this.#node.cluster.workers).length;
        if (test !== this.#enabledConnectors.length) {
          this.#logger.error(
            `Number of workers: ${test}, Number of configured workers ${this.#enabledConnectors.length}, number of started workers ${this.#startedConnectorProcesses.length}`
          );
        } else {
          this.#logger.info(
            `Number of workers: ${test}, Number of configured workers ${this.#enabledConnectors.length}, number of started workers ${this.#startedConnectorProcesses.length}`
          );
        }
        const newLastUpdatedTimestamp = await this.#managementApiClient.getLastUpdatedTimestamp().catch((error) => {
          this.#logger.error(
            "Error while getting last updated timestamp",
            error
          );
          return (/* @__PURE__ */ new Date()).toISOString();
        });
        if (newLastUpdatedTimestamp === this.#lastUpdatedTimestamp) {
          this.#logger.debug(
            "Last updated timestamp has not changed. No need to check for new or changed connectors"
          );
          return;
        }
        this.#logger.info(
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
            source: "connector-orchestrator"
          });
        }
        let defaultTenantIdentifier = process.env["TENANT_IDENTIFIER"] ?? null;
        if (defaultTenantIdentifier === "") {
          defaultTenantIdentifier = null;
        }
        const newConnectors = (fullOrchestratorConfig.connectors ?? this.#enabledConnectors).map(
          (connector) => this.#buildConnectorConfiguration(
            connector,
            fullOrchestratorConfig,
            defaultTenantIdentifier
          )
        );
        this.#logger.info(`received ${newConnectors.length} enabled connectors`);
        const comparisonResult = (0, import_check_two_arrays.checkTwoArrays)(
          this.#enabledConnectors,
          newConnectors
        );
        const toRemove = comparisonResult.onlyInA;
        const toAdd = comparisonResult.onlyInB;
        toRemove.forEach(stopProcess);
        toAdd.forEach(startProcess);
        this.#enabledConnectors = [...newConnectors];
        this.#lastUpdatedTimestamp = newLastUpdatedTimestamp;
      };
      let mutex = false;
      this.#logger.info("Starting process to check connectors");
      return (0, import_rxjs.timer)(0, 60 * 1e3).pipe(
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
              this.#logger.debug("Checked connectors");
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
    };
    this.#buildConnectorConfiguration = (connector, fullOrchestratorConfig, defaultTenantIdentifier) => {
      const tenantIdentifier = defaultTenantIdentifier ?? connector.tenantIdentifier;
      const awsAccessKeyId = connector.config.kafka?.sasl?.accessKeyId ?? process.env["AWS_ACCESS_KEY_ID"] ?? fullOrchestratorConfig.config.awsAccessKeyId;
      const awsSecretAccessKey = connector.config.kafka?.sasl?.secretAccessKey ?? process.env["AWS_SECRET_ACCESS_KEY"] ?? fullOrchestratorConfig.config.awsSecretAccessKey;
      return {
        ...connector,
        tenantIdentifier,
        config: {
          ...connector.config,
          tenantIdentifier,
          processIdentifier: connector.config.processIdentifier ?? `${tenantIdentifier}-${connector.identifier}`,
          kafka: {
            ...connector.config.kafka ?? {},
            brokers: connector.config.kafka?.brokers ?? fullOrchestratorConfig.config.kafkaBrokers,
            groupId: connector.config.kafka?.groupId ?? `${tenantIdentifier}-${connector.identifier}-group`,
            clientId: connector.config.kafka?.clientId ?? `${tenantIdentifier}-${connector.identifier}-client`,
            useConfluentLibrary: connector.config.kafka?.useConfluentLibrary ?? true,
            ...awsAccessKeyId && awsSecretAccessKey ? {
              sasl: {
                region: connector.config.kafka?.sasl?.region ?? process.env["AWS_REGION"] ?? fullOrchestratorConfig.config.awsRegion ?? this.#DEFAULT_AWS_REGION,
                accessKeyId: awsAccessKeyId,
                secretAccessKey: awsSecretAccessKey,
                mechanism: "aws"
              }
            } : {}
          }
        }
      };
    };
    this.#node = node;
    this.#managementApiClient = managementApiClient;
    this.#logger = import_logger.Logger.getInstance();
  }
  #DEFAULT_AWS_REGION;
  #node;
  #managementApiClient;
  #logger;
  #lastUpdatedTimestamp;
  #orchestratorConfig;
  #enabledConnectors;
  #startedConnectorProcesses;
  #buildConnectorConfiguration;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ClusterManager
});
