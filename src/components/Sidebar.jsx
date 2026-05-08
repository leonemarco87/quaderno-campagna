import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Building2, Wrench, Leaf, Sprout,
  Package, TrendingDown, TrendingUp, Apple, CalendarClock,
  Settings, Info
} from 'lucide-react'

const links = [
  { to: '/',              icon: LayoutDashboard, label: 'Dashboard'       },
  { to: '/anagrafica',    icon: Building2,       label: 'Anagrafica'      },
  { to: '/lavorazioni',   icon: Wrench,          label: 'Lavorazioni'     },
  { to: '/trattamenti',   icon: Leaf,            label: 'Trattamenti'     },
  { to: '/concimazioni',  icon: Sprout,          label: 'Concimazioni'    },
  { to: '/magazzino',     icon: Package,         label: 'Magazzino'       },
  { to: '/spese',         icon: TrendingDown,    label: 'Spese'           },
  { to: '/entrate',       icon: TrendingUp,      label: 'Entrate'         },
  { to: '/produzione',    icon: Apple,           label: 'Produzione'      },
  { to: '/scadenzario',   icon: CalendarClock,   label: 'Scadenzario'     },
  { to: '/impostazioni',  icon: Settings,        label: 'Impostazioni'    },
]

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={onClose} />
      )}
      <aside className={`
        fixed top-0 left-0 h-full w-60 z-30 flex flex-col
        bg-verde-600 shadow-2xl transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:shadow-none
      `}>
        <div className="px-5 py-6 border-b border-verde-500">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🍋</span>
            <div>
              <p className="text-white font-display font-bold text-base leading-tight">Quaderno</p>
              <p className="text-verde-200 text-xs">di Campagna</p>
            </div>
          </div>
          <p className="mt-2 text-verde-300 text-[10px] font-mono uppercase tracking-widest">
            Limone di Rocca Imperiale IGP
          </p>
        </div>
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={to === '/'} onClick={onClose}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Icon size={17} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-verde-500">
          <div className="flex items-center gap-2 text-verde-300 text-xs">
            <Info size={13} />
            <span>v2.0 — Anno {new Date().getFullYear()}</span>
          </div>
        </div>
      </aside>
    </>
  )
}
