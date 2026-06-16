// Session admin via Firebase Auth (cookie HttpOnly).
import { authAdmin } from './firebase-admin'

export const COOKIE_NAME = 'o77_session'
export const MAX_AGE = 60 * 60 * 24 * 14 // 14 jours

// Crée un cookie de session à partir d'un idToken client.
export async function createSession(idToken) {
  return authAdmin.createSessionCookie(idToken, { expiresIn: MAX_AGE * 1000 })
}

// Vérifie un cookie de session -> renvoie le payload décodé (uid, email...) ou null.
export async function verifySession(sessionCookie) {
  if (!sessionCookie) return null
  try {
    return await authAdmin.verifySessionCookie(sessionCookie, true)
  } catch {
    return null
  }
}

export function parseCookies(req) {
  return Object.fromEntries(
    (req.headers.cookie || '')
      .split(';')
      .map((c) => {
        const [k, ...v] = c.trim().split('=')
        return [k.trim(), v.join('=').trim()]
      })
      .filter(([k]) => k)
  )
}

// Helper d'auth pour les routes API admin. Renvoie le payload ou null.
export async function checkAuth(req) {
  const cookies = parseCookies(req)
  return verifySession(cookies[COOKIE_NAME])
}
