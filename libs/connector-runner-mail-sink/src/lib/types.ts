import { ActionConfig, isActionConfigType } from '@xip-online-data/types';
import {
  MailConfig } from '@xip-online-data/mail-client';

export interface MailSinkConfig {
  mailConfig: MailConfig;
  action: ActionConfig;
}

export function isYamlConfigType(obj: MailSinkConfig): obj is MailSinkConfig {
  return (
    obj !== undefined &&
    obj !== null &&
    isActionConfigType(obj.action) &&
    obj.mailConfig !== undefined &&
    obj.mailConfig !== null
  );
}
