const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEFAULT_REPORT_HIDDEN_COPY_TO = "n.petyaev@gmail.com";
const MERGEVUE_PUBLIC_REPORT_PDF_FILE_NAME = "mergevue-forecast-brief.pdf";
const MERGEVUE_REPORT_EMAIL_SUBJECT = "Mergevue Forecast Brief: Post-Deal Behavior Forecast";

type NodeRequest = {
  body?: unknown;
  method?: string;
  url?: string;
  on?: (event: "data" | "end" | "error", callback: (chunk?: any) => void) => void;
};

type NodeResponse = {
  statusCode: number;
  json?: (body: unknown) => void;
  status?: (statusCode: number) => NodeResponse;
  setHeader: (name: string, value: string) => void;
  end: (body: string) => void;
};

type ReportEmailCopy = {
  subject: string;
  attachmentFileName: string;
  previewText: string;
  textLines: string[];
};

function sendJson(response: NodeResponse, statusCode: number, body: unknown) {
  const setStatus = response.status;
  const sendBody = response.json;
  if (typeof setStatus === "function" && typeof sendBody === "function") {
    setStatus.call(response, statusCode);
    sendBody.call(response, body);
    return;
  }

  response.statusCode = statusCode;
  response.setHeader("content-type", "application/json; charset=utf-8");
  response.end(JSON.stringify(body));
}

function sendMethodNotAllowed(response: NodeResponse, method: string | undefined, allowed: string[]) {
  sendJson(response, 405, {
    status: "method-not-allowed",
    method: method ?? "UNKNOWN",
    allowed,
  });
}

async function parseBody(request: NodeRequest) {
  if (typeof request.body === "object" && request.body) {
    return request.body;
  }

  if (typeof request.body === "string") {
    try {
      return request.body ? JSON.parse(request.body) : null;
    } catch {
      return null;
    }
  }

  return new Promise<any>((resolve) => {
    let raw = "";

    if (typeof request.on !== "function") {
      resolve(null);
      return;
    }

    request.on("data", (chunk) => {
      raw += chunk?.toString() ?? "";
    });
    request.on("error", () => resolve(null));
    request.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : null);
      } catch {
        resolve(null);
      }
    });
  });
}

function normalizeEmail(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

function cleanString(value: unknown) {
  return String(value ?? "").trim();
}

function firstConfiguredString(...values: unknown[]) {
  for (const value of values) {
    const cleanValue = cleanString(value);
    if (cleanValue) return cleanValue;
  }
  return "";
}

function sanitizeEmailProviderError(value: unknown) {
  let message = "";
  if (value instanceof Error) {
    message = value.message;
  } else if (typeof value === "string") {
    message = value;
  } else if (typeof value === "object" && value) {
    const body = value as { message?: unknown; error?: unknown; name?: unknown };
    message = cleanString(body.message ?? body.error ?? body.name);
  }

  return (message || "E-mail provider request failed")
    .replace(/[^\s@]+@[^\s@]+\.[^\s@]+/g, "[redacted-email]")
    .replace(/https?:\/\/[^\s"')]+/g, "[redacted-url]")
    .replace(/\b\d{6}\b/g, "[redacted-code]")
    .slice(0, 300);
}

function validPdfFileName(value: string) {
  return /^[A-Za-z0-9][A-Za-z0-9._ -]*\.pdf$/i.test(value);
}

function validPdfBase64(value: string) {
  return value.startsWith("JVBERi") && /^[A-Za-z0-9+/]+={0,2}$/.test(value);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function publicSafeReportString(value: unknown) {
  return cleanString(value)
    .replace(/Academy of Structural Typology/gi, "Mergevue")
    .replace(/Structural Typology/gi, "Mergevue")
    .replace(/structural-typology\.academy/gi, "mergevue.com")
    .replace(/structural-typology\.com/gi, "mergevue.com")
    .replace(/info@structural-typology\.academy/gi, "report@mergevue.com")
    .replace(/Forward-verifiable\s*В·\s*on record/gi, "Display-only preview")
    .replace(/lodged against public ledger/gi, "available as a display-only preview")
    .replace(/timestamped against public ledger/gi, "available as a display-only preview")
    .replace(/USD 50\.0B/gi, "Valuation risk band: $50M-$500M EV")
    .replace(/USD 350M to USD 2\.2B/gi, "Valuation risk band: $50M-$500M EV")
    .replace(/Indicative Total Risk Envelope/gi, "Economic risk posture")
    .replace(/Total Risk Envelope/gi, "Economic risk posture")
    .replace(/hard risk envelope/gi, "engagement-tier economic model")
    .replace(/absolute loss range/gi, "engagement-tier economic model")
    .replace(/Kill a Competitor/gi, "Absorb / neutralize a competitor")
    .replace(/\bMcDonalds\b/g, "McDonald's");
}

function normalizeReportEmailCopy(value: any): ReportEmailCopy {
  const textLines = Array.isArray(value?.textLines)
    ? value.textLines.map(publicSafeReportString).filter(Boolean)
    : [];

  return {
    subject: publicSafeReportString(value?.subject) || MERGEVUE_REPORT_EMAIL_SUBJECT,
    attachmentFileName: publicSafeReportString(value?.attachmentFileName) || MERGEVUE_PUBLIC_REPORT_PDF_FILE_NAME,
    previewText: publicSafeReportString(value?.previewText) || "Mergevue Forecast Brief: Post-Deal Behavior Forecast",
    textLines: textLines.length > 0
      ? textLines
      : [
        "Mergevue Forecast Brief",
        "Post-Deal Behavior Forecast",
        "Contact: report@mergevue.com",
        "Sealed Prediction Preview: Display-only preview; not ledger-recorded.",
        "Valuation risk band: $50M-$500M EV",
        "Illustrative posture, not a valuation.",
        "Absolute risk figures require the engagement-tier economic model.",
      ],
  };
}

export function buildFinalReportEmailMessage(firstName: string, reportId: string, reportEmailCopyValue: any) {
  const reportEmailCopy = normalizeReportEmailCopy(reportEmailCopyValue);
  const text = [
    `Hello ${firstName},`,
    "",
    "Your Mergevue Forecast Brief is attached.",
    "",
    ...reportEmailCopy.textLines,
    "",
    `Report reference: ${reportId}`,
  ].join("\n");
  const html = [
    `<p>Hello ${escapeHtml(firstName)},</p>`,
    "<p>Your Mergevue Forecast Brief is attached.</p>",
    `<p>${escapeHtml(reportEmailCopy.previewText)}</p>`,
    "<ul>",
    ...reportEmailCopy.textLines.filter(Boolean).map((line) => `<li>${escapeHtml(line)}</li>`),
    "</ul>",
    `<p><strong>Report reference:</strong> ${escapeHtml(reportId)}</p>`,
  ].join("");

  return {
    subject: reportEmailCopy.subject,
    text,
    html,
  };
}

export function buildHiddenFinalReportCopyMessage(reportId: string, reportEmailCopyValue: any) {
  const reportEmailCopy = normalizeReportEmailCopy(reportEmailCopyValue);
  const text = [
    "A Mergevue Forecast Brief PDF was saved from the public diagnostic.",
    "",
    ...reportEmailCopy.textLines,
    "",
    `Report reference: ${reportId}`,
  ].join("\n");
  const html = [
    "<p>A Mergevue Forecast Brief PDF was saved from the public diagnostic.</p>",
    `<p>${escapeHtml(reportEmailCopy.previewText)}</p>`,
    "<ul>",
    ...reportEmailCopy.textLines.filter(Boolean).map((line) => `<li>${escapeHtml(line)}</li>`),
    "</ul>",
    `<p><strong>Report reference:</strong> ${escapeHtml(reportId)}</p>`,
  ].join("");

  return {
    subject: `${reportEmailCopy.subject} Copy`,
    text,
    html,
  };
}

function validateAuthorizedSurveyLink(value: string) {
  try {
    const parsed = new URL(value);
    const allowedPath = parsed.pathname === "/screen-6a-target-observation-setup/authorized";
    const requiredParams = ["observationSessionId", "assessmentSessionId", "codeHash", "createdAt", "expiresAt"];
    const hasRequiredParams = requiredParams.every((param) => Boolean(parsed.searchParams.get(param)));
    return allowedPath && hasRequiredParams;
  } catch {
    return false;
  }
}

function validateTargetSelfSurveyLink(value: string) {
  try {
    const parsed = new URL(value);
    const allowedPath = parsed.pathname === "/screen-9a-target-code-gate";
    const requiredParams = ["targetSessionId", "assessmentId", "codeHash", "createdAt", "expiresAt"];
    const hasRequiredParams = requiredParams.every((param) => Boolean(parsed.searchParams.get(param)));
    return allowedPath && hasRequiredParams;
  } catch {
    return false;
  }
}

async function sendSurveyLink(
  request: NodeRequest,
  response: NodeResponse,
  params: URLSearchParams,
  options: {
    endpoint: string;
    invalidLinkStatus: string;
    invalidLinkError: string;
    subject: string;
    intro: string;
    linkText: string;
    validateSurveyLink: (value: string) => boolean;
  },
) {
  if (request.method !== "POST") {
    sendMethodNotAllowed(response, request.method, ["POST"]);
    return;
  }

  const body = await parseBody(request);
  const recipientEmail = normalizeEmail(body?.recipientEmail ?? params.get("recipientEmail"));
  const surveyLink = cleanString(body?.surveyLink ?? params.get("surveyLink"));
  const digitalCode = cleanString(body?.digitalCode ?? params.get("digitalCode"));
  const expiresAt = cleanString(body?.expiresAt ?? params.get("expiresAt"));

  if (!EMAIL_PATTERN.test(recipientEmail)) {
    sendJson(response, 400, {
      endpoint: options.endpoint,
      status: "invalid-recipient-email",
      error: "A valid recipientEmail is required",
    });
    return;
  }

  if (!options.validateSurveyLink(surveyLink) || !/^\d{6}$/.test(digitalCode) || !expiresAt) {
    sendJson(response, 400, {
      endpoint: options.endpoint,
      status: options.invalidLinkStatus,
      error: options.invalidLinkError,
    });
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = firstConfiguredString(
    process.env.AUTHORIZED_LINK_FROM_EMAIL,
    process.env.AUTHORIZED_LINK_FROM,
    process.env.REPORT_FROM_EMAIL,
    process.env.REPORT_COPY_FROM,
  );

  if (!apiKey || !from) {
    sendJson(response, 503, {
      endpoint: options.endpoint,
      status: "email-service-not-configured",
      error: "RESEND_API_KEY and sender e-mail environment variables are required",
    });
    return;
  }

  const text = [
    options.intro,
    "",
    `Survey link: ${surveyLink}`,
    `6-digit code: ${digitalCode}`,
    `Expires at: ${expiresAt}`,
  ].join("\n");
  const html = [
    `<p>${escapeHtml(options.intro)}</p>`,
    `<p><a href="${escapeHtml(surveyLink)}">${escapeHtml(options.linkText)}</a></p>`,
    `<p><strong>6-digit code:</strong> ${escapeHtml(digitalCode)}</p>`,
    `<p><strong>Expires at:</strong> ${escapeHtml(expiresAt)}</p>`,
  ].join("");

  const action = cleanString(params.get("action")) || cleanString(options.endpoint.split("action=").at(1));
  let providerResponse: Response;
  let providerBody: any;

  try {
    providerResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [recipientEmail],
        subject: options.subject,
        text,
        html,
      }),
    });
    providerBody = await providerResponse.json();
  } catch (error) {
    const sanitizedError = sanitizeEmailProviderError(error);
    console.error("Survey link e-mail send failed", {
      endpoint: options.endpoint,
      action,
      error: sanitizedError,
    });
    sendJson(response, 502, {
      endpoint: options.endpoint,
      status: "email-send-failed",
      action,
      error: sanitizedError,
    });
    return;
  }

  if (!providerResponse.ok) {
    const sanitizedError = sanitizeEmailProviderError(
      providerBody?.message ?? providerBody?.error ?? `Resend returned HTTP ${providerResponse.status}`,
    );
    console.error("Survey link e-mail provider rejected request", {
      endpoint: options.endpoint,
      action,
      providerStatus: providerResponse.status,
      error: sanitizedError,
    });
    sendJson(response, 502, {
      endpoint: options.endpoint,
      status: "email-provider-error",
      providerStatus: providerResponse.status,
      action,
      error: sanitizedError,
    });
    return;
  }

  sendJson(response, 200, {
    endpoint: options.endpoint,
    status: "sent",
    to: recipientEmail,
    provider: "resend",
    messageId: providerBody?.id ?? null,
  });
}

async function sendFinalReport(request: NodeRequest, response: NodeResponse) {
  if (request.method !== "POST") {
    sendMethodNotAllowed(response, request.method, ["POST"]);
    return;
  }

  const body = await parseBody(request);
  const recipientEmail = normalizeEmail(body?.recipientEmail);
  const firstName = cleanString(body?.firstName);
  const reportId = cleanString(body?.reportId);
  const fileName = MERGEVUE_PUBLIC_REPORT_PDF_FILE_NAME;
  const pdfBase64 = cleanString(body?.pdfBase64);

  if (!EMAIL_PATTERN.test(recipientEmail) || !firstName) {
    sendJson(response, 400, {
      endpoint: "/api/final-report?action=send-final-report",
      status: "invalid-report-recipient",
      error: "A valid recipientEmail and firstName are required",
    });
    return;
  }

  if (!reportId || !validPdfFileName(fileName) || !validPdfBase64(pdfBase64)) {
    sendJson(response, 400, {
      endpoint: "/api/final-report?action=send-final-report",
      status: "invalid-final-report",
      error: "A valid reportId, PDF fileName, and PDF attachment are required",
    });
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = firstConfiguredString(
    process.env.REPORT_FROM_EMAIL,
    process.env.REPORT_COPY_FROM,
    process.env.AUTHORIZED_LINK_FROM_EMAIL,
    process.env.AUTHORIZED_LINK_FROM,
  );
  const hiddenCopyTo = normalizeEmail(firstConfiguredString(
    process.env.REPORT_HIDDEN_COPY_TO,
    DEFAULT_REPORT_HIDDEN_COPY_TO,
  ));
  const bcc = EMAIL_PATTERN.test(hiddenCopyTo) && hiddenCopyTo !== recipientEmail ? [hiddenCopyTo] : undefined;

  if (!apiKey || !from) {
    sendJson(response, 503, {
      endpoint: "/api/final-report?action=send-final-report",
      status: "email-service-not-configured",
      error: "RESEND_API_KEY and sender e-mail environment variables are required",
    });
    return;
  }

  const reportMessage = buildFinalReportEmailMessage(firstName, reportId, body?.reportEmailCopy);

  const providerResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [recipientEmail],
      ...(bcc ? { bcc } : {}),
      subject: reportMessage.subject,
      text: reportMessage.text,
      html: reportMessage.html,
      attachments: [
        {
          filename: fileName,
          content: pdfBase64,
        },
      ],
    }),
  });

  const providerBody = await providerResponse.json().catch(() => null);
  if (!providerResponse.ok) {
    sendJson(response, 502, {
      endpoint: "/api/final-report?action=send-final-report",
      status: "email-provider-error",
      providerStatus: providerResponse.status,
      error: providerBody?.message ?? "Resend rejected the final report e-mail request",
    });
    return;
  }

  sendJson(response, 200, {
    endpoint: "/api/final-report?action=send-final-report",
    status: "sent",
    to: recipientEmail,
    hiddenCopy: Boolean(bcc),
    provider: "resend",
    messageId: providerBody?.id ?? null,
  });
}

async function sendFinalReportHiddenCopy(request: NodeRequest, response: NodeResponse) {
  if (request.method !== "POST") {
    sendMethodNotAllowed(response, request.method, ["POST"]);
    return;
  }

  const body = await parseBody(request);
  const reportId = cleanString(body?.reportId);
  const fileName = MERGEVUE_PUBLIC_REPORT_PDF_FILE_NAME;
  const pdfBase64 = cleanString(body?.pdfBase64);

  if (!reportId || !validPdfFileName(fileName) || !validPdfBase64(pdfBase64)) {
    sendJson(response, 400, {
      endpoint: "/api/final-report?action=send-final-report-hidden-copy",
      status: "invalid-final-report",
      error: "A valid reportId, PDF fileName, and PDF attachment are required",
    });
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = firstConfiguredString(
    process.env.REPORT_FROM_EMAIL,
    process.env.REPORT_COPY_FROM,
    process.env.AUTHORIZED_LINK_FROM_EMAIL,
    process.env.AUTHORIZED_LINK_FROM,
  );
  const hiddenCopyTo = normalizeEmail(firstConfiguredString(
    process.env.REPORT_HIDDEN_COPY_TO,
    DEFAULT_REPORT_HIDDEN_COPY_TO,
  ));

  if (!apiKey || !from || !EMAIL_PATTERN.test(hiddenCopyTo)) {
    sendJson(response, 503, {
      endpoint: "/api/final-report?action=send-final-report-hidden-copy",
      status: "email-service-not-configured",
      error: "RESEND_API_KEY, sender e-mail, and hidden-copy recipient environment variables are required",
    });
    return;
  }

  const reportMessage = buildHiddenFinalReportCopyMessage(reportId, body?.reportEmailCopy);

  const providerResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [hiddenCopyTo],
      subject: reportMessage.subject,
      text: reportMessage.text,
      html: reportMessage.html,
      attachments: [
        {
          filename: fileName,
          content: pdfBase64,
        },
      ],
    }),
  });

  const providerBody = await providerResponse.json().catch(() => null);
  if (!providerResponse.ok) {
    sendJson(response, 502, {
      endpoint: "/api/final-report?action=send-final-report-hidden-copy",
      status: "email-provider-error",
      providerStatus: providerResponse.status,
      error: providerBody?.message ?? "Resend rejected the hidden final report e-mail request",
    });
    return;
  }

  sendJson(response, 200, {
    endpoint: "/api/final-report?action=send-final-report-hidden-copy",
    status: "sent",
    hiddenCopy: true,
    provider: "resend",
    messageId: providerBody?.id ?? null,
  });
}

const TARGET_SELF_COMPLETION_TTL_SECONDS = 259200;
const REDIS_REST_TIMEOUT_MS = 4000;

type TargetSelfCompletionRecord = {
  targetSessionId: string;
  assessmentId: string;
  codeHash?: string;
  completed: true;
  completedAt: string;
  targetSelfAssessment: unknown;
};

type TargetSelfCompletionGlobal = typeof globalThis & {
  __mergevueTargetSelfCompletionStore?: Map<string, TargetSelfCompletionRecord>;
};

function targetSelfCompletionStore() {
  const root = globalThis as TargetSelfCompletionGlobal;
  if (!root.__mergevueTargetSelfCompletionStore) {
    root.__mergevueTargetSelfCompletionStore = new Map<string, TargetSelfCompletionRecord>();
  }
  return root.__mergevueTargetSelfCompletionStore;
}

function targetSelfCompletionKey(assessmentId: string, targetSessionId: string) {
  return `target-self-completion:${assessmentId}:${targetSessionId}`;
}

function targetSelfPersistentStorageConfig() {
  const url = firstConfiguredString(
    process.env.KV_REST_API_URL,
    process.env.UPSTASH_REDIS_REST_URL,
  );
  const token = firstConfiguredString(
    process.env.KV_REST_API_TOKEN,
    process.env.UPSTASH_REDIS_REST_TOKEN,
  );

  if (url && token) {
    return {
      url: url.replace(/\/$/, ""),
      token,
    };
  }

  return null;
}

async function targetSelfRedisCommand(command: unknown[]) {
  const config = targetSelfPersistentStorageConfig();
  if (!config) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REDIS_REST_TIMEOUT_MS);

  try {
    const providerResponse = await fetch(config.url, {
      method: "POST",
      headers: {
        authorization: `Bearer ${config.token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(command),
      signal: controller.signal,
    });

    const providerBody = await providerResponse.json().catch(() => null);

    if (!providerResponse.ok || providerBody?.error) {
      throw new Error(providerBody?.error ?? `KV returned HTTP ${providerResponse.status}`);
    }

    return providerBody?.result ?? null;
  } finally {
    clearTimeout(timeout);
  }
}

function normalizeTargetSelfCompletion(value: unknown): TargetSelfCompletionRecord | null {
  const record = typeof value === "object" && value ? value as Partial<TargetSelfCompletionRecord> : null;

  if (
    !record
    || !cleanString(record.targetSessionId)
    || !cleanString(record.assessmentId)
    || record.completed !== true
    || !record.targetSelfAssessment
    || typeof record.targetSelfAssessment !== "object"
    || (record.targetSelfAssessment as { completed?: unknown }).completed !== true
  ) {
    return null;
  }

  return {
    targetSessionId: cleanString(record.targetSessionId),
    assessmentId: cleanString(record.assessmentId),
    codeHash: cleanString(record.codeHash),
    completed: true,
    completedAt: cleanString(record.completedAt) || new Date().toISOString(),
    targetSelfAssessment: record.targetSelfAssessment,
  };
}

async function saveTargetSelfCompletionRecord(record: TargetSelfCompletionRecord) {
  const key = targetSelfCompletionKey(record.assessmentId, record.targetSessionId);
  targetSelfCompletionStore().set(key, record);

  await targetSelfRedisCommand([
    "SET",
    key,
    JSON.stringify(record),
    "EX",
    String(TARGET_SELF_COMPLETION_TTL_SECONDS),
  ]);

  return record;
}

async function readTargetSelfCompletionRecord(assessmentId: string, targetSessionId: string) {
  const key = targetSelfCompletionKey(assessmentId, targetSessionId);
  const localRecord = targetSelfCompletionStore().get(key);
  if (localRecord) return localRecord;

  const raw = await targetSelfRedisCommand(["GET", key]);
  if (raw === null || raw === undefined) return null;

  const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
  const record = normalizeTargetSelfCompletion(parsed);
  if (record) {
    targetSelfCompletionStore().set(key, record);
  }

  return record;
}

async function saveTargetSelfCompletion(request: NodeRequest, response: NodeResponse) {
  if (request.method !== "POST") {
    sendMethodNotAllowed(response, request.method, ["POST"]);
    return;
  }

  const body = await parseBody(request);
  const record = normalizeTargetSelfCompletion(body);

  if (!record) {
    sendJson(response, 400, {
      endpoint: "/api/final-report?action=save-target-self-completion",
      status: "invalid-target-self-completion",
      error: "A completed Target Self-Assessment record with targetSessionId and assessmentId is required.",
    });
    return;
  }

  try {
    await saveTargetSelfCompletionRecord(record);
    sendJson(response, 200, {
      endpoint: "/api/final-report?action=save-target-self-completion",
      status: "target-self-completion-saved",
      completed: true,
      targetSessionId: record.targetSessionId,
      assessmentId: record.assessmentId,
      completedAt: record.completedAt,
    });
  } catch (error) {
    sendJson(response, 503, {
      endpoint: "/api/final-report?action=save-target-self-completion",
      status: "target-self-completion-save-failed",
      error: error instanceof Error ? error.message : "Target Self-Assessment completion could not be saved.",
    });
  }
}

async function readTargetSelfCompletion(request: NodeRequest, response: NodeResponse, params: URLSearchParams) {
  if (request.method !== "GET" && request.method !== "POST") {
    sendMethodNotAllowed(response, request.method, ["GET", "POST"]);
    return;
  }

  const targetSessionId = cleanString(params.get("targetSessionId"));
  const assessmentId = cleanString(params.get("assessmentId"));
  const codeHash = cleanString(params.get("codeHash"));

  if (!targetSessionId || !assessmentId) {
    sendJson(response, 400, {
      endpoint: "/api/final-report?action=target-self-state",
      status: "invalid-target-self-state-request",
      error: "targetSessionId and assessmentId are required.",
    });
    return;
  }

  try {
    const record = await readTargetSelfCompletionRecord(assessmentId, targetSessionId);

    if (!record || (codeHash && record.codeHash && record.codeHash !== codeHash)) {
      sendJson(response, 200, {
        endpoint: "/api/final-report?action=target-self-state",
        status: "target-self-pending",
        completed: false,
        targetSessionId,
        assessmentId,
      });
      return;
    }

    sendJson(response, 200, {
      endpoint: "/api/final-report?action=target-self-state",
      status: "target-self-completed",
      completed: true,
      targetSessionId: record.targetSessionId,
      assessmentId: record.assessmentId,
      codeHash: record.codeHash,
      completedAt: record.completedAt,
      targetSelfAssessment: record.targetSelfAssessment,
    });
  } catch (error) {
    sendJson(response, 503, {
      endpoint: "/api/final-report?action=target-self-state",
      status: "target-self-state-unavailable",
      error: error instanceof Error ? error.message : "Target Self-Assessment state is unavailable.",
    });
  }
}

export default async function handler(request: NodeRequest, response: NodeResponse) {
  const requestUrl = new URL(request.url ?? "/api/final-report", "https://st.local");
  
  if (requestUrl.searchParams.get("action") === "save-target-self-completion") {
    await saveTargetSelfCompletion(request, response);
    return;
  }

  if (requestUrl.searchParams.get("action") === "target-self-state") {
    await readTargetSelfCompletion(request, response, requestUrl.searchParams);
    return;
  }

  if (requestUrl.searchParams.get("action") === "send-final-report-hidden-copy") {
    await sendFinalReportHiddenCopy(request, response);
    return;
  }

  if (requestUrl.searchParams.get("action") === "send-final-report") {
    await sendFinalReport(request, response);
    return;
  }

  if (requestUrl.searchParams.get("action") === "send-authorized-link") {
    await sendSurveyLink(request, response, requestUrl.searchParams, {
      endpoint: "/api/final-report?action=send-authorized-link",
      invalidLinkStatus: "invalid-authorized-link",
      invalidLinkError: "A valid authorized surveyLink, 6-digit digitalCode, and expiresAt are required",
      subject: "Authorized Target Observer survey link",
      intro: "Please complete the authorized Target Observer survey.",
      linkText: "Open the authorized survey",
      validateSurveyLink: validateAuthorizedSurveyLink,
    });
    return;
  }

  if (requestUrl.searchParams.get("action") === "send-target-self-link") {
    await sendSurveyLink(request, response, requestUrl.searchParams, {
      endpoint: "/api/final-report?action=send-target-self-link",
      invalidLinkStatus: "invalid-target-self-link",
      invalidLinkError: "A valid Target Self-Assessment surveyLink, 6-digit digitalCode, and expiresAt are required",
      subject: "Target Self-Assessment survey link",
      intro: "Please complete the Target Self-Assessment survey.",
      linkText: "Open the Target Self-Assessment",
      validateSurveyLink: validateTargetSelfSurveyLink,
    });
    return;
  }

  sendJson(response, 501, {
    endpoint: "/api/final-report",
    status: "contract-stub",
    message: "Returns final report only after Acquirer and verified Target completion.",
  });
}


