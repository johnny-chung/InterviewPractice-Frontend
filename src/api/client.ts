const DEFAULT_BASE_URL = "http://localhost:3000/api/v1";

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || DEFAULT_BASE_URL;

function buildUrl(path: string): string {
  if (path.startsWith("http")) {
    return path;
  }
  return `${API_BASE_URL.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(buildUrl(path), init);
  if (!response.ok) {
    let message = `${response.status} ${response.statusText}`;
    try {
      const body = await response.json();
      if (body?.error) {
        message = body.error;
      }
    } catch (err) {
      // Ignore JSON parse errors for non-JSON responses.
    }
    throw new Error(message);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  const data = (await response.json()) as T;
  return data;
}

export async function upload<T>(path: string, formData: FormData): Promise<T> {
  return request<T>(path, {
    method: "POST",
    body: formData,
  });
}

export async function postJson<T>(path: string, payload: unknown): Promise<T> {
  return request<T>(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}
