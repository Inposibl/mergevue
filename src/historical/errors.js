export class HistoricalIngressError extends Error {
  constructor(code, detail = "") {
    super(detail ? `${code} | ${detail}` : code);
    this.name = "HistoricalIngressError";
    this.code = code;
    this.detail = detail;
  }
}

export function failClosed(code, detail = "") {
  throw new HistoricalIngressError(code, detail);
}
