import pino from "pino";
import { config } from "./config.js";

export const logger = pino(
  config.nodeEnv === "production"
    ? { level: config.logLevel }
    : {
        level: config.logLevel,
        transport: { target: "pino-pretty", options: { colorize: true } },
      }
);
