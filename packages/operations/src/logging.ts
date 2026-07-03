import fs from 'fs';
import path from 'path';

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export class CentralLogger {
  private logFilePath: string;
  private level: LogLevel = 'INFO';

  constructor(logDir = 'logs', level: LogLevel = 'INFO') {
    this.level = level;
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    this.logFilePath = path.join(logDir, 'app-operations.log');
  }

  public setLogLevel(level: LogLevel): void {
    this.level = level;
  }

  public debug(message: string, context = 'GLOBAL'): void {
    this.log('DEBUG', message, context);
  }

  public info(message: string, context = 'GLOBAL'): void {
    this.log('INFO', message, context);
  }

  public warn(message: string, context = 'GLOBAL'): void {
    this.log('WARN', message, context);
  }

  public error(message: string, context = 'GLOBAL'): void {
    this.log('ERROR', message, context);
  }

  private log(level: LogLevel, message: string, context: string): void {
    const levels: Record<LogLevel, number> = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };
    
    if (levels[level] < levels[this.level]) {
      return;
    }

    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] [${level}] [${context}] ${message}\n`;

    // Console output
    if (level === 'ERROR') {
      console.error(formattedMessage.trim());
    } else {
      console.log(formattedMessage.trim());
    }

    // Write file append
    try {
      fs.appendFileSync(this.logFilePath, formattedMessage);
    } catch {
      // Ignored
    }
  }

  public readLogs(): string {
    if (fs.existsSync(this.logFilePath)) {
      return fs.readFileSync(this.logFilePath, 'utf8');
    }
    return '';
  }

  public clearLogs(): void {
    if (fs.existsSync(this.logFilePath)) {
      fs.writeFileSync(this.logFilePath, '');
    }
  }
}

export const centralLogger = new CentralLogger();
export default centralLogger;
