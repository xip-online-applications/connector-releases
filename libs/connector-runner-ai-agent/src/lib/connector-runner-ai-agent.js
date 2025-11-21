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
var connector_runner_ai_agent_exports = {};
__export(connector_runner_ai_agent_exports, {
  ConnectorRunnerAiAgent: () => ConnectorRunnerAiAgent
});
module.exports = __toCommonJS(connector_runner_ai_agent_exports);
var import_openai = require("@langchain/openai");
var import_connector_runtime_sdk = require("@transai/connector-runtime-sdk");
var import_langchain = require("langchain");
var import_output_parsers = require("./output-parsers");
class ConnectorRunnerAiAgent extends import_connector_runtime_sdk.ConnectorRuntimeSDK {
  constructor(connector, connectorSDK, injectedLangchainInstance) {
    super(connector, connectorSDK);
    this.CONNECTOR_INSTANCE = "XOD_CONNECTOR_AI_AGENT_CONFIG";
    this.init = async () => {
      this.#logger.debug("Initializing AI Agent Connector Runner");
      this.callbackFunction = async (message, action) => {
        const debugMessageInterval = setInterval(() => {
          this.#logger.debug(
            `AI agent still processing for message ID: ${message.eventId}`
          );
        }, 1e4);
        const clearDebugInterval = () => clearInterval(debugMessageInterval);
        const systemPrompt = action.config["systemPrompt"];
        if (!systemPrompt || systemPrompt.trim() === "") {
          clearDebugInterval();
          return this.connectorSDK.receiver.responses.unprocessableEntity(
            "System prompt not found"
          )(message);
        }
        const userPrompt = action.config["userPrompt"];
        if (!userPrompt || userPrompt.trim() === "") {
          clearDebugInterval();
          return this.connectorSDK.receiver.responses.unprocessableEntity(
            "Prompt not found"
          )(message);
        }
        const processedSystemPrompt = this.processPromptTemplate(
          systemPrompt,
          action.inputParameters,
          message.payload
        );
        const processedUserPrompt = this.processPromptTemplate(
          userPrompt,
          action.inputParameters,
          message.payload
        );
        const outputSchema = (0, import_output_parsers.parseParametersToZod)(
          action.outputParameters
        );
        this.connectorSDK.telemetry.gauge(
          "ai_agent.invocation.system_prompt_length",
          processedSystemPrompt.length
        );
        this.connectorSDK.telemetry.gauge(
          "ai_agent.invocation.user_prompt_length",
          processedUserPrompt.length
        );
        const llm = (0, import_langchain.createAgent)({
          model: this.langchain,
          responseFormat: outputSchema,
          systemPrompt: processedSystemPrompt,
          tools: [],
          middleware: [this.#langchainLoggingMiddleware]
        });
        try {
          this.#logger.debug("Invoking AI agent...");
          const response = await llm.invoke({
            messages: [new import_langchain.HumanMessage(processedUserPrompt)]
          });
          this.connectorSDK.telemetry.increment("ai_agent.invocation.success");
          this.connectorSDK.telemetry.gauge(
            "ai_agent.invocation.response_messages_length",
            response.messages.length
          );
          this.#logger.info("AI agent invoked successfully.");
          const returnPayload = {
            ...message,
            payload: {
              ...response.structuredResponse
            }
          };
          return this.connectorSDK.receiver.responses.ok()(returnPayload);
        } catch (error) {
          this.#logger.error(`Error processing AI agent request: ${error}`);
          return this.connectorSDK.receiver.responses.internalServerError(
            `Error processing AI agent request: ${error}`
          )(message);
        } finally {
          clearDebugInterval();
        }
      };
    };
    this.#openAISettings = this.connectorSDK.config.openai;
    this.#logger = this.connectorSDK.logger;
    this.#logger.debug(
      `Initializing AI Agent Connector Runner with model: ${this.#openAISettings.model}`
    );
    this.#langchainInstance = injectedLangchainInstance ?? new import_openai.ChatOpenAI({
      apiKey: this.#openAISettings.apiKey,
      model: this.#openAISettings.model || "gpt-4.1-mini",
      temperature: this.#openAISettings.temperature || 1,
      timeout: this.#openAISettings.timeout || 6e4
    });
    this.#langchainLoggingMiddleware = (0, import_langchain.createMiddleware)({
      name: "LoggingMiddleware",
      beforeModel: (state) => {
        this.#logger.debug(
          `Invoking model: ${state.messages[state.messages.length - 1].text.slice(0, 100)}...`
        );
      },
      afterModel: (state) => {
        this.#logger.debug(
          `Model invocation completed: ${state.messages[state.messages.length - 1].text.slice(0, 100)}...`
        );
      }
    });
  }
  #logger;
  #openAISettings;
  #langchainInstance;
  #langchainLoggingMiddleware;
  get langchain() {
    if (this.#langchainInstance === void 0) {
      throw new Error("Langchain instance not initialized");
    }
    return this.#langchainInstance;
  }
  // Template processing with inputParameters
  processPromptTemplate(template, inputParams, payload) {
    let processed = template;
    inputParams.forEach((param) => {
      const value = payload[param.name];
      processed = processed.replace(
        new RegExp(`\\{\\{inputs\\.${param.name}\\}\\}`, "g"),
        value
      );
    });
    return processed;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ConnectorRunnerAiAgent
});
