import TransportStream from "winston-transport";
import { createLogger, format, transports } from "winston";
import rollbar from "rollbar";

let log;
let enableRollbar = false;
if (process.env.NODE_ENV === "production" && process.env.ROLLBAR_ACCESS_TOKEN) {
  enableRollbar = true;
  rollbar.init(process.env.ROLLBAR_ACCESS_TOKEN);
}

class RollbarTransport extends TransportStream {
  constructor(opts) {
    super(opts);
    this.level = opts.level || "error";
    this.rollbar = opts.rollbar;
  }

  log(info, callback) {
    const { level, message } = info;
    process.nextTick(() => {
      const cb = err => {
        if (err) {
          this.emit("error", err);
          return callback(err);
        }
        this.emit("logged");
        return callback(null, true);
      };

      const logMethod = this.rollbar[rollbarLevel] || this.rollbar.log;
      return logMethod.apply(this.rollbar, [message, meta, cb]);
    });
    if (typeof err === "object") {
      rollbar.handleError(err);
    } else if (typeof err === "string") {
      rollbar.reportMessage(err);
    } else {
      rollbar.reportMessage("Got backend error with no error message");
    }
  }
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

log = process.env.LAMBDA_DEBUG_LOG ? console : logInstance;
export default log;
