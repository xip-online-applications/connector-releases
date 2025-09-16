var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var asyncHelpers_exports = {};
__export(asyncHelpers_exports, {
  wrapAsync: () => wrapAsync
});
module.exports = __toCommonJS(asyncHelpers_exports);
var import_handlebars = __toESM(require("handlebars"));
function wrapAsync(hbs = import_handlebars.default, debug = false) {
  const P = Promise;
  const MARK = "";
  hbs.__ASYNC_WRAPPED__ = true;
  const origCompile = hbs.compile.bind(hbs);
  const origTemplate = hbs.template?.bind(hbs);
  const origRegisterHelper = hbs.registerHelper.bind(hbs);
  const origCreate = hbs.create?.bind(hbs);
  if (debug)
    console.log("[wrapAsync] patching Handlebars\u2026");
  function wrapHelper(fn) {
    return function wrappedHelper(...args) {
      const val = fn.apply(this, args);
      const isThenable = !!val && typeof val.then === "function";
      if (!isThenable)
        return val;
      const maybeOpts = args[args.length - 1];
      const ctx = maybeOpts && typeof maybeOpts === "object" && maybeOpts.data ? maybeOpts.data.__ASYNC_CTX__ : void 0;
      if (!ctx) {
        if (debug)
          console.warn("[wrapAsync] async helper without ctx");
        return String(val);
      }
      const id = String(ctx.promises.length);
      ctx.promises.push(P.resolve(val));
      return `${MARK}${id}${MARK}`;
    };
  }
  hbs.registerHelper = (nameOrMap, helper) => {
    if (typeof nameOrMap === "string" && helper) {
      if (debug)
        console.log(`[wrapAsync] wrapping helper "${nameOrMap}"`);
      origRegisterHelper(nameOrMap, wrapHelper(helper));
      return;
    }
    if (typeof nameOrMap === "object" && !helper) {
      const map = nameOrMap;
      const wrapped = {};
      for (const [n, fn] of Object.entries(map)) {
        if (debug)
          console.log(`[wrapAsync] wrapping helper "${n}" (map)`);
        wrapped[n] = wrapHelper(fn);
      }
      origRegisterHelper(wrapped);
      return;
    }
    throw new Error("Unsupported registerHelper call signature");
  };
  function renderWithAsync(fn, data) {
    const ctx = { promises: [] };
    const hbsData = import_handlebars.default.createFrame(data && data.data || {});
    hbsData.__ASYNC_CTX__ = ctx;
    const out0 = fn(data, { data: hbsData });
    const toPromise = (v) => v && typeof v.then === "function" ? Promise.resolve(v) : Promise.resolve(v);
    return toPromise(out0).then((out1) => {
      if (ctx.promises.length === 0) {
        if (debug)
          console.log("[wrapAsync] no async helpers, returning out1");
        return String(out1);
      }
      if (debug) {
        console.log("[wrapAsync] awaiting", ctx.promises.length, "promises");
        console.log("[wrapAsync] first pass out (raw):", String(out1));
      }
      return Promise.all(ctx.promises).then((results) => {
        let s = String(out1);
        s = s.replace(/\u0001(\d+)\u0001/g, (_m, idxStr) => {
          const r = results[Number(idxStr)];
          if (r && r.constructor === hbs.SafeString)
            return r.toString();
          return String(r ?? "");
        });
        if (debug)
          console.log("[wrapAsync] after replace:", s);
        return s;
      });
    });
  }
  hbs.compile = function(...args) {
    const tmpl = origCompile(...args);
    if (debug)
      console.log("[wrapAsync] compile patched");
    return (data) => renderWithAsync(tmpl, data);
  };
  if (origTemplate) {
    hbs.template = function(...args) {
      const tmpl = origTemplate(...args);
      if (debug)
        console.log("[wrapAsync] template patched");
      return (data) => renderWithAsync(tmpl, data);
    };
  }
  if (origCreate) {
    hbs.create = function(...args) {
      const inst = origCreate(...args);
      return wrapAsync(inst, debug);
    };
  }
  return hbs;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  wrapAsync
});
