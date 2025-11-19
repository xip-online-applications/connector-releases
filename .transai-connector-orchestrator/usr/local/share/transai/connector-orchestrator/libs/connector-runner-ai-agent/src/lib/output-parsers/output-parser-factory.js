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
var output_parser_factory_exports = {};
__export(output_parser_factory_exports, {
  generateOutputParser: () => generateOutputParser,
  parseParametersToZod: () => parseParametersToZod,
  parseSchemaToZod: () => parseSchemaToZod
});
module.exports = __toCommonJS(output_parser_factory_exports);
var import_zod = require("zod");
const generateOutputParser = (outputParameters) => {
  const properties = {};
  const required = [];
  Object.entries(outputParameters).forEach(([key, value]) => {
    const { required: isRequired, ...propertySchema } = value;
    properties[key] = propertySchema;
    if (isRequired === true) {
      required.push(key);
    }
  });
  return {
    type: "object",
    properties,
    required
  };
};
const toCamelCase = (str) => {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};
const parseSchemaToZod = (schemaObject) => {
  const { properties = {}, required = [] } = schemaObject;
  const zodSchema = {};
  Object.entries(properties).forEach(([key, property]) => {
    const camelKey = toCamelCase(key);
    let zodField;
    if (property.type === "string") {
      if (property.enum) {
        zodField = import_zod.z.enum(property.enum);
      } else {
        zodField = import_zod.z.string();
      }
    } else if (property.type === "number" || property.type === "integer") {
      zodField = import_zod.z.number();
      if (property.minimum !== void 0) {
        zodField = zodField.min(property.minimum);
      }
      if (property.maximum !== void 0) {
        zodField = zodField.max(property.maximum);
      }
    } else if (property.type === "array") {
      if (property.items?.type === "string") {
        zodField = import_zod.z.array(import_zod.z.string());
      } else if (property.items?.type === "number" || property.items?.type === "integer") {
        zodField = import_zod.z.array(import_zod.z.number());
      } else {
        zodField = import_zod.z.array(import_zod.z.any());
      }
    } else if (Array.isArray(property.type)) {
      if (property.type.includes("null") && property.type.length === 2) {
        const nonNullType = property.type.find((t) => t !== "null");
        if (nonNullType === "integer" || nonNullType === "number") {
          zodField = import_zod.z.number();
          if (property.minimum !== void 0) {
            zodField = zodField.min(property.minimum);
          }
          if (property.maximum !== void 0) {
            zodField = zodField.max(property.maximum);
          }
        } else if (nonNullType === "string") {
          zodField = import_zod.z.string();
        } else {
          zodField = import_zod.z.any();
        }
      } else {
        zodField = import_zod.z.any();
      }
    } else {
      zodField = import_zod.z.any();
    }
    if (property.description) {
      zodField = zodField.describe(property.description);
    }
    if (!required.includes(key)) {
      zodField = zodField.optional();
    }
    zodSchema[camelKey] = zodField;
  });
  return import_zod.z.object(zodSchema);
};
const createZodFieldFromSchema = (propertySchema) => {
  let zodField;
  if (Array.isArray(propertySchema.type)) {
    if (propertySchema.type.includes("null") && propertySchema.type.length === 2) {
      const nonNullType = propertySchema.type.find((t) => t !== "null");
      if (nonNullType === "integer" || nonNullType === "number") {
        zodField = import_zod.z.number();
        if (propertySchema.minimum !== void 0) {
          zodField = zodField.min(propertySchema.minimum);
        }
        if (propertySchema.maximum !== void 0) {
          zodField = zodField.max(propertySchema.maximum);
        }
      } else if (nonNullType === "string") {
        zodField = import_zod.z.string();
      } else {
        zodField = import_zod.z.any();
      }
      zodField = zodField.nullable();
    } else {
      zodField = import_zod.z.any();
    }
  } else if (propertySchema.type === "string") {
    if (propertySchema.enum) {
      zodField = import_zod.z.enum(propertySchema.enum);
    } else {
      zodField = import_zod.z.string();
    }
  } else if (propertySchema.type === "number" || propertySchema.type === "integer") {
    zodField = import_zod.z.number();
    if (propertySchema.minimum !== void 0) {
      zodField = zodField.min(propertySchema.minimum);
    }
    if (propertySchema.maximum !== void 0) {
      zodField = zodField.max(propertySchema.maximum);
    }
  } else if (propertySchema.type === "object") {
    if (propertySchema.properties) {
      const nestedSchema = {};
      Object.entries(propertySchema.properties).forEach(
        ([nestedKey, nestedProperty]) => {
          const camelNestedKey = toCamelCase(nestedKey);
          nestedSchema[camelNestedKey] = createZodFieldFromSchema(nestedProperty);
          if (nestedProperty.description) {
            nestedSchema[camelNestedKey] = nestedSchema[camelNestedKey].describe(nestedProperty.description);
          }
        }
      );
      zodField = import_zod.z.object(nestedSchema);
    } else {
      zodField = import_zod.z.object({});
    }
  } else if (propertySchema.type === "array") {
    if (propertySchema.items?.type === "string") {
      zodField = import_zod.z.array(import_zod.z.string());
    } else if (propertySchema.items?.type === "number" || propertySchema.items?.type === "integer") {
      zodField = import_zod.z.array(import_zod.z.number());
    } else if (propertySchema.items?.type === "object") {
      const itemSchema = createZodFieldFromSchema(propertySchema.items);
      zodField = import_zod.z.array(itemSchema);
    } else if (Array.isArray(propertySchema.items?.type)) {
      const itemSchema = createZodFieldFromSchema(propertySchema.items);
      zodField = import_zod.z.array(itemSchema);
    } else {
      zodField = import_zod.z.array(import_zod.z.any());
    }
  } else {
    zodField = import_zod.z.any();
  }
  return zodField;
};
const parseParametersToZod = (parametersObject) => {
  const zodSchema = {};
  Object.entries(parametersObject).forEach(([key, property]) => {
    const camelKey = toCamelCase(key);
    const { required: isRequired, ...propertySchema } = property;
    let zodField = createZodFieldFromSchema(propertySchema);
    if (propertySchema.description) {
      zodField = zodField.describe(propertySchema.description);
    }
    if (isRequired !== true) {
      zodField = zodField.nullable();
    }
    zodSchema[camelKey] = zodField;
  });
  return import_zod.z.object(zodSchema);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  generateOutputParser,
  parseParametersToZod,
  parseSchemaToZod
});
