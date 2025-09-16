export interface MailConfig {
  host: string;
  port: number;
  username: string;
  password?: string;
  secure?: boolean;
  tenantId?: string;
  clientId?: string;
  clientSecret?: string;
}
