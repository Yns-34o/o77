import { useState, useEffect } from 'react'
import Head from 'next/head'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { parseCookies, verifySession, COOKIE_NAME } from '@/lib/auth-session'
import { LEGAL_PAGE_META, LEGAL_PAGES, seedLegalPages } from '@/lib/legal-content'
import { pricesToLabel, pricesToBase, priceDisplay } from '@/lib/format'
import { auth } from '@/lib/firebase'

// Helper de fetch avec cookie de session.
function adminFetch(path, body) {
  const opts = { headers: { 'content-type': 'application/json' }, credentials: 'same-origin' }
  if (body) { opts.method = 'POST'; opts.body = JSON.stringify(body) } else opts.method = 'GET'
  return fetch(path, opts).then((r) => r.json())
}

const TABS = [
  { id: 'produits', label: 'Produits' },
  { id: 'promos', label: 'Promos' },
  { id: 'categories', label: 'Catégories' },
  { id: 'infos', label: 'Infos & Légal' },
]

const inputStyle = { marginBottom: 12 }
const lbl = { fontSize: 10, fontFamily: 'Oswald', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#999', display: 'block', marginBottom: 6 }

// Formulaire de connexion affiché DIRECTEMENT dans /dashboard quand l'admin
// n'est pas authentifié. Valide les identifiants : accepte l'entrée si corrects,
// la refuse sinon. Après connexion, on recharge -> le cookie posé rend le dashboard.
function LoginForm() {
  const [email, setEmail] = useState('')
  const [pwd, setPwd] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setErr(''); setLoading(true)
    try {
      // 1. Connexion côté client -> idToken (Firebase Auth)
      const cred = await signInWithEmailAndPassword(auth, email, pwd)
      const idToken = await cred.user.getIdToken()
      // 2. Échange contre un cookie de session HttpOnly (fait foi côté serveur)
      const res = await fetch('/api/auth/session', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ idToken }) })
      if (!res.ok) throw new Error()
      await auth.signOut()
      window.location.reload() // cookie posé -> getServerSideProps rend le dashboard
    } catch {
      setErr('Email ou mot de passe incorrect.')
      setLoading(false)
    }
  }

  return (
    <>
      <Head><title>Connexion admin — O'77</title><meta name="robots" content="noindex" /></Head>
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

// Point d'entrée : authentifié -> dashboard complet ; sinon -> formulaire de connexion.
export default function Dashboard({ authed, adminEmail }) {
  return authed ? <DashboardApp adminEmail={adminEmail} /> : <LoginForm />
}

function DashboardApp({ adminEmail }) {
  const [tab, setTab] = useState('produits')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])
  async function load() {
    try {
      const d = await adminFetch('/api/admin/data')
      setData(d)
    } catch { /* ignore */ }
    setLoading(false)
  }

  async function logout() {
    await fetch('/api/auth/session', { method: 'DELETE' })
    window.location.href = '/dashboard'
  }

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>Chargement…</div>
  }
  if (!data || data.error) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171' }}>Session expirée — <a href="/dashboard" style={{ color: '#FFD600', marginLeft: 8 }}>reconnexion</a></div>
  }

  return (
    <>
      <Head><title>Dashboard admin — O'77</title><meta name="robots" content="noindex" /></Head>
      <div style={{ minHeight: '100vh', background: '#000' }}>
        {/* Barre du haut */}
        <div style={{ borderBottom: '2px solid #FFD600', padding: '0 20px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: '#000', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src="/logo.png" alt="O'77" style={{ height: 36 }} />
            <span style={{ fontFamily: 'Oswald', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.9rem' }}>Dashboard</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ color: '#666', fontSize: '0.75rem' }}>{adminEmail}</span>
            <button onClick={logout} className="btn-outline" style={{ fontSize: '0.7rem', padding: '8px 16px' }}>Déconnexion</button>
          </div>
        </div>

        {/* Onglets */}
        <div style={{ display: 'flex', gap: 4, padding: '0 20px', borderBottom: '1px solid #1c1c1c', overflowX: 'auto' }}>
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '14px 18px', background: 'none', border: 'none', borderBottom: tab === t.id ? '2px solid #FFD600' : '2px solid transparent', color: tab === t.id ? '#FFD600' : '#888', fontFamily: 'Oswald', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.8rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ maxWidth: 1100, margin: '0 auto', padding: 32 }}>
          {tab === 'produits' && <ProduitsTab data={data} reload={load} />}
          {tab === 'promos' && <PromosTab data={data} reload={load} />}
          {tab === 'categories' && <CategoriesTab data={data} reload={load} />}
          {tab === 'infos' && <InfosTab data={data} reload={load} />}
        </div>
      </div>
    </>
  )
}

/* =================== PRODUITS =================== */
// Charge les prix structurés d'un produit dans l'état d'édition (lignes label+price).
// Legacy (produits sans `prices`) -> 1 ligne à partir de `price`.
function toEditingPrices(p) {
  if (Array.isArray(p.prices) && p.prices.length) {
    return p.prices.map((l) => ({ label: l.label || '', price: String(l.price ?? '') }))
  }
  return [{ label: '', price: String(p.price ?? '') }]
}

function ProduitsTab({ data, reload }) {
  const [editing, setEditing] = useState(null) // produit en édition (ou {} pour nouveau)
  const cats = data.categories || []

  function startNew() {
    setEditing({ id: '', name: '', description: '', prices: [{ label: '', price: '' }], salePrice: '', saleActive: false, category: cats[0]?.id || '', image: '', badge: '', allergens: '', featured: false, active: true, sortOrder: 0 })
  }

  async function save() {
    // Régénère prices (nettoyé) + price/priceLabel dérivés.
    const raw = (editing.prices || [{ label: '', price: '' }])
      .map((l) => ({ label: (l.label || '').trim(), price: parseFloat(l.price) || 0 }))
      .filter((l) => l.price > 0 || l.label)
    const prices = raw.length ? raw : [{ label: '', price: 0 }]
    const p = {
      id: editing.id || undefined,
      name: editing.name,
      description: editing.description,
      prices,
      price: pricesToBase(prices),
      priceLabel: pricesToLabel(prices),
      salePrice: editing.salePrice !== '' && editing.salePrice != null ? parseFloat(editing.salePrice) : null,
      saleActive: !!editing.saleActive,
      category: editing.category,
      image: editing.image,
      badge: editing.badge || null,
      allergens: (editing.allergens || '').split(',').map((s) => s.trim()).filter(Boolean),
      featured: !!editing.featured,
      active: editing.active !== false,
      sortOrder: parseInt(editing.sortOrder, 10) || 0,
    }
    await adminFetch('/api/admin/products', p)
    setEditing(null)
    await reload()
  }

  async function remove(id) {
    if (!confirm('Supprimer ce produit ?')) return
    await fetch('/api/admin/products', { method: 'DELETE', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id }) })
    await reload()
  }

  // Produits groupés par catégorie : toute catégorie ajoutée apparaît ici
  // automatiquement comme une section. Les produits sans catégorie valide
  // tombent dans « Hors catégorie » (pour vérifier qu'aucun n'est perdu).
  const products = data.products || []
  const catsSorted = cats.slice().sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
  const orphans = products.filter((p) => !cats.find((c) => c.id === p.category))

  // Rendu d'une ligne produit (réutilisé dans chaque section).
  const row = (p) => (
    <div key={p.id} style={{ background: '#111', border: '1px solid #1c1c1c', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
      <div>
        <strong style={{ fontSize: '0.9rem' }}>{p.name}</strong>
        {!p.active && <span style={{ color: '#f87171', fontSize: '0.7rem', marginLeft: 8 }}>(masqué)</span>}
        {p.featured && <span style={{ color: '#FFD600', fontSize: '0.7rem', marginLeft: 8 }}>★ Mis en avant</span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontFamily: 'Oswald', color: '#FFD600', fontSize: '0.8rem' }}>
          {p.saleActive && p.salePrice != null && !p.priceLabel ? <><s style={{ color: '#555', fontSize: '0.75rem' }}>{Number(p.price).toFixed(2)}€</s> {Number(p.salePrice).toFixed(2)}€</> : priceDisplay(p)}
        </span>
        <button onClick={() => setEditing({ ...p, prices: toEditingPrices(p), salePrice: p.salePrice != null ? String(p.salePrice) : '', allergens: (p.allergens || []).join(', ') })} style={miniBtn}>Éditer</button>
        <button onClick={() => remove(p.id)} style={{ ...miniBtn, color: '#f87171' }}>Suppr.</button>
      </div>
    </div>
  )

  return (
    <div>
      <SectionTitle title={`Produits (${products.length})`} action={<button onClick={startNew} className="btn-jaune" style={{ fontSize: '0.75rem', padding: '10px 18px' }}>+ Nouveau produit</button>} />
      {catsSorted.map((c) => {
        const items = products.filter((p) => p.category === c.id)
        if (!items.length) return null
        return (
          <div key={c.id} style={{ marginBottom: 22 }}>
            <h3 style={{ fontFamily: 'Oswald', textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '0.95rem', color: '#fff', margin: '8px 0 10px' }}>
              {c.icon || '🍽️'} {c.label} <span style={{ color: '#666', fontSize: '0.75rem', letterSpacing: 0 }}>({items.length})</span>
            </h3>
            <div style={{ display: 'grid', gap: 8 }}>{items.map(row)}</div>
          </div>
        )
      })}
      {orphans.length > 0 && (
        <div style={{ marginBottom: 22 }}>
          <h3 style={{ fontFamily: 'Oswald', textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '0.95rem', color: '#f87171', margin: '8px 0 10px' }}>
            Hors catégorie <span style={{ color: '#666', fontSize: '0.75rem', letterSpacing: 0 }}>({orphans.length})</span>
          </h3>
          <div style={{ display: 'grid', gap: 8 }}>{orphans.map(row)}</div>
        </div>
      )}

      {editing && (
        <Modal onClose={() => setEditing(null)} title={editing.id ? 'Modifier le produit' : 'Nouveau produit'}>
          <Field label="Nom"><input className="form-input" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} style={inputStyle} /></Field>
          <Field label="Description"><textarea className="form-input" rows={2} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} style={inputStyle} /></Field>
          <Field label="Catégorie">
            <select className="form-input" value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })}>
              {cats.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </Field>
          <PricesEditor prices={editing.prices} setPrices={(prices) => setEditing({ ...editing, prices })} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Prix soldé (€) — laisser vide sinon"><input className="form-input" type="number" step="0.01" value={editing.salePrice} onChange={(e) => setEditing({ ...editing, salePrice: e.target.value })} /></Field>
            <Field label="Badge (ex: 🔥 Best)"><input className="form-input" value={editing.badge || ''} onChange={(e) => setEditing({ ...editing, badge: e.target.value })} /></Field>
          </div>
          <ImageField value={editing.image} onChange={(v) => setEditing({ ...editing, image: v })} productId={editing.id} />
          <Field label="Allergènes (séparés par des virgules)"><input className="form-input" value={editing.allergens} onChange={(e) => setEditing({ ...editing, allergens: e.target.value })} style={inputStyle} /></Field>
          <Field label="Ordre (tri)"><input className="form-input" type="number" value={editing.sortOrder} onChange={(e) => setEditing({ ...editing, sortOrder: e.target.value })} style={inputStyle} /></Field>
          <div style={{ display: 'flex', gap: 20, margin: '12px 0 20px' }}>
            <Check label="En soldes" checked={editing.saleActive} onChange={(v) => setEditing({ ...editing, saleActive: v })} />
            <Check label="Mis en avant (accueil)" checked={editing.featured} onChange={(v) => setEditing({ ...editing, featured: v })} />
            <Check label="Visible sur le site" checked={editing.active} onChange={(v) => setEditing({ ...editing, active: v })} />
          </div>
          <button onClick={save} className="btn-jaune" style={{ width: '100%' }}>Enregistrer</button>
        </Modal>
      )}
    </div>
  )
}

/* =================== PROMOS (réduction -X% + bannière) =================== */
const DAY_LABELS = [
  { id: 'monday', label: 'Lun' }, { id: 'tuesday', label: 'Mar' }, { id: 'wednesday', label: 'Mer' },
  { id: 'thursday', label: 'Jeu' }, { id: 'friday', label: 'Ven' }, { id: 'saturday', label: 'Sam' }, { id: 'sunday', label: 'Dim' },
]

function PromosTab({ data, reload }) {
  const promos = data.promos || []
  const cats = data.categories || []
  // La promo « deal » actuellement enregistrée en base (null si aucune).
  const stored = promos.find((p) => p.type === 'deal') || null
  const toForm = (p) => ({ id: p.id || '', type: 'deal', text: p.text || '', active: !!p.active, percent: p.percent != null ? String(p.percent) : '', cats: p.cats || [], days: p.days || [] })
  const EMPTY = { id: '', type: 'deal', text: '', active: false, percent: '', cats: [], days: [] }

  const [d, setD] = useState(() => (stored ? toForm(stored) : { ...EMPTY }))
  const [justSaved, setJustSaved] = useState(false)

  // Resynchronise le formulaire avec la base : après un enregistrement (l'id vient
  // d'être créé) ou au retour sur l'onglet. Sans ça, chaque « Enregistrer » créait
  // un nouveau document au lieu de modifier l'existant.
  useEffect(() => {
    setD(stored ? toForm(stored) : { ...EMPTY })
  }, [stored?.id, stored?.updatedAt])

  const set = (k, v) => setD((p) => ({ ...p, [k]: v }))
  const toggleCat = (cid) => set('cats', d.cats.includes(cid) ? d.cats.filter((x) => x !== cid) : [...d.cats, cid])
  const toggleDay = (day) => set('days', d.days.includes(day) ? d.days.filter((x) => x !== day) : [...d.days, day])

  async function save() {
    await fetch('/api/admin/promos', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id: d.id || undefined, type: 'deal', text: d.text, active: !!d.active, percent: parseFloat(d.percent) || 0, cats: d.cats, days: d.days }) })
    setJustSaved(true); setTimeout(() => setJustSaved(false), 2000)
    await reload()
  }

  async function remove() {
    if (!d.id || !confirm('Supprimer définitivement cette promo ? Les prix redeviennent normaux.')) return
    await fetch('/api/admin/promos', { method: 'DELETE', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id: d.id }) })
    setD({ ...EMPTY })
    await reload()
  }

  return (
    <div>
      <SectionTitle title="Promo du moment" />
      <p style={{ color: '#888', fontSize: '0.8rem', marginBottom: 20 }}>
        Configurez une réduction : elle s'affiche en <strong>bannière en haut du site</strong> ET <strong>réduit les prix</strong> des catégories ciblées les jours choisis (prix barrés sur la carte).
      </p>

      {d.id && (
        <div style={{ background: '#1c1a00', border: '1px solid #3a3500', color: '#FFD600', padding: '10px 14px', marginBottom: 16, fontSize: '0.8rem', borderRadius: 6 }}>
          ✓ Promo enregistrée en mémoire — modifiable ci-dessous, ou supprimable.
        </div>
      )}

      <Field label="Texte de la bannière"><input className="form-input" value={d.text} onChange={(e) => set('text', e.target.value)} placeholder="ex : -20% sur les pizzas tous les vendredis !" style={{ marginBottom: 16 }} /></Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 8 }}>
        <Field label="Réduction (%)"><input className="form-input" type="number" min="0" max="100" step="1" value={d.percent} onChange={(e) => set('percent', e.target.value)} /></Field>
        <div style={{ paddingTop: 26 }}><Check label="Promo active" checked={!!d.active} onChange={(v) => set('active', v)} /></div>
      </div>

      <Field label="Catégories concernées (vide = tout le menu)">
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {cats.map((c) => <Check key={c.id} label={`${c.icon || '🍽️'} ${c.label}`} checked={d.cats.includes(c.id)} onChange={() => toggleCat(c.id)} />)}
        </div>
      </Field>

      <Field label="Jours actifs (vide = tous les jours)">
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {DAY_LABELS.map((day) => <Check key={day.id} label={day.label} checked={d.days.includes(day.id)} onChange={() => toggleDay(day.id)} />)}
        </div>
      </Field>

      <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
        <button onClick={save} className="btn-jaune">{justSaved ? '✓ Enregistré' : (d.id ? 'Mettre à jour' : 'Enregistrer la promo')}</button>
        {d.id && <button onClick={remove} className="btn-outline" style={{ color: '#f87171', borderColor: '#f87171' }}>Supprimer</button>}
      </div>

      <SectionTitle title="Promo par produit (prix barré)" />
      <p style={{ color: '#888', fontSize: '0.8rem' }}>Pour une promo ciblée sur un seul produit : onglet <strong>Produits</strong> → éditer → « Prix soldé » + cocher « En soldes ».</p>
    </div>
  )
}

/* =================== COMMANDES (À EMPORTER) =================== */
function CommandesTab({ data, reload }) {
  const orders = data.preorders || []
  const statusColor = { new: '#FFD600', confirmed: '#4ade80', cancelled: '#f87171', completed: '#888' }
  async function setStatus(id, status) {
    await fetch('/api/admin/reservations', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id, status }) })
    await reload()
  }
  if (orders.length === 0) return <p style={{ color: '#666' }}>Aucune pré-commande pour l'instant.</p>
  return (
    <div>
      <SectionTitle title={`Pré-commandes (${orders.length})`} />
      <div style={{ display: 'grid', gap: 10 }}>
        {orders.map((o) => (
          <div key={o.id} style={{ background: '#111', border: '1px solid #1c1c1c', padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
              <strong>{o.firstName} {o.lastName}</strong>
              <span style={{ color: statusColor[o.status] || '#888', fontFamily: 'Oswald', textTransform: 'uppercase', fontSize: '0.75rem' }}>{o.status}</span>
            </div>
            <div style={{ color: '#aaa', fontSize: '0.82rem', lineHeight: 1.7 }}>
              📞 {o.phone} {o.email && <>· ✉️ {o.email}</>}<br />
              🕒 Retrait : <strong>{o.pickupDate} à {o.pickupTime}</strong><br />
              📝 {o.details}
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
              {['new', 'confirmed', 'cancelled', 'completed'].map((s) => (
                <button key={s} onClick={() => setStatus(o.id, s)} style={{ ...miniBtn, opacity: o.status === s ? 1 : 0.5 }}>{s}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* =================== CATÉGORIES =================== */
function CategoriesTab({ data, reload }) {
  const [editing, setEditing] = useState(null) // catégorie en édition (ou {} pour nouvelle)
  const cats = (data.categories || []).slice().sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))

  function startNew() {
    setEditing({ id: '', label: '', icon: '🍽️', image: '', sortOrder: cats.length, active: true })
  }

  async function save() {
    if (!String(editing.label || '').trim()) return
    await fetch('/api/admin/categories', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({
      id: editing.id || undefined,
      label: editing.label.trim(),
      icon: editing.icon || '🍽️',
      image: editing.image || null,
      sortOrder: parseInt(editing.sortOrder, 10) || 0,
      active: editing.active !== false,
    }) })
    setEditing(null)
    await reload()
  }

  async function remove(id) {
    if (!confirm('Supprimer cette catégorie ? (Les produits associés ne sont pas supprimés, mais n\'auront plus de catégorie.)')) return
    await fetch('/api/admin/categories', { method: 'DELETE', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id }) })
    await reload()
  }

  return (
    <div>
      <SectionTitle title="Catégories du menu" action={<button onClick={startNew} className="btn-jaune" style={{ fontSize: '0.75rem', padding: '10px 18px' }}>+ Nouvelle catégorie</button>} />
      <div style={{ display: 'grid', gap: 8 }}>
        {cats.map((c) => (
          <div key={c.id} style={{ background: '#111', border: '1px solid #1c1c1c', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {c.image
                ? <img src={c.image} alt="" style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 6, border: '1px solid #1c1c1c' }} />
                : <span style={{ width: 44, height: 44, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', borderRadius: 6, fontSize: 22 }}>{c.icon || '🍽️'}</span>}
              <div>
                <strong style={{ fontSize: '0.9rem' }}>{c.label}</strong>
                {!c.active && <span style={{ color: '#f87171', fontSize: '0.7rem', marginLeft: 8 }}>(masquée)</span>}
                <span style={{ color: '#666', fontSize: '0.72rem', display: 'block' }}>{c.id}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setEditing({ ...c })} style={miniBtn}>Éditer</button>
              <button onClick={() => remove(c.id)} style={{ ...miniBtn, color: '#f87171' }}>Suppr.</button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <Modal onClose={() => setEditing(null)} title={editing.id ? 'Modifier la catégorie' : 'Nouvelle catégorie'}>
          <Field label="Nom"><input className="form-input" value={editing.label} onChange={(e) => setEditing({ ...editing, label: e.target.value })} style={inputStyle} /></Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Icône (emoji)"><input className="form-input" value={editing.icon || ''} onChange={(e) => setEditing({ ...editing, icon: e.target.value })} placeholder="🍕" /></Field>
            <Field label="Ordre (tri)"><input className="form-input" type="number" value={editing.sortOrder ?? 0} onChange={(e) => setEditing({ ...editing, sortOrder: e.target.value })} /></Field>
          </div>
          <ImageField label="Image de la catégorie" value={editing.image} onChange={(v) => setEditing({ ...editing, image: v })} categoryId={editing.id} />
          <div style={{ margin: '12px 0 20px' }}>
            <Check label="Visible sur le site" checked={editing.active !== false} onChange={(v) => setEditing({ ...editing, active: v })} />
          </div>
          <button onClick={save} className="btn-jaune" style={{ width: '100%' }}>Enregistrer</button>
        </Modal>
      )}
    </div>
  )
}

/* =================== INFOS & MENTIONS LÉGALES =================== */
function InfosTab({ data, reload }) {
  const c = data.config || {}
  const [cfg, setCfg] = useState(() => seedLegalPages(c))
  const [saved, setSaved] = useState(false)
  const set = (k, v) => setCfg({ ...cfg, [k]: v })
  const setDeep = (k1, k2, v) => setCfg({ ...cfg, [k1]: { ...cfg[k1], [k2]: v } })
  const setLegal = (k, v) => setCfg({ ...cfg, legal: { ...(cfg.legal || {}), [k]: v } })

  async function save() {
    await fetch('/api/admin/config', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ config: cfg }) })
    setSaved(true); setTimeout(() => setSaved(false), 2000)
    await reload()
  }

  return (
    <div>
      <SectionTitle title="Coordonnées du restaurant" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Nom"><input className="form-input" value={cfg.restaurantName || ''} onChange={(e) => set('restaurantName', e.target.value)} /></Field>
        <Field label="Slogan"><input className="form-input" value={cfg.slogan || ''} onChange={(e) => set('slogan', e.target.value)} /></Field>
        <Field label="Téléphone"><input className="form-input" value={cfg.phone || ''} onChange={(e) => set('phone', e.target.value)} /></Field>
        <Field label="Email"><input className="form-input" value={cfg.email || ''} onChange={(e) => set('email', e.target.value)} /></Field>
        <Field label="Adresse"><input className="form-input" value={(cfg.address && cfg.address.street) || ''} onChange={(e) => setDeep('address', 'street', e.target.value)} /></Field>
        <Field label="Ville / CP"><input className="form-input" value={(cfg.address && cfg.address.postalCode + ' ' + (cfg.address.city || '')) || ''} readOnly style={{ opacity: 0.6 }} /></Field>
      </div>

      <SectionTitle title="Livraison & réseaux" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Lien Deliveroo"><input className="form-input" value={(cfg.delivery && cfg.delivery.deliveroo) || ''} onChange={(e) => setDeep('delivery', 'deliveroo', e.target.value)} /></Field>
        <Field label="Lien Uber Eats (si dispo)"><input className="form-input" value={(cfg.delivery && cfg.delivery.ubereats) || ''} onChange={(e) => setDeep('delivery', 'ubereats', e.target.value)} /></Field>
        <Field label="Lien Just Eat (si dispo)"><input className="form-input" value={(cfg.delivery && cfg.delivery.justeat) || ''} onChange={(e) => setDeep('delivery', 'justeat', e.target.value)} /></Field>
        <Field label="Instagram (URL)"><input className="form-input" value={(cfg.social && cfg.social.instagram) || ''} onChange={(e) => setDeep('social', 'instagram', e.target.value)} /></Field>
        <Field label="TikTok (URL)"><input className="form-input" value={(cfg.social && cfg.social.tiktok) || ''} onChange={(e) => setDeep('social', 'tiktok', e.target.value)} /></Field>
        <Field label="Snapchat (URL)"><input className="form-input" value={(cfg.social && cfg.social.snapchat) || ''} onChange={(e) => setDeep('social', 'snapchat', e.target.value)} /></Field>
        <Field label="Facebook (URL)"><input className="form-input" value={(cfg.social && cfg.social.facebook) || ''} onChange={(e) => setDeep('social', 'facebook', e.target.value)} /></Field>
      </div>

      <SectionTitle title="Mentions légales (à compléter)" />
      <p style={{ color: '#888', fontSize: '0.78rem', marginBottom: 16 }}>Ces infos apparaissent automatiquement sur la page <a href="/mentions-legales" target="_blank" style={{ color: '#FFD600' }}>/mentions-legales</a>.</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Raison sociale"><input className="form-input" value={(cfg.legal && cfg.legal.companyName) || ''} onChange={(e) => setLegal('companyName', e.target.value)} /></Field>
        <Field label="Forme juridique (SARL, SAS…)"><input className="form-input" value={(cfg.legal && cfg.legal.legalForm) || ''} onChange={(e) => setLegal('legalForm', e.target.value)} /></Field>
        <Field label="SIRET"><input className="form-input" value={(cfg.legal && cfg.legal.siret) || ''} onChange={(e) => setLegal('siret', e.target.value)} /></Field>
        <Field label="RCS"><input className="form-input" value={(cfg.legal && cfg.legal.rcs) || ''} onChange={(e) => setLegal('rcs', e.target.value)} /></Field>
        <Field label="TVA intracomm."><input className="form-input" value={(cfg.legal && cfg.legal.tva) || ''} onChange={(e) => setLegal('tva', e.target.value)} /></Field>
        <Field label="Capital social"><input className="form-input" value={(cfg.legal && cfg.legal.capital) || ''} onChange={(e) => setLegal('capital', e.target.value)} /></Field>
        <Field label="Nom du gérant"><input className="form-input" value={(cfg.legal && cfg.legal.ownerName) || ''} onChange={(e) => setLegal('ownerName', e.target.value)} /></Field>
        <Field label="Code APE/NAF"><input className="form-input" value={(cfg.legal && cfg.legal.ape) || ''} onChange={(e) => setLegal('ape', e.target.value)} /></Field>
      </div>

      <SectionTitle title="Pages légales éditables" />
      <p style={{ color: '#888', fontSize: '0.78rem', marginBottom: 16 }}>Modifiez le contenu des CGV, de la Politique de confidentialité et des Cookies. Les changements sont visibles publiquement dès le clic sur « Enregistrer les infos » ci-dessous.</p>
      <LegalPagesEditor cfg={cfg} setCfg={setCfg} />

      <button onClick={save} className="btn-jaune" style={{ marginTop: 20 }}>{saved ? '✓ Enregistré' : 'Enregistrer les infos'}</button>
    </div>
  )
}

/* =================== ÉDITEUR PAGES LÉGALES (sections) =================== */
function newSectionId(slug) {
  return `${slug}-u${Math.random().toString(36).slice(2, 8)}`
}

function LegalPagesEditor({ cfg, setCfg }) {
  const [open, setOpen] = useState(null) // slug de la page dépliée
  const legalPages = cfg.legalPages || {}

  function setSections(slug, sections) {
    setCfg({ ...cfg, legalPages: { ...legalPages, [slug]: sections } })
  }
  function updateField(slug, idx, field, value) {
    const arr = (legalPages[slug] || []).map((s) => ({ ...s }))
    arr[idx] = { ...arr[idx], [field]: value }
    setSections(slug, arr)
  }
  function addSection(slug) {
    const arr = (legalPages[slug] || []).map((s) => ({ ...s }))
    arr.push({ id: newSectionId(slug), title: '', body: '' })
    setSections(slug, arr)
  }
  function removeSection(slug, idx) {
    setSections(slug, (legalPages[slug] || []).filter((_, i) => i !== idx))
  }
  function resetPage(slug) {
    if (!confirm('Réinitialiser cette page au texte par défaut ? Vos modifications seront perdues.')) return
    setSections(slug, LEGAL_PAGES[slug].map((s) => ({ ...s })))
  }
  function moveSection(slug, idx, dir) {
    const arr = (legalPages[slug] || []).map((s) => ({ ...s }))
    const j = idx + dir
    if (j < 0 || j >= arr.length) return
    ;[arr[idx], arr[j]] = [arr[j], arr[idx]]
    setSections(slug, arr)
  }

  return (
    <div>
      {LEGAL_PAGE_META.map(({ slug, label }) => {
        const sections = legalPages[slug] || []
        const isOpen = open === slug
        return (
          <div key={slug} style={{ background: '#111', border: '1px solid #1c1c1c', marginBottom: 10 }}>
            <button onClick={() => setOpen(isOpen ? null : slug)} style={{ width: '100%', textAlign: 'left', padding: '14px 16px', background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'Oswald', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.8rem' }}>
              <span>{label} <span style={{ color: '#555', fontSize: '0.7rem', textTransform: 'none' }}>({sections.length} sections)</span></span>
              <span style={{ color: '#FFD600', fontSize: '1.1rem' }}>{isOpen ? '−' : '+'}</span>
            </button>
            {isOpen && (
              <div style={{ padding: '4px 16px 20px' }}>
                <p style={{ color: '#888', fontSize: '0.7rem', marginBottom: 14, lineHeight: 1.6 }}>
                  ⚠ Contenu juridique — modifiez avec précaution. Mise en forme&nbsp;: ligne débutant par <code>- </code> = puce&nbsp;; <code>**gras**</code>, <code>*italique*</code>&nbsp;; <code>### titre</code> = sous-titre&nbsp;; <code>[texte](url)</code> = lien. Les champs <code>{`{{email}}`}</code>, <code>{`{{address}}`}</code>… sont remplis automatiquement.
                </p>
                {sections.map((s, idx) => (
                  <div key={s.id || idx} style={{ borderTop: idx ? '1px solid #1c1c1c' : 'none', paddingTop: idx ? 14 : 0, marginTop: idx ? 14 : 0 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                      <input className="form-input" value={s.title || ''} onChange={(e) => updateField(slug, idx, 'title', e.target.value)} placeholder="Titre de la section (ex : Article 1 — Objet). Laisser vide pour un bloc d'intro." style={{ flex: 1 }} />
                      <button onClick={() => moveSection(slug, idx, -1)} title="Monter" style={{ ...miniBtn, flexShrink: 0 }}>↑</button>
                      <button onClick={() => moveSection(slug, idx, 1)} title="Descendre" style={{ ...miniBtn, flexShrink: 0 }}>↓</button>
                      <button onClick={() => removeSection(slug, idx)} title="Supprimer la section" style={{ ...miniBtn, color: '#f87171', flexShrink: 0 }}>Suppr.</button>
                    </div>
                    <textarea className="form-input" rows={4} value={s.body || ''} onChange={(e) => updateField(slug, idx, 'body', e.target.value)} placeholder="Texte de la section…" style={{ width: '100%' }} />
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
                  <button onClick={() => addSection(slug)} className="btn-outline" style={{ fontSize: '0.7rem', padding: '8px 16px' }}>+ Ajouter une section</button>
                  <button onClick={() => resetPage(slug)} style={{ ...miniBtn }}>Réinitialiser au défaut</button>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

/* =================== Petits composants =================== */
const miniBtn = { fontSize: '0.7rem', fontFamily: 'Oswald', textTransform: 'uppercase', letterSpacing: '0.06em', background: 'none', border: '1px solid #333', color: '#ccc', padding: '6px 12px', cursor: 'pointer' }

function SectionTitle({ title, action }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '24px 0 16px' }}>
      <h2 style={{ fontFamily: 'Oswald', textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '1.1rem' }}>{title}</h2>
      {action}
    </div>
  )
}
function Field({ label, children }) {
  return <div style={{ marginBottom: 12 }}><label style={lbl}>{label}</label>{children}</div>
}
// Éditeur de prix par tailles/formules : liste de lignes (libellé + prix).
// 1 ligne sans libellé = prix simple ; plusieurs lignes = multi-tailles (J/S/M, Seul/Menu, M/L/XL…).
function PricesEditor({ prices, setPrices }) {
  const lines = Array.isArray(prices) && prices.length ? prices : [{ label: '', price: '' }]
  const update = (i, field, val) => setPrices(lines.map((l, idx) => (idx === i ? { ...l, [field]: val } : l)))
  const add = () => setPrices([...lines, { label: '', price: '' }])
  const remove = (i) => setPrices(lines.length > 1 ? lines.filter((_, idx) => idx !== i) : lines)
  const multi = lines.length > 1
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={lbl}>Prix {multi ? '(une ligne par taille / formule)' : '(€)'}</label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {lines.map((l, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 130px auto', gap: 8 }}>
            <input className="form-input" value={l.label || ''} onChange={(e) => update(i, 'label', e.target.value)} placeholder={multi ? 'Taille/formule (ex : J, M, XL — Seul…)' : 'Laisser vide si prix unique'} />
            <input className="form-input" type="number" step="0.01" value={l.price} onChange={(e) => update(i, 'price', e.target.value)} placeholder="Prix €" />
            <button type="button" onClick={() => remove(i)} style={{ ...miniBtn, color: '#f87171' }} disabled={lines.length <= 1} aria-label="Supprimer la ligne">✕</button>
          </div>
        ))}
      </div>
      <button type="button" onClick={add} className="btn-outline" style={{ fontSize: '0.7rem', padding: '6px 14px', marginTop: 8 }}>+ Ajouter une taille / formule</button>
    </div>
  )
}
// Champ image avec aperçu en direct : la preview se rafraîchit à chaque
// modification de l'URL, et signale une image introuvable (onError).
// Champ image : upload (PNG/JPG/WebP), photo en direct (caméra mobile) OU URL.
// L'upload passe par /api/admin/upload (sharp + Firebase Storage) qui renvoie une URL.
// `productId` OU `categoryId` : précise à qui appartient l'image (nommage + dossier).
// `label` : libellé du champ (ex : « Image du produit », « Image de la catégorie »).
// Normalisation côté client d'une image (HEIC iPhone, JPEG, PNG...) -> Blob WebP
// via <canvas>, avec correction de l'orientation EXIF et grand côté plafonné à 2000px.
// Indispensable sur iPhone : les photos sont en HEIC, un format que le serveur ne sait
// pas lire. Safari iOS / Chrome modernes décodent le HEIC nativement.
async function normalizeImage(file) {
  const MAX = 2000
  let bitmap = null
  try { bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' }) } catch { bitmap = null }
  let source, w, h
  if (bitmap) {
    source = bitmap; w = bitmap.width; h = bitmap.height
  } else {
    const img = document.createElement('img')
    img.src = URL.createObjectURL(file)
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = () => reject(new Error("Image illisible — essayez un JPG ou un PNG."))
    })
    source = img; w = img.naturalWidth; h = img.naturalHeight
  }
  if (w > MAX || h > MAX) {
    const r = Math.min(MAX / w, MAX / h)
    w = Math.round(w * r); h = Math.round(h * r)
  }
  const canvas = document.createElement('canvas')
  canvas.width = w; canvas.height = h
  canvas.getContext('2d').drawImage(source, 0, 0, w, h)
  let blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', 0.92))
  let ext = 'webp', type = 'image/webp'
  if (!blob) { // Très vieux navigateur sans export WebP -> JPEG.
    blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92))
    ext = 'jpg'; type = 'image/jpeg'
  }
  if (bitmap && bitmap.close) bitmap.close()
  if (!blob) throw new Error("Conversion impossible — essayez un JPG ou un PNG.")
  return new File([blob], `photo.${ext}`, { type })
}

function ImageField({ value, onChange, productId, categoryId, label = 'Image du produit' }) {
  const [err, setErr] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadErr, setUploadErr] = useState('')
  useEffect(() => { setErr(false) }, [value])

  async function uploadFile(file) {
    setUploadErr('')
    if (!file) return
    setUploading(true)
    try {
      let toSend = file
      const STANDARD = ['image/png', 'image/jpeg', 'image/webp']
      // HEIC/HEIF (photos iPhone) ou fichier trop lourd : on normalise côté client
      // (conversion WebP + orientation + redimensionnement), sinon l'upload échoue
      // (le serveur ne lit pas le HEIC et bloque les fichiers de plus de 12 Mo).
      if (!STANDARD.includes(file.type) || file.size > 12 * 1024 * 1024) {
        toSend = await normalizeImage(file)
      }
      const fd = new FormData()
      fd.append('file', toSend)
      fd.append('id', categoryId || productId || '')
      fd.append('kind', categoryId ? 'category' : 'product')
      const r = await fetch('/api/admin/upload', { method: 'POST', body: fd, credentials: 'same-origin' })
      const data = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(data.error || "Échec de l'upload")
      onChange(data.url)
    } catch (e) {
      setUploadErr(e.message || 'Upload impossible. Essayez une autre photo (JPG/PNG).')
    } finally {
      setUploading(false)
    }
  }

  const url = (value || '').trim()
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={lbl}>{label}</label>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
        <label className="btn-outline" style={{ fontSize: '0.7rem', padding: '8px 14px', cursor: 'pointer' }}>
          📁 Choisir une image
          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => uploadFile(e.target.files && e.target.files[0])} />
        </label>
        <label className="btn-outline" style={{ fontSize: '0.7rem', padding: '8px 14px', cursor: 'pointer' }}>
          📸 Prendre une photo
          <input type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={(e) => uploadFile(e.target.files && e.target.files[0])} />
        </label>
      </div>
      {uploading && <p style={{ color: '#FFD600', fontSize: '0.72rem', marginBottom: 8 }}>Upload en cours… (optimisation qualité)</p>}
      {uploadErr && <p style={{ color: '#f87171', fontSize: '0.72rem', marginBottom: 8 }}>⚠ {uploadErr}</p>}
      <input className="form-input" value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder="…ou collez une URL https://…" style={inputStyle} />
      <div style={{ marginTop: 8, height: 150, width: '100%', background: '#0a0a0a', border: '1px solid #1c1c1c', borderRadius: 4, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {url && !err ? (
          <img src={url} alt="Aperçu" onError={() => setErr(true)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ color: err ? '#f87171' : '#555', fontSize: '0.72rem', textAlign: 'center', padding: 12 }}>
            {err ? "⚠ Image introuvable — vérifiez l'URL" : url ? 'Chargement…' : 'Aperçu : uploadez une photo ou collez une URL'}
          </span>
        )}
      </div>
    </div>
  )
}
function Check({ label, checked, onChange }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', cursor: 'pointer', color: '#ccc' }}>
      <input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)} style={{ width: 16, height: 16, accentColor: '#FFD600' }} />
      {label}
    </label>
  )
}
function Modal({ title, children, onClose }) {
  return (
    <div className="modal-bg open" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-box" style={{ maxWidth: 560, padding: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontFamily: 'Oswald', fontSize: '1.2rem', textTransform: 'uppercase' }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 20 }}>✕</button>
        </div>
        <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>{children}</div>
      </div>
    </div>
  )
}

export async function getServerSideProps({ req }) {
  const cookies = parseCookies(req)
  const decoded = await verifySession(cookies[COOKIE_NAME])
  // Pas de session valide -> on reste sur /dashboard mais on y affiche le
  // formulaire de connexion intégré (authed=false) plutôt que de rediriger.
  if (!decoded) return { props: { authed: false } }
  return { props: { authed: true, adminEmail: decoded.email || '' } }
}
