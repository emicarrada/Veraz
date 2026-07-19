import { NextResponse } from "next/server";

import { verifyCronAuth } from "@/lib/scheduler/auth/verify-cron-auth";
import { runSchedulerJob } from "@/lib/scheduler/run-job";
import type { JobRunSummary } from "@/lib/scheduler/types/job-run";

function jobResponse(summary: JobRunSummary) {
  const code =
    summary.status === "failure" ? 500 : summary.status === "partial" ? 207 : 200;
  return NextResponse.json(summary, { status: code });
}

async function handleRunIngestion(request: Request) {
  if (!verifyCronAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const summary = await runSchedulerJob("run_ingestion");
  return jobResponse(summary);
}

/** Vercel Cron invokes GET by default. */
export async function GET(request: Request) {
  return handleRunIngestion(request);
}

export async function POST(request: Request) {
  return handleRunIngestion(request);
}
