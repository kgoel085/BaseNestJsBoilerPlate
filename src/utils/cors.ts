import { ConfigService } from '@nestjs/config';
import { AllConfigType, Environment } from '../config/config.type';

function allowedCorsOrigins(
  configService: ConfigService<AllConfigType>,
): string[] | boolean {
  const nodeEnv = configService.get('app.nodeEnv', { infer: true });
  if (nodeEnv !== Environment.Production) {
    return true;
  }
  const allowedOrigin = configService.get('app.allowedOrigins', {
    // Use this to add any additional CORS related domains
    infer: true,
  });

  const backendDomain = configService.get('app.backendDomain', {
    infer: true,
  });

  const returnOrigins: string[] = [];
  if (backendDomain) returnOrigins.push(backendDomain);

  if (allowedOrigin) {
    returnOrigins.push(...allowedOrigin.split(',').map((i) => i.trim()));
  }

  return [...new Set(returnOrigins)];
}

export default function corsOptions(configService: ConfigService) {
  const corsOptions = {
    origin: allowedCorsOrigins(configService),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  };

  return corsOptions;
}
