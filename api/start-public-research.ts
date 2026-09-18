import { jsonResponse, methodNotAllowed, parseJsonBody } from "../src/server/_response.ts";
import {
  START_PUBLIC_RESEARCH_ENDPOINT,
  startPublicResearch,
} from "../src/server/_secResearch.ts";

export default async function handler(request: Request) {
  if (request.method !== "POST") {
    return methodNotAllowed(request.method, ["POST"]);
  }

  const body = await parseJsonBody(request);
  const result = await startPublicResearch(body);
  return jsonResponse(result.statusCode, {
    ...result.body,
    endpoint: START_PUBLIC_RESEARCH_ENDPOINT,
  });
}
