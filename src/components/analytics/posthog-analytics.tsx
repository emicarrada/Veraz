"use client";

import type { ReactNode } from "react";
import { Suspense, useEffect } from "react";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";

import { PostHogPageView } from "@/components/analytics/posthog-pageview";

export type PostHogAnalyticsProps = {
  apiKey: string;
  apiHost: string;
  children: ReactNode;
};

export function PostHogAnalytics({
  apiKey,
  apiHost,
  children,
}: PostHogAnalyticsProps) {
  useEffect(() => {
    if (!apiKey || posthog.__loaded) return;

    posthog.init(apiKey, {
      api_host: apiHost,
      person_profiles: "identified_only",
      capture_pageview: false,
      capture_pageleave: true,
      autocapture: true,
    });
  }, [apiHost, apiKey]);

  return (
    <PostHogProvider client={posthog}>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </PostHogProvider>
  );
}
