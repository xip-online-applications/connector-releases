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
var filters_interface_exports = {};
__export(filters_interface_exports, {
  FiltersSchema: () => FiltersSchema
});
module.exports = __toCommonJS(filters_interface_exports);
var import_zod = require("zod");
var import_filter_group = require("./filter-group.interface");
var import_filter = require("./filter.interface");
const FiltersSchema = import_zod.z.record(
  import_zod.z.union([import_zod.z.lazy(() => import_filter_group.FilterGroupSchema), import_filter.FilterSchema, import_zod.z.literal(false)])
);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  FiltersSchema
});
//# sourceMappingURL=filters.interface.js.map
