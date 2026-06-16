import { createContext, useContext, useEffect, useState } from 'react'

// Fournit la config du site (Firestore) côté client, avec mise en cache.
// Utilisé par les composants globaux (Footer). Les valeurs SSR critiques
// (hero, contact) passent par getServerSideProps pour le référencement.
const ConfigContext = createContext(null)

export function ConfigProvider({ children }) {
  const [config, setConfig] = useState(null)
  useEffect(() => {
    fetch('/api/public/site-config')
      .then((r) => r.json())
      .then(setConfig)
      .catch(() => {})
  }, [])
  return <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>
}

export function useConfig() {
  return useContext(ConfigContext)
}
