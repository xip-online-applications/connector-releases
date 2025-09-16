import {
  ConnectorRuntime,
  PersistentOffsetStoreInterface,
} from '@transai/connector-runtime';
import { MailsourceProcessorService } from './mail-processor/mailsource-processor.service';
import { isYamlConfigType, MailSourceProcessConfig } from './types';
import { MailClient, MailConfig } from '@xip-online-data/mail-client';

export class ConnectorRunnerMailSource extends ConnectorRuntime<MailSourceProcessConfig> {
  readonly CONNECTOR_INSTANCE: string = 'XOD_CONNECTOR_MAIL_SOURCE_CONFIG';

  #processors: Array<MailsourceProcessorService> = [];

  override init = async (): Promise<void> => {
    if (this.offsetStoreInstance === undefined) {
      throw new Error(
        'Offset store is not defined. Please provide an temp location for the offset store.',
      );
    }

    this.#processors = await Promise.all(
      this.config.mailboxes.map(async (mailSourceConfig) => {
        const mailClient = new MailClient(this.config.mailConfig);

        const processor = new MailsourceProcessorService(
          this.config,
          mailSourceConfig,
          this.kafkaService,
          mailClient,
          this.offsetStoreInstance as PersistentOffsetStoreInterface,
        );
        await processor.init();

        return processor;
      }),
    );
  };

  override exit = async () => {
    this.#processors.forEach((service) => service.stop());
  };

  override isValidConfig = (config: MailSourceProcessConfig): boolean => {
    return isYamlConfigType(config);
  };
}
