const API_BASE = '/api'

export const API = {
  parse: `${API_BASE}/parse`,
  analyze: `${API_BASE}/analyze`,
  optimize: `${API_BASE}/optimize`,
  
  ai: {
    chat: `${API_BASE}/ai/chat`,
    generateResume: `${API_BASE}/ai/generate-resume`,
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

export function renderMarkdown(text) {
  if (!text) return ''
  
  let html = text

  html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>')
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>')
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>')
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>')

  html = html.replace(/^---$/gm, '<hr>')

  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')

  html = html.replace(/^- (.+)$/gm, '<li>$1</li>')
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')

  html = html.replace(/^\|(.+)\|$/gm, (match) => {
    const cells = match.split('|').filter(c => c.trim() !== '')
    if (cells.every(c => /^[\s:-]+$/.test(c))) return ''
    const isHeader = cells.every(c => /^[\s:-]+$/.test(c.trim()))
    if (isHeader) return ''
    const row = cells.map(c => `<td>${c.trim()}</td>`).join('')
    return `<tr>${row}</tr>`
  })
  html = html.replace(/(<tr>.*<\/tr>\n?)+/g, '<table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%">$&</table>')

  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
  html = html.replace(/(<blockquote>.*<\/blockquote>\n?)+/g, '<div class="quote">$&</div>')

  html = html.replace(/✅/g, '<span style="color:#16a34a">✅</span>')
  html = html.replace(/🎯/g, '<span style="color:#2563eb">🎯</span>')
  html = html.replace(/📌/g, '<span style="color:#dc2626">📌</span>')

  html = html.replace(/\n\n/g, '</p><p>')
  html = html.replace(/\n/g, '<br>')
  html = '<p>' + html + '</p>'

  html = html.replace(/<p><\/p>/g, '')
  html = html.replace(/<p>(<h[1-4]>)/g, '$1')
  html = html.replace(/(<\/h[1-4]>)<\/p>/g, '$1')
  html = html.replace(/<p>(<hr>)<\/p>/g, '$1')
  html = html.replace(/<p>(<ul>)/g, '$1')
  html = html.replace(/(<\/ul>)<\/p>/g, '$1')
  html = html.replace(/<p>(<table)/g, '$1')
  html = html.replace(/(<\/table>)<\/p>/g, '$1')
  html = html.replace(/<p>(<div class="quote">)/g, '$1')
  html = html.replace(/(<\/div>)<\/p>/g, '$1')

  return html
}
