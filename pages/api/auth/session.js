import { createSession, COOKIE_NAME, MAX_AGE } from '@/lib/auth-session'

// POST { idToken }  -> pose le cookie de session (login)
// DELETE           -> efface le cookie (logout)
export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { idToken } = req.body || {}
    if (!idToken) return res.status(400).json({ error: 'Token manquant' })
    try {
      const sessionCookie = await createSession(idToken)
      const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
      res.setHeader(
        'Set-Cookie',
        `${COOKIE_NAME}=${sessionCookie}; HttpOnly; Path=/; Max-Age=${MAX_AGE}; SameSite=Strict${secure}`
      )
      return res.status(200).json({ ok: true })
    } catch {
      return res.status(401).json({ error: 'Token invalide' })
    }
  }

  if (req.method === 'DELETE') {
    res.setHeader('Set-Cookie', `${COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict`)
    return res.status(200).json({ ok: true })
  }

  return res.status(405).end()
}
