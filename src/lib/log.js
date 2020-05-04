import TransportStream from "winston-transport";
import { createLogger, format, transports } from "winston";
import rollbar from "rollbar";
import { isClient } from ".";

let log;
if (isClient() || process.env.LAMBDA_DEBUG_LOG) {
  log = console;
} else {
  class RollbarTransport extends TransportStream {
    log(info, callback) {
      const { level, message } = info;

      setImmediate(() => this.emit("logged", info));

      if (level === "error") {
        if (typeof message === "object") {
          rollbar.handleError(message);
        } else if (typeof message === "string") {
          rollbar.reportMessage(message);
        } else {
          rollbar.reportMessage("Got backend error with no error message");
        }
      }

      callback();
    }
  }

  let enableRollbar = false;
  if (
    process.env.NODE_ENV === "production" &&
    process.env.ROLLBAR_ACCESS_TOKEN
  ) {
    enableRollbar = true;
    rollbar.init(process.env.ROLLBAR_ACCESS_TOKEN);
  }

  const winstonTransports = [new transports.Console()];

  if (enableRollbar) {
    winstonTransports.push(new RollbarTransport({ rollbar }));
  }

  log = createLogger({
    level: "info",
    format: format.combine(
      format.timestamp({
        format: "YYYY-MM-DD HH:mm:ss"
      }),
      format.errors({ stack: true }),
      format.json()
    ),
    transports: winstonTransports
  });
}

export default log;
