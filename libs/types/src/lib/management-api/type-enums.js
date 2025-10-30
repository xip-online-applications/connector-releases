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
var type_enums_exports = {};
__export(type_enums_exports, {
  ConnectorOrigin: () => ConnectorOrigin,
  DatasetTypeEnum: () => DatasetTypeEnum,
  DimensionFormatsEnum: () => DimensionFormatsEnum,
  DimensionTypesEnum: () => DimensionTypesEnum,
  FieldValueType: () => FieldValueType,
  FilterGroupTypesEnum: () => FilterGroupTypesEnum,
  FilterOperatorsEnum: () => FilterOperatorsEnum,
  FilterValueType: () => FilterValueType,
  MeasureFormatsEnum: () => MeasureFormatsEnum,
  MeasureTypesEnum: () => MeasureTypesEnum,
  RelationTypesEnum: () => RelationTypesEnum,
  SemanticTriggerFilterOperatorsEnum: () => SemanticTriggerFilterOperatorsEnum
});
module.exports = __toCommonJS(type_enums_exports);
var import_zod = require("zod");
var DatasetTypeEnum = /* @__PURE__ */ ((DatasetTypeEnum2) => {
  DatasetTypeEnum2["documents"] = "documents";
  DatasetTypeEnum2["metrics"] = "metrics";
  DatasetTypeEnum2["events"] = "events";
  return DatasetTypeEnum2;
})(DatasetTypeEnum || {});
var FilterOperatorsEnum = /* @__PURE__ */ ((FilterOperatorsEnum2) => {
  FilterOperatorsEnum2["equals"] = "=";
  FilterOperatorsEnum2["notEquals"] = "<>";
  FilterOperatorsEnum2["greaterThan"] = ">";
  FilterOperatorsEnum2["greaterThanOrEqual"] = ">=";
  FilterOperatorsEnum2["lessThan"] = "<";
  FilterOperatorsEnum2["lessThanOrEqual"] = "<=";
  FilterOperatorsEnum2["in"] = "IN";
  return FilterOperatorsEnum2;
})(FilterOperatorsEnum || {});
const FilterValueType = import_zod.z.union([
  import_zod.z.string().min(1),
  import_zod.z.number(),
  import_zod.z.boolean(),
  import_zod.z.array(import_zod.z.union([import_zod.z.string().min(1), import_zod.z.number(), import_zod.z.boolean()])).min(1)
]);
var FilterGroupTypesEnum = /* @__PURE__ */ ((FilterGroupTypesEnum2) => {
  FilterGroupTypesEnum2["and"] = "AND";
  FilterGroupTypesEnum2["or"] = "OR";
  return FilterGroupTypesEnum2;
})(FilterGroupTypesEnum || {});
const FieldValueType = import_zod.z.union([
  import_zod.z.string().min(1),
  import_zod.z.array(import_zod.z.string().min(1)).min(1)
]);
var DimensionTypesEnum = /* @__PURE__ */ ((DimensionTypesEnum2) => {
  DimensionTypesEnum2["string"] = "string";
  DimensionTypesEnum2["number"] = "number";
  DimensionTypesEnum2["boolean"] = "boolean";
  DimensionTypesEnum2["time"] = "time";
  return DimensionTypesEnum2;
})(DimensionTypesEnum || {});
var DimensionFormatsEnum = /* @__PURE__ */ ((DimensionFormatsEnum2) => {
  DimensionFormatsEnum2["id"] = "image_url";
  DimensionFormatsEnum2["imageUrl"] = "image_url";
  DimensionFormatsEnum2["link"] = "link";
  DimensionFormatsEnum2["percent"] = "percent";
  DimensionFormatsEnum2["currency"] = "currency";
  return DimensionFormatsEnum2;
})(DimensionFormatsEnum || {});
var RelationTypesEnum = /* @__PURE__ */ ((RelationTypesEnum2) => {
  RelationTypesEnum2["oneToOne"] = "one_to_one";
  RelationTypesEnum2["oneToMany"] = "one_to_many";
  RelationTypesEnum2["manyToOne"] = "many_to_one";
  RelationTypesEnum2["manyToMany"] = "many_to_many";
  return RelationTypesEnum2;
})(RelationTypesEnum || {});
var MeasureTypesEnum = /* @__PURE__ */ ((MeasureTypesEnum2) => {
  MeasureTypesEnum2["count"] = "count";
  MeasureTypesEnum2["countDistinct"] = "count_distinct";
  MeasureTypesEnum2["countDistinctApprox"] = "count_distinct_approx";
  MeasureTypesEnum2["sum"] = "sum";
  MeasureTypesEnum2["avg"] = "avg";
  MeasureTypesEnum2["min"] = "min";
  MeasureTypesEnum2["max"] = "max";
  MeasureTypesEnum2["string"] = "string";
  MeasureTypesEnum2["time"] = "time";
  MeasureTypesEnum2["boolean"] = "boolean";
  MeasureTypesEnum2["number"] = "number";
  return MeasureTypesEnum2;
})(MeasureTypesEnum || {});
var MeasureFormatsEnum = /* @__PURE__ */ ((MeasureFormatsEnum2) => {
  MeasureFormatsEnum2["percent"] = "percent";
  MeasureFormatsEnum2["currency"] = "currency";
  return MeasureFormatsEnum2;
})(MeasureFormatsEnum || {});
var SemanticTriggerFilterOperatorsEnum = /* @__PURE__ */ ((SemanticTriggerFilterOperatorsEnum2) => {
  SemanticTriggerFilterOperatorsEnum2["equals"] = "equals";
  SemanticTriggerFilterOperatorsEnum2["notEquals"] = "notEquals";
  SemanticTriggerFilterOperatorsEnum2["contains"] = "contains";
  SemanticTriggerFilterOperatorsEnum2["notContains"] = "notContains";
  SemanticTriggerFilterOperatorsEnum2["startsWith"] = "startsWith";
  SemanticTriggerFilterOperatorsEnum2["notStartsWith"] = "notStartsWith";
  SemanticTriggerFilterOperatorsEnum2["endsWith"] = "endsWith";
  SemanticTriggerFilterOperatorsEnum2["notEndsWith"] = "notEndsWith";
  SemanticTriggerFilterOperatorsEnum2["gt"] = "gt";
  SemanticTriggerFilterOperatorsEnum2["gte"] = "gte";
  SemanticTriggerFilterOperatorsEnum2["lt"] = "lt";
  SemanticTriggerFilterOperatorsEnum2["lte"] = "lte";
  SemanticTriggerFilterOperatorsEnum2["set"] = "set";
  SemanticTriggerFilterOperatorsEnum2["notSet"] = "notSet";
  SemanticTriggerFilterOperatorsEnum2["inDateRange"] = "inDateRange";
  SemanticTriggerFilterOperatorsEnum2["notInDateRange"] = "notInDateRange";
  SemanticTriggerFilterOperatorsEnum2["beforeDate"] = "beforeDate";
  SemanticTriggerFilterOperatorsEnum2["beforeOrOnDate"] = "beforeOrOnDate";
  SemanticTriggerFilterOperatorsEnum2["afterDate"] = "afterDate";
  SemanticTriggerFilterOperatorsEnum2["afterOrOnDate"] = "afterOrOnDate";
  return SemanticTriggerFilterOperatorsEnum2;
})(SemanticTriggerFilterOperatorsEnum || {});
var ConnectorOrigin = /* @__PURE__ */ ((ConnectorOrigin2) => {
  ConnectorOrigin2["from_template"] = "from_template";
  ConnectorOrigin2["manual"] = "manual";
  return ConnectorOrigin2;
})(ConnectorOrigin || {});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ConnectorOrigin,
  DatasetTypeEnum,
  DimensionFormatsEnum,
  DimensionTypesEnum,
  FieldValueType,
  FilterGroupTypesEnum,
  FilterOperatorsEnum,
  FilterValueType,
  MeasureFormatsEnum,
  MeasureTypesEnum,
  RelationTypesEnum,
  SemanticTriggerFilterOperatorsEnum
});
//# sourceMappingURL=type-enums.js.map
