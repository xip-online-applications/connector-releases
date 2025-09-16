import { Logger } from '@transai/logger';
import { ImapFlow, ImapFlowOptions } from 'imapflow';
import { ParsedMail, simpleParser } from 'mailparser';
import { MailConfig } from './types';
import { MailInterface } from './mail-interface';
import { getAccessToken } from './mail-token';
import { addPdfJsonAttachments } from './mail-attachments';
import { htmlToText } from 'html-to-text';

export interface Attachment {
  content?: string;
  contentType: string;
  filename?: string;
  path?: string;
}

export interface MailMessage {
  uid: number;
  attachments: Array<Attachment>;
  headers?: Array<{ key: string; header: string }>;
  headerLines?: Array<{ key: string; line: string }>;
  subject?: string;
  references?: string | Array<string>;
  date?: Date;
  to?: Array<string>;
  from?: Array<string>;
  cc?: Array<string>;
  bcc?: Array<string>;
  messageId?: string;
  inReplyTo?: string;
  replyTo?: Array<string>;
  text?: string;
  html?: string;
  textAsHtml?: string;
}

export class MailClient implements MailInterface {
  private mailClient: ImapFlow | undefined;

  #logger: Logger;

  constructor(protected readonly config: MailConfig) {
    this.config = config;
    this.#logger = Logger.getInstance();
  }

  public async init(): Promise<void> {
    Logger.getInstance().info(
      `Initializing mail: ${this.config.host}:${this.config.port}`,
    );

    let accessToken: string | undefined;

    if (
      this.config.tenantId &&
      this.config.clientId &&
      this.config.clientSecret
    ) {
      accessToken = await getAccessToken(
        this.config.tenantId,
        this.config.clientId,
        this.config.clientSecret,
      );
    }

    const imapFlowConfig: ImapFlowOptions = {
      host: this.config.host,
      port: this.config.port,
      secure: this.config.secure ?? true,
      logger: Logger.getInstance(),
    };
    if (accessToken) {
      imapFlowConfig.auth = {
        user: this.config.username,
        accessToken,
      };
    }
    if (this.config.password) {
      imapFlowConfig.auth = {
        user: this.config.username,
        pass: this.config.password,
      };
    }

    this.mailClient = new ImapFlow(imapFlowConfig);

    await this.mailClient.connect();
    Logger.getInstance().info('Mail client initialized');
  }

  public async readMail(
    mailbox: string,
    lastSeenUid: number,
  ): Promise<Array<MailMessage>> {
    const parsedMessages: Array<MailMessage> = [];

    try {
      await this.init();
      if (this.mailClient === undefined) {
        throw new Error('Mail client not initialized');
      }

      const lock = await this.mailClient.getMailboxLock(mailbox, {
        readOnly: true,
      });
      try {
        let maxUid = lastSeenUid;

        const fromUid = maxUid + 1;
        const range = `${fromUid}:*`;

        this.#logger.debug('Fetching messages with range: ' + range);

        for await (const msg of this.mailClient.fetch(
          range,
          {
            uid: true,
            flags: true,
            envelope: true,
            internalDate: true,
            size: true,
            source: true,
          },
          { uid: true },
        )) {
          if (!msg.source) {
            this.#logger.warn(
              `Message with UID ${msg.uid} has no source, skipping`,
            );

            // eslint-disable-next-line no-continue
            continue;
          }
          if (msg.uid <= maxUid) {
            this.#logger.debug(
              `Message with UID ${msg.uid} already processed, skipping`,
            );
            // eslint-disable-next-line no-continue
            continue;
          }

          const parsed = await simpleParser(msg.source);

          await addPdfJsonAttachments(parsed);

          const message = this.toJson(parsed, msg.uid);

          parsedMessages.push(message);

          if (message.uid > maxUid) maxUid = message.uid;
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          this.#logger.error(err.message);
        } else {
          this.#logger.error(String(err));
        }
      } finally {
        try {
          lock.release();
        } catch (_) {
          this.#logger.error('[lock:error] Failed to release mailbox lock');
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        this.#logger.error(err.message);
      } else {
        this.#logger.error(String(err));
      }
      try {
        await this.mailClient?.logout();
      } catch (_) {
        this.#logger.error('[logout:error] Failed to logout from mail server');
      }
      this.mailClient = undefined; // force reconnect on next poll
    }

    return parsedMessages;
  }

  private toJson(parsed: ParsedMail, uid: number): MailMessage {
    // Helper to extract address list as array of strings
    const extractAddresses = (addrObj: any): Array<string> | undefined => {
      if (!addrObj) return undefined;
      if (Array.isArray(addrObj.value)) {
        return addrObj.value.map((a: any) => a.address).filter(Boolean);
      }
      return typeof addrObj.text === 'string' ? [addrObj.text] : undefined;
    };

    // Convert headers Map to plain object
    const headersObj = parsed.headers
      ? Array.from(parsed.headers.entries()).map(([key, header]) => ({
          key,
          header: Array.isArray(header) ? header.join(', ') : String(header),
        }))
      : undefined;

    const headerLinesObj = parsed.headerLines
      ? parsed.headerLines.map((line) => ({
          key: line.key,
          line: line.line,
        }))
      : undefined;

    return {
      uid,
      attachments: parsed.attachments.map((attachment) => ({
        content:
          attachment.contentType === 'application/json'
            ? attachment.content.toString()
            : undefined,
        contentType: attachment.contentType,
        filename: attachment.filename,
      })),
      // headers: headersObj,
      // headerLines: headerLinesObj,
      subject: parsed.subject,
      references: parsed.references,
      date: parsed.date,
      to: extractAddresses(parsed.to),
      from: extractAddresses(parsed.from),
      cc: extractAddresses(parsed.cc),
      bcc: extractAddresses(parsed.bcc),
      messageId: parsed.messageId,
      inReplyTo: parsed.inReplyTo,
      replyTo: extractAddresses(parsed.replyTo),
      text: (parsed.text || parsed.html
        ? htmlToText(parsed.html as string)
        : ''
      ).trim(),
      // html: !parsed.html ? undefined : parsed.html,
      // textAsHtml: parsed.textAsHtml,
    };
  }

  public async reply(
    from: string,
    mailbox: string,
    messageId: string,
    mailBody: string,
    concept = true,
  ): Promise<void> {
    await this.init();

    if (this.mailClient === undefined) {
      throw new Error('Mail client not initialized');
    }

    await this.mailClient.mailboxOpen(mailbox);

    const message = await this.mailClient.fetchOne(messageId, {
      headers: true,
      source: true,
      envelope: true,
    });

    if (!message || !message.source) {
      throw new Error(`Message with ID ${messageId} not found`);
    }

    const domain = from.split('@')[1] || 'transai.com';
    const parsed = await simpleParser(message.source);

    const origMessageId = parsed.messageId;
    // const inReplyTo = parsed.inReplyTo;
    const references = parsed.references || [];
    const subject = parsed.subject || '';
    const to = parsed.from?.text;
    const replyTo = parsed.replyTo?.text || to;

    const replyHeaders = {
      'In-Reply-To': origMessageId,
      References: [...references, origMessageId].join(' '),
    };

    const body = `${mailBody}}\n\n> ${parsed.text?.split('\n').join('\n> ')}`;

    const raw = [
      `From: me@example.com`,
      `To: ${replyTo}`,
      `Subject: ${subject.startsWith('Re:') ? subject : `Re: ${subject}`}`,
      `Message-ID: <${Date.now()}.draft@${domain}`,
      `Date: ${new Date().toUTCString()}`,
      `In-Reply-To: ${replyHeaders['In-Reply-To']}`,
      `References: ${replyHeaders['References']}`,
      `MIME-Version: 1.0`,
      `Content-Type: text/plain; charset=utf-8`,
      ``,
      body,
    ].join('\r\n');

    await this.mailClient.mailboxOpen('Drafts');
    await this.mailClient.append('Drafts', raw, ['\\Draft']);

    if (!concept) {
      // todo: send the email
    }
  }
}
