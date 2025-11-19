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
var generic_filter_dto_exports = {};
__export(generic_filter_dto_exports, {
  FilterOperator: () => FilterOperator,
  SortDirection: () => SortDirection
});
module.exports = __toCommonJS(generic_filter_dto_exports);
const FilterOperator = {
  EQ: "eq",
  NEQ: "neq",
  CONTAINS: "ct",
  NOT_CONTAINS: "nct",
  STARTSWITH: "sw",
  ENDSWITH: "ew",
  NOT_STARTSWITH: "nsw",
  NOT_ENDSWITH: "new",
  BETWEEN: "bt",
  LT: "lt",
  LTE: "lte",
  GT: "gt",
  GTE: "gte",
  IN: "in",
  NOT_IN: "nin",
  LIKE: "like"
};
const SortDirection = {
  ASC: "asc",
  DESC: "desc"
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  FilterOperator,
  SortDirection
});
