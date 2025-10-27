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
var cube_query_helper_exports = {};
__export(cube_query_helper_exports, {
  parseCubeResultToObjects: () => parseCubeResultToObjects
});
module.exports = __toCommonJS(cube_query_helper_exports);
function parseCubeResultToObjects(data) {
  const keys = Object.keys(data);
  const cubes = keys.map((k) => k.split(".")[0]);
  const uniqueCubes = Array.from(new Set(cubes));
  const objects = {};
  uniqueCubes.forEach((cube) => {
    const applicableKeys = keys.filter((k) => k.split(".").length > 1).filter((k) => k.split(".")[0] === cube);
    if (applicableKeys.length === 0) {
      return;
    }
    objects[cube] = {};
    applicableKeys.forEach((k) => {
      const keys2 = k.split(".");
      if (keys2.length === 1) {
        return;
      }
      objects[cube][keys2[1]] = data[k];
    });
  });
  return objects;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  parseCubeResultToObjects
});
//# sourceMappingURL=cube-query-helper.js.map
