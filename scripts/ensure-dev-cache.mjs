import { appendFileSync, existsSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const NEXT_DIR = join(ROOT, ".next");
const MARKER = join(NEXT_DIR, ".production-build");
const DOCUMENT = join(NEXT_DIR, "server", "pages", "_document.js");
const DEBUG_LOG = join(ROOT, ".cursor", "debug-190033.log");

function debugLog(message, data, hypothesisId) {
  try {
    appendFileSync(
      DEBUG_LOG,
      `${JSON.stringify({
        sessionId: "190033",
        runId: "ensure-dev-cache",
        hypothesisId,
        location: "scripts/ensure-dev-cache.mjs",
        message,
        data,
        timestamp: Date.now(),
      })}\n`,
    );
  } catch {
    // ignore logging failures
  }
}

function hasProductionPagesArtifact() {
  if (!existsSync(DOCUMENT)) return false;
  const content = readFileSync(DOCUMENT, "utf8");
  return content.includes("pages.runtime.prod.js");
}

function hasBrokenChunkReference() {
  const chunkAtRoot = join(NEXT_DIR, "server", "611.js");
  const chunkInDir = join(NEXT_DIR, "server", "chunks", "611.js");
  return !existsSync(chunkAtRoot) && existsSync(chunkInDir);
}

function hasMissingRootServerChunks() {
  const chunksDir = join(NEXT_DIR, "server", "chunks");
  if (!existsSync(chunksDir)) return false;

  try {
    const chunkFiles = readdirSync(chunksDir).filter((name) => /^\d+\.js$/.test(name));
    return chunkFiles.some((name) => !existsSync(join(NEXT_DIR, "server", name)));
  } catch {
    return false;
  }
}

const hasMarker = existsSync(MARKER);
const hasProdPages = hasProductionPagesArtifact();
const hasBrokenChunks = hasBrokenChunkReference();
const hasMissingRootChunks = hasMissingRootServerChunks();
const shouldClean =
  hasMarker || hasProdPages || hasBrokenChunks || hasMissingRootChunks;

debugLog("ensure-dev-cache scan", {
  hasMarker,
  hasProdPages,
  hasBrokenChunks,
  hasMissingRootChunks,
  shouldClean,
  nextDirExists: existsSync(NEXT_DIR),
}, "H1");

if (shouldClean) {
  debugLog("cleaning stale .next before dev", { reason: {
    hasMarker,
    hasProdPages,
    hasBrokenChunks,
    hasMissingRootChunks,
  }}, "H1");
  console.log("[veraz] Stale production .next cache detected — cleaning before dev...");
  rmSync(NEXT_DIR, { recursive: true, force: true });
}
