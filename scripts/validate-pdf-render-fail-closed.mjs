import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const RENDERER_PATH = new URL("../api/render-pdf.js", import.meta.url);
const PACKAGE_PATH = new URL("../package.json", import.meta.url);

const source = readFileSync(RENDERER_PATH, "utf8");
const pkg = JSON.parse(readFileSync(PACKAGE_PATH, "utf8"));

const {
  evaluatePdfRenderAuthorization,
  isAllowedRendererRequestUrl,
  shouldAbortRendererRequest,
  SET_CONTENT_OPTIONS,
} = await import(RENDERER_PATH.href);

const failures = [];

function check(label, fn) {
  try {
    fn();
  } catch (error) {
    failures.push(`${label}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

check("package.json registers the fail-closed oracle", () => {
  assert.equal(
    pkg.scripts?.["validate:pdf-render-fail-closed"],
    "node scripts/validate-pdf-render-fail-closed.mjs"
  );
});

check("source scan: fail-open missing-key branch is gone", () => {
  assert.equal(
    /if\s*\(\s*!requiredKey\s*\)\s*\{\s*return\s+true\s*;/s.test(source),
    false,
    "fail-open `if (!requiredKey) return true` must not remain"
  );
  assert.equal(
    /if\s*\(\s*!requiredKey\s*\)\s*return\s+true\s*;/.test(source),
    false,
    "fail-open `if (!requiredKey) return true` must not remain"
  );
});

check("source scan: networkidle0 amplification path is gone", () => {
  assert.equal(source.includes("networkidle0"), false, "waitUntil networkidle0 must not remain");
});

check("source scan: setContent timeout 45000 is gone", () => {
  assert.equal(source.includes("45000"), false, "timeout 45000 must not remain");
  assert.equal(
    /setContent\s*\([\s\S]{0,240}timeout\s*:\s*45_?000/.test(source),
    false,
    "setContent must not use timeout 45000"
  );
});

check("source scan: fail-closed missing-key branch exists", () => {
  assert.ok(source.includes("PDF renderer is not configured"));
  assert.ok(source.includes("status: 503"));
  assert.ok(source.includes("wouldLaunchBrowser: false"));
});

check("source scan: request interception denies http(s)", () => {
  assert.ok(source.includes("setRequestInterception"));
  assert.ok(source.includes("request.abort"));
  assert.ok(source.includes('protocol === "about:"') || source.includes("protocol === 'about:'"));
  assert.ok(source.includes('protocol === "data:"') || source.includes("protocol === 'data:'"));
});

check("source scan: authorize before Chromium launch", () => {
  const authIdx = source.indexOf("evaluatePdfRenderAuthorization");
  const denyIdx = source.indexOf("if (!authorization.allowed)");
  const importIdx = source.indexOf('import("puppeteer-core")');
  const launchIdx = source.indexOf("puppeteer.launch");

  assert.ok(authIdx !== -1, "evaluatePdfRenderAuthorization must be used");
  assert.ok(denyIdx !== -1, "authorization deny return must exist");
  assert.ok(importIdx !== -1, "puppeteer-core must load only after auth");
  assert.ok(launchIdx !== -1, "puppeteer.launch must exist");
  assert.ok(authIdx < denyIdx, "authorization evaluation must precede deny return");
  assert.ok(denyIdx < importIdx, "deny return must precede puppeteer import");
  assert.ok(importIdx < launchIdx, "puppeteer import must precede launch");
});

check("source scan: setContent waits only for domcontentloaded <= 15000ms", () => {
  assert.equal(SET_CONTENT_OPTIONS.waitUntil, "domcontentloaded");
  assert.ok(SET_CONTENT_OPTIONS.timeout <= 15_000);
  assert.ok(source.includes("SET_CONTENT_OPTIONS"));
  assert.ok(source.includes('waitUntil: "domcontentloaded"') || source.includes("waitUntil: 'domcontentloaded'"));
});

check("source scan: Chromium is not imported at module top level", () => {
  const preamble = source.slice(0, source.indexOf("export default async function handler"));
  assert.equal(preamble.includes("@sparticuz/chromium"), false);
  assert.equal(preamble.includes("puppeteer-core"), false);
});

const authCases = [
  {
    label: "unset key, no credential",
    requiredKey: undefined,
    headers: {},
    expected: { allowed: false, status: 503, error: "PDF renderer is not configured", wouldLaunchBrowser: false },
  },
  {
    label: "empty key, any credential",
    requiredKey: "",
    headers: { authorization: "Bearer secret" },
    expected: { allowed: false, status: 503, error: "PDF renderer is not configured", wouldLaunchBrowser: false },
  },
  {
    label: "whitespace key, Bearer secret",
    requiredKey: " ",
    headers: { authorization: "Bearer secret" },
    expected: { allowed: false, status: 503, error: "PDF renderer is not configured", wouldLaunchBrowser: false },
  },
  {
    label: "configured key, no credential",
    requiredKey: "secret",
    headers: {},
    expected: { allowed: false, status: 401, error: "Unauthorized", wouldLaunchBrowser: false },
  },
  {
    label: "configured key, Bearer wrong",
    requiredKey: "secret",
    headers: { authorization: "Bearer wrong" },
    expected: { allowed: false, status: 401, error: "Unauthorized", wouldLaunchBrowser: false },
  },
  {
    label: "configured key, x-api-key wrong",
    requiredKey: "secret",
    headers: { "x-api-key": "wrong" },
    expected: { allowed: false, status: 401, error: "Unauthorized", wouldLaunchBrowser: false },
  },
  {
    label: "configured key, x-pdf-render-key wrong",
    requiredKey: "secret",
    headers: { "x-pdf-render-key": "wrong" },
    expected: { allowed: false, status: 401, error: "Unauthorized", wouldLaunchBrowser: false },
  },
  {
    label: "configured key, Bearer secret",
    requiredKey: "secret",
    headers: { authorization: "Bearer secret" },
    expected: { allowed: true, wouldLaunchBrowser: true },
  },
  {
    label: "configured key, x-api-key secret",
    requiredKey: "secret",
    headers: { "x-api-key": "secret" },
    expected: { allowed: true, wouldLaunchBrowser: true },
  },
  {
    label: "configured key, x-pdf-render-key secret",
    requiredKey: "secret",
    headers: { "x-pdf-render-key": "secret" },
    expected: { allowed: true, wouldLaunchBrowser: true },
  },
];

for (const testCase of authCases) {
  check(`auth: ${testCase.label}`, () => {
    const result = evaluatePdfRenderAuthorization({
      requiredKey: testCase.requiredKey,
      headers: testCase.headers,
    });

    assert.equal(result.allowed, testCase.expected.allowed);
    assert.equal(result.wouldLaunchBrowser, testCase.expected.wouldLaunchBrowser);

    if (testCase.expected.allowed) {
      assert.equal(result.wouldLaunchBrowser, true);
      return;
    }

    assert.equal(result.status, testCase.expected.status);
    assert.equal(result.error, testCase.expected.error);
    assert.equal(result.wouldLaunchBrowser, false);
  });
}

const allowUrls = [
  "about:blank",
  "data:text/html",
  "data:image/png",
];

const denyUrls = [
  "http://127.0.0.1:1/",
  "https://example.com/x.png",
  "https://evil.test/slow",
  "file:///etc/passwd",
  "ws://example.com",
];

for (const url of allowUrls) {
  check(`network allow: ${url}`, () => {
    assert.equal(isAllowedRendererRequestUrl(url), true);
    assert.equal(shouldAbortRendererRequest(url), false);
  });
}

for (const url of denyUrls) {
  check(`network deny: ${url}`, () => {
    assert.equal(isAllowedRendererRequestUrl(url), false);
    assert.equal(shouldAbortRendererRequest(url), true);
  });
}

check("oracle does not load Chromium/Puppeteer", () => {
  const require = createRequire(fileURLToPath(import.meta.url));
  const loaded = Object.keys(require.cache || {});
  assert.equal(loaded.some((id) => id.includes("puppeteer-core")), false);
  assert.equal(loaded.some((id) => id.includes("@sparticuz/chromium")), false);
});

if (failures.length) {
  console.error("validate:pdf-render-fail-closed FAILED");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("validate:pdf-render-fail-closed passed");
console.log(`auth cases: ${authCases.length}`);
console.log(`network allow: ${allowUrls.length}`);
console.log(`network deny: ${denyUrls.length}`);
