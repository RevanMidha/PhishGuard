export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

async function parseResponse(response) {
  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      (typeof payload === 'object' && payload?.error) ||
      (typeof payload === 'object' && payload?.message) ||
      (typeof payload === 'string' && payload) ||
      `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return payload;
}

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, options);
  return parseResponse(response);
}

export function getJson(path) {
  return apiRequest(path);
}

export function postJson(path, body) {
  return apiRequest(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export function submitFeedback(feedback) {
  return postJson('/api/feedback', feedback);
}
