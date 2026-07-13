import { useState, Component, lazy, Suspense } from 'react'
import { ClientsProvider } from './contexts/ClientsContext'

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null } }
  static getDerivedStateFromError(e) { return { error: e } }
  render() {
    if (this.state.error) return (
      <div style={{ padding: 24, color: '#f87171', fontFamily: 'monospace', fontSize: 13 }}>
        <b>Erro:</b> {this.state.error.message}
        <pre style={{ marginTop: 8, fontSize: 11, whiteSpace: 'pre-wrap' }}>{this.state.error.stack}</pre>
      </div>
    )
    return this.props.children
  }
}
import Sidebar from './components/layout/Sidebar'
import Header from './components/layout/Header'
import Toast from './components/Toast'
import Login from './pages/Login'

const Dashboard       = lazy(() => import('./pages/Dashboard'))
const Clients         = lazy(() => import('./pages/Clients'))
const Reports         = lazy(() => import('./pages/Reports'))
const Uploader        = lazy(() => import('./pages/Uploader'))
const Sheets          = lazy(() => import('./pages/Sheets'))
const Settings        = lazy(() => import('./pages/Settings'))
const FeedbackPublic  = lazy(() => import('./pages/FeedbackPublic'))
const GmbForm         = lazy(() => import('./pages/GmbForm'))
const FeedbackDashboard = lazy(() => import('./pages/FeedbackDashboard'))
const Cadencia          = lazy(() => import('./pages/Cadencia'))

const PAGES = { dashboard: Dashboard, clients: Clients, reports: Reports, uploader: Uploader, sheets: Sheets, feedback: FeedbackDashboard, cadencia: Cadencia, settings: Settings }

const PageLoader = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(245,245,245,.3)', fontSize: 13 }}>
    Carregando…
  </div>
)

function getStoredUser() {
  try { return JSON.parse(localStorage.getItem('raiz_user')) } catch { return null }
}

export default function App() {
  const [user, setUser]         = useState(getStoredUser)
  const [page, setPage]         = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleLogin = (u) => setUser(u)

  const handleLogout = () => {
    localStorage.removeItem('raiz_token')
    localStorage.removeItem('raiz_user')
    setUser(null)
  }

  // Formulário público — acessível sem login via ?c={slug}
  const urlParams = new URLSearchParams(window.location.search)
  const feedbackSlug = urlParams.get('c')
  const isGmb = window.location.pathname === '/gmb'

  if (isGmb) {
    return (
      <ErrorBoundary>
        <Suspense fallback={<div style={{ minHeight: '100vh', background: '#1d2b27' }} />}>
          <GmbForm slug={urlParams.get('c')} />
        </Suspense>
        <Toast />
      </ErrorBoundary>
    )
  }

  if (feedbackSlug) {
    return (
      <>
        <Suspense fallback={<div style={{ minHeight: '100vh', background: '#1d2b27' }} />}>
          <FeedbackPublic slug={feedbackSlug} />
        </Suspense>
        <Toast />
      </>
    )
  }

  if (!user) {
    return (
      <>
        <Login onLogin={handleLogin} />
        <Toast />
      </>
    )
  }

  const PageComponent = PAGES[page]

  return (
    <ClientsProvider>
      <div style={{ display: 'flex', width: '100%', height: '100vh', overflow: 'hidden', background: '#162d26' }}>
        <Sidebar current={page} onNavigate={setPage} open={sidebarOpen} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          <Header page={page} onToggleSidebar={() => setSidebarOpen(o => !o)} user={user} onLogout={handleLogout} />
          <main style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
            <Suspense fallback={<PageLoader />}>
              <PageComponent />
            </Suspense>
          </main>
        </div>
        <Toast />
      </div>
    </ClientsProvider>
  )
}
