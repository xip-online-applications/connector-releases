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
var opcua_client_exports = {};
__export(opcua_client_exports, {
  OpcuaClient: () => OpcuaClient
});
module.exports = __toCommonJS(opcua_client_exports);
var import_logger = require("@transai/logger");
var import_node_opcua = require("node-opcua");
class OpcuaClient {
  #OPCUA_NAMESPACE_NODE_ID = "i=2255";
  #opcuaConfig;
  #logger;
  #client;
  #initialized = false;
  #clientSession;
  #namespaceIndex;
  #nodeSubscriptions = {};
  #sessionOpen = false;
  constructor(opcuaConfig, logger = import_logger.Logger.getInstance(), client = void 0) {
    this.#logger = logger;
    this.#opcuaConfig = opcuaConfig;
    this.#client = client ?? import_node_opcua.OPCUAClient.create({
      applicationName: "TransAI Bystronic OPC UA Client",
      endpointMustExist: false,
      securityMode: this.#opcuaConfig.securityMode ?? import_node_opcua.MessageSecurityMode.None,
      securityPolicy: this.#opcuaConfig.securityPolicy ?? import_node_opcua.SecurityPolicy.None
    });
  }
  /**
   * Initialize the OPC UA client and connect to the server. This method
   * must be called before any other operations. It establishes a session and
   * retrieves the namespace index for the configured namespace URI.
   *
   * @throws Will throw an error if the connection fails.
   */
  async init() {
    if (this.#initialized) {
      this.#logger.verbose(
        `OPC UA client already initialized and connected to ${this.#opcuaConfig.endpointUrl}.`
      );
      return;
    }
    try {
      this.#logger.verbose(
        `Connecting to OPC UA server ${this.#opcuaConfig.endpointUrl}...`
      );
      await this.#client.connect(this.#opcuaConfig.endpointUrl);
      this.#clientSession = await this.#client.createSession();
      if (this.#opcuaConfig.namespace) {
        this.#namespaceIndex = await this.#resolveNamespaceIndex(
          this.#opcuaConfig.namespace
        );
      }
      this.#sessionOpen = true;
      this.#initialized = true;
      this.#logger.verbose(
        `Setting up OPC UA client listeners to ${this.#opcuaConfig.endpointUrl}.`
      );
      this.#client.on("connection_failed", (status) => {
        this.#logger.warn(
          `OPC UA client connection failed: ${status.toString()}`
        );
        this.#sessionOpen = false;
      });
      this.#client.on("connection_lost", () => {
        this.#logger.warn("OPC UA client connection lost");
        this.#sessionOpen = false;
      });
      this.#client.on("start_reconnection", () => {
        this.#logger.warn("OPC UA client reconnected");
        this.#sessionOpen = false;
      });
      this.#client.on("close", () => {
        this.#logger.warn("OPC UA session closed");
        this.#sessionOpen = false;
      });
      this.#client.on("after_reconnection", (err) => {
        this.#logger.warn(`OPC UA client reconnected: ${err?.message}`, err);
        this.#sessionOpen = err === void 0;
      });
      this.#client.on("connected", () => {
        this.#logger.warn("OPC UA client connected");
        this.#sessionOpen = true;
      });
      this.#client.on("connection_reestablished", () => {
        this.#logger.warn("OPC UA client connection reestablished");
        this.#sessionOpen = true;
      });
      this.#clientSession.on("session_closed", (status) => {
        this.#logger.warn(`OPC UA session closed: ${status.toString()}`);
        this.#sessionOpen = false;
      });
      this.#clientSession.on("session_restored", () => {
        this.#logger.debug("OPC UA session restored");
        this.#sessionOpen = true;
      });
      this.#logger.debug(
        `Connected to OPC UA server ${this.#opcuaConfig.endpointUrl}.`
      );
    } catch (error) {
      this.#logger.error(
        `Failed to connect to OPC UA server ${this.#opcuaConfig.endpointUrl}:`,
        error
      );
      await this.disconnect();
      throw error;
    }
  }
  async disconnect() {
    this.#initialized = false;
    this.#sessionOpen = false;
    await Promise.all(
      Object.keys(this.#nodeSubscriptions).map(async (nodeId) => {
        try {
          await this.unsubscribeFromNode(nodeId);
        } catch (error) {
          this.#logger.error(
            `Failed to unsubscribe from node ${nodeId}:`,
            error
          );
        }
      })
    );
    this.#nodeSubscriptions = {};
    try {
      await this.#clientSession?.close(true);
    } catch (error) {
      this.#logger.error("Failed to close client session:", error);
    } finally {
      this.#clientSession = void 0;
    }
    if ("disconnect" in this.#client) {
      try {
        await this.#client.disconnect();
      } catch (error) {
        this.#logger.error("Failed to disconnect client:", error);
      }
    }
    this.#logger.verbose(
      `Disconnected from OPC UA server ${this.#opcuaConfig.endpointUrl}.`
    );
  }
  get #getClientSession() {
    if (!this.#clientSession) {
      throw new Error("No active session.");
    }
    return this.#clientSession;
  }
  async isConnected() {
    return this.#initialized && this.#sessionOpen;
  }
  async readValue(nodeId) {
    let dataValue;
    try {
      dataValue = await this.#getClientSession.read({
        nodeId,
        attributeId: import_node_opcua.AttributeIds.Value
      });
    } catch (error) {
      this.#logger.error("Read error:", error);
      throw error;
    }
    if (dataValue.statusCode === import_node_opcua.StatusCodes.BadNodeIdUnknown) {
      this.#logger.error(`NodeId ${nodeId} is unknown.`);
      return void 0;
    }
    this.#logger.debug(`Read value from ${nodeId}: ${dataValue.toString()}`);
    return dataValue.value.value;
  }
  async callMethod(nodeId, methodName, args) {
    const result = await this.#getClientSession.call({
      objectId: `ns=${this.#namespaceIndex};s=${nodeId}`,
      methodId: `ns=${this.#namespaceIndex};s=${nodeId}.${methodName}`,
      inputArguments: args
    });
    if (!result.outputArguments) {
      return [];
    }
    return result.outputArguments.map((arg) => arg.value);
  }
  async callFromDsl(dsl) {
    const parsed = this.#parseDslWithNamespaceUri(dsl);
    const nsIndex = await this.#resolveNamespaceIndex(parsed.namespaceUri);
    const objectId = parsed.objectNodeId?.replace("ns=0", `ns=${nsIndex}`);
    const methodId = parsed.methodNodeId?.replace("ns=0", `ns=${nsIndex}`);
    this.#logger.verbose(
      `Resolved nxIndex ${nsIndex}, objectId ${objectId} and methodId ${methodId}`
    );
    return new Promise((resolve, reject) => {
      this.#getClientSession.call(
        {
          objectId,
          methodId,
          inputArguments: parsed.inputArguments
        },
        (err, result) => {
          if (err) {
            this.#logger.error("Call failed:", err.message);
            reject(new Error(`Call failed: ${err.message}`));
            return;
          }
          if (!result) {
            this.#logger.warn("No result returned.");
            reject(new Error("No result returned."));
            return;
          }
          if (result.statusCode !== import_node_opcua.StatusCodes.Good) {
            this.#logger.error(`Call failed: ${result.statusCode.name}`);
            reject(new Error(`Call failed: ${result.statusCode.name}`));
            return;
          }
          this.#logger.debug("Call succeeded:", result);
          resolve(result.outputArguments?.map((arg) => arg.value) ?? []);
        }
      );
    });
  }
  async subscribeToNode(nodeId, callback) {
    const subscription = import_node_opcua.ClientSubscription.create(this.#getClientSession, {
      requestedPublishingInterval: 1e3,
      requestedLifetimeCount: 10,
      requestedMaxKeepAliveCount: 5,
      maxNotificationsPerPublish: 10,
      publishingEnabled: true,
      priority: 10
    });
    const monitoredItem = await subscription.monitor(
      { nodeId, attributeId: import_node_opcua.AttributeIds.Value },
      { samplingInterval: 1e3, discardOldest: true, queueSize: 10 },
      import_node_opcua.TimestampsToReturn.Both
    );
    monitoredItem.on("changed", (dataValue) => {
      const { value, statusCode } = dataValue;
      if (statusCode === import_node_opcua.StatusCodes.BadNodeIdUnknown) {
        throw new Error("NodeId is unknown.");
      }
      this.#logger.debug(
        `Subscription update from ${nodeId}: ${value.toString()}`
      );
      callback(nodeId, value.value);
    });
    this.#logger.info(`Subscribed to ${nodeId}`);
  }
  async unsubscribeFromNode(nodeId) {
    const subscription = this.#nodeSubscriptions[nodeId];
    if (!subscription) {
      return;
    }
    await subscription.terminate();
    delete this.#nodeSubscriptions[nodeId];
    this.#logger.debug(`Unsubscribed from ${nodeId}`);
  }
  async browseNode(nodeId, depth = 0) {
    const indentation = " ".repeat(depth * 2);
    try {
      const browseResult = await this.#getClientSession.browse({
        nodeId,
        referenceTypeId: null,
        includeSubtypes: true,
        browseDirection: import_node_opcua.BrowseDirection.Forward,
        resultMask: 63
        // all
      });
      if (browseResult.references?.length === 0 && depth === 0) {
        this.#logger.warn(`${indentation}  No child nodes found.`);
      }
      await Promise.all(
        (browseResult.references ?? []).map(
          (ref) => this.browseNode(ref.nodeId.toString(), depth + 1)
        )
      );
    } catch (error) {
      this.#logger.error(
        `${indentation}Failed to browse node ${nodeId}:`,
        error
      );
    }
  }
  /**
   * Parse DSL like:
   * call nsu=http://bystronic.com/ByVisionCutting/;s=History -> GetRunPartHistory("...", "...", 0, 100)
   */
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  #parseDslWithNamespaceUri(dsl) {
    const callRegex = /^call\s+nsu=([^;]+);(s|i)=([^ ]+)\s*->\s*(s|i)=([^(\s]+)\((.*)\)$/;
    const readRegex = /^read\s+nsu=([^;]+);(s|i)=([^ ]+)$/;
    const callMatch = dsl.match(callRegex);
    if (callMatch) {
      const [
        ,
        namespaceUri,
        objectIdType,
        objectIdValue,
        methodIdType,
        methodIdValue,
        argStr
      ] = callMatch;
      const objectNodeId = `ns=0;${objectIdType}=${objectIdValue}`;
      const methodNodeId = `ns=0;${methodIdType}=${methodIdValue}`;
      const args = argStr.length ? argStr.split(",").map(this.#parseArgument) : [];
      return {
        type: "call",
        namespaceUri,
        objectNodeId,
        methodNodeId,
        inputArguments: args
      };
    }
    const readMatch = dsl.match(readRegex);
    if (readMatch) {
      const [, namespaceUri, nodeIdType, nodeIdValue] = readMatch;
      const nodeId = `ns=0;${nodeIdType}=${nodeIdValue}`;
      return {
        type: "read",
        namespaceUri,
        nodeId
      };
    }
    throw new Error("Invalid DSL format");
  }
  /**
   * Infer the correct OPC UA Variant from a literal string
   */
  #parseArgument(raw) {
    const str = raw.trim();
    const guidRegex = /^[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}$/;
    if (/^".+"$/.test(str)) {
      const val = str.slice(1, -1);
      if (guidRegex.test(val)) {
        return new import_node_opcua.Variant({
          dataType: import_node_opcua.DataType.Guid,
          value: val
        });
      }
      if (/\d{4}-\d{2}-\d{2}T/.test(val)) {
        return new import_node_opcua.Variant({
          dataType: import_node_opcua.DataType.DateTime,
          value: new Date(val)
        });
      }
      return new import_node_opcua.Variant({
        dataType: import_node_opcua.DataType.String,
        value: val
      });
    }
    if (/^\d+$/.test(str)) {
      return new import_node_opcua.Variant({
        dataType: import_node_opcua.DataType.Int32,
        value: parseInt(str, 10)
      });
    }
    if (/^\d+\.\d+$/.test(str)) {
      return new import_node_opcua.Variant({
        dataType: import_node_opcua.DataType.Double,
        value: parseFloat(str)
      });
    }
    if (str === "true" || str === "false") {
      return new import_node_opcua.Variant({
        dataType: import_node_opcua.DataType.Boolean,
        value: str === "true"
      });
    }
    throw new Error(`Unrecognized argument: ${str}`);
  }
  async #resolveNamespaceIndex(namespaceUri) {
    const namespaces = await this.readValue(
      this.#opcuaConfig.namespaceNodeId ?? this.#OPCUA_NAMESPACE_NODE_ID
    );
    this.#logger.verbose("Retrieved namespaces:", namespaces);
    const index = namespaces?.indexOf(namespaceUri);
    if (index === void 0 || index === -1) {
      this.#logger.error("Namespace URI not found:", namespaceUri, namespaces);
      throw new Error("Namespace index not found");
    }
    return index;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  OpcuaClient
});
