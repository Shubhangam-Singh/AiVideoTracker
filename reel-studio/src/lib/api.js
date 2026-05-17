async function request(method, url, body) {
  const opts = { method, credentials: 'include', headers: {} };
  if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(url, opts);
  if (res.status === 204) return null;
  let data = null;
  try { data = await res.json(); } catch {}
  if (!res.ok) {
    const err = new Error((data && data.error) || `${method} ${url} failed (${res.status})`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  get:    (u)     => request('GET',    u),
  post:   (u, b)  => request('POST',   u, b ?? {}),
  put:    (u, b)  => request('PUT',    u, b ?? {}),
  patch:  (u, b)  => request('PATCH',  u, b ?? {}),
  delete: (u)     => request('DELETE', u),
};

export default api;
