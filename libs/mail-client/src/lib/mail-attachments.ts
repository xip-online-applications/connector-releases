import { ParsedMail } from 'mailparser';
import { Readable } from 'stream';
import pdf from 'pdf-parse';


function streamToBuffer(stream: Readable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Array<Buffer> = [];
    stream.on('data', (c: Buffer) => chunks.push(c));
    stream.once('end', () => resolve(Buffer.concat(chunks)));
    stream.once('error', reject);
  });
}

export async function addPdfJsonAttachments(parsed: ParsedMail): Promise<void> {
  if (!Array.isArray(parsed.attachments) || parsed.attachments.length === 0)
    return;

  const jsonAtts = [];
  for (const att of parsed.attachments) {
    const isPdf =
      (att.contentType &&
        att.contentType.toLowerCase().includes('application/pdf')) ||
      (att.filename && att.filename.toLowerCase().endsWith('.pdf'));
    if (!isPdf) continue;

    const buf = Buffer.isBuffer(att.content)
      ? att.content
      : await streamToBuffer(att.content as Readable);

    const pdfParsed = await pdf(buf);
    const jsonFilename = `${att.filename?.replace(/\.pdf$/i, '') || 'attachment'}.json`;

    jsonAtts.push({
      filename: jsonFilename,
      contentType: 'application/json',
      contentDisposition: att.contentDisposition || 'attachment',
      headers: att.headers,
      related: att.related || false,
      cid: att.cid,
      type: att.type,
      size: att.size,
      headerLines: att.headerLines,
      checksum: att.checksum,
      // store as Buffer so your existing mapping stays unchanged
      content: Buffer.from(pdfParsed.text),
    });
  }

  parsed.attachments.push(...jsonAtts);
}
