const API_BASE = '/api'

export const API = {
  parse: `${API_BASE}/parse`,
  analyze: `${API_BASE}/analyze`,
  optimize: `${API_BASE}/optimize`,
  
  ai: {
    chat: `${API_BASE}/ai/chat`,
    analyze: `${API_BASE}/ai/analyze`,
    search: `${API_BASE}/ai/search`,
    health: `${API_BASE}/ai/health`,
    
    rag: {
      ingest: `${API_BASE}/ai/rag/ingest`,
      ingestBatch: `${API_BASE}/ai/rag/ingest-batch`,
      search: `${API_BASE}/ai/rag/search`,
      clear: `${API_BASE}/ai/rag/clear`
    },
    
    weight: {
      config: `${API_BASE}/ai/weight/config`,
      configs: `${API_BASE}/ai/weight/configs`
    },
    
    keys: {
      validate: `${API_BASE}/ai/keys/validate`,
      list: `${API_BASE}/ai/keys/list`,
      providers: `${API_BASE}/ai/keys/providers`
    }
  }
}

export async function apiPost(url, data) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(error || '请求失败')
  }
  
  return response.json()
}

export async function apiGet(url) {
  const response = await fetch(url)
  
  if (!response.ok) {
    throw new Error('请求失败')
  }
  
  return response.json()
}

export async function apiDelete(url) {
  const response = await fetch(url, {
    method: 'DELETE'
  })
  
  if (!response.ok) {
    throw new Error('删除失败')
  }
  
  return response.json()
}

export async function apiUpload(url, formData) {
  const response = await fetch(url, {
    method: 'POST',
    body: formData
  })
  
  if (!response.ok) {
    throw new Error('上传失败')
  }
  
  return response.json()
}
