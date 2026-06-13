const IS_DEV = process.env.NODE_ENV === "development";
const LOGGING_ENABLED = IS_DEV || process.env.GS_LOGGING_ENABLED === "true";

export const gsLogger = {
  request: (method: string, endpoint: string, headers: any, payload?: any) => {
    if (!LOGGING_ENABLED) return;

    console.log(` [GS API REQUEST] [${method}] ${endpoint}`);
    console.dir(
      {
        headers: sanitizeHeaders(headers),
        payload,
      },
      { depth: null },
    );
  },

  response: (method: string, endpoint: string, status: number, data: any) => {
    if (!LOGGING_ENABLED) return;

    const icon = status >= 200 && status < 300 ? "[Success]" : "[Failed]";
    console.log(
      `${icon}: [GS API RESPONSE] [${status}] [${method}] ${endpoint}`,
    );
    if (data) console.dir(data, { depth: null });
  },

  info: (message: string, detail?: any) => {
    if (!LOGGING_ENABLED) return;
    console.log(` [GS INFO] ${message}`, detail ?? "");
  },
};

function sanitizeHeaders(headers: Record<string, string>) {
  const sensitive = ["authorization", "x-internal-api-key"];
  const clean = { ...headers };
  for (const key in clean) {
    if (sensitive.includes(key.toLowerCase())) clean[key] = "[REDACTED]";
  }
  return clean;
}
