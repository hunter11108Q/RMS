import winston from 'winston';
import path from 'path';
import config from '../config/index';

const logFormat = winston.format.printf(({ level, message, timestamp, context, ...metadata }) => {
  let msg = `[${timestamp}] [${level.toUpperCase()}]`;
  if (context) msg += ` [${context}]`;
  msg += `: ${message}`;
  if (Object.keys(metadata).length > 0) {
    msg += ` | ${JSON.stringify(metadata)}`;
  }
  return msg;
});

export const logger = winston.createLogger({
  level: config.logging.level,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp', 'context'] })
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), logFormat),
    }),
    new winston.transports.File({
      filename: path.join(config.logging.filePath, 'error.log'),
      level: 'error',
      format: winston.format.json(),
    }),
    new winston.transports.File({
      filename: path.join(config.logging.filePath, 'combined.log'),
      format: winston.format.json(),
    }),
  ],
});

export default logger;
