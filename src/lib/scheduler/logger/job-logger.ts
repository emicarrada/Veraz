import type { JobRunContext, JobRunSummary } from "@/lib/scheduler/types/job-run";

export type SchedulerLogEvent =
  | {
      type: "scheduler.job.start";
      timestamp: string;
      jobName: JobRunSummary["jobName"];
      runId: string;
    }
  | {
      type: "scheduler.job.complete";
      timestamp: string;
      summary: JobRunSummary;
    };

/**
 * Structured console logger — ready for external observability sinks.
 */
export class JobLogger {
  logStart(context: JobRunContext, jobName: JobRunSummary["jobName"]): void {
    this.emit({
      type: "scheduler.job.start",
      timestamp: new Date().toISOString(),
      jobName,
      runId: context.runId,
    });
  }

  logComplete(summary: JobRunSummary): void {
    this.emit({
      type: "scheduler.job.complete",
      timestamp: new Date().toISOString(),
      summary,
    });
  }

  private emit(event: SchedulerLogEvent): void {
    console.log(JSON.stringify({ level: "info", ...event }));
  }
}

export const jobLogger = new JobLogger();
