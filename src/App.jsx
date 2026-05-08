import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Menu } from 'lucide-react'
import Sidebar from './components/Sidebar'
import Dashboard    from './pages/Dashboard'
import Anagrafica   from './pages/Anagrafica'
import Lavorazioni  from './pages/Lavorazioni'
import Trattamenti  from './pages/Trattamenti'
import { Spese, Entrate, Magazzino, Concimazioni, Produzione, Scadenzario } from './pages/AltrePages'

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-[#fafaf7]">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-verde-600 text-white shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-lg hover:bg-verde-500">
            <Menu size={20} />
          </button>
          <span className="text-lg">🍋</span>
          <span className="font-display font-semibold text-sm">Quaderno di Campagna</span>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
          <Routes>
            <Route path="/"             element={<Dashboard />}   />
            <Route path="/anagrafica"   element={<Anagrafica />}  />
            <Route path="/lavorazioni"  element={<Lavorazioni />} />
            <Route path="/trattamenti"  element={<Trattamenti />} />
            <Route path="/concimazioni" element={<Concimazioni />}/>
            <Route path="/magazzino"    element={<Magazzino />}   />
            <Route path="/spese"        element={<Spese />}       />
            <Route path="/entrate"      element={<Entrate />}     />
            <Route path="/produzione"   element={<Produzione />}  />
            <Route path="/scadenzario"  element={<Scadenzario />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
