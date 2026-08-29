import { timingSafeEqual } from "node:crypto";

const MAX_HTML_BYTES = 5 * 1024 * 1024;
const MIN_HTML_CHARS = 1000;
const MIN_RENDERED_TEXT_CHARS = 100;
const MIN_RENDERED_HTML_CHARS = 1000;
const MIN_PDF_BYTES = 10_000;

export const SET_CONTENT_OPTIONS = Object.freeze({
  waitUntil: "domcontentloaded",
  timeout: 15_000,
});

function sanitizeFilename(value) {
  const raw = String(value || "mergevue-forecast-brief.pdf").trim();

  const safe = raw
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return safe.toLowerCase().endsWith(".pdf")
    ? safe
    : `${safe || "mergevue-forecast-brief"}.pdf`;
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;

      if (Buffer.byteLength(body, "utf8") > MAX_HTML_BYTES) {
        reject(new Error("Request body too large"));
        req.destroy();
      }
    });

    req.on("end", () => {
      resolve(body);
    });

    req.on("error", reject);
  });
}

function parseRequestBody(rawBody, contentType) {
  const type = String(contentType || "").toLowerCase();

  if (!rawBody) {
    return {};
  }

  if (type.includes("application/json")) {
    try {
      return JSON.parse(rawBody);
    } catch {
      throw new Error("Invalid JSON body");
    }
  }

  if (type.includes("text/html")) {
    return { html: rawBody };
  }

  try {
    return JSON.parse(rawBody);
  } catch {
    return { html: rawBody };
  }
}

function extractHtml(body) {
  if (typeof body.html === "string") return body.html;
  if (typeof body.source === "string") return body.source;
  if (typeof body.content === "string") return body.content;
  if (typeof body.document === "string") return body.document;
  return "";
}

function headerString(headers, name) {
  const value = headers?.[name];
  if (Array.isArray(value)) return String(value[0] ?? "");
  if (value == null) return "";
  return String(value);
}

function timingSafeStringEqual(provided, required) {
  const left = Buffer.from(String(provided ?? ""), "utf8");
  const right = Buffer.from(String(required ?? ""), "utf8");

  if (left.length !== right.length) {
    timingSafeEqual(left, left);
    return false;
  }

  if (left.length === 0) {
    return false;
  }

  return timingSafeEqual(left, right);
}

function extractProvidedCredentials(headers = {}) {
  const auth = headerString(headers, "authorization");
  const bearer = auth.startsWith("Bearer ") ? auth.slice("Bearer ".length).trim() : "";

  return {
    bearer,
    xApiKey: headerString(headers, "x-api-key"),
    xPdfRenderKey: headerString(headers, "x-pdf-render-key"),
  };
}

export function resolveConfiguredPdfRenderApiKey(rawValue) {
  if (rawValue == null) return "";
  return String(rawValue).trim();
}

export function evaluatePdfRenderAuthorization({ requiredKey, headers } = {}) {
  const configuredKey = resolveConfiguredPdfRenderApiKey(requiredKey);

  // Fail-closed: missing/blank PDF_RENDER_API_KEY never reaches Chromium.
  if (!configuredKey) {
    return {
      allowed: false,
      status: 503,
      error: "PDF renderer is not configured",
      wouldLaunchBrowser: false,
    };
  }

  const provided = extractProvidedCredentials(headers);
  const matched =
    timingSafeStringEqual(provided.bearer, configuredKey) ||
    timingSafeStringEqual(provided.xApiKey, configuredKey) ||
    timingSafeStringEqual(provided.xPdfRenderKey, configuredKey);

  if (!matched) {
    return {
      allowed: false,
      status: 401,
      error: "Unauthorized",
      wouldLaunchBrowser: false,
    };
  }

  return {
    allowed: true,
    status: null,
    error: null,
    wouldLaunchBrowser: true,
  };
}

export function isAllowedRendererRequestUrl(rawUrl) {
  if (rawUrl == null) return false;

  const text = String(rawUrl).trim();
  if (!text) return false;

  let parsed;
  try {
    parsed = new URL(text);
  } catch {
    return false;
  }

  const protocol = String(parsed.protocol || "").toLowerCase();
  return protocol === "about:" || protocol === "data:";
}

export function shouldAbortRendererRequest(rawUrl) {
  return !isAllowedRendererRequestUrl(rawUrl);
}

export async function applyRendererNetworkPolicy(page) {
  await page.setRequestInterception(true);
  page.on("request", (request) => {
    const action = isAllowedRendererRequestUrl(request.url())
      ? request.continue()
      : request.abort();

    if (action && typeof action.catch === "function") {
      action.catch(() => {});
    }
  });
}

function setCorsHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-API-Key, X-PDF-Render-Key"
  );
}

function jsonError(res, status, error, details = {}) {
  setCorsHeaders(res);
  return res.status(status).json({
    error,
    ...details,
  });
}

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return jsonError(res, 405, "Method not allowed");
  }

  const authorization = evaluatePdfRenderAuthorization({
    requiredKey: process.env.PDF_RENDER_API_KEY,
    headers: req.headers,
  });

  if (!authorization.allowed) {
    return jsonError(res, authorization.status, authorization.error);
  }

  let browser;

  try {
    const rawBody = await readRequestBody(req);
    const body = parseRequestBody(rawBody, req.headers["content-type"]);

    const html = extractHtml(body);
    const filename = sanitizeFilename(body.filename);

    const htmlBytes = Buffer.byteLength(html, "utf8");

    console.log("[render-pdf] input", {
      contentType: req.headers["content-type"],
      rawBodyBytes: Buffer.byteLength(rawBody || "", "utf8"),
      htmlLength: html.length,
      htmlBytes,
      filename,
      startsWith: html.slice(0, 160),
    });

    if (!html.trim()) {
      return jsonError(res, 400, "Missing html", {
        rawBodyBytes: Buffer.byteLength(rawBody || "", "utf8"),
        receivedKeys: body && typeof body === "object" ? Object.keys(body) : [],
      });
    }

    if (html.length < MIN_HTML_CHARS) {
      return jsonError(res, 400, "HTML payload is unexpectedly small", {
        htmlLength: html.length,
        htmlBytes,
        startsWith: html.slice(0, 300),
      });
    }

    const [{ default: chromium }, { default: puppeteer }] = await Promise.all([
      import("@sparticuz/chromium"),
      import("puppeteer-core"),
    ]);

    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: {
        width: 1240,
        height: 1754,
        deviceScaleFactor: 1,
      },
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await applyRendererNetworkPolicy(page);

    await page.setContent(html, SET_CONTENT_OPTIONS);

    await page.evaluate(async () => {
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
    });

    const renderedStats = await page.evaluate(() => ({
      title: document.title,
      bodyClass: document.body?.className || "",
      bodyTextLength: document.body?.innerText?.trim().length || 0,
      bodyHtmlLength: document.body?.innerHTML?.trim().length || 0,
      pageCount: document.querySelectorAll(".page").length,
      sheetCount: document.querySelectorAll(".sheet").length,
      sectionCount: document.querySelectorAll(".sec").length,
      hasCanonClass:
        document.body?.className?.includes("mergevue-forecast-brief-canon") || false,
      bodyStart: document.body?.innerText?.trim().slice(0, 300) || "",
    }));

    console.log("[render-pdf] rendered", renderedStats);

    if (
      renderedStats.bodyHtmlLength < MIN_RENDERED_HTML_CHARS ||
      renderedStats.bodyTextLength < MIN_RENDERED_TEXT_CHARS
    ) {
      return jsonError(res, 422, "Rendered HTML is unexpectedly small", {
        renderedStats,
        inputHtmlLength: html.length,
        inputHtmlBytes: htmlBytes,
      });
    }

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: "0mm",
        right: "0mm",
        bottom: "0mm",
        left: "0mm",
      },
    });

    const pdfBuffer = Buffer.from(pdf);

    console.log("[render-pdf] output", {
      pdfBytes: pdfBuffer.length,
      htmlBytes,
      renderedStats,
    });

    if (pdfBuffer.length < MIN_PDF_BYTES) {
      return jsonError(res, 422, "Generated PDF is unexpectedly small", {
        pdfBytes: pdfBuffer.length,
        htmlBytes,
        renderedStats,
      });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", String(pdfBuffer.length));

    return res.status(200).end(pdfBuffer);
  } catch (error) {
    console.error("PDF render failed:", error);

    return jsonError(res, 500, "PDF render failed", {
      message: error instanceof Error ? error.message : String(error),
    });
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
}
