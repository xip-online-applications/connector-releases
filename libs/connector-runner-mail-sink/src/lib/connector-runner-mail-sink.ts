import { ConnectorRuntime } from '@transai/connector-runtime';
import {
  ActionInterface,
  BaseConnectorConfig,
  ConnectorInterface,
  KafkaCallbackResponse,
  XodActionType,
  XodBaseMessageType,
  XodJobType,
} from '@xip-online-data/types';
import {
  BadRequest,
  Created,
  InternalServerError,
} from '@xip-online-data/kafka-base-service';
import { Logger } from '@transai/logger';
import { MailSinkConfig } from './types';
import { MailClient } from '../../../mail-client/src';

export class ConnectorRunnerMailSink extends ConnectorRuntime<MailSinkConfig> {
  readonly CONNECTOR_INSTANCE: string = 'XOD_CONNECTOR_MAIL_SINK_CONFIG';

  private mailClientInstance: MailClient | undefined;

  constructor(
    connector: ConnectorInterface,
    mailSinkConfig: MailSinkConfig & BaseConnectorConfig,
    actionConfigs: Array<ActionInterface>,
    readonly injectedMailClientInstance?: MailClient,
  ) {
    super(connector, mailSinkConfig, actionConfigs);
    this.mailClientInstance = injectedMailClientInstance;
  }

  override init = async (): Promise<void> => {
    if (this.mailClientInstance === undefined) {
      this.mailClientInstance = new MailClient(this.config.mailConfig);
    }

    const jobCallbackFunction = (
      callbackFunction: (
        message: XodBaseMessageType,
      ) => Promise<KafkaCallbackResponse>,
    ) => {
      return async (m: XodBaseMessageType) => {
        if (m.type !== 'JOB') {
          return callbackFunction(m);
        }

        const message = m as XodJobType;
        let action: ActionInterface;
        try {
          action = this.getActionConfig(message);
        } catch (error: unknown) {
          if (error instanceof Error) {
            return BadRequest(`No action found: ${error.message}`)(message);
          }
          return BadRequest('Unknown error occured')(message);
        }

        try {
          const handleBars = action.config['parsedTemplates'] as {
            url: HandlebarsTemplateDelegate<unknown>;
            body: HandlebarsTemplateDelegate<unknown>;
          };

          const parsedUrl = handleBars
            .url({
              inputs: message.payload,
            })
            .trim();

          const parsedBody = handleBars
            .body({
              inputs: message.payload,
            })
            .trim();

          if (message.testRun) {
            Logger.getInstance().info(
              `Test run for ${message.eventId} with payload ${parsedBody} to path ${parsedUrl}`,
            );
            return callbackFunction(message);
          }

          const parsedBodyJson = JSON.parse(parsedBody);

          switch (parsedBodyJson.actionType) {
            case 'REPLY':
              this.mailClientInstance.reply(
                parsedBodyJson.from,
                parsedBodyJson.Malbox,
                parsedBodyJson.messageId,
                parsedBodyJson.mailBody,
                true,
              );
              break;
            case 'FORWARD':
              // this.mailClientInstance.forward(parsedBody);
              break;
            case 'SEND':
              // this.mailClientInstance.send(parsedBody);
              break;
            case 'TAG_ADD':
              break;
            case 'TAG_REMOVE':
              break;
            default:
              throw new Error(
                `Unknown action type: ${parsedBodyJson.actionType}`,
              );
          }

          const result = { success: true, data: 'Not implemented yet' };

          if (result.success) {
            return callbackFunction(message);
          }
          return InternalServerError(result.data)(message);
        } catch (error: unknown) {
          if (error instanceof Error) {
            return InternalServerError(error.message)(message);
          }
          return InternalServerError('Unknown error occured')(message);
        }
      };
    };

    const actionCallbackFunction = (
      callbackFunction: (
        message: XodBaseMessageType,
      ) => Promise<KafkaCallbackResponse>,
    ) => {
      return async (m: XodBaseMessageType) => {
        if (m.type !== 'ACTION') {
          return callbackFunction(m);
        }

        const message = m as XodActionType;
        try {
          if (!message.payload.destination || !message.payload.content) {
            return BadRequest('Destination or content not found')(message);
          }

          // her comes the action handling logic
          const result = { success: true, data: 'Not implemented yet' };

          if (result.success) {
            return callbackFunction(message);
          }
          return InternalServerError(result.data)(message);
        } catch (error) {
          if (error instanceof Error) {
            return InternalServerError(error.message)(message);
          }
          return InternalServerError('Unknown error occurred')(message);
        }
      };
    };

    this.callbackFunction = jobCallbackFunction(
      actionCallbackFunction(this.emitEventType(Created())),
    );
  };
}
