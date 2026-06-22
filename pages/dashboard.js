import { useState, useEffect } from 'react'
import Head from 'next/head'
import { parseCookies, verifySession, COOKIE_NAME } from '@/lib/auth-session'

// Helper de fetch avec cookie de session.
function adminFetch(path, body) {
  const opts = { headers: { 'content-type': 'application/json' }, credentials: 'same-origin' }
  if (body) { opts.method = 'POST'; opts.body = JSON.stringify(body) } else opts.method = 'GET'
  return fetch(path, opts).then((r) => r.json())
}

const TABS = [
  { id: 'produits', label: 'Produits' },
  { id: 'promos', label: 'Promos' },
  { id: 'commandes', label: 'Commandes' },
  { id: 'categories', label: 'Catégories' },
  { id: 'infos', label: 'Infos & Légal' },
]

const inputStyle = { marginBottom: 12 }
const lbl = { fontSize: 10, fontFamily: 'Oswald', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#999', display: 'block', marginBottom: 6 }

export default function Dashboard({ adminEmail }) {
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
    window.location.href = '/login-admin'
  }

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>Chargement…</div>
  }
  if (!data || data.error) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171' }}>Session expirée — <a href="/login-admin" style={{ color: '#FFD600', marginLeft: 8 }}>reconnexion</a></div>
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
          {tab === 'commandes' && <CommandesTab data={data} reload={load} />}
          {tab === 'categories' && <CategoriesTab data={data} reload={load} />}
          {tab === 'infos' && <InfosTab data={data} reload={load} />}
        </div>
      </div>
    </>
  )
}

/* =================== PRODUITS =================== */
function ProduitsTab({ data, reload }) {
  const [editing, setEditing] = useState(null) // produit en édition (ou {} pour nouveau)
  const cats = data.categories || []

  function startNew() {
    setEditing({ id: '', name: '', description: '', price: '', salePrice: '', saleActive: false, category: cats[0]?.id || '', image: '', badge: '', allergens: '', featured: false, active: true, sortOrder: 0 })
  }

  async function save() {
    const p = {
      id: editing.id || undefined,
      name: editing.name,
      description: editing.description,
      price: parseFloat(editing.price) || 0,
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

  return (
    <div>
      <SectionTitle title="Produits" action={<button onClick={startNew} className="btn-jaune" style={{ fontSize: '0.75rem', padding: '10px 18px' }}>+ Nouveau produit</button>} />
      <div style={{ display: 'grid', gap: 8 }}>
        {(data.products || []).map((p) => (
          <div key={p.id} style={{ background: '#111', border: '1px solid #1c1c1c', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <strong style={{ fontSize: '0.9rem' }}>{p.name}</strong>
              <span style={{ color: '#666', fontSize: '0.75rem', marginLeft: 8 }}>{(cats.find((c) => c.id === p.category) || {}).label || p.category}</span>
              {!p.active && <span style={{ color: '#f87171', fontSize: '0.7rem', marginLeft: 8 }}>(masqué)</span>}
              {p.featured && <span style={{ color: '#FFD600', fontSize: '0.7rem', marginLeft: 8 }}>★ Mis en avant</span>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontFamily: 'Oswald', color: '#FFD600' }}>
                {p.saleActive && p.salePrice != null ? <><s style={{ color: '#555', fontSize: '0.8rem' }}>{Number(p.price).toFixed(2)}€</s> {Number(p.salePrice).toFixed(2)}€</> : Number(p.price).toFixed(2) + '€'}
              </span>
              <button onClick={() => setEditing({ ...p, price: String(p.price ?? ''), salePrice: p.salePrice != null ? String(p.salePrice) : '', allergens: (p.allergens || []).join(', ') })} style={miniBtn}>Éditer</button>
              <button onClick={() => remove(p.id)} style={{ ...miniBtn, color: '#f87171' }}>Suppr.</button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <Modal onClose={() => setEditing(null)} title={editing.id ? 'Modifier le produit' : 'Nouveau produit'}>
          <Field label="Nom"><input className="form-input" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} style={inputStyle} /></Field>
          <Field label="Description"><textarea className="form-input" rows={2} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} style={inputStyle} /></Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Prix (€)"><input className="form-input" type="number" step="0.01" value={editing.price} onChange={(e) => setEditing({ ...editing, price: e.target.value })} /></Field>
            <Field label="Catégorie">
              <select className="form-input" value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })}>
                {cats.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Prix soldé (€) — laisser vide sinon"><input className="form-input" type="number" step="0.01" value={editing.salePrice} onChange={(e) => setEditing({ ...editing, salePrice: e.target.value })} /></Field>
            <Field label="Badge (ex: 🔥 Best)"><input className="form-input" value={editing.badge || ''} onChange={(e) => setEditing({ ...editing, badge: e.target.value })} /></Field>
          </div>
          <ImageField value={editing.image} onChange={(v) => setEditing({ ...editing, image: v })} />
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

/* =================== PROMOS (bannière) =================== */
function PromosTab({ data, reload }) {
  const promos = data.promos || []
  const banner = promos.find((p) => p.type === 'banner') || { id: '', type: 'banner', text: '', active: false }
  const [text, setText] = useState(banner.text)
  const [active, setActive] = useState(banner.active)

  async function save() {
    await fetch('/api/admin/promos', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id: banner.id || undefined, type: 'banner', text, active }) })
    await reload()
  }

  return (
    <div>
      <SectionTitle title="Bannière promo" />
      <p style={{ color: '#888', fontSize: '0.8rem', marginBottom: 20 }}>Une bannière jaune s'affiche en haut du site quand la promo est active.</p>
      <Field label="Texte de la promo"><input className="form-input" value={text} onChange={(e) => setText(e.target.value)} placeholder="ex : −20% sur les pizzas ce vendredi !" style={{ marginBottom: 16 }} /></Field>
      <div style={{ marginBottom: 20 }}><Check label="Activer la bannière" checked={active} onChange={setActive} /></div>
      <button onClick={save} className="btn-jaune">Enregistrer la promo</button>

      <SectionTitle title="Prix soldés" />
      <p style={{ color: '#888', fontSize: '0.8rem' }}>Pour mettre un produit en promo avec un prix barré : onglet <strong>Produits</strong> → éditer → remplir « Prix soldé » + cocher « En soldes ».</p>
    </div>
  )
}

/* =================== COMMANDES (Click & Collect) =================== */
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
  const [label, setLabel] = useState('')
  const [icon, setIcon] = useState('')
  const cats = data.categories || []
  async function add() {
    if (!label.trim()) return
    await fetch('/api/admin/categories', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ label, icon: icon || '🍽️', sortOrder: cats.length, active: true }) })
    setLabel(''); setIcon(''); await reload()
  }
  async function remove(id) {
    if (!confirm('Supprimer cette catégorie ?')) return
    await fetch('/api/admin/categories', { method: 'DELETE', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id }) })
    await reload()
  }
  return (
    <div>
      <SectionTitle title="Catégories du menu" />
      <div style={{ display: 'grid', gap: 8, marginBottom: 24 }}>
        {cats.map((c) => (
          <div key={c.id} style={{ background: '#111', border: '1px solid #1c1c1c', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{c.icon} {c.label}</span>
            <button onClick={() => remove(c.id)} style={{ ...miniBtn, color: '#f87171' }}>Suppr.</button>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr auto', gap: 8 }}>
        <input className="form-input" value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="🍕" />
        <input className="form-input" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Nom de la catégorie" />
        <button onClick={add} className="btn-jaune">+ Ajouter</button>
      </div>
    </div>
  )
}

/* =================== INFOS & MENTIONS LÉGALES =================== */
function InfosTab({ data, reload }) {
  const c = data.config || {}
  const [cfg, setCfg] = useState(c)
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
        <Field label="Instagram (URL)"><input className="form-input" value={(cfg.social && cfg.social.instagram) || ''} onChange={(e) => setDeep('social', 'instagram', e.target.value)} /></Field>
        <Field label="TikTok (URL)"><input className="form-input" value={(cfg.social && cfg.social.tiktok) || ''} onChange={(e) => setDeep('social', 'tiktok', e.target.value)} /></Field>
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

      <button onClick={save} className="btn-jaune" style={{ marginTop: 20 }}>{saved ? '✓ Enregistré' : 'Enregistrer les infos'}</button>
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
// Champ image avec aperçu en direct : la preview se rafraîchit à chaque
// modification de l'URL, et signale une image introuvable (onError).
function ImageField({ value, onChange }) {
  const [err, setErr] = useState(false)
  useEffect(() => { setErr(false) }, [value])
  const url = (value || '').trim()
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={lbl}>Image (URL) — aperçu en direct</label>
      <input className="form-input" value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder="https://…" style={inputStyle} />
      <div style={{ marginTop: 8, height: 150, width: '100%', background: '#0a0a0a', border: '1px solid #1c1c1c', borderRadius: 4, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {url && !err ? (
          <img src={url} alt="Aperçu" onError={() => setErr(true)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ color: err ? '#f87171' : '#555', fontSize: '0.72rem', textAlign: 'center', padding: 12 }}>
            {err ? "⚠ Image introuvable — vérifiez l'URL" : url ? 'Chargement…' : "L'aperçu apparaîtra ici"}
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
  if (!decoded) return { redirect: { destination: '/login-admin', permanent: false } }
  return { props: { adminEmail: decoded.email || '' } }
}
