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
var office365_mail_parser_exports = {};
__export(office365_mail_parser_exports, {
  Office365MailParser: () => Office365MailParser
});
module.exports = __toCommonJS(office365_mail_parser_exports);
var import_pdf2md = __toESM(require("@opendocsg/pdf2md"));
var import_html_to_text = require("html-to-text");
class Office365MailParser {
  async parsedToMailMessage(mail, parsed, receivedFallback) {
    const date = parsed.date ?? receivedFallback;
    const headers = [];
    const headerLines = [];
    parsed.headers.forEach((value, key) => {
      headers.push({
        key: String(key),
        header: Array.isArray(value) ? value.join(", ") : String(value)
      });
    });
    parsed.headerLines.forEach(({ key, line }) => {
      headerLines.push({ key, line });
    });
    const to = this.#extractAddrList(parsed.to);
    const cc = this.#extractAddrList(parsed.cc);
    const bcc = this.#extractAddrList(parsed.bcc);
    const from = this.#extractAddrList(parsed.from);
    const replyTo = this.#extractAddrList(parsed.replyTo);
    const html = typeof parsed.html === "string" ? parsed.html : void 0;
    const text = parsed.text || (html ? (0, import_html_to_text.htmlToText)(html) : "");
    return {
      deltaTimestamp: receivedFallback.getTime(),
      deltaId: mail.id,
      id: mail.id,
      originalMessageId: mail.internetMessageId,
      attachmentsCount: (parsed.attachments ?? []).length,
      attachments: await this.#parseAttachments(parsed.attachments ?? []),
      headers,
      headerLines,
      subject: parsed.subject || void 0,
      references: parsed.references || void 0,
      date,
      to,
      from,
      cc,
      bcc,
      replyTo,
      text: (text || "").trim(),
      html,
      messageId: parsed.messageId || void 0,
      inReplyTo: parsed.inReplyTo || void 0
    };
  }
  formatMailReplyBody(orig, body) {
    const origFrom = orig.from?.emailAddress?.address || "";
    const origTo = orig.toRecipients?.map((r) => r.emailAddress?.address).filter(Boolean).join("; ") || "";
    const origSubject = orig.subject || "";
    const origDate = orig.sentDateTime ? new Date(orig.sentDateTime).toLocaleString() : "";
    const separator = `<br><hr style="border:none;border-top:solid #b1b1b1 1px;height:1px;margin:16px 0 8px 0;" /><br>From: ${origFrom}<br>Sent: ${origDate}<br>To: ${origTo}<br>Subject: ${origSubject}<br><br>`;
    const origBody = orig.body?.content || "";
    return `${body}${separator}${origBody}`;
  }
  #extractAddrList(field) {
    if (!field) {
      return void 0;
    }
    const pluck = (x) => {
      if (!x || typeof x !== "object") {
        return [];
      }
      if ("address" in x && typeof x.address === "string" && x.address) {
        return [x.address];
      }
      if ("group" in x && Array.isArray(x.group)) {
        return x.group.flatMap(pluck);
      }
      return [];
    };
    if ("value" in field && Array.isArray(field.value)) {
      const out2 = field.value.flatMap(pluck).filter(Boolean);
      return out2.length ? out2 : void 0;
    }
    if (Array.isArray(field)) {
      const out2 = field.flatMap(pluck).filter(Boolean);
      return out2.length ? out2 : void 0;
    }
    const out = pluck(field).filter(Boolean);
    return out.length ? out : void 0;
  }
  async #parseAttachments(attachments) {
    return (await Promise.all(
      attachments.map(async (att) => {
        const isJson = att.contentType?.toLowerCase().includes("application/json") || att.filename?.toLowerCase().endsWith(".json");
        const parsedPdfToJson = await this.#addPdfJsonAttachment(att);
        if (!parsedPdfToJson && !isJson) {
          return void 0;
        }
        att = parsedPdfToJson ?? att;
        const buf = Buffer.isBuffer(att.content) ? att.content : await new Promise((resolve, reject) => {
          const chunks = [];
          att.content?.on?.(
            "data",
            (c) => chunks.push(c)
          );
          att.content?.once?.(
            "end",
            () => resolve(
              Buffer.concat(
                chunks
              )
            )
          );
          att.content?.once?.("error", reject);
        });
        return {
          id: att.cid,
          filename: att.filename || "attachment.json",
          contentType: "application/json",
          content: buf.toString("utf-8")
        };
      })
    )).filter((att) => !!att);
  }
  async #addPdfJsonAttachment(attachment) {
    const isPdf = attachment.contentType?.toLowerCase().includes("application/pdf") || attachment.filename?.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      return null;
    }
    const buf = await this.#streamToBuffer(attachment.content);
    const pdfParsed = await (0, import_pdf2md.default)(buf);
    const filename = `${attachment.filename?.replace(/\.pdf$/i, "") || "attachment"}.json`;
    return {
      ...attachment,
      filename,
      contentType: "application/json",
      content: Buffer.from(pdfParsed)
    };
  }
  async #streamToBuffer(stream) {
    if (Buffer.isBuffer(stream)) {
      return stream;
    }
    return new Promise((resolve, reject) => {
      const chunks = [];
      stream.on("data", (c) => chunks.push(c));
      stream.once(
        "end",
        () => resolve(Buffer.concat(chunks))
      );
      stream.once("error", reject);
    });
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Office365MailParser
});
