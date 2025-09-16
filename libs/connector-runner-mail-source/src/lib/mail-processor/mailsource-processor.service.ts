import { interval, Subscription } from 'rxjs';
import {
  BaseConnectorConfig,
  XodSourceMessageType,
  XodSourcePayloadType,
} from '@xip-online-data/types';
import { KafkaSourceInterface } from '@xip-online-data/kafka-base-service';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '@transai/logger';
import { PersistentOffsetStoreInterface } from '@transai/connector-runtime';
import { MailClient, MailMessage } from '@xip-online-data/mail-client';
import {
  generateCollectionName,
  generateKafkaTopic,
  generateOffsetIdentifier,
} from '../helper.functions';
import { MailboxConfig, MailSourceProcessConfig } from '../types';
import { htmlToText } from 'html-to-text';

export class MailsourceProcessorService {
  #processing = false;

  readonly #mailboxConfig: MailboxConfig;

  readonly #mailSourceConfig: MailSourceProcessConfig & BaseConnectorConfig;

  readonly #kafkaService: KafkaSourceInterface;

  readonly #mailClient: MailClient;

  readonly #logger: Logger;

  #subscription?: Subscription;

  #offsetStore: PersistentOffsetStoreInterface;

  constructor(
    mailSourceConfig: MailSourceProcessConfig,
    config: MailboxConfig,
    kafkaService: KafkaSourceInterface,
    mailClient: MailClient,
    offsetStore: PersistentOffsetStoreInterface,
  ) {
    this.#mailSourceConfig = mailSourceConfig;
    this.#mailboxConfig = config;
    this.#kafkaService = kafkaService;
    this.#mailClient = mailClient;
    this.#logger = Logger.getInstance();
    this.#offsetStore = offsetStore;
  }

  public async init(): Promise<void> {
    this.#subscription = interval(
      this.#mailboxConfig.interval * 1000,
    ).subscribe(async () => {
      await this.process().catch((error) => {
        this.#logger.error(
          `Error while processing message from mailsource processor service ${error.message}`,
        );
      });
    });
  }

  stop() {
    this.#subscription?.unsubscribe();
  }

  public async process(): Promise<void> {
    if (this.#processing) {
      this.#logger.debug(
        `Mailsource processor service is already processing: ${this.#mailboxConfig.mailboxIdentifier} ${this.#mailboxConfig.mailbox}`,
      );
      return;
    }

    this.#processing = true;

    try {
      await this.processMailbox(this.#mailboxConfig);
    } finally {
      this.#processing = false;
    }
  }

  private async processMailbox(config: MailboxConfig): Promise<void> {
    this.#logger.debug(
      `Processing mailbox: ${this.#mailboxConfig.mailboxIdentifier} ${this.#mailboxConfig.mailbox}`,
    );

    const lastOffset = await this.#offsetStore.getOffset(
      generateOffsetIdentifier(this.#mailboxConfig),
    );

    const lastMessageId = (lastOffset?.id as number) || 0;

    this.#logger.info('Last message ID', lastMessageId);
    const messages = await this.#mailClient.readMail(
      config.mailbox,
      lastMessageId,
    );
    if (this.#mailboxConfig.type === 'metric') {
      await this.sendMetricsToKafka(messages);
    } else {
      await this.sendDocumentsToKafka(messages);
    }

    if (messages.length === 0) {
      this.#logger.debug(
        `No new messages found for mailbox: ${this.#mailboxConfig.mailboxIdentifier} ${this.#mailboxConfig.mailbox}`,
      );
      return;
    }

    this.#logger.info('New last message ID', messages[messages.length - 1].uid);
    this.storeId(messages[messages.length - 1].uid ?? 0);
  }

  private storeId(id: number) {
    this.#offsetStore.setOffset(
      { timestamp: 0, id, rawTimestamp: 0 },
      generateOffsetIdentifier(this.#mailboxConfig),
    );
  }

  private sendMetricsToKafka = async (
    contents: MailMessage | Array<MailMessage>,
  ): Promise<void> => {
    let kafkaPayload: Array<XodSourceMessageType>;

    if (Array.isArray(contents)) {
      kafkaPayload = contents.map((content) => ({
        type: 'SOURCE',
        eventId: uuidv4(),
        eventType: 'event.metric',
        created: Date.now(),
        ttl: 3600000, // 1 month
        tenantIdentifier: this.#mailSourceConfig.tenantIdentifier,
        payload: this.buildPayload(content),
      }));
    } else {
      kafkaPayload = [
        {
          type: 'SOURCE',
          eventId: uuidv4(),
          eventType: 'event.metric',
          created: Date.now(),
          ttl: 3600000, // 1 month
          tenantIdentifier: this.#mailSourceConfig.tenantIdentifier,
          payload: this.buildPayload(contents),
        },
      ];
    }

    // Send JSON data to Kafka
    await this.#kafkaService.send(
      kafkaPayload,
      generateKafkaTopic(this.#mailSourceConfig, this.#mailboxConfig),
    );
  };

  private sendDocumentsToKafka = async (
    contents: MailMessage | Array<MailMessage>,
  ): Promise<void> => {
    let kafkaPayload: Array<XodSourceMessageType>;

    if (Array.isArray(contents)) {
      kafkaPayload = contents.map((content) => ({
        type: 'SOURCE',
        eventId: uuidv4(),
        eventType: 'event.metric',
        created: Date.now(),
        ttl: 3600000, // 1 month
        tenantIdentifier: this.#mailSourceConfig.tenantIdentifier,
        payload: this.buildPayload(content),
      }));
    } else {
      kafkaPayload = [
        {
          type: 'SOURCE',
          eventId: uuidv4(),
          eventType: `${this.#mailSourceConfig.tenantIdentifier}_SOURCE_${this.#mailboxConfig.mailboxIdentifier}`,
          created: Date.now(),
          ttl: 3600000, // 1 month
          tenantIdentifier: this.#mailSourceConfig.tenantIdentifier,
          payload: this.buildPayload(contents),
        },
      ];
    }

    this.#logger.info('payload', JSON.stringify(kafkaPayload, null, 2));

    // Send JSON data to Kafka
    await this.#kafkaService.send(
      kafkaPayload,
      generateKafkaTopic(this.#mailSourceConfig, this.#mailboxConfig),
    );
  };

  private buildPayload = (parsedContent: MailMessage): XodSourcePayloadType => {
    return {
      body: {
        ...parsedContent,
      },
      collection: generateCollectionName(
        this.#mailSourceConfig,
        this.#mailboxConfig,
      ),
    };
  };
}
