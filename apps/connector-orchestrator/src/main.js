var import_logger = require("@transai/logger");
var import_management_api_client = require("@transai/management-api-client");
var import_handle_error = require("@xip-online-data/handle-error");
var import_cluster = require("./cluster/cluster.manager");
var import_connector = require("./connector/connector.manager");
var import_node_wrapper = require("./util/node-wrapper");
async function main() {
  const node = new import_node_wrapper.NodeWrapper();
  if (process.env.NODE_ENV === "development" && node.cluster.isPrimary) {
    console.warn(
      "CONNECTOR ORCHESTRATOR: Running in development mode, waiting for 5 seconds to prevent race condition"
    );
    await new Promise((resolve) => {
      setTimeout(resolve, 5 * 1e3);
    });
  }
  if (node.cluster.isPrimary) {
    import_logger.Logger.getInstance(
      `[${node.process.pid}] connector-orchestrator`
    ).setDatadogTransport({
      service: "cluster-manager",
      source: "connector-orchestrator"
    });
    new import_cluster.ClusterManager(node, new import_management_api_client.ConnectorApiClient()).start().subscribe();
  } else {
    const connectorData = JSON.parse(
      node.process.env.CONNECTOR
    );
    const orchestratorConfig = JSON.parse(
      node.process.env.ORCHESTRATOR_CONFIG
    );
    import_logger.Logger.getInstance(
      `[${node.process.pid}] ${connectorData.identifier}`
    ).setDatadogTransport({
      apiKey: orchestratorConfig.datadogApiKey,
      service: "connector-manager",
      source: "connector-orchestrator",
      tags: {
        connector: connectorData.identifier,
        tenantIdentifier: connectorData.tenantIdentifier
      }
    });
    await new import_connector.ConnectorManager(node, connectorData).start();
  }
}
main().catch((error) => {
  (0, import_handle_error.handleError)("Error while initializing the app", error);
});
//# sourceMappingURL=main.js.map
