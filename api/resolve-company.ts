import { jsonResponse, methodNotAllowed, parseJsonBody } from "../src/server/_response.js";
import {
  RESOLVE_COMPANY_ENDPOINT,
  resolveCompanyQuery,
} from "../src/server/_companyResolver.js";

async function handler(request: Request) {
  if (request.method !== "POST") {
    return methodNotAllowed(request.method, ["POST"]);
  }

  const body = await parseJsonBody(request);
  if (!body || typeof body !== "object") {
    const result = await resolveCompanyQuery({ query: null });
    return jsonResponse(result.statusCode, result.body);
  }

  const result = await resolveCompanyQuery({
    query: (body as { query?: unknown }).query,
    confirmCik: (body as { confirmCik?: unknown }).confirmCik,
  });

  return jsonResponse(result.statusCode, {
    ...result.body,
    endpoint: RESOLVE_COMPANY_ENDPOINT,
  });
}

export default Object.assign(handler, { fetch: handler });
