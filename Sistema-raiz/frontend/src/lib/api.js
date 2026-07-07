const BASE = ''

function getToken() {
  return localStorage.getItem('raiz_token')
}

async function request(method, path, body) {
  const token = getToken()
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (res.status === 401) {
    localStorage.removeItem('raiz_token')
    localStorage.removeItem('raiz_user')
    window.location.reload()
    throw new Error('Sessão expirada — faça login novamente')
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || 'Erro na requisição')
  }
  if (res.status === 204) return null
  return res.json()
}

export const api = {
  get:    (path)        => request('GET',    path),
  post:   (path, body)  => request('POST',   path, body),
  put:    (path, body)  => request('PUT',    path, body),
  delete: (path)        => request('DELETE', path),
}

// Feedback helpers
export const feedbackApi = {
  overview:          ()         => api.get('/api/feedback/overview'),
  clientFeedbacks:   (id)       => api.get(`/api/feedback/client/${id}`),
  generateInsights:  (id)       => api.post(`/api/feedback/client/${id}/insights`),
  surveys:           ()         => api.get('/api/feedback/surveys'),
  createSurvey:      (body)     => api.post('/api/feedback/surveys', body),
  updateSurvey:      (id, body) => api.put(`/api/feedback/surveys/${id}`, body),
  activateSurvey:    (id)       => api.post(`/api/feedback/surveys/${id}/activate`),
  seedSlugs:         ()         => api.post('/api/feedback/seed-slugs'),
  setSlug:           (id)       => api.post(`/api/feedback/clients/${id}/set-slug`),
}
