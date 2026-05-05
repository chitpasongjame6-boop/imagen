// @ts-nocheck

const BASE = '/api'

function getToken() {
  try { return localStorage.getItem('simagent_token') } catch { return null }
}

async function request(method, path, body) {
  const token = getToken()
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || res.statusText)
  }
  return res.json()
}

export const api = {
  auth: {
    login: (staffId, pin) => request('POST', '/auth/login', { staffId, pin }),
  },
  staff: {
    list: () => request('GET', '/staff'),
    create: (data) => request('POST', '/staff', data),
    update: (id, data) => request('PUT', `/staff/${id}`, data),
    remove: (id) => request('DELETE', `/staff/${id}`),
  },
  sims: {
    list: () => request('GET', '/sims'),
    create: (data) => request('POST', '/sims', data),
    update: (id, data) => request('PUT', `/sims/${id}`, data),
    remove: (id) => request('DELETE', `/sims/${id}`),
  },
  agents: {
    list: () => request('GET', '/agents'),
    create: (data) => request('POST', '/agents', data),
    update: (id, data) => request('PUT', `/agents/${id}`, data),
    remove: (id) => request('DELETE', `/agents/${id}`),
  },
  transactions: {
    list: () => request('GET', '/transactions'),
    create: (data) => request('POST', '/transactions', data),
    update: (id, data) => request('PUT', `/transactions/${id}`, data),
    remove: (id) => request('DELETE', `/transactions/${id}`),
  },
  clearAll: () => request('DELETE', '/clear-all'),
}
