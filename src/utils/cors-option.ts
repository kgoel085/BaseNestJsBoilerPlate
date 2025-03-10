import { ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/config/config.type';

function allowedCorsOrigins(
  configService: ConfigService<AllConfigType>,
): string[] {
  const allowedOrigin = configService.get('app.allowedOrigins', {
    // Use this to add any additional CORS related domains
    infer: true,
  });

  const frontendDomain = configService.get('app.frontendDomain', {
    infer: true,
  });

  const returnOrigins: string[] = [];
  if (frontendDomain) returnOrigins.push(frontendDomain);
  if (allowedOrigin) {
    returnOrigins.push(
      ...(allowedOrigin ?? '').split(',').map((i) => i.trim()),
    );
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
