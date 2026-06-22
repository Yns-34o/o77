import React from 'react'

// Interpole les jetons {{token}} avec les valeurs de l'identité légale, puis
// parse le markdown inline : **gras**, *italique*, [texte](url), emails.
function renderInline(text, legal) {
  const source = String(text || '').replace(/\{\{(\w+)\}\}/g, (_, k) =>
    legal && legal[k] != null ? String(legal[k]) : ''
  )

  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\)|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/g
  const nodes = []
  let last = 0
  let key = 0
  let m
  while ((m = re.exec(source))) {
    if (m.index > last) nodes.push(source.slice(last, m.index))
    const tok = m[0]
    if (tok.startsWith('**')) {
      nodes.push(<strong key={key++}>{tok.slice(2, -2)}</strong>)
    } else if (tok.startsWith('*')) {
      nodes.push(<em key={key++}>{tok.slice(1, -1)}</em>)
    } else if (tok.startsWith('[')) {
      const mm = /\[([^\]]+)\]\(([^)]+)\)/.exec(tok)
      const url = mm[2]
      const ext = url.startsWith('http')
      nodes.push(<a key={key++} href={url} target={ext ? '_blank' : undefined} rel={ext ? 'noopener noreferrer' : undefined}>{mm[1]}</a>)
    } else {
      nodes.push(<a key={key++} href={`mailto:${tok}`}>{tok}</a>)
    }
    last = m.index + tok.length
  }
  if (last < source.length) nodes.push(source.slice(last))
  return nodes
}

// Découpe un corps de section (markdown léger) en blocs React.
// - lignes "- ..." groupées en <ul>
// - lignes "### ..." en <h3>
// - autres lignes en <p> (une par ligne)
export function renderLegalBody(body, legal) {
  const lines = String(body || '').split('\n')
  const out = []
  let list = []
  let key = 0
  const flush = () => {
    if (list.length) {
      out.push(<ul key={`u${key++}`}>{list.map((t, i) => <li key={i}>{renderInline(t, legal)}</li>)}</ul>)
      list = []
    }
  }
  for (const raw of lines) {
    const l = raw.trim()
    if (!l) { flush(); continue }
    if (l.startsWith('- ')) { list.push(l.slice(2)); continue }
    if (l.startsWith('### ')) { flush(); out.push(<h3 key={`h${key++}`}>{renderInline(l.slice(4), legal)}</h3>); continue }
    flush()
    out.push(<p key={`p${key++}`}>{renderInline(l, legal)}</p>)
  }
  flush()
  return out
}

// Affiche une liste de sections { title, body } dans la coquille légale.
export default function LegalSections({ sections, legal }) {
  return (
    <>
      {sections.map((s, i) => (
        <React.Fragment key={s.id || i}>
          {s.title ? <h2>{s.title}</h2> : null}
          {renderLegalBody(s.body, legal)}
        </React.Fragment>
      ))}
    </>
  )
}
