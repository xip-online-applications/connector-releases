import { BaseConnectorConfig } from '@xip-online-data/types';
import { MailConfig } from '@xip-online-data/mail-client';

export interface MailboxConfig {
  mailboxIdentifier: string;
  host: string;
  port: number;
  type?: 'metric' | 'document';
  interval: number;
  mailbox: string;
  offsetFilePrefix?: string;
}

export interface MailSourceProcessConfig extends BaseConnectorConfig {
  mailboxes: Array<MailboxConfig>;
  mailConfig: MailConfig;
}

export function isYamlConfigType(
  obj: MailSourceProcessConfig,
): obj is MailSourceProcessConfig {
  return obj !== undefined && obj !== null;
}
