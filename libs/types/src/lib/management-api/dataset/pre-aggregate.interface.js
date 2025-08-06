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
var pre_aggregate_interface_exports = {};
__export(pre_aggregate_interface_exports, {
  PreAggregateSchema: () => PreAggregateSchema
});
module.exports = __toCommonJS(pre_aggregate_interface_exports);
var import_zod = require("zod");
const PreAggregateSchema = import_zod.z.object({
  type: import_zod.z.enum(["rollup", "original_sql", "rollup_join"]).optional(),
  measures: import_zod.z.array(import_zod.z.string()).optional(),
  dimensions: import_zod.z.array(import_zod.z.string()).optional(),
  segments: import_zod.z.array(import_zod.z.string()).optional(),
  timeDimension: import_zod.z.string().optional(),
  granularity: import_zod.z.string().optional(),
  partitionGranularity: import_zod.z.string().optional(),
  rollups: import_zod.z.array(import_zod.z.string()).optional(),
  refreshKeySql: import_zod.z.string().optional(),
  refreshKeyEvery: import_zod.z.string().optional(),
  refreshKeyIncremental: import_zod.z.boolean().optional(),
  refreshKeyUpdateWindow: import_zod.z.string().optional(),
  buildRangeStartSql: import_zod.z.string().optional(),
  buildRangeEndSql: import_zod.z.string().optional(),
  lambda: import_zod.z.boolean().optional()
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  PreAggregateSchema
});
//# sourceMappingURL=pre-aggregate.interface.js.map
