import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

const MAX_HTML_BYTES = 5 * 1024 * 1024;

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

function getRequestBody(req) {
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
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("Invalid JSON body"));
      }
    });

    req.on("error", reject);
  });
}

function checkApiKey(req) {
  const requiredKey = process.env.PDF_RENDER_API_KEY;

  if (!requiredKey) {
    return true;
  }

  const auth = req.headers.authorization || "";
  const bearer = auth.startsWith("Bearer ") ? auth.slice("Bearer ".length).trim() : "";
  const headerKey = req.headers["x-api-key"];

  return bearer === requiredKey || headerKey === requiredKey;
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-API-Key");
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!checkApiKey(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  let browser;

  try {
    const body = await getRequestBody(req);
    const html = typeof body.html === "string" ? body.html : "";
    const filename = sanitizeFilename(body.filename);

    if (!html.trim()) {
      return res.status(400).json({ error: "Missing html" });
    }

    const executablePath = await chromium.executablePath();

    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: {
        width: 1240,
        height: 1754,
        deviceScaleFactor: 1,
      },
      executablePath,
      headless: chromium.headless,
    });

    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: "networkidle0",
      timeout: 45000,
    });

    await page.evaluate(async () => {
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
    });

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

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", String(pdfBuffer.length));

    return res.status(200).end(pdfBuffer);
  } catch (error) {
    console.error("PDF render failed:", error);

    return res.status(500).json({
      error: "PDF render failed",
      message: error instanceof Error ? error.message : String(error),
    });
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
}
