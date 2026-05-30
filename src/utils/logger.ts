import { createLogger, format, transports } from 'winston';
import {
  WinstonModule,
  utilities as nestWinstonModuleUtilities,
} from 'nest-winston';

// ✅ Custom log format
const customFormat = format.printf(
  ({ timestamp, level, stack, message, ...meta }) => {
    const metaData =
      meta && Object.keys(meta).length ? JSON.stringify(meta) : '';
    return `${timestamp} - [${level.toUpperCase()}] - ${stack || message} ${metaData}`;
  },
);

// ✅ Define Winston logger with rotation
export const instance = createLogger({
  level: 'debug', // Log everything
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.metadata({ fillExcept: ['timestamp', 'level', 'message', 'stack'] }),
    customFormat,
  ),
  transports: [
    new transports.Console(), // Console logs
  ],
});

// ✅ Logger Factory for NestJS
export const LoggerFactory = (appName: string) => {
  const logFormat = format.combine(
    format.timestamp(),
    format.ms(),
    format.errors({ stack: true }),
    format.metadata({ fillExcept: ['timestamp', 'level', 'message', 'stack'] }),
    format.json(),
    nestWinstonModuleUtilities.format.nestLike(appName, {
      colors: true,
      prettyPrint: true,
    }),
  );

  const insTransports: any[] = [
    new transports.Console({ format: logFormat }), // Console logs
  ];

  return WinstonModule.createLogger({
    level: 'debug',
    transports: insTransports,
  });
};
