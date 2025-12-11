const API = process.env.NEXT_PUBLIC_API_URL;

if (!API) throw new Error("NEXT_PUBLIC_API_URL is not set");

type FetchOptions = RequestInit;

export async function apiFetch<T>(
  path: string,
  opts: FetchOptions = {}
): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    },
    credentials: "include",
  });

  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      msg = data?.message || msg;
    } catch {}
    throw new Error(msg);
  }

  return (await res.json()) as T;
}
