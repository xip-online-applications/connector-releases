// eslint-disable-next-line max-classes-per-file
import { UnprocessableEntity } from '@xip-online-data/kafka-base-service';
import {
  ActionInterface,
  BaseConnectorConfig,
  ConfiguredConnectorTypes,
  ConnectorInterface,
  XodActionType,
  XodBaseMessageType,
  XodJobType,
} from '@xip-online-data/types';
import { HttpClient } from '@xip-online-data/http-client';
import { ConnectorRunnerApiSink } from './connector-runner-mail-sink';
import { ApiSinkConfig } from './types';

jest.mock('@xip-online-data/http-client');
jest.mock('@xip-online-data/kafka-base-service', () => {
  return {
    KafkaSourceService: class {
      setCallbackFunction = jest.fn();

      init = jest.fn();
    },
    KafkaBaseService: class {},
    Created: jest
      .fn()
      .mockImplementation(() => (message: XodBaseMessageType) => message),
    UnprocessableEntity: jest
      .fn()
      .mockImplementation(() => (message: XodBaseMessageType) => message),
    InternalServerError: jest
      .fn()
      .mockImplementation(() => (message: XodBaseMessageType) => message),
  };
});

describe('ConnectorRunnerApiSink', () => {
  let connector: ConnectorRunnerApiSink;
  let mockHttpClient: jest.Mocked<HttpClient>;
  let action: ActionInterface;
  let printAction: ActionInterface;

  const baseMessage: XodBaseMessageType = {
    type: 'JOB',
    eventId: 'test',
    eventType: 'test',
    created: 123,
    payload: {},
    ttl: Number.MAX_VALUE,
    tenantIdentifier: 'test',
    testRun: false,
  } as const;

  beforeEach(async () => {
    process.env = {
      ...process.env,
      TRANSAI_CONFIG_SOURCE: 'api',
    };

    const connectorConfig: ConnectorInterface<
      ApiSinkConfig & BaseConnectorConfig
    > = {
      identifier: 'test',
      connectorType: ConfiguredConnectorTypes.API_SINK,
      tenantIdentifier: 'test',
      name: 'test',
      location: 'test',
      config: {
        processIdentifier: 'test',
        tenantIdentifier: 'test',
        datasourceIdentifier: 'test',
        location: 'test',
        kafka: {
          groupId: 'test',
          clientId: 'test',
          brokers: ['test'],
        },
        http: {
          host: 'http://test',
        },
        action: {
          timeSensitive: false,
        },
      },
      enabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    action = {
      identifier: 'test',
      version: 'test',
      tenantIdentifier: 'test',
      name: 'test',
      connectorIdentifier: 'test',
      config: {
        templates: {
          url: '/api/{{inputs.machineNummer}}/start',
          body: `
  {
      "CalculationNumber": "{{ inputs.calculatieNummer  }}",
      "LineNumber": {{ inputs.regelNummer  }},
      "Bwpl": "{{ inputs.machineNaam  }}",
      "Quantity": {{ inputs.aantalGereed  }},
      "Timestamp": "{{ formatDateInTimezone inputs.stopTimestamp "Europe/Amsterdam"  }}",
      "PersonelNumber": "{{ inputs.bewerkingsplaatsNummer }}",
      "Meldcode": "SCRAP"
    }
          `,
        },
      },
      inputParameters: [
        {
          name: 'machineNummer',
          type: 'string',
        },
        {
          name: 'calculatieNummer',
          type: 'string',
        },
        {
          name: 'regelNummer',
          type: 'number',
        },
        {
          name: 'machineNaam',
          type: 'string',
        },
        {
          name: 'aantalGereed',
          type: 'number',
        },
        {
          name: 'stopTimestamp',
          type: 'string',
        },
        {
          name: 'bewerkingsplaatsNummer',
          type: 'string',
        },
      ],
      outputParameters: {},
      createdAt: new Date(),
    };
    printAction = {
      identifier: 'print',
      version: 'print',
      tenantIdentifier: 'print',
      name: 'print',
      connectorIdentifier: 'print',
      config: {
        templates: {
          url: 'http://labelprinter{{ minus inputs.machineNummer (modulo inputs.machineNummer 100) }}.internal.betech.nl/pstprnt',
          body: '^XA\n~TA000\n~JSN\n^LT0\n^MNW\n^MTT\n^PON\n^PMN\n^LH0,0\n^JMA\n^PR6,6\n~SD30\n^JUS\n^LRN\n^CI27\n^PA0,1,1,0\n^XZ\n^XA\n^MMT\n^PW1200\n^LL1876\n^LS0\n^FO442,1230^GFA,393,1356,6,:Z64:eJzVkjFuwzAMRSkQCBfDXDME8VF8tOoEPZOBXMRHaDcHcK2Sn01iJHaRpFnK4UH4kj4pikQW2SFgAxanFF+2I4T+IgwQurOgELSbEQpjN05SA0l+pB7SOJdm2aOSqOreaJGleJZURmSf3KpvYajGmgRkM64o/cI4I0HcDZ/wDH96w4ua/pEqF0JLsXbc8qlIH04ePq02+fI6pXjNYp72LHm3t9S8s3dVvA2ma+6Ctluz2lds7HI2B3FObOQpHTOlEb0awAdi7acOjZPxR+ydD1acVhhnfFg2HHcL6G7M+CN+so9XYd3LSyTaY19ADkJPNwxd4y5dOIHDX0ucdZXRVYmudj63esfkn2beT0p2crenF8/nQrX/ZQYilHSd36Sfsio=:60FF\n^FO362,78^GFA,345,1355,5,:Z64:eJzNk00KgzAQhScMOBtJbmCP4sW6CHgxoYteo0fo0oU4nRd/itbWLArtLD6QJPP3nkTkImUiqOoWuW9nfIq6NWhnN7UnYh2I5HIysBB55jiiZLeDdCqRCk4vFLAEzJaK+HZQ+n1gytsGP0v1rxuKWxBV6QhgfG5swAsOgwGhM2DteqcTSr5irMYgboIPhlBZZhmA3vbCXWEZ7rnjvLrWqS1aFoQEHJRreKA49vlYBg2l1qQHBus0eBvWC88TrRX0gEBGaSTtmWYMQJc74X58kFGApMNbLcPXGlo8zvC4JI+3NbwEj6Naubt77AVXJELztvrqr/uMAFPv4QFK3Mfb:9B21\n^FPH,8^FT363,630^AUR,59,18^FH\\^FD{{#if inputs.machineMetrics}}{{ plus (subtractPositive inputs.partCount (toInt inputs.machineTellerLaatst)) (toInt inputs.aantalGereedSum) }}{{else}}{{ toInt inputs.aantalGereedSum }}{{/if}}/{{ inputs.aantal }}^FS\n^FO819,738^GB96,1074,6^FS\n^FO847,766^GFA,501,2725,5,:Z64:eJzllc1twzAMhWkQKG/mAkGyST1aBfjgY0boKh4lQBfIMQfDKh/9B7sKarsFUjQ6fAAjiXx6lhiNMQadg4gEKICIqDWcrojqIbr1EWOBItLLCIQ+QW/1sJWxjTy7x9JQn74rJEsZg5b1I/M6TY7kQCum5WjIlQPl8hXSwY7LlQbKounRDi1wW1mZwxKWqjUPDAKoAxN5AtJt+34UtQGqstjAYhMpH++G8mxyuQqG0pImUfUQtsWC7yOlJeASX4Kvm6x2m8ISRK8+BUjal/5ura5RhQW2ZcB43LX4Owp84EVdFtiT59dGShDXB1wU2IQ7pEDqzSiugTUNw6XAW4h4FWgybs5pw8meqG/w1DfgmvlHnZOp9H0N91mgzhZzna83Nn3hDpjyLDLibqM4hZmxDbC1VQ1aEv3q+BAthOIMyAhFBR3lTHhZCKvvHmbXWOULT+VHuCU6WjLz5WcJdjW3/3WYJ/ujpy4R+i46+gT/7RPgFry6:3EC9\n^FPH,8^FT848,0^AUR,59,18^FB1783,1,12,R^FH\\^FD{{inputs.certificaatKenmerk}}^FS\n^FO1086,1195^GFA,349,1032,4,:Z64:eJzFkj2OgzAQhR+LZDeWaV1Y+BoU0Z4rxSqh2nPlKBzBJQVi9jkmCSER66120IeMPcObHweRKSw4AKXs2rlHLQO0jGi+j7DKwyt7xSm1Ie2l8wOMHkkE9OUXgQ9iyQmoJqBhzPmCauZyBMJAeBr6vNZ0gaQP+tVTjkO7/Oe/anhYkPkOcCR+qU+tsAs7ts65/6I3c+LbMX5N2suPh0ZHXZlvlOZcszwdHfvt0XbUcdTxxKg7nlhDHdNSYyIjiYUK6olaJDaEOUb/Uo+CufrtW8XyNGkSyF3e3uu0Z5A7rbGdTbk9x3V4zPTdXD83/bn5mwL/4U95JWtxeOEHnS99bw==:BFB7\n^FO1025,1195^GFA,233,576,4,:Z64:eJyV0E0KwyAQBeAXhLgRs3Ux6DWyKD1Tb9Cr5Sg5gsssQqbPkuanBWkefIuRUcZJqnNaBcDVCCAOCNR7ssDDDE022Y5QHfBUoJtQixkAmwPbBLEXSPAIQq7dCHnnKSLpTBPl6rt72hOjmjvi/7KwDgeldu++ehpdYKkrWHMPvH9WzrgXcC/gXjjvsrmS871+fdmvjn8r9f1rP59+90f/eGmukojbjxfxykzY:0E4D\n^FPH,8^FT1086,0^AUR,59,18^FB1770,1,12,R^FH\\^FD{{ formatDateInTimezone inputs.gewensteLeverDatum "Europe/Amsterdam" "DD/MM/YYYY" }}^FS\n^FO69,77^BQN,2,20^FDLA,{{inputs.productieNummer}}#{{inputs.certificaatKenmerk}}#^FS\n^FO87,1204^GFA,557,2605,5,:Z64:eJzVlL1ugzAQxw+5shfLrFS14BU6MkTqa2VALVOeq4+CVKkzU+WqCHp/QwkB0hQapekp/ASxfd8+IqIbfmgDVPwox3goiIKGX8Jq8pUUQN4DnwoLhC1+8/TbfalvDXmT38lTDpN8VDUl2823RIYs8U8DhigiOQ+/qgF/QuUZkWhcp89r/rFciRuQpKmHINoCFjCAPITpcVIsTsRAkjPuCsZtiTgyIAbCHUO8MoI3BPgIxIDPwVLhEOwAKwT5E21lHCqT9ZU5UpRxPVosdT1pOPl7EKX41/aYK8W+HhsoqAAHFIujnmoWDXdmCCSAnY1cInK5JMrV5QkKhnh/KUh9cJQK8ZrQ8oWRqWHcyyPgVSMtt6FJalI2rElU3HDCwfFyiffnllHNFWre9drJhvP7fHeq9u7zGFl+98fdvsMckjAuTYdIyhn4Bb+PW09jCmsFD9TzGRJx6eZnEfBblXxrQ8cm4xSxRYjSAloOYQGjUQUdHxov1xjvcjAawxfPwcrRZwajL52p5W/duJae/Ldx/Hlf9RJD3ww+AWU2AQE=:BC7B\n^FO192,492^GFA,49,5192,4,:Z64:eJztwwENAAAMw6BKnX8Vd3AFkLBqqqqqqqrPA/Y85tA=:CE50\n^FO438,79^GFA,337,1655,5,:Z64:eJzlk1Fug0AMRGdlCf8guEFyk3K0crSVchGOkE8+EK7HKCSgpE1XzU9qoSfBsjNjL0BnAJ1lwOyMZDZCxjRBMj6gPVoo/GoACfQ1kB4jXqmI2BYCMriUS870mIBP98DRBn/LUFqtWb8HcIglQnibtpAVP1fnEwGDCiOreXjNHZZ5NFSpKbpDLGiMjAOQfIikNuxQ0PAaKDGQRKDT0SEMJO4bqCXdQaz6YVQSO4xwAZGJEymJs9SrT+EZIw2jb93a2IELZmIsaPe2mEAIXdHSq+FivUU8q65h88OOyuvvJ8Rv40ZAfy1QPuJ3aOZ//7CLG0Xv4Qt+1fIQ:0E07\n^FPH,8^FT517,630^AUR,59,18^FH\\^FD{{inputs.artikelNummer}}^FS\n^FPH,8^FT439,630^AUR,59,18^FH\\^FD{{inputs.productieNummer}}^FS\n^FO281,494^GFA,449,1548,6,:Z64:eJy1lE1qw0AMhTUIrC6CZ9tFSC4Smmtl19l11zMZepE5grtzIbWqJxkKidOAnQrzLebn6WlGHiIZyeKonVG1J0qqAxEP6Wzs6IVICmWjf60NBgttbPE9xsrGGQqhxhXKlmP0vJaLXpGX9lqNrPSAyKpaZmh17QhOMghT5tMMmuc0y5gVeCepezcIh0n99Nw47et6u2WORDufFycHfTxdMcZz7KVfjs4zXarJCrVheanHDnSF5K7YNeUDZyvsN8LIHtxwusFYg3tpOPaqE2rMXq+12iPi3u1k598nGVyY3X6Ma06S0vmi6nZ68HACTwc46OGQq3d7h7PKBdvy1NtkfFrq6q3McH38/7+wons9hZ8yD5+mI9/oYVEoi2dp5T2jMbd4Jvk5mC65Ddpsy9nupbHN9kxmAUc28pi+Cp5JVDRMdS2P7F16gz/RrdH9:179C\n^FPH,8^FT212,492^AUR,59,18^FH\\^FD^FS\n^FO529,1234^GFA,317,1015,5,:Z64:eJzFk80NwjAMhV9kCV+qZAMYpaNhiQNrIbFIR+DYA2rwMxRo4RQhkUqf4vg3jltqrVaWALAjuJPqmzI69gOQQro6+pDcQCmVC2HzLs5A27CD0j98sT/N8WQK+Z6tfC+jZSVWIOOGZRCTesIsQFYxdJocskAmVFyrBzV4csyYiLGpjp43pa/UK+Gh9NQ7/EOGZwt0SB8IRdgpivta9mtZ11IFOzmsAGypUkICxr4tEWflZ914L+hoK7SHsjX+cbfnS6fXS593DuFLc64Cq6l7ILQ+dRsJj0p4ABH+QzI0tuaxCsfnG2486qD0:BD7E\n^FPH,8^FT530,1585^AUR,59,18^FH\\^FD{{ inputs.machineNummer }}^FS\n^FO90,1753^GFA,41,165,5,:Z64:eJyz/////wN7VMKOgYF5wAh7LA4CAKbePRo=:B73F\n^FO672,81^GFA,233,625,5,:Z64:eJytzzEOwyAMBdCPLMUdInyD5iY5V4cOlnqxbL1GbtCMDFGoTdVIoC5IBfEGG4wtOWeVGuAGW7udkA16WYifCzDRCsxhA+5+J2EGbZjAC0RFwSp2XaM91At6l3++NnQV8MZAabBud+dgKxoJiEyKkYNBFdFhsiw/WL0DfDmc1D1EO5G2AFdPsUMFj4WaEpO/NNRUNkK2WnwiBU+MNdEZPs+6J7f9kzcmdWVL:5ED3\n^FO586,79^GFA,485,1854,6,:Z64:eJzFlUtqAzEMhmUEo81gb7sIyU2aixVq6KK7nml2vUaOkO5cSMeVfk0e5DlMUmrCB5HtXw9rbCLpSceydspa10Sh1kLEJWyUHT0TSaakxC+q0Zmp1cW36Csb0BVcjVemrD56+FVf9Gp+aVFXSq70iJFqzedINMe8gOyEPZzQ7cn30p49uKFjNblDrUzOlAffL6CpxVB3bPkzG9+MEnaMyZjmFpX04Mbi59KY3HpSKMvOiFwY9WFkJ90SsZl+RB2cLSpzSp/19WIto/+1m3SunRTWfmjNtclO+biumH6OZ6PN13o4jYjTOdH7ez7DEaO9wLgVVh0BGQx1rPKV4ZkuQFRJcJMs8J3ijN2QcESpOyAsw8WDlcOurelA+V/qeVs5/+1dd2dXB1wnXL5UR37sZtDTV2WBlygf2smRZ/aw8JMzHHPm1NnISV+SRjfrw5LE2LOS+/Cd7WGxjMqQ1/SR8H1d4C9rBvDm:265F\n^FO516,77^GFA,389,1770,5,:Z64:eJzdlE2OgzAMhYMs4S6i5gblIpV6rS7ZzbWQ5iIcocsuRrjvmcIUBKMStVI1XnySk/j5J4FdgO2J1BBXQDugMPon+ol+pB8r+FHgx2A1UI2gKzYcsRZhdhdwKbVB3hN5yl3YasmQZ4YQDr5FCN1iChnxt83CgMKsQ+EDkoMbcYo9UfZh25r5qmfYpvAoZe0Mfc/acLsFDhfgeAbOR7R3wdSkTTyhmGSN06lvJtRP3cyJyub3+wMpzCbodwWI4n4Feo4oxQJ8F3lL8QgjICACKZSVOYaVQWRLrb01JcTBtaUHlzwiDOiIa3ZbvbECIXREYi7/mOIUvlb+FtusdpRvr58Qb/9BQDcL5I/4PzTzqZ/k2/7ZC9kouoQbM+EMEA==:00A9\n^FPH,8^FT673,630^AUR,59,18^FH\\^FD{{inputs.organisatieNaam}}^FS\n^FPH,8^FT595,630^AUR,59,18^FH\\^FD{{inputs.omschrijving}}^FS\n^FO774,81^GFA,525,2418,6,:Z64:eJzdlkFuhDAMRW1lwTJHyE2ai1WCo+UoOQJLFnRc+3uYoS0dQktbqdHoCZko+Xa+w5DoIDYOOxxDjd8k0UJqGE2qwJbVVmvurGzz8oDJxg5MYuF+RnhCuCJsL/PFXiIcEI7vw4ywL7iz+8GMruPAOd5PYYcqPF1JRiJNPxNpWr3+BraH2imzyLwwiWUcRUarhhSIQwmn83P5bU+eNVp8uLgxQdsOBz0jigWsejp2AGQudZoTA8h2Rlrj0ZjK6Wq7Eh8wggnM1dSKMcjUD+YcVdu/YK9J1bKMYNW+Y6E8Ec+aHjHE84b47D1oQrQAFW4c4Ux90cOfuonWQUqnu9iDran97j4PcAJYQjXVO8RMdnq/YDWyRJQ1CPYVaLh1SoSeDtrYeyTNTUexjP/U7wznRDCB/YpvMsJ0VCqMK9YGumecUMaXWyWXW9d3zCslropb7uTsF/217eoD71Xznmx6r7R7j+/e2zq1Z6KnDxr9ljvOY9/ir+7yWWV/4p/AX31lXgFbJjWk:4DD1\n^PQ1,0,1,Y\n^PQ1\n^XZ',
        },
      },
      inputParameters: [
        {
          name: 'machineNummer',
          type: 'string',
        },
        {
          name: 'machineMetrics',
          type: 'string',
        },
        {
          name: 'partCount',
          type: 'number',
        },
        {
          name: 'machineTellerLaatst',
          type: 'string',
        },
        {
          name: 'aantalGereedSum',
          type: 'number',
        },
        {
          name: 'aantal',
          type: 'string',
        },
        {
          name: 'certificaatKenmerk',
          type: 'string',
        },
        {
          name: 'gewensteLeverDatum',
          type: 'string',
        },
        {
          name: 'productieNummer',
          type: 'string',
        },
        {
          name: 'artikelNummer',
          type: 'string',
        },
        {
          name: 'organisatieNaam',
          type: 'string',
        },
        {
          name: 'omschrijving',
          type: 'string',
        },
      ],
      outputParameters: {},
      createdAt: new Date(),
    };

    mockHttpClient = {
      init: jest.fn().mockResolvedValue(undefined),
      post: jest.fn().mockResolvedValue({ success: true, data: 'response' }),
    } as unknown as jest.Mocked<HttpClient>;
    connector = new ConnectorRunnerApiSink(
      connectorConfig,
      connectorConfig.config,
      [action, printAction],
      mockHttpClient,
    );
    await connector.start();
  });

  it('should initialize HttpClient', async () => {
    expect(mockHttpClient.init).toHaveBeenCalled();
  });

  it('should execute post request on valid job message', async () => {
    const message: XodJobType = {
      ...baseMessage,
      type: 'JOB',
      actionIdentifier: action.identifier,
      actionVersion: action.version,
      payload: {
        machineNummer: 'test',
        calculatieNummer: 'test',
        regelNummer: 1,
        machineNaam: 'test',
        aantalGereed: 1,
        stopTimestamp: '2025-01-01T10:18:46+00:00',
        bewerkingsplaatsNummer: 'test',
      },
    };
    await connector.getCallbackFunction()(message);
    expect(mockHttpClient.post).toHaveBeenCalledWith(
      '/api/test/start',
      `{
      "CalculationNumber": "test",
      "LineNumber": 1,
      "Bwpl": "test",
      "Quantity": 1,
      "Timestamp": "2025-01-01T11:18:46+01:00",
      "PersonelNumber": "test",
      "Meldcode": "SCRAP"
    }`,
    );
  });

  it('should print the proper values. Execute the print job', async () => {
    const message: XodJobType = {
      ...baseMessage,
      type: 'JOB',
      actionIdentifier: printAction.identifier,
      actionVersion: printAction.version,
      payload: {
        aantal: 4,
        partCount: 1,
        machineNummer: 505,
        aantalGereedSum: 3,
        productieNummer: 1234,
        gewensteLeverDatum: '01-01-2025',
        machineTellerLaatst: 2,
      },
    };
    await connector.getCallbackFunction()(message);
    expect(mockHttpClient.post).toHaveBeenCalledWith(
      'http://labelprinter500.internal.betech.nl/pstprnt',
      `^XA
~TA000
~JSN
^LT0
^MNW
^MTT
^PON
^PMN
^LH0,0
^JMA
^PR6,6
~SD30
^JUS
^LRN
^CI27
^PA0,1,1,0
^XZ
^XA
^MMT
^PW1200
^LL1876
^LS0
^FO442,1230^GFA,393,1356,6,:Z64:eJzVkjFuwzAMRSkQCBfDXDME8VF8tOoEPZOBXMRHaDcHcK2Sn01iJHaRpFnK4UH4kj4pikQW2SFgAxanFF+2I4T+IgwQurOgELSbEQpjN05SA0l+pB7SOJdm2aOSqOreaJGleJZURmSf3KpvYajGmgRkM64o/cI4I0HcDZ/wDH96w4ua/pEqF0JLsXbc8qlIH04ePq02+fI6pXjNYp72LHm3t9S8s3dVvA2ma+6Ctluz2lds7HI2B3FObOQpHTOlEb0awAdi7acOjZPxR+ydD1acVhhnfFg2HHcL6G7M+CN+so9XYd3LSyTaY19ADkJPNwxd4y5dOIHDX0ucdZXRVYmudj63esfkn2beT0p2crenF8/nQrX/ZQYilHSd36Sfsio=:60FF
^FO362,78^GFA,345,1355,5,:Z64:eJzNk00KgzAQhScMOBtJbmCP4sW6CHgxoYteo0fo0oU4nRd/itbWLArtLD6QJPP3nkTkImUiqOoWuW9nfIq6NWhnN7UnYh2I5HIysBB55jiiZLeDdCqRCk4vFLAEzJaK+HZQ+n1gytsGP0v1rxuKWxBV6QhgfG5swAsOgwGhM2DteqcTSr5irMYgboIPhlBZZhmA3vbCXWEZ7rnjvLrWqS1aFoQEHJRreKA49vlYBg2l1qQHBus0eBvWC88TrRX0gEBGaSTtmWYMQJc74X58kFGApMNbLcPXGlo8zvC4JI+3NbwEj6Naubt77AVXJELztvrqr/uMAFPv4QFK3Mfb:9B21
^FPH,8^FT363,630^AUR,59,18^FH\\^FD3/4^FS
^FO819,738^GB96,1074,6^FS
^FO847,766^GFA,501,2725,5,:Z64:eJzllc1twzAMhWkQKG/mAkGyST1aBfjgY0boKh4lQBfIMQfDKh/9B7sKarsFUjQ6fAAjiXx6lhiNMQadg4gEKICIqDWcrojqIbr1EWOBItLLCIQ+QW/1sJWxjTy7x9JQn74rJEsZg5b1I/M6TY7kQCum5WjIlQPl8hXSwY7LlQbKounRDi1wW1mZwxKWqjUPDAKoAxN5AtJt+34UtQGqstjAYhMpH++G8mxyuQqG0pImUfUQtsWC7yOlJeASX4Kvm6x2m8ISRK8+BUjal/5ura5RhQW2ZcB43LX4Owp84EVdFtiT59dGShDXB1wU2IQ7pEDqzSiugTUNw6XAW4h4FWgybs5pw8meqG/w1DfgmvlHnZOp9H0N91mgzhZzna83Nn3hDpjyLDLibqM4hZmxDbC1VQ1aEv3q+BAthOIMyAhFBR3lTHhZCKvvHmbXWOULT+VHuCU6WjLz5WcJdjW3/3WYJ/ujpy4R+i46+gT/7RPgFry6:3EC9
^FPH,8^FT848,0^AUR,59,18^FB1783,1,12,R^FH\\^FD^FS
^FO1086,1195^GFA,349,1032,4,:Z64:eJzFkj2OgzAQhR+LZDeWaV1Y+BoU0Z4rxSqh2nPlKBzBJQVi9jkmCSER66120IeMPcObHweRKSw4AKXs2rlHLQO0jGi+j7DKwyt7xSm1Ie2l8wOMHkkE9OUXgQ9iyQmoJqBhzPmCauZyBMJAeBr6vNZ0gaQP+tVTjkO7/Oe/anhYkPkOcCR+qU+tsAs7ts65/6I3c+LbMX5N2suPh0ZHXZlvlOZcszwdHfvt0XbUcdTxxKg7nlhDHdNSYyIjiYUK6olaJDaEOUb/Uo+CufrtW8XyNGkSyF3e3uu0Z5A7rbGdTbk9x3V4zPTdXD83/bn5mwL/4U95JWtxeOEHnS99bw==:BFB7
^FO1025,1195^GFA,233,576,4,:Z64:eJyV0E0KwyAQBeAXhLgRs3Ux6DWyKD1Tb9Cr5Sg5gsssQqbPkuanBWkefIuRUcZJqnNaBcDVCCAOCNR7ssDDDE022Y5QHfBUoJtQixkAmwPbBLEXSPAIQq7dCHnnKSLpTBPl6rt72hOjmjvi/7KwDgeldu++ehpdYKkrWHMPvH9WzrgXcC/gXjjvsrmS871+fdmvjn8r9f1rP59+90f/eGmukojbjxfxykzY:0E4D
^FPH,8^FT1086,0^AUR,59,18^FB1770,1,12,R^FH\\^FD01/01/2025^FS
^FO69,77^BQN,2,20^FDLA,1234##^FS
^FO87,1204^GFA,557,2605,5,:Z64:eJzVlL1ugzAQxw+5shfLrFS14BU6MkTqa2VALVOeq4+CVKkzU+WqCHp/QwkB0hQapekp/ASxfd8+IqIbfmgDVPwox3goiIKGX8Jq8pUUQN4DnwoLhC1+8/TbfalvDXmT38lTDpN8VDUl2823RIYs8U8DhigiOQ+/qgF/QuUZkWhcp89r/rFciRuQpKmHINoCFjCAPITpcVIsTsRAkjPuCsZtiTgyIAbCHUO8MoI3BPgIxIDPwVLhEOwAKwT5E21lHCqT9ZU5UpRxPVosdT1pOPl7EKX41/aYK8W+HhsoqAAHFIujnmoWDXdmCCSAnY1cInK5JMrV5QkKhnh/KUh9cJQK8ZrQ8oWRqWHcyyPgVSMtt6FJalI2rElU3HDCwfFyiffnllHNFWre9drJhvP7fHeq9u7zGFl+98fdvsMckjAuTYdIyhn4Bb+PW09jCmsFD9TzGRJx6eZnEfBblXxrQ8cm4xSxRYjSAloOYQGjUQUdHxov1xjvcjAawxfPwcrRZwajL52p5W/duJae/Ldx/Hlf9RJD3ww+AWU2AQE=:BC7B
^FO192,492^GFA,49,5192,4,:Z64:eJztwwENAAAMw6BKnX8Vd3AFkLBqqqqqqqrPA/Y85tA=:CE50
^FO438,79^GFA,337,1655,5,:Z64:eJzlk1Fug0AMRGdlCf8guEFyk3K0crSVchGOkE8+EK7HKCSgpE1XzU9qoSfBsjNjL0BnAJ1lwOyMZDZCxjRBMj6gPVoo/GoACfQ1kB4jXqmI2BYCMriUS870mIBP98DRBn/LUFqtWb8HcIglQnibtpAVP1fnEwGDCiOreXjNHZZ5NFSpKbpDLGiMjAOQfIikNuxQ0PAaKDGQRKDT0SEMJO4bqCXdQaz6YVQSO4xwAZGJEymJs9SrT+EZIw2jb93a2IELZmIsaPe2mEAIXdHSq+FivUU8q65h88OOyuvvJ8Rv40ZAfy1QPuJ3aOZ//7CLG0Xv4Qt+1fIQ:0E07
^FPH,8^FT517,630^AUR,59,18^FH\\^FD^FS
^FPH,8^FT439,630^AUR,59,18^FH\\^FD1234^FS
^FO281,494^GFA,449,1548,6,:Z64:eJy1lE1qw0AMhTUIrC6CZ9tFSC4Smmtl19l11zMZepE5grtzIbWqJxkKidOAnQrzLebn6WlGHiIZyeKonVG1J0qqAxEP6Wzs6IVICmWjf60NBgttbPE9xsrGGQqhxhXKlmP0vJaLXpGX9lqNrPSAyKpaZmh17QhOMghT5tMMmuc0y5gVeCepezcIh0n99Nw47et6u2WORDufFycHfTxdMcZz7KVfjs4zXarJCrVheanHDnSF5K7YNeUDZyvsN8LIHtxwusFYg3tpOPaqE2rMXq+12iPi3u1k598nGVyY3X6Ma06S0vmi6nZ68HACTwc46OGQq3d7h7PKBdvy1NtkfFrq6q3McH38/7+wons9hZ8yD5+mI9/oYVEoi2dp5T2jMbd4Jvk5mC65Ddpsy9nupbHN9kxmAUc28pi+Cp5JVDRMdS2P7F16gz/RrdH9:179C
^FPH,8^FT212,492^AUR,59,18^FH\\^FD^FS
^FO529,1234^GFA,317,1015,5,:Z64:eJzFk80NwjAMhV9kCV+qZAMYpaNhiQNrIbFIR+DYA2rwMxRo4RQhkUqf4vg3jltqrVaWALAjuJPqmzI69gOQQro6+pDcQCmVC2HzLs5A27CD0j98sT/N8WQK+Z6tfC+jZSVWIOOGZRCTesIsQFYxdJocskAmVFyrBzV4csyYiLGpjp43pa/UK+Gh9NQ7/EOGZwt0SB8IRdgpivta9mtZ11IFOzmsAGypUkICxr4tEWflZ914L+hoK7SHsjX+cbfnS6fXS593DuFLc64Cq6l7ILQ+dRsJj0p4ABH+QzI0tuaxCsfnG2486qD0:BD7E
^FPH,8^FT530,1585^AUR,59,18^FH\\^FD505^FS
^FO90,1753^GFA,41,165,5,:Z64:eJyz/////wN7VMKOgYF5wAh7LA4CAKbePRo=:B73F
^FO672,81^GFA,233,625,5,:Z64:eJytzzEOwyAMBdCPLMUdInyD5iY5V4cOlnqxbL1GbtCMDFGoTdVIoC5IBfEGG4wtOWeVGuAGW7udkA16WYifCzDRCsxhA+5+J2EGbZjAC0RFwSp2XaM91At6l3++NnQV8MZAabBud+dgKxoJiEyKkYNBFdFhsiw/WL0DfDmc1D1EO5G2AFdPsUMFj4WaEpO/NNRUNkK2WnwiBU+MNdEZPs+6J7f9kzcmdWVL:5ED3
^FO586,79^GFA,485,1854,6,:Z64:eJzFlUtqAzEMhmUEo81gb7sIyU2aixVq6KK7nml2vUaOkO5cSMeVfk0e5DlMUmrCB5HtXw9rbCLpSceydspa10Sh1kLEJWyUHT0TSaakxC+q0Zmp1cW36Csb0BVcjVemrD56+FVf9Gp+aVFXSq70iJFqzedINMe8gOyEPZzQ7cn30p49uKFjNblDrUzOlAffL6CpxVB3bPkzG9+MEnaMyZjmFpX04Mbi59KY3HpSKMvOiFwY9WFkJ90SsZl+RB2cLSpzSp/19WIto/+1m3SunRTWfmjNtclO+biumH6OZ6PN13o4jYjTOdH7ez7DEaO9wLgVVh0BGQx1rPKV4ZkuQFRJcJMs8J3ijN2QcESpOyAsw8WDlcOurelA+V/qeVs5/+1dd2dXB1wnXL5UR37sZtDTV2WBlygf2smRZ/aw8JMzHHPm1NnISV+SRjfrw5LE2LOS+/Cd7WGxjMqQ1/SR8H1d4C9rBvDm:265F
^FO516,77^GFA,389,1770,5,:Z64:eJzdlE2OgzAMhYMs4S6i5gblIpV6rS7ZzbWQ5iIcocsuRrjvmcIUBKMStVI1XnySk/j5J4FdgO2J1BBXQDugMPon+ol+pB8r+FHgx2A1UI2gKzYcsRZhdhdwKbVB3hN5yl3YasmQZ4YQDr5FCN1iChnxt83CgMKsQ+EDkoMbcYo9UfZh25r5qmfYpvAoZe0Mfc/acLsFDhfgeAbOR7R3wdSkTTyhmGSN06lvJtRP3cyJyub3+wMpzCbodwWI4n4Feo4oxQJ8F3lL8QgjICACKZSVOYaVQWRLrb01JcTBtaUHlzwiDOiIa3ZbvbECIXREYi7/mOIUvlb+FtusdpRvr58Qb/9BQDcL5I/4PzTzqZ/k2/7ZC9kouoQbM+EMEA==:00A9
^FPH,8^FT673,630^AUR,59,18^FH\\^FD^FS
^FPH,8^FT595,630^AUR,59,18^FH\\^FD^FS
^FO774,81^GFA,525,2418,6,:Z64:eJzdlkFuhDAMRW1lwTJHyE2ai1WCo+UoOQJLFnRc+3uYoS0dQktbqdHoCZko+Xa+w5DoIDYOOxxDjd8k0UJqGE2qwJbVVmvurGzz8oDJxg5MYuF+RnhCuCJsL/PFXiIcEI7vw4ywL7iz+8GMruPAOd5PYYcqPF1JRiJNPxNpWr3+BraH2imzyLwwiWUcRUarhhSIQwmn83P5bU+eNVp8uLgxQdsOBz0jigWsejp2AGQudZoTA8h2Rlrj0ZjK6Wq7Eh8wggnM1dSKMcjUD+YcVdu/YK9J1bKMYNW+Y6E8Ec+aHjHE84b47D1oQrQAFW4c4Ux90cOfuonWQUqnu9iDran97j4PcAJYQjXVO8RMdnq/YDWyRJQ1CPYVaLh1SoSeDtrYeyTNTUexjP/U7wznRDCB/YpvMsJ0VCqMK9YGumecUMaXWyWXW9d3zCslropb7uTsF/217eoD71Xznmx6r7R7j+/e2zq1Z6KnDxr9ljvOY9/ir+7yWWV/4p/AX31lXgFbJjWk:4DD1
^PQ1,0,1,Y
^PQ1
^XZ`,
    );
  });

  it('should execute post request on valid action message', async () => {
    const message = {
      ...baseMessage,
      type: 'ACTION',
      payload: {
        destination: '/test',
        content: 'test content',
      },
    } as XodActionType;
    await connector.getCallbackFunction()(message);
    expect(mockHttpClient.post).toHaveBeenCalledWith('/test', 'test content');
  });

  it('should handle missing post content', async () => {
    const message = { payload: {} } as XodActionType;
    const response = await connector.getCallbackFunction()(message);
    expect(response).toEqual(UnprocessableEntity('Content not found')(message));
  });
});
