export function validateApiUrl(value) {
  const url = String(value ?? '').trim().replace(/\/$/, '');
  if (!url) return '';
  const parsed = new URL(url);
  if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Utiliza una URL http:// o https:// válida.');
  return url;
}

export async function apiRequest(baseUrl, method, path, body) {
  const root = validateApiUrl(baseUrl);
  if (!root) throw new Error('No se ha configurado la dirección de la API.');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 7000);
  try {
    const response = await fetch(`${root}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || `Error del servidor (${response.status})`);
    return result;
  } finally { clearTimeout(timer); }
}
