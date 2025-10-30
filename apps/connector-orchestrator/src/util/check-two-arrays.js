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
var check_two_arrays_exports = {};
__export(check_two_arrays_exports, {
  checkTwoArrays: () => checkTwoArrays
});
module.exports = __toCommonJS(check_two_arrays_exports);
function checkTwoArrays(datasetA, datasetB) {
  const onlyInA = [];
  const onlyInB = [];
  const inBoth = [];
  datasetA.forEach((itemA) => {
    const itemB = datasetB.find(
      (b) => b.identifier === itemA.identifier && b.connectorType === itemA.connectorType && new Date(b.updatedAt).getTime() === new Date(itemA.updatedAt).getTime()
    );
    if (itemB) {
      inBoth.push(itemA);
    } else {
      onlyInA.push(itemA);
    }
  });
  datasetB.forEach((itemB) => {
    const itemA = datasetA.find(
      (a) => a.identifier === itemB.identifier && a.connectorType === itemB.connectorType && new Date(a.updatedAt).getTime() === new Date(itemB.updatedAt).getTime()
    );
    if (!itemA) {
      onlyInB.push(itemB);
    }
  });
  return { onlyInA, onlyInB, inBoth };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  checkTwoArrays
});
