import { NextResponse } from "next/server";

import { verifyCronAuth } from "@/lib/scheduler/auth/verify-cron-auth";
import { runSchedulerJob } from "@/lib/scheduler/run-job";
import type { JobRunSummary } from "@/lib/scheduler/types/job-run";

function jobResponse(summary: JobRunSummary) {
  const code =
    summary.status === "failure" ? 500 : summary.status === "partial" ? 207 : 200;
  return NextResponse.json(summary, { status: code });
}

async function handleDiscover(request: Request) {
  if (!verifyCronAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const summary = await runSchedulerJob("discover_feeds");
  return jobResponse(summary);
}

export async function GET(request: Request) {
  return handleDiscover(request);
}

export async function POST(request: Request) {
  return handleDiscover(request);
}
