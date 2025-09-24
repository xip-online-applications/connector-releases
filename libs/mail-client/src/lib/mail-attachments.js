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
var mail_attachments_exports = {};
__export(mail_attachments_exports, {
  addPdfJsonAttachments: () => addPdfJsonAttachments
});
module.exports = __toCommonJS(mail_attachments_exports);
var import_pdf2md = __toESM(require("@opendocsg/pdf2md"));
function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (c) => chunks.push(c));
    stream.once("end", () => resolve(Buffer.concat(chunks)));
    stream.once("error", reject);
  });
}
async function addPdfJsonAttachments(parsed) {
  if (!Array.isArray(parsed.attachments) || parsed.attachments.length === 0)
    return;
  const jsonAtts = [];
  for (const att of parsed.attachments) {
    const isPdf = att.contentType && att.contentType.toLowerCase().includes("application/pdf") || att.filename && att.filename.toLowerCase().endsWith(".pdf");
    if (!isPdf)
      continue;
    const buf = Buffer.isBuffer(att.content) ? att.content : await streamToBuffer(att.content);
    const pdfParsed = await (0, import_pdf2md.default)(buf);
    const jsonFilename = `${att.filename?.replace(/\.pdf$/i, "") || "attachment"}.json`;
    jsonAtts.push({
      filename: jsonFilename,
      contentType: "application/json",
      contentDisposition: att.contentDisposition || "attachment",
      headers: att.headers,
      related: att.related || false,
      cid: att.cid,
      type: att.type,
      size: att.size,
      headerLines: att.headerLines,
      checksum: att.checksum,
      // store as Buffer so your existing mapping stays unchanged
      content: Buffer.from(pdfParsed)
    });
  }
  parsed.attachments.push(...jsonAtts);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  addPdfJsonAttachments
});
//# sourceMappingURL=mail-attachments.js.map
