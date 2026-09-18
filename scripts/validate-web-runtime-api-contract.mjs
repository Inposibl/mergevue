import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer as createViteServer } from "vite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const AFFECTED_ENTRYPOINTS = Object.freeze([
  "api/resolve-company.ts",
  "api/start-public-research.ts",
]);

const HTTP_METHODS = Object.freeze([
  "GET",
  "HEAD",
  "OPTIONS",
  "POST",
  "PUT",
  "DELETE",
  "PATCH",
]);

const TS_IMPORT_SPECIFIER = /from\s+["']([^"']+\.ts)["']/;

function simulateVercelListenerUnwrap(mod) {
  let listener = mod;
  for (let i = 0; i < 5; i += 1) {
    if (listener && listener.default) listener = listener.default;
  }
  return listener;
}

function vercelWouldUseWebHandlers(mod) {
  const listener = simulateVercelListenerUnwrap(mod);
  return (
    HTTP_METHODS.some((method) => typeof listener?.[method] === "function")
    || typeof listener?.fetch === "function"
  );
}

function vercelWouldUseNodeReqRes(mod) {
  const listener = simulateVercelListenerUnwrap(mod);
  return typeof listener === "function" && !vercelWouldUseWebHandlers(mod);
}

async function readEntrypoint(relPath) {
  return readFile(path.join(root, relPath), "utf8");
}

const results = [];

function check(id, title, fn) {
  try {
    const extra = fn();
    results.push({ id, title, result: "PASS", extra: extra ?? null });
  } catch (error) {
    results.push({
      id,
      title,
      result: "FAIL",
      extra: error instanceof Error ? error.message : String(error),
    });
  }
}

check("INV-PUBLIC-ENDPOINTS", "minimum public entrypoints remain present", () => {
  assert.deepEqual([...AFFECTED_ENTRYPOINTS], [
    "api/resolve-company.ts",
    "api/start-public-research.ts",
  ]);
  return AFFECTED_ENTRYPOINTS.join(",");
});

for (const relPath of AFFECTED_ENTRYPOINTS) {
  const source = await readEntrypoint(relPath);
  check(`${relPath}:no-ts-specifier`, "entrypoint does not import compiled .ts specifiers", () => {
    const match = source.match(TS_IMPORT_SPECIFIER);
    assert.equal(match, null, match ? match[1] : "");
    return "js-specifiers-only";
  });
  check(`${relPath}:fetch-adapter`, "entrypoint attaches fetch onto the default handler", () => {
    assert.match(source, /Object\.assign\(\s*handler\s*,\s*\{\s*fetch:\s*handler\s*\}\s*\)/);
    assert.match(source, /async function handler\(\s*request:\s*Request\s*\)/);
    return "default-function-with-fetch";
  });
  check(`${relPath}:business-symbols`, "entrypoint still delegates to existing business modules", () => {
    if (relPath.endsWith("resolve-company.ts")) {
      assert.match(source, /resolveCompanyQuery/);
      assert.match(source, /methodNotAllowed/);
      assert.doesNotMatch(source, /buildPairDeliverable/);
      assert.doesNotMatch(source, /startPublicResearch/);
    } else {
      assert.match(source, /startPublicResearch/);
      assert.match(source, /methodNotAllowed/);
      assert.match(source, /parseJsonBody/);
      assert.doesNotMatch(source, /setSecResearchTestHarness/);
      assert.doesNotMatch(source, /buildPairDeliverable/);
    }
    return "business-delegation-preserved";
  });
}

check("NEG-BARE-DEFAULT-FUNCTION", "known-bad bare default function is not a Vercel web handler", () => {
  async function handler() {
    return new Response("ok");
  }
  const knownBad = { default: handler };
  assert.equal(vercelWouldUseWebHandlers(knownBad), false);
  assert.equal(vercelWouldUseNodeReqRes(knownBad), true);
  return "FUNCTION_INVOCATION_MISROUTE";
});

check("POS-FETCH-ON-DEFAULT-FUNCTION", "corrected default function with fetch is a Vercel web handler", () => {
  async function handler() {
    return new Response("ok");
  }
  const knownGood = { default: Object.assign(handler, { fetch: handler }) };
  assert.equal(vercelWouldUseWebHandlers(knownGood), true);
  assert.equal(vercelWouldUseNodeReqRes(knownGood), false);
  assert.equal(typeof knownGood.default, "function");
  return "WEB_FETCH_CONTRACT";
});

check("NEG-TS-IMPORT-SPECIFIER", "known-bad .ts import specifier is rejected", () => {
  const knownBadSource = 'import { x } from "../src/server/_response.ts";\n';
  assert.match(knownBadSource, TS_IMPORT_SPECIFIER);
  return "ts-specifier-rejected";
});

const vite = await createViteServer({
  root,
  configFile: false,
  server: { middlewareMode: true, hmr: false },
  appType: "custom",
  optimizeDeps: { noDiscovery: true },
});

try {
  for (const relPath of AFFECTED_ENTRYPOINTS) {
    const loaded = await vite.ssrLoadModule(`/${relPath}`);
    check(`${relPath}:callable-default`, "default export remains a callable function", () => {
      assert.equal(typeof loaded.default, "function");
      return "callable-default";
    });
    check(`${relPath}:runtime-web-contract`, "loaded module satisfies Vercel web-handler detection", () => {
      assert.equal(vercelWouldUseWebHandlers(loaded), true);
      assert.equal(vercelWouldUseNodeReqRes(loaded), false);
      assert.equal(typeof loaded.default.fetch, "function");
      return "fetch-on-unwrapped-default";
    });
  }

  const resolveApi = await vite.ssrLoadModule("/api/resolve-company.ts");
  const researchApi = await vite.ssrLoadModule("/api/start-public-research.ts");

  const getResolve = await resolveApi.default(
    new Request("http://127.0.0.1/api/resolve-company", { method: "GET" }),
  );
  const getResolveViaFetch = await resolveApi.default.fetch(
    new Request("http://127.0.0.1/api/resolve-company", { method: "GET" }),
  );
  const getResolveBody = await getResolve.json();
  const getResolveFetchBody = await getResolveViaFetch.json();
  const postResolveEmpty = await resolveApi.default(
    new Request("http://127.0.0.1/api/resolve-company", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{}",
    }),
  );
  const postResolveBody = await postResolveEmpty.json();

  check("LOCAL-RESOLVE-GET-405", "GET /api/resolve-company is handler-level 405 JSON", () => {
    assert.equal(getResolve.status, 405);
    assert.equal(getResolve.headers.get("content-type"), "application/json; charset=utf-8");
    assert.equal(getResolveBody.status, "method-not-allowed");
    return getResolveBody.status;
  });
  check("LOCAL-RESOLVE-FETCH-GET-405", "fetch adapter GET matches callable default", () => {
    assert.equal(getResolveViaFetch.status, 405);
    assert.deepEqual(getResolveFetchBody, getResolveBody);
    return getResolveFetchBody.status;
  });
  check("LOCAL-RESOLVE-POST-CONTROLLED", "POST /api/resolve-company remains bounded JSON", () => {
    assert.equal(postResolveEmpty.headers.get("content-type"), "application/json; charset=utf-8");
    assert.notEqual(postResolveEmpty.status, 500);
    assert.equal(typeof postResolveBody.status, "string");
    return String(postResolveEmpty.status);
  });

  const getResearch = await researchApi.default(
    new Request("http://127.0.0.1/api/start-public-research", { method: "GET" }),
  );
  const getResearchBody = await getResearch.json();
  const postResearchMalformed = await researchApi.default(
    new Request("http://127.0.0.1/api/start-public-research", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{}",
    }),
  );
  const postResearchBody = await postResearchMalformed.json();

  check("LOCAL-RESEARCH-GET-405", "GET /api/start-public-research is handler-level 405 JSON", () => {
    assert.equal(getResearch.status, 405);
    assert.equal(getResearch.headers.get("content-type"), "application/json; charset=utf-8");
    assert.equal(getResearchBody.status, "method-not-allowed");
    return getResearchBody.status;
  });
  check("LOCAL-RESEARCH-POST-400", "malformed POST /api/start-public-research remains bounded JSON", () => {
    assert.equal(postResearchMalformed.status, 400);
    assert.equal(postResearchMalformed.headers.get("content-type"), "application/json; charset=utf-8");
    assert.equal(postResearchBody.status, "malformed-request");
    return postResearchBody.status;
  });
} finally {
  await vite.close();
}

const failed = results.filter((row) => row.result === "FAIL");
const payload = {
  validator: "validate-web-runtime-api-contract",
  affected: AFFECTED_ENTRYPOINTS,
  passed: results.filter((row) => row.result === "PASS").length,
  failed: failed.length,
  results,
};

console.log(JSON.stringify(payload, null, 2));
if (failed.length > 0) {
  process.exit(1);
}
