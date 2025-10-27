var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var src_exports = {};
module.exports = __toCommonJS(src_exports);
__reExport(src_exports, require("./lib/kafka-base.service"), module.exports);
__reExport(src_exports, require("./lib/rdkafka-base.service"), module.exports);
__reExport(src_exports, require("./lib/kafka-source.interface"), module.exports);
__reExport(src_exports, require("./lib/kafka-source.service"), module.exports);
__reExport(src_exports, require("./lib/rdkafka-source.service"), module.exports);
__reExport(src_exports, require("./lib/kafka-bulk-listener.service"), module.exports);
__reExport(src_exports, require("./lib/rdkafka-bulk-listener.service"), module.exports);
__reExport(src_exports, require("./lib/rdkafka-logs.service"), module.exports);
__reExport(src_exports, require("./lib/types"), module.exports);
__reExport(src_exports, require("./lib/factories"), module.exports);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ...require("./lib/kafka-base.service"),
  ...require("./lib/rdkafka-base.service"),
  ...require("./lib/kafka-source.interface"),
  ...require("./lib/kafka-source.service"),
  ...require("./lib/rdkafka-source.service"),
  ...require("./lib/kafka-bulk-listener.service"),
  ...require("./lib/rdkafka-bulk-listener.service"),
  ...require("./lib/rdkafka-logs.service"),
  ...require("./lib/types"),
  ...require("./lib/factories")
});
//# sourceMappingURL=index.js.map
