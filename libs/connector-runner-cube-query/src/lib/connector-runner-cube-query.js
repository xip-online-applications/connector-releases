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
var connector_runner_cube_query_exports = {};
__export(connector_runner_cube_query_exports, {
  ConnectorRunnerCubeQuery: () => ConnectorRunnerCubeQuery
});
module.exports = __toCommonJS(connector_runner_cube_query_exports);
var import_core = __toESM(require("@cubejs-client/core"));
var import_connector_runtime_sdk = require("@transai/connector-runtime-sdk");
var import_helper_functions = require("@xip-online-data/helper-functions");
var import_httpclient = require("@xip-online-data/httpclient");
var import_kafka_base_service = require("@xip-online-data/kafka-base-service");
class ConnectorRunnerCubeQuery extends import_connector_runtime_sdk.ConnectorRuntimeSDK {
  constructor(connector, connectorSDK) {
    super(connector, connectorSDK);
    this.init = async () => {
      const { config } = this.connectorSDK;
      const { cubeConfig } = config;
      if (!cubeConfig || !cubeConfig.auth0_token_url || !cubeConfig.auth0_client_id || !cubeConfig.auth0_client_secret || !cubeConfig.auth0_audience) {
        throw new Error("Cube config is not valid");
      }
      const cacheService = import_httpclient.HttpServiceBuilder.buildCacheService({});
      const tokenService = import_httpclient.HttpServiceBuilder.buildJwtTokenService(
        {
          tokenUrl: cubeConfig.auth0_token_url,
          clientId: cubeConfig.auth0_client_id,
          clientSecret: cubeConfig.auth0_client_secret,
          audience: cubeConfig.auth0_audience,
          tenantIdentifier: config.tenantIdentifier
        },
        cacheService
      );
      const getAuth0CubeJwtToken = async () => {
        this.#logger.debug(
          `Getting Auth0 Cube JWT Token for tenant ${config.tenantIdentifier}`
        );
        return tokenService.getToken({
          tenantIdentifier: config.tenantIdentifier
        });
      };
      const cubeApi = (0, import_core.default)(getAuth0CubeJwtToken, {
        apiUrl: cubeConfig.apiUrl
      });
      this.callbackFunction = async (message, action) => {
        const config2 = action.config;
        const { payload } = message;
        this.#logger.debug(
          `Received payload for Cube query: ${JSON.stringify(payload)}`
        );
        const payloadKeys = Object.keys(payload);
        if (payload && payloadKeys.length > 0) {
          const parsedQuery = (0, import_helper_functions.replacePlaceholdersInConfig)(
            config2.query,
            payload
          );
          let queryResult;
          try {
            queryResult = await cubeApi.load(parsedQuery);
          } catch (error) {
            let errorMessage = `Error in query ${JSON.stringify(parsedQuery)}`;
            if (error instanceof Error) {
              errorMessage += error.message;
            }
            this.#logger.error(errorMessage);
            return (0, import_kafka_base_service.BadRequest)(errorMessage)(message);
          }
          const result = queryResult.serialize().loadResponse.results;
          this.#logger.info("Cube query executed successfully", result);
          if (result.length > 0) {
            const response = {
              ...message,
              payload: result[0].data.map(import_helper_functions.parseCubeResultToObjects),
              meta: {
                lastRefreshTime: result[0].lastRefreshTime
              }
            };
            return this.connectorSDK.receiver.responses.ok()(response);
          }
          return this.connectorSDK.receiver.responses.badRequest(
            "No results found for given query"
          )({
            ...message,
            meta: {
              query: parsedQuery
            }
          });
        }
        return this.connectorSDK.receiver.responses.badRequest(
          "No parameters for query given."
        )(message);
      };
    };
    this.#logger = this.connectorSDK.logger;
  }
  #logger;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ConnectorRunnerCubeQuery
});
