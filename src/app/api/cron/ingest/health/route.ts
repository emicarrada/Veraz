import { NextResponse } from "next/server";

import { guardCronRequest } from "@/lib/security/cron-route-guard";
import { runSchedulerJob } from "@/lib/scheduler/run-job";
import type { JobRunSummary } from "@/lib/scheduler/types/job-run";

function jobResponse(summary: JobRunSummary) {
  const code =
    summary.status === "failure" ? 500 : summary.status === "partial" ? 207 : 200;
  return NextResponse.json(summary, { status: code });
}

async function handleHealthCheck(request: Request) {
  const blocked = guardCronRequest(request);
  if (blocked) return blocked;

  const summary = await runSchedulerJob("health_check");
  return jobResponse(summary);
}

export async function GET(request: Request) {
  return handleHealthCheck(request);
}

export async function POST(request: Request) {
  return handleHealthCheck(request);
}
