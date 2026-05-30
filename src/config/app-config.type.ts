export type AppConfig = {
  nodeEnv: string;
  name: string;
  workingDirectory: string;
  frontendDomain?: string;
  backendDomain: string;
  port: number;
  apiPrefix: string;
  fallbackLanguage: string;
  headerLanguage: string;
  dataEncryptKey: string;
  allowedOrigins?: string;
  redisUrl: string;
  redisHost: string;
  redisPort: string;
  redisUserName?: string;
  redisPassword?: string;
  redisEnableEncryption: boolean;
};
