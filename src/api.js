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

  const lines = text.split('\n')
  let html = ''
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (/^## (.+)$/.test(line)) {
      html += `<h2>${line.replace(/^## /, '')}</h2>`
      i++
      continue
    }

    if (/^### (.+)$/.test(line)) {
      html += `<h3>${line.replace(/^### /, '')}</h3>`
      i++
      continue
    }

    if (/^#### (.+)$/.test(line)) {
      html += `<h4>${line.replace(/^#### /, '')}</h4>`
      i++
      continue
    }

    if (/^---+$/.test(line.trim())) {
      html += '<hr>'
      i++
      continue
    }

    if (/^\|/.test(line)) {
      const tableLines = []
      while (i < lines.length && /^\|/.test(lines[i])) {
        tableLines.push(lines[i])
        i++
      }

      let tableHtml = '<table>'
      let isHeaderRow = true
      for (const tl of tableLines) {
        if (/^\|[\s:|-]+\|$/.test(tl)) continue
        const cells = tl.split('|').slice(1, -1)
        if (cells.length === 0) continue
        const tag = isHeaderRow ? 'th' : 'td'
        const rowHtml = cells.map(c => `<${tag}>${inlineFormat(c.trim())}</${tag}>`).join('')
        tableHtml += `<tr>${rowHtml}</tr>`
        isHeaderRow = false
      }
      tableHtml += '</table>'
      html += tableHtml
      continue
    }

    if (/^- /.test(line)) {
      const items = []
      while (i < lines.length && /^- /.test(lines[i])) {
        items.push(lines[i].replace(/^- /, ''))
        i++
      }
      html += '<ul>' + items.map(it => `<li>${inlineFormat(it)}</li>`).join('') + '</ul>'
      continue
    }

    if (/^\d+\. /.test(line)) {
      const items = []
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\. /, ''))
        i++
      }
      html += '<ol>' + items.map(it => `<li>${inlineFormat(it)}</li>`).join('') + '</ol>'
      continue
    }

    if (/^> /.test(line)) {
      const quotes = []
      while (i < lines.length && /^> /.test(lines[i])) {
        quotes.push(lines[i].replace(/^> /, ''))
        i++
      }
      html += '<blockquote>' + quotes.map(q => inlineFormat(q)).join('<br>') + '</blockquote>'
      continue
    }

    if (line.trim() === '') {
      html += '<br>'
      i++
      continue
    }

    html += `<p>${inlineFormat(line)}</p>`
    i++
  }

  return html
}

function inlineFormat(text) {
  let result = text
  result = result.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  result = result.replace(/\*(.+?)\*/g, '<em>$1</em>')
  result = result.replace(/`(.+?)`/g, '<code>$1</code>')
  return result
}
