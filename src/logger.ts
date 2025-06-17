import winston from 'winston';
import fs from 'fs';
import path from 'path';

const apiLogPath = path.join('logs', 'bot.log');

class ReverseFileTransport extends winston.transports.File {
    log(info: any, callback: any) {
        setImmediate(() => this.emit('logged', info));

        const logMessage = `${info[Symbol.for('message')]}\n`;

        fs.readFile(apiLogPath, 'utf8', (err, data) => {
            if (err && err.code !== 'ENOENT') return callback(err);

            const newLog = logMessage + (data || '');

            fs.writeFile(apiLogPath, newLog, callback);
        });
    }
}

const consoleFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.colorize({ all: false, level: true }),
    winston.format.printf(({ level, message, timestamp, ...meta }) => {
        const metaStr = Object.entries(meta)
            .filter(([key]) => key !== 'level')
            .map(([key, value]) => `${key}=${value}`)
            .join(' ');
        return `${timestamp} | ${level.padEnd(7)} | ${message} ${metaStr}`;
    })
);

const fileFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ level, message, timestamp, ...meta }) => {
        const metaStr = Object.entries(meta)
            .map(([key, value]) => `${key}=${value}`)
            .join(' ');
        return `${timestamp} | ${level.toUpperCase().padEnd(7)} | ${message} ${metaStr}`;
    })
);

export const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: fileFormat,

    transports: [
        new winston.transports.Console({
            format: consoleFormat
        }),
        new ReverseFileTransport({
            filename: apiLogPath
        })
    ]
});
