import { BaseConnectorConfig } from '@xip-online-data/types';
import { MailboxConfig } from './types';

export function generateCollectionName(
  connectorConfig: BaseConnectorConfig,
  sourceConfig: MailboxConfig,
): string {
  return `${connectorConfig.datasourceIdentifier}_${sourceConfig.mailboxIdentifier}`;
}

export function generateKafkaTopic(
  connectorConfig: BaseConnectorConfig,
  sourceConfig: MailboxConfig,
): string {
  return `${connectorConfig.tenantIdentifier}_SOURCE_${connectorConfig.datasourceIdentifier}_${sourceConfig.mailboxIdentifier.replace('@', '_at_')}`;
}

export function generateOffsetIdentifier(sourceConfig: MailboxConfig): string {
  return `${sourceConfig.offsetFilePrefix ?? 'offset'}_${sourceConfig.mailboxIdentifier}`;
}
