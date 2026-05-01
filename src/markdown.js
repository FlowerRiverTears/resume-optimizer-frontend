export function renderMarkdown(text) {
  if (!text) return ''
  const blocks = parseBlocks(text)
  return blocks.map(renderBlock).join('')
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function parseBlocks(text) {
  const lines = text.split('\n')
  const blocks = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (/^```/.test(line)) {
      const lang = line.replace(/^```\s*/, '').trim()
      const codeLines = []
      i++
      while (i < lines.length && !/^```\s*$/.test(lines[i])) {
        codeLines.push(lines[i])
        i++
      }
      if (i < lines.length) i++
      blocks.push({ type: 'code', lang: lang, text: codeLines.join('\n') })
      continue
    }

    if (/^#{1,6}\s/.test(line)) {
      const m = line.match(/^(#{1,6})\s+(.+)$/)
      if (m) {
        blocks.push({ type: 'heading', level: m[1].length, text: m[2] })
      }
      i++
      continue
    }

    if (/^(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
      blocks.push({ type: 'hr' })
      i++
      continue
    }

    if (/^\|/.test(line)) {
      const tableRows = []
      let alignRow = null
      while (i < lines.length && /^\|/.test(lines[i])) {
        const row = lines[i].trim()
        if (/^\|[\s:|\-+]+$/.test(row)) {
          alignRow = parseTableAlign(row)
        } else {
          tableRows.push(row)
        }
        i++
      }
      blocks.push({ type: 'table', rows: tableRows, align: alignRow })
      continue
    }

    if (/^>\s?/.test(line)) {
      const quoteLines = []
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        quoteLines.push(lines[i].replace(/^>\s?/, ''))
        i++
      }
      blocks.push({ type: 'blockquote', text: quoteLines.join('\n') })
      continue
    }

    if (/^(\s*)[-*+]\s/.test(line)) {
      const items = parseNestedList(lines, i, /^(\s*)[-*+]\s/, (l) => l.replace(/^\s*[-*+]\s/, ''))
      blocks.push({ type: 'ul', items })
      i = items._nextIndex || i + 1
      continue
    }

    if (/^(\s*)\d+\.\s/.test(line)) {
      const items = parseNestedList(lines, i, /^(\s*)\d+\.\s/, (l) => l.replace(/^\s*\d+\.\s/, ''))
      blocks.push({ type: 'ol', items })
      i = items._nextIndex || i + 1
      continue
    }

    if (line.trim() === '') {
      i++
      continue
    }

    const paraLines = []
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !/^#{1,6}\s/.test(lines[i]) &&
      !/^\|/.test(lines[i]) &&
      !/^(\s*)[-*+]\s/.test(lines[i]) &&
      !/^(\s*)\d+\.\s/.test(lines[i]) &&
      !/^>\s?/.test(lines[i]) &&
      !/^(-{3,}|\*{3,}|_{3,})\s*$/.test(lines[i]) &&
      !/^```/.test(lines[i])
    ) {
      paraLines.push(lines[i])
      i++
    }
    if (paraLines.length > 0) {
      blocks.push({ type: 'paragraph', text: paraLines.join('\n') })
    }
  }

  return blocks
}

function parseNestedList(lines, startIdx, pattern, stripPrefix) {
  const items = []
  let i = startIdx

  while (i < lines.length && pattern.test(lines[i])) {
    const line = lines[i]
    const indentMatch = line.match(/^(\s*)/)
    const indent = indentMatch ? indentMatch[1].length : 0
    const itemText = stripPrefix(line)

    if (/^\[[ xX]\]\s/.test(itemText)) {
      const checked = /^\[[xX]\]/.test(itemText)
      items.push({ text: itemText.replace(/^\[[ xX]\]\s/, ''), task: true, checked, indent })
    } else {
      let hasChildren = false
      const childLines = [itemText]
      let j = i + 1
      while (j < lines.length && lines[j].trim() !== '' && !pattern.test(lines[j]) && !/^#{1,6}\s/.test(lines[j]) && !/^\|/.test(lines[j]) && !/^>\s?/.test(lines[j]) && !/^```/.test(lines[j]) && !/^(-{3,}|\*{3,}|_{3,})\s*$/.test(lines[j])) {
        childLines.push(lines[j])
        hasChildren = true
        j++
      }
      if (hasChildren) {
        items.push({ text: childLines.join('\n'), task: false, indent })
        i = j
        continue
      }
      items.push({ text: itemText, task: false, indent })
    }
    i++
  }

  items._nextIndex = i
  return items
}

function parseTableAlign(row) {
  const cells = row.split('|').slice(1, -1).map(c => c.trim())
  return cells.map(c => {
    if (/^:.*:$/.test(c)) return 'center'
    if (/:$/.test(c)) return 'right'
    return 'left'
  })
}

function renderBlock(block) {
  switch (block.type) {
    case 'heading':
      return `<h${block.level}>${inline(block.text)}</h${block.level}>`
    case 'hr':
      return '<hr>'
    case 'code':
      return renderCodeBlock(block.lang, block.text)
    case 'table':
      return renderTable(block.rows, block.align)
    case 'blockquote':
      return `<blockquote>${renderMarkdown(block.text)}</blockquote>`
    case 'ul':
      return renderUl(block.items)
    case 'ol':
      return renderOl(block.items)
    case 'paragraph':
      return `<p>${inline(block.text)}</p>`
    default:
      return ''
  }
}

function renderCodeBlock(lang, text) {
  const escaped = escapeHtml(text)
  const langAttr = lang ? ` class="language-${lang}"` : ''
  const langLabel = lang ? `<span class="code-lang">${escapeHtml(lang)}</span>` : ''
  const copyBtn = '<button class="code-copy" onclick="this.closest(\'.code-block\').classList.toggle(\'copied\');const c=this.closest(\'.code-block\').querySelector(\'code\');navigator.clipboard.writeText(c.textContent);this.textContent=\'已复制!\';setTimeout(()=>this.textContent=\'复制\',2000)">复制</button>'
  return `<div class="code-block">${langLabel}${copyBtn}<pre><code${langAttr}>${escaped}</code></pre></div>`
}

function renderTable(rows, align) {
  if (rows.length === 0) return ''

  const headerCells = splitCells(rows[0])
  let html = '<div class="table-wrapper"><table><thead><tr>'
  headerCells.forEach((cell, idx) => {
    const a = align && align[idx] ? ` style="text-align:${align[idx]}"` : ''
    html += `<th${a}>${inline(cell)}</th>`
  })
  html += '</tr></thead>'

  if (rows.length > 1) {
    html += '<tbody>'
    for (let r = 1; r < rows.length; r++) {
      const cells = splitCells(rows[r])
      html += '<tr>'
      cells.forEach((cell, idx) => {
        const a = align && align[idx] ? ` style="text-align:${align[idx]}"` : ''
        html += `<td${a}>${inline(cell)}</td>`
      })
      html += '</tr>'
    }
    html += '</tbody>'
  }

  html += '</table></div>'
  return html
}

function splitCells(row) {
  return row.split('|').slice(1, -1).map(c => c.trim())
}

function renderUl(items) {
  let html = '<ul>'
  for (const item of items) {
    if (item.task) {
      const checkbox = item.checked
        ? '<input type="checkbox" checked disabled>'
        : '<input type="checkbox" disabled>'
      html += `<li class="task-item">${checkbox}${inline(item.text)}</li>`
    } else {
      html += `<li>${inline(item.text)}</li>`
    }
  }
  html += '</ul>'
  return html
}

function renderOl(items) {
  let html = '<ol>'
  for (const item of items) {
    if (item.task) {
      const checkbox = item.checked
        ? '<input type="checkbox" checked disabled>'
        : '<input type="checkbox" disabled>'
      html += `<li class="task-item">${checkbox}${inline(item.text)}</li>`
    } else {
      html += `<li>${inline(item.text)}</li>`
    }
  }
  html += '</ol>'
  return html
}

function inline(text) {
  if (!text) return ''
  let r = text

  const codeSpans = []
  r = r.replace(/`([^`]+)`/g, (_, code) => {
    codeSpans.push(code)
    return `\x00CODE${codeSpans.length - 1}\x00`
  })

  const images = []
  r = r.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, src) => {
    images.push({ alt, src })
    return `\x00IMG${images.length - 1}\x00`
  })

  const links = []
  r = r.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, url) => {
    links.push({ label, url })
    return `\x00LINK${links.length - 1}\x00`
  })

  r = r.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  r = r.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>')
  r = r.replace(/~~(.+?)~~/g, '<del>$1</del>')

  r = r.replace(/\x00CODE(\d+)\x00/g, (_, idx) => {
    return `<code>${escapeHtml(codeSpans[parseInt(idx)])}</code>`
  })

  r = r.replace(/\x00LINK(\d+)\x00/g, (_, idx) => {
    const link = links[parseInt(idx)]
    return `<a href="${escapeHtml(link.url)}" target="_blank" rel="noopener">${inline(link.label)}</a>`
  })

  r = r.replace(/\x00IMG(\d+)\x00/g, (_, idx) => {
    const img = images[parseInt(idx)]
    return `<img src="${escapeHtml(img.src)}" alt="${escapeHtml(img.alt)}" />`
  })

  r = r.replace(/\n/g, '<br>')
  return r
}
