const baseUrl = (import.meta.env.VITE_API_URL as string | undefined)?.replace(
  /\/+$/,
  ''
) ?? 'https://dummyjson.com';

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  signal?: AbortSignal;
  token?: string | null;
}

export async function httpClient<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${baseUrl}${normalizedPath}`;

  const headers: Record<string, string> = {};
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  let serializedBody: string | undefined;
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    serializedBody = JSON.stringify(options.body);
  }

  const response = await fetch(url, {
    method: options.method ?? 'GET',
    headers,
    body: serializedBody,
    signal: options.signal,
  });

  if (!response.ok) {
    throw new Error(
      `HTTP помилка ${response.status} при запиті до ${normalizedPath}`
    );
  }

  return (await response.json()) as T;
}
