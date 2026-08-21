export function jsonResponse(statusCode: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status: statusCode,
    headers: {
      "content-type": "application/json; charset=utf-8",
    },
  });
}

export async function parseJsonBody(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export function methodNotAllowed(method: string, allowed: string[]) {
  return jsonResponse(405, {
    status: "method-not-allowed",
    method,
    allowed,
  });
}

export function unrecognizedReliabilityFlagResponse(endpoint: string, error: { flag?: unknown }) {
  return jsonResponse(400, {
    endpoint,
    status: "unrecognized_reliability_flag",
    name: "UnrecognizedReliabilityFlagError",
    flag: error.flag,
  });
}

export function illegalReliabilityFlagForSideResponse(endpoint: string, error: { flag?: unknown; side?: unknown }) {
  return jsonResponse(400, {
    endpoint,
    status: "illegal_reliability_flag_for_side",
    name: "IllegalReliabilityFlagForSideError",
    flag: error.flag,
    side: error.side ?? null,
  });
}
