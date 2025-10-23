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
var import_prompts = require("@langchain/core/prompts");
var import_runnables = require("@langchain/core/runnables");
var import_openai = require("@langchain/openai");
var import_connector_runtime = require("@transai/connector-runtime");
var import_logger = require("@transai/logger");
var import_kafka_base_service = require("@xip-online-data/kafka-base-service");
var import_output_parsers = require("./output-parsers");
class ConnectorRunnerAiAgent extends import_connector_runtime.ConnectorRuntime {
  constructor(connector, connectorConfig, actionConfigs, injectedLangchainInstance) {
    super(connector, connectorConfig, actionConfigs);
    this.CONNECTOR_INSTANCE = "XOD_CONNECTOR_AI_AGENT_CONFIG";
    this.logger = import_logger.Logger.getInstance();
    this.init = async () => {
      this.logger.debug("Initializing AI Agent Connector Runner");
      if (this.langchainInstance === void 0) {
        this.langchainInstance = new import_openai.ChatOpenAI({
          apiKey: this.config.openai.apiKey,
          modelName: this.config.openai.model || "gpt-3.5-turbo",
          temperature: this.config.openai.temperature || 0,
          timeout: this.config.openai.timeout || 6e4
        });
      }
      const jobCallbackFunction = (callbackFunction) => {
        return async (m) => {
          this.logger.debug("ai-agent connector's job callback function called");
          if (m.type !== "JOB") {
            return callbackFunction(m);
          }
          this.logger.debug(`Received message: ${JSON.stringify(m)}`);
          const message = m;
          let action;
          try {
            action = this.getActionConfig(message);
          } catch (error) {
            if (error instanceof Error) {
              return (0, import_kafka_base_service.BadRequest)(`No action found: ${error.message}`)(message);
            }
            return (0, import_kafka_base_service.BadRequest)("Unknown error occured")(message);
          }
          try {
            const systemPrompt = action.config["systemPrompt"];
            if (!systemPrompt || systemPrompt.trim() === "") {
              return (0, import_kafka_base_service.UnprocessableEntity)("System prompt not found")(message);
            }
            const userPrompt = action.config["userPrompt"];
            if (!userPrompt || userPrompt.trim() === "") {
              return (0, import_kafka_base_service.UnprocessableEntity)("Prompt not found")(message);
            }
            const processedPrompt = this.processPromptTemplate(
              `${systemPrompt}

${userPrompt}`,
              action.inputParameters,
              message.payload
            );
            this.logger.debug(`Processed prompt: ${processedPrompt}`);
            const { outputParameters } = action;
            const outputParser = (0, import_output_parsers.generateOutputParser)(outputParameters);
            const processedInstructions = this.escapeFormatInstructions(
              outputParser.getFormatInstructions()
            );
            this.logger.debug(
              `Processed format instructions: ${processedInstructions}`
            );
            const chain = import_runnables.RunnableSequence.from([
              import_prompts.ChatPromptTemplate.fromTemplate(
                `<system>${processedPrompt}</system>
            <format>${processedInstructions}</format>
            <user>{{question}}</user>`
              ),
              this.langchain,
              outputParser
            ]);
            this.logger.info("Invoking AI agent...");
            const response = await chain.invoke({
              question: action.config["question"] || ""
            });
            this.logger.info(`AI response: ${JSON.stringify(response, null, 2)}`);
            const returnPayload = {
              ...message,
              payload: response
            };
            return callbackFunction(returnPayload);
          } catch (error) {
            if (error instanceof Error) {
              return (0, import_kafka_base_service.InternalServerError)(error.message)(message);
            }
            return (0, import_kafka_base_service.InternalServerError)("Unknown error occured")(message);
          }
        };
      };
      this.callbackFunction = jobCallbackFunction(this.emitEventType((0, import_kafka_base_service.Ok)()));
    };
    this.langchainInstance = injectedLangchainInstance;
  }
  get langchain() {
    if (this.langchainInstance === void 0) {
      throw new Error("Langchain instance not initialized");
    }
    return this.langchainInstance;
  }
  // Escape single curly braces in format instructions within markdown code blocks
  escapeFormatInstructions(instructions) {
    return instructions.replace(
      /```json\n([\s\S]*?)\n```/g,
      (match, jsonContent) => {
        const escapedJson = jsonContent.replace(/{/g, "{{").replace(/}/g, "}}");
        return `\`\`\`json
${escapedJson}
\`\`\``;
      }
    );
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
