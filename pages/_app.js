import '@/styles/globals.css'
import { useRouter } from 'next/router'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Toast from '@/components/Toast'
import { ConfigProvider } from '@/context/ConfigContext'

// Pages sans header/footer public (admin).
const SHELL_LESS = ['/login-admin', '/dashboard']

export default function App({ Component, pageProps }) {
  const router = useRouter()
  const bare = SHELL_LESS.includes(router.pathname)
  const isHome = router.pathname === '/'

  if (bare) {
    return (
      <ConfigProvider>
        <Component {...pageProps} />
        <Toast />
      </ConfigProvider>
    )
  }

  return (
    <ConfigProvider>
      <Header />
      <main style={{ paddingTop: isHome ? 0 : 120 }}>
        <Component {...pageProps} />
      </main>
      <Footer />
      <Toast />
    </ConfigProvider>
  )
}
