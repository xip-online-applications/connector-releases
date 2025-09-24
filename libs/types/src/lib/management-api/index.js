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
var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var management_api_exports = {};
__export(management_api_exports, {
  DimensionInterface: () => import_dimension.DimensionInterface,
  DimensionsInterface: () => import_dimensions.DimensionsInterface,
  FilterGroupInterface: () => import_filter_group.FilterGroupInterface,
  MeasureInterface: () => import_measure.MeasureInterface,
  MeasuresInterface: () => import_measures.MeasuresInterface,
  MetaInterface: () => import_meta.MetaInterface,
  PreAggregateInterface: () => import_pre_aggregate.PreAggregateInterface,
  PreAggregationsInterface: () => import_pre_aggregations.PreAggregationsInterface,
  RelationInterface: () => import_relation.RelationInterface,
  RelationsInterface: () => import_relations.RelationsInterface,
  SegmentInterface: () => import_segment.SegmentInterface,
  SegmentsInterface: () => import_segments.SegmentsInterface,
  SwitchInterface: () => import_switch.SwitchInterface,
  TemplateImplementationOverridesInterface: () => import_template_implementation_overrides.TemplateImplementationOverridesInterface,
  WhenItemInterface: () => import_when_item.WhenItemInterface,
  WhenItemsInterface: () => import_when_items.WhenItemsInterface
});
module.exports = __toCommonJS(management_api_exports);
__reExport(management_api_exports, require("./type-enums"), module.exports);
__reExport(management_api_exports, require("./action-definition.interface"), module.exports);
__reExport(management_api_exports, require("./template-implementation.interface"), module.exports);
__reExport(management_api_exports, require("./template.interface"), module.exports);
__reExport(management_api_exports, require("./tenant.interface"), module.exports);
__reExport(management_api_exports, require("./cube-dataset.interface"), module.exports);
__reExport(management_api_exports, require("./event-origin.interface"), module.exports);
__reExport(management_api_exports, require("./workflow"), module.exports);
__reExport(management_api_exports, require("./semantic-trigger"), module.exports);
__reExport(management_api_exports, require("./chart.interface"), module.exports);
__reExport(management_api_exports, require("./dataset/datasets.interface"), module.exports);
__reExport(management_api_exports, require("./dataset/dataset.interface"), module.exports);
__reExport(management_api_exports, require("./dataset/dataset-record.interface"), module.exports);
__reExport(management_api_exports, require("./dataset/collection.interface"), module.exports);
__reExport(management_api_exports, require("./dataset/filters.interface"), module.exports);
__reExport(management_api_exports, require("./dataset/filter.interface"), module.exports);
var import_filter_group = require("./dataset/filter-group.interface");
var import_dimensions = require("./dataset/dimensions.interface");
var import_dimension = require("./dataset/dimension.interface");
var import_segments = require("./dataset/segments.interface");
var import_segment = require("./dataset/segment.interface");
var import_relations = require("./dataset/relations.interface");
var import_relation = require("./dataset/relation.interface");
var import_measures = require("./dataset/measures.interface");
var import_measure = require("./dataset/measure.interface");
var import_switch = require("./dataset/switch.interface");
var import_when_items = require("./dataset/when-items.interface");
var import_when_item = require("./dataset/when-item.interface");
var import_meta = require("./dataset/meta.interface");
var import_pre_aggregations = require("./dataset/pre-aggregations.interface");
var import_pre_aggregate = require("./dataset/pre-aggregate.interface");
var import_template_implementation_overrides = require("./template-implementation-overrides.interface");
__reExport(management_api_exports, require("./pagination"), module.exports);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DimensionInterface,
  DimensionsInterface,
  FilterGroupInterface,
  MeasureInterface,
  MeasuresInterface,
  MetaInterface,
  PreAggregateInterface,
  PreAggregationsInterface,
  RelationInterface,
  RelationsInterface,
  SegmentInterface,
  SegmentsInterface,
  SwitchInterface,
  TemplateImplementationOverridesInterface,
  WhenItemInterface,
  WhenItemsInterface,
  ...require("./type-enums"),
  ...require("./action-definition.interface"),
  ...require("./template-implementation.interface"),
  ...require("./template.interface"),
  ...require("./tenant.interface"),
  ...require("./cube-dataset.interface"),
  ...require("./event-origin.interface"),
  ...require("./workflow"),
  ...require("./semantic-trigger"),
  ...require("./chart.interface"),
  ...require("./dataset/datasets.interface"),
  ...require("./dataset/dataset.interface"),
  ...require("./dataset/dataset-record.interface"),
  ...require("./dataset/collection.interface"),
  ...require("./dataset/filters.interface"),
  ...require("./dataset/filter.interface"),
  ...require("./pagination")
});
//# sourceMappingURL=index.js.map
