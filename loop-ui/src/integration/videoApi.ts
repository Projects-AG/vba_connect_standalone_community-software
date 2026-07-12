export type LoopUiConfig = {
  apiUrl?: string;
  livekitUrl?: string;
};

let apiBaseUrl = "http://localhost:3000";
let livekitBaseUrl = "ws://localhost:7880";

/** Call once from the host app (recommended for published packages). */
export function configureLoopUi(config: LoopUiConfig) {
  if (config.apiUrl) apiBaseUrl = config.apiUrl.replace(/\/$/, "");
  if (config.livekitUrl) livekitBaseUrl = config.livekitUrl;
}

function readViteEnv(key: string): string | undefined {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const env = (import.meta as any)?.env;
    const value = env?.[key];
    return typeof value === "string" && value.length > 0 ? value : undefined;
  } catch {
    return undefined;
  }
}

async function parseJson(response: Response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      (data as { message?: string }).message ??
        `Request failed (${response.status})`,
    );
  }
  return data;
}

function resolveApiBase() {
  return readViteEnv("VITE_API_URL") ?? apiBaseUrl;
}

function resolveLivekitUrl() {
  return readViteEnv("VITE_LIVEKIT_URL") ?? livekitBaseUrl;
}

/** Nest video API — matches current backend routes only. */
export const videoApi = {
  get baseUrl() {
    return resolveApiBase();
  },

  async createRoom(roomName: string) {
    const response = await fetch(`${resolveApiBase()}/video/create-room`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomName }),
    });
    return parseJson(response) as Promise<{
      success: boolean;
      message?: string;
      room?: unknown;
    }>;
  },

  async generateToken(roomName: string, participantName: string) {
    const response = await fetch(`${resolveApiBase()}/video/generate-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomName, participantName }),
    });
    return parseJson(response) as Promise<{
      success: boolean;
      token: string;
    }>;
  },

  async getParticipants(roomName: string) {
    const response = await fetch(
      `${resolveApiBase()}/video/participants/${encodeURIComponent(roomName)}`,
    );
    return parseJson(response) as Promise<{
      success: boolean;
      participants: unknown[];
    }>;
  },

  async endRoom(roomName: string) {
    const response = await fetch(
      `${resolveApiBase()}/video/end-room/${encodeURIComponent(roomName)}`,
      { method: "DELETE" },
    );
    return parseJson(response) as Promise<{
      success: boolean;
      message?: string;
    }>;
  },
};

/** Prefer this getter in host apps and hooks. */
export function getLivekitUrl() {
  return resolveLivekitUrl();
}

/** @deprecated Use getLivekitUrl() */
export const livekitUrl = {
  toString() {
    return resolveLivekitUrl();
  },
  valueOf() {
    return resolveLivekitUrl();
  },
  [Symbol.toPrimitive]() {
    return resolveLivekitUrl();
  },
};
