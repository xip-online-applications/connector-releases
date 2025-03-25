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
  ChartInterface: () => import_chart.ChartInterface,
  CollectionInterface: () => import_collection.CollectionInterface,
  DatasetInterface: () => import_dataset.DatasetInterface,
  DatasetRecordInterface: () => import_dataset_record.DatasetRecordInterface,
  DatasetsInterface: () => import_datasets.DatasetsInterface,
  DimensionInterface: () => import_dimension.DimensionInterface,
  DimensionsInterface: () => import_dimensions.DimensionsInterface,
  FilterGroupInterface: () => import_filter_group.FilterGroupInterface,
  FilterInterface: () => import_filter.FilterInterface,
  FiltersInterface: () => import_filters.FiltersInterface,
  MeasureInterface: () => import_measure.MeasureInterface,
  MeasuresInterface: () => import_measures.MeasuresInterface,
  MetaInterface: () => import_meta.MetaInterface,
  PreAggregateInterface: () => import_pre_aggregate.PreAggregateInterface,
  PreAggregationsInterface: () => import_pre_aggregations.PreAggregationsInterface,
  RelationInterface: () => import_relation.RelationInterface,
  RelationsInterface: () => import_relations.RelationsInterface,
  SegmentInterface: () => import_segment.SegmentInterface,
  SegmentsInterface: () => import_segments.SegmentsInterface,
  SemanticTriggerFilterInterface: () => import_semantic_trigger_filter.SemanticTriggerFilterInterface,
  SemanticTriggerFiltersInterface: () => import_semantic_trigger_filters.SemanticTriggerFiltersInterface,
  SemanticTriggerInterface: () => import_semantic_trigger.SemanticTriggerInterface,
  SemanticTriggerRecordInterface: () => import_semantic_trigger_record.SemanticTriggerRecordInterface,
  SemanticTriggersInterface: () => import_semantic_triggers.SemanticTriggersInterface,
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
var import_chart = require("./chart.interface");
var import_datasets = require("./dataset/datasets.interface");
var import_dataset = require("./dataset/dataset.interface");
var import_dataset_record = require("./dataset/dataset-record.interface");
var import_collection = require("./dataset/collection.interface");
var import_filters = require("./dataset/filters.interface");
var import_filter = require("./dataset/filter.interface");
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
var import_semantic_triggers = require("./semantic-trigger/semantic-triggers.interface");
var import_semantic_trigger = require("./semantic-trigger/semantic-trigger.interface");
var import_semantic_trigger_record = require("./semantic-trigger/semantic-trigger-record.interface");
var import_semantic_trigger_filters = require("./semantic-trigger/semantic-trigger-filters.interface");
var import_semantic_trigger_filter = require("./semantic-trigger/semantic-trigger-filter.interface");
var import_template_implementation_overrides = require("./template-implementation-overrides.interface");
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ChartInterface,
  CollectionInterface,
  DatasetInterface,
  DatasetRecordInterface,
  DatasetsInterface,
  DimensionInterface,
  DimensionsInterface,
  FilterGroupInterface,
  FilterInterface,
  FiltersInterface,
  MeasureInterface,
  MeasuresInterface,
  MetaInterface,
  PreAggregateInterface,
  PreAggregationsInterface,
  RelationInterface,
  RelationsInterface,
  SegmentInterface,
  SegmentsInterface,
  SemanticTriggerFilterInterface,
  SemanticTriggerFiltersInterface,
  SemanticTriggerInterface,
  SemanticTriggerRecordInterface,
  SemanticTriggersInterface,
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
  ...require("./workflow")
});
