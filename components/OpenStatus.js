import { useEffect, useState } from 'react'
import { isOpenNow } from '@/lib/format'

// Badge "Ouvert / Fermé" calculé à partir de isOpenNow().
export default function OpenStatus() {
  const [open, setOpen] = useState(null)

  useEffect(() => {
    const upd = () => setOpen(isOpenNow())
    upd()
    const i = setInterval(upd, 60000)
    return () => clearInterval(i)
  }, [])

  if (open === null) return null
  const color = open ? '#22c55e' : '#ef4444'
  const txt = open ? 'Ouvert' : "Fermé — Ouvre à 11h"
  const txtColor = open ? '#4ade80' : '#f87171'

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, animation: 'blink 2s infinite' }} />
      <span style={{ fontSize: '0.7rem', fontFamily: 'Oswald', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: txtColor }}>
        {txt}
      </span>
    </span>
  )
}
