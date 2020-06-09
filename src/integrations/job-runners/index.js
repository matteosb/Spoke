import { r } from "../../server/models";
import defaultRunner from "./default";
import inProcessRunner from "./in-process";
import inProcessSyncRunner from "./in-process-sync";

function getJobRunner() {
  const name = process.env.JOB_RUNNER;
  if (name) {
    try {
      return require(`./${name}`);
    } catch (e) {
      throw new Error(`Job runner ${name} not found`);
    }
    // compatibility with previous env vars
  } else if (process.env.JOBS_SAME_PROCESS) {
    return process.env.JOBS_SYNC ? inProcessSyncRunner : inProcessRunner;
  } else {
    return defaultRunner;
  }
}

const jobRunner = getJobRunner();

export async function dispatchJob(jobData) {
  return jobRunner.dispatch(jobData);
}
