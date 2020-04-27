import { isClient } from "./is-client";
import { createLogger, format, transports } from "winston";
const rollbar = require("rollbar");
let logInstance = null;

let log;

if (!isClient()) {
  let enableRollbar = false;
  if (
    process.env.NODE_ENV === "production" &&
    process.env.ROLLBAR_ACCESS_TOKEN
  ) {
    enableRollbar = true;
    rollbar.init(process.env.ROLLBAR_ACCESS_TOKEN);
  }

  logInstance = createLogger({
    level: "info",
    format: format.combine(
      format.timestamp({
        format: "YYYY-MM-DD HH:mm:ss"
      }),
      format.errors({ stack: true }),
      format.splat(),
      format.json()
    ),
    transports: [new transports.Console()]
  });

  const existingErrorLogger = logInstance.error;
  logInstance.error = err => {
    if (enableRollbar) {
      if (typeof err === "object") {
        rollbar.handleError(err);
      } else if (typeof err === "string") {
        rollbar.reportMessage(err);
      } else {
        rollbar.reportMessage("Got backend error with no error message");
      }
    }

    existingErrorLogger(err && err.stack ? err.stack : err);
  };
} else {
}

const log = process.env.LAMBDA_DEBUG_LOG ? console : logInstance;

export { log };
