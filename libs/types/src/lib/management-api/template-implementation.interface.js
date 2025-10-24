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
var template_implementation_interface_exports = {};
__export(template_implementation_interface_exports, {
  TemplateImplementationCreateSchema: () => TemplateImplementationCreateSchema,
  TemplateImplementationSchema: () => TemplateImplementationSchema
});
module.exports = __toCommonJS(template_implementation_interface_exports);
var import_zod = require("zod");
var import_template_implementation_overrides = require("./template-implementation-overrides.interface");
const TemplateImplementationSchema = import_zod.z.object({
  templateVersion: import_zod.z.literal("latest").or(import_zod.z.string().min(1)),
  name: import_zod.z.string().min(1),
  description: import_zod.z.string().min(1),
  overrides: import_template_implementation_overrides.TemplateImplementationOverridesSchema
});
const TemplateImplementationCreateSchema = TemplateImplementationSchema.extend({
  templateId: import_zod.z.string().min(1),
  tenantId: import_zod.z.string().min(1)
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  TemplateImplementationCreateSchema,
  TemplateImplementationSchema
});
//# sourceMappingURL=template-implementation.interface.js.map
