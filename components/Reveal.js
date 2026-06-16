import { useEffect, useRef, useState } from 'react'

// Enveloppe ses enfants d'une animation "reveal au scroll" (portée de la maquette).
export default function Reveal({ children, as: Tag = 'div', className = '', style, ...rest }) {
  const ref = useRef(null)
  const [vis, setVis] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') { setVis(true); return }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVis(true)
          io.unobserve(el)
        }
      },
      { threshold: 0.1 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <Tag ref={ref} className={`reveal ${vis ? 'vis' : ''} ${className}`.trim()} style={style} {...rest}>
      {children}
    </Tag>
  )
}
