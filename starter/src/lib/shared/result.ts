// Svarformen alle lag (repository, service, controller) bruker i stedet for å
// kaste forventede feil.

export type Fail = {
  ok: false;
  error: {
    code: string; // "400" | "404" | "500", brukes som HTTP-status i controlleren
    message: string;
    fieldErrors: Record<string, string[]>;
  };
};

// ok: true har data, ellers en feil. Sletting har ingen data: bruk `{ ok: true } | Fail`.
export type Result<T> = { ok: true; data: T } | Fail;
