import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Menu, LogOut, User } from 'lucide-react'
import Sidebar from './components/Sidebar'
import Login   from './pages/Login'
import { auth } from './lib/auth'
import { ConfigProvider } from './hooks/useConfig'

import Dashboard    from './pages/Dashboard'
import Anagrafica   from './pages/Anagrafica'
import Lavorazioni  from './pages/Lavorazioni'
import Trattamenti  from './pages/Trattamenti'
import Impostazioni from './pages/Impostazioni'
import { Spese, Entrate, Magazzino, Concimazioni, Produzione, Scadenzario } from './pages/AltrePages'

export default function App() {
  const [user,        setUser]        = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    auth.getUser().then(u => { setUser(u); setAuthLoading(false) })
    const { data: { subscription } } = auth.onAuthChange(u => {
      setUser(u); setAuthLoading(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    if (!confirm('Vuoi uscire dal gestionale?')) return
    await auth.signOut()
    setUser(null)
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-verde-600">
        <div className="text-center">
          <div className="text-6xl mb-4">🍋</div>
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
          <p className="text-white/70 text-sm mt-3">Caricamento…</p>
        </div>
      </div>
    )
  }

  if (!user) return <Login onLogin={() => auth.getUser().then(setUser)} />

  return (
    <ConfigProvider>
      <div className="flex h-screen overflow-hidden bg-[#fafaf7]">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="flex items-center justify-between px-4 py-3 bg-verde-600 text-white shrink-0">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 rounded-lg hover:bg-verde-500">
                <Menu size={20} />
              </button>
              <span className="text-lg lg:hidden">🍋</span>
              <span className="font-display font-semibold text-sm lg:hidden">Quaderno di Campagna</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-verde-200 text-xs">
                <User size={14} />
                <span className="hidden sm:block">{user.user_metadata?.nome_completo || user.email}</span>
              </div>
              <button onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/20 transition-colors">
                <LogOut size={14} />
                <span className="hidden sm:block">Esci</span>
              </button>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
            <Routes>
              <Route path="/"              element={<Dashboard />}    />
              <Route path="/anagrafica"    element={<Anagrafica />}   />
              <Route path="/lavorazioni"   element={<Lavorazioni />}  />
              <Route path="/trattamenti"   element={<Trattamenti />}  />
              <Route path="/concimazioni"  element={<Concimazioni />} />
              <Route path="/magazzino"     element={<Magazzino />}    />
              <Route path="/spese"         element={<Spese />}        />
              <Route path="/entrate"       element={<Entrate />}      />
              <Route path="/produzione"    element={<Produzione />}   />
              <Route path="/scadenzario"   element={<Scadenzario />}  />
              <Route path="/impostazioni"  element={<Impostazioni />} />
              <Route path="*"              element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </div>
    </ConfigProvider>
  )
}
