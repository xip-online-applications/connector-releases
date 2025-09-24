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
var segment_interface_exports = {};
__export(segment_interface_exports, {
  SegmentSchema: () => SegmentSchema
});
module.exports = __toCommonJS(segment_interface_exports);
var import_zod = require("zod");
var import_filter = require("./filter.interface");
const SegmentSchema = import_zod.z.intersection(
  import_filter.FilterSchema,
  import_zod.z.object({
    name: import_zod.z.string().min(1).optional(),
    description: import_zod.z.string().min(1).optional(),
    public: import_zod.z.boolean().optional()
  })
);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  SegmentSchema
});
//# sourceMappingURL=segment.interface.js.map
