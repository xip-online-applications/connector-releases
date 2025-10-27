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
var filter_group_interface_exports = {};
__export(filter_group_interface_exports, {
  FilterGroupSchema: () => FilterGroupSchema
});
module.exports = __toCommonJS(filter_group_interface_exports);
var import_zod = require("zod");
var import_filters = require("./filters.interface");
var import_type_enums = require("../type-enums");
const FilterGroupSchema = import_zod.z.lazy(
  () => import_zod.z.object({
    type: import_zod.z.nativeEnum(import_type_enums.FilterGroupTypesEnum),
    filters: import_filters.FiltersSchema
  })
);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  FilterGroupSchema
});
//# sourceMappingURL=filter-group.interface.js.map
