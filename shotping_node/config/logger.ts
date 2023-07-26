import winston from "winston";
import { format } from "date-fns";
import { utcToZonedTime, format as tzFormat } from "date-fns-tz";
import "winston-daily-rotate-file";

// Define the timezone offset for KST
const kst = "Asia/Seoul";

// Logging with Winston
const logFormat = winston.format.printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

const transport = new winston.transports.DailyRotateFile({
  dirname: "/usr/src/logs",
  filename: "application-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "14d",
});

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({
      format: () => tzFormat(utcToZonedTime(new Date(), kst), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
    }),
    logFormat
  ),
  transports: [transport],
});

export default logger;