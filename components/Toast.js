import { useEffect, useState } from 'react'

// Toast global — écoute l'événement 'o77-toast' (émis par lib/toast.js).
export default function Toast() {
  const [msg, setMsg] = useState('')
  const [show, setShow] = useState(false)

  useEffect(() => {
    let t
    const handler = (e) => {
      setMsg(e.detail)
      setShow(true)
      clearTimeout(t)
      t = setTimeout(() => setShow(false), 2500)
    }
    window.addEventListener('o77-toast', handler)
    return () => {
      window.removeEventListener('o77-toast', handler)
      clearTimeout(t)
    }
  }, [])

  return <div className={`toast-msg ${show ? 'show' : ''}`}>{msg}</div>
}
