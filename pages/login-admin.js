import { useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase'

const lbl = {
  fontSize: 10, fontFamily: 'Oswald', fontWeight: 700, letterSpacing: '0.15em',
  textTransform: 'uppercase', color: '#ccc', display: 'block', marginBottom: 8,
}

export default function LoginAdmin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [pwd, setPwd] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setErr('')
    setLoading(true)
    try {
      // 1. Connexion côté client -> idToken
      const cred = await signInWithEmailAndPassword(auth, email, pwd)
      const idToken = await cred.user.getIdToken()
      // 2. Échange contre un cookie de session (HttpOnly)
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ idToken }),
      })
      if (!res.ok) throw new Error()
      await auth.signOut() // le cookie de session fait foi côté serveur
      router.replace(router.query.from || '/dashboard')
    } catch {
      setErr('Email ou mot de passe incorrect.')
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Connexion admin — O'77</title>
        <meta name="robots" content="noindex" />
      </Head>
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: '#000' }}>
        <div style={{ width: '100%', maxWidth: 380, background: '#0a0a0a', border: '1px solid #1c1c1c', borderTop: '2px solid #FFD600', padding: 40 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <img src="/logo.png" alt="O'77" style={{ height: 56, marginBottom: 16, display: 'inline-block' }} />
            <h1 style={{ fontFamily: 'Oswald', fontSize: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Espace admin</h1>
            <p style={{ color: '#666', fontSize: '0.8rem', marginTop: 8 }}>Connectez-vous pour gérer le site</p>
          </div>
          <form onSubmit={submit}>
            <label style={lbl}>Email</label>
            <input type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="username" style={{ marginBottom: 16 }} />
            <label style={lbl}>Mot de passe</label>
            <input type="password" className="form-input" value={pwd} onChange={(e) => setPwd(e.target.value)} required autoComplete="current-password" />
            {err && <p style={{ color: '#f87171', fontSize: '0.8rem', margin: '12px 0' }}>{err}</p>}
            <button type="submit" className="btn-jaune" disabled={loading} style={{ width: '100%', marginTop: 20, opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}
