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
var redis_message_monitor_exports = {};
__export(redis_message_monitor_exports, {
  RedisMessageMonitor: () => RedisMessageMonitor
});
module.exports = __toCommonJS(redis_message_monitor_exports);
var import_redis = require("redis");
var import_logger = require("@transai/logger");
var import_abstract = require("./abstract.message-monitor");
class RedisMessageMonitor extends import_abstract.AbstractMessageMonitor {
  constructor(config, baseConfig) {
    super(baseConfig);
    this.config = config;
    this.redisClient = void 0;
    this.initialized = false;
    this.DEFAULT_TTL = 2 * 60 * 60;
    (0, import_redis.createClient)({
      url: this.config.url
    }).on(
      "error",
      (err) => import_logger.Logger.getInstance().error(
        "[REDIS MESSAGE MONITOR] Redis Client Error",
        err
      )
    ).connect().then((client) => {
      this.redisClient = client;
      this.initialized = true;
    });
  }
  async isProcessed(message) {
    if (this.redisClient === void 0 || !this.initialized) {
      import_logger.Logger.getInstance().error(
        "[REDIS MESSAGE MONITOR] Not initialized. continue to handle message"
      );
      return false;
    }
    return await this.redisClient.exists(
      this.getMessageProcessIdentifier(message)
    ) === 1;
  }
  async addProcessedMessage(message) {
    if (this.redisClient === void 0 || !this.initialized) {
      import_logger.Logger.getInstance().error(
        "[REDIS MESSAGE MONITOR] Not initialized. Cannot store message details"
      );
      return;
    }
    await this.redisClient.set(this.getMessageProcessIdentifier(message), "1", {
      EX: this.config.ttl ?? this.DEFAULT_TTL
    });
  }
  getMessageProcessIdentifier(message) {
    return `${this.baseConfig.processIdentifier}.${message.eventId}`;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  RedisMessageMonitor
});
//# sourceMappingURL=redis.message-monitor.js.map
