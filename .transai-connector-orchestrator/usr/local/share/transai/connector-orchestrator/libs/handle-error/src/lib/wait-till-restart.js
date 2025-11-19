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
var wait_till_restart_exports = {};
__export(wait_till_restart_exports, {
  waitTillRestart: () => waitTillRestart
});
module.exports = __toCommonJS(wait_till_restart_exports);
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function waitTillRestart(message, error = void 0) {
  console.log("Wait till restart;", message);
  if (error) {
    console.error(error);
  }
  while (true) {
    await sleep(5 * 60 * 1e3);
    console.log("Wait till restart;", message);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  waitTillRestart
});
