import { useEffect, useState } from 'react'
import { db } from '../lib/supabase'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { TrendingDown, TrendingUp, Leaf, Sprout, Clock, AlertTriangle, Download } from 'lucide-react'
import { exportFullExcel } from '../lib/export'
import { format, getMonth, getYear, parseISO } from 'date-fns'
import { it } from 'date-fns/locale'

const MONTHS = ['Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic']
const fmtEur = (v) => `€ ${Number(v || 0).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

function KpiCard({ icon: Icon, label, value, sub, color = 'verde', trend }) {
  const colors = {
    verde:  { bg: 'bg-verde-50',  icon: 'text-verde-600',  val: 'text-verde-700' },
    red:    { bg: 'bg-red-50',    icon: 'text-red-500',    val: 'text-red-700'   },
    yellow: { bg: 'bg-yellow-50', icon: 'text-yellow-600', val: 'text-yellow-700'},
    blue:   { bg: 'bg-blue-50',   icon: 'text-blue-600',   val: 'text-blue-700'  },
  }
  const c = colors[color]
  return (
    <div className={`kpi-card ${c.bg} border-0`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
        <Icon size={18} className={c.icon} />
      </div>
      <p className={`text-2xl font-bold font-mono ${c.val} mt-1`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}

export default function Dashboard() {
  const [spese,      setSpese]      = useState([])
  const [entrate,    setEntrate]    = useState([])
  const [trattamenti,setTrattamenti]= useState([])
  const [concimazioni,setConcimazioni]=useState([])
  const [lavorazioni,setLavorazioni]= useState([])
  const [scadenzario,setScadenzario]= useState([])
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    Promise.all([
      db.getAll('spese',       { order: 'data' }),
      db.getAll('entrate',     { order: 'data' }),
      db.getAll('trattamenti', { order: 'data' }),
      db.getAll('concimazioni',{ order: 'data' }),
      db.getAll('lavorazioni', { order: 'data' }),
      db.getAll('scadenzario', { order: 'scadenza', asc: true }),
    ]).then(([s, e, t, c, l, sc]) => {
      setSpese(s); setEntrate(e); setTrattamenti(t)
      setConcimazioni(c); setLavorazioni(l); setScadenzario(sc)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const totSpese   = spese.reduce((a, r) => a + (parseFloat(r.totale) || 0), 0)
  const totEntrate = entrate.reduce((a, r) => a + (parseFloat(r.totale) || 0), 0)
  const netto      = totEntrate - totSpese
  const oreL       = lavorazioni.reduce((a, r) => a + (parseFloat(r.ore_lavorate) || 0), 0)

  const now = new Date()
  const monthlyData = MONTHS.map((m, i) => ({
    name: m,
    Spese:   spese.filter(r => r.data && getMonth(parseISO(r.data)) === i && getYear(parseISO(r.data)) === getYear(now)).reduce((a, r) => a + (parseFloat(r.totale) || 0), 0),
    Entrate: entrate.filter(r => r.data && getMonth(parseISO(r.data)) === i && getYear(parseISO(r.data)) === getYear(now)).reduce((a, r) => a + (parseFloat(r.totale) || 0), 0),
  }))

  const scadenzeUrgenti = scadenzario.filter(s => {
    if (s.stato === 'Completato') return false
    const days = Math.ceil((new Date(s.scadenza) - now) / 86400000)
    return days <= 14
  })

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-verde-400">
      <div className="w-8 h-8 border-2 border-verde-200 border-t-verde-600 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="fade-in space-y-6">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-verde-600 px-6 py-5 text-white">
        <div className="relative z-10">
          <p className="text-verde-200 text-xs uppercase tracking-widest font-mono mb-1">
            Anno {getYear(now)}
          </p>
          <h1 className="font-display text-2xl font-bold">Benvenuto nel tuo Quaderno</h1>
          <p className="text-verde-200 text-sm mt-1">
            🍋 Limone di Rocca Imperiale IGP — Riepilogo automatico aggiornato
          </p>
        </div>
        <button
          data-no-print
          onClick={() => exportFullExcel([
            { name:'Spese',       data: spese,       columns: [{key:'data',label:'Data'},{key:'categoria',label:'Categoria'},{key:'descrizione',label:'Descrizione'},{key:'fornitore',label:'Fornitore'},{key:'totale',label:'Totale (€)'}] },
            { name:'Entrate',     data: entrate,     columns: [{key:'data',label:'Data'},{key:'cliente',label:'Cliente'},{key:'quantita_kg',label:'Kg'},{key:'prezzo_al_kg',label:'€/kg'},{key:'totale',label:'Totale (€)'}] },
            { name:'Trattamenti', data: trattamenti, columns: [{key:'data',label:'Data'},{key:'prodotto',label:'Prodotto'},{key:'principio_attivo',label:'Principio Attivo'},{key:'motivazione',label:'Motivazione'},{key:'operatore',label:'Operatore'},{key:'costo',label:'Costo (€)'}] },
            { name:'Lavorazioni', data: lavorazioni, columns: [{key:'data',label:'Data'},{key:'appezzamento',label:'Appezzamento'},{key:'tipo_lavorazione',label:'Tipo'},{key:'operatore',label:'Operatore'},{key:'ore_lavorate',label:'Ore'},{key:'costo',label:'Costo (€)'}] },
            { name:'Concimazioni',data: concimazioni,columns: [{key:'data',label:'Data'},{key:'tipo_concime',label:'Concime'},{key:'quantita',label:'Q.tà'},{key:'costo',label:'Costo (€)'}] },
          ])}
          className="absolute right-16 top-4 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/20 text-white hover:bg-white/30 transition-colors"
        >
          <Download size={14} /> Esporta tutto in Excel
        </button>
        <div className="absolute right-4 top-0 text-[80px] opacity-10 select-none">🍋</div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard icon={TrendingDown} label="Totale Spese"    value={fmtEur(totSpese)}   color="red"    />
        <KpiCard icon={TrendingUp}   label="Totale Entrate"  value={fmtEur(totEntrate)} color="verde"  />
        <KpiCard icon={netto >= 0 ? TrendingUp : TrendingDown}
                                     label="Guadagno Netto"  value={fmtEur(netto)}
                                     color={netto >= 0 ? 'verde' : 'red'} />
        <KpiCard icon={Leaf}         label="Trattamenti"     value={trattamenti.length} sub="registrati" color="yellow" />
        <KpiCard icon={Sprout}       label="Concimazioni"    value={concimazioni.length} sub="registrate" color="blue" />
        <KpiCard icon={Clock}        label="Ore Lavorate"    value={`${oreL.toFixed(0)} h`} color="verde" />
      </div>

      {/* Alert scadenze */}
      {scadenzeUrgenti.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-amber-600" />
            <p className="text-amber-800 font-semibold text-sm">
              {scadenzeUrgenti.length} scadenz{scadenzeUrgenti.length === 1 ? 'a urgente' : 'e urgenti'} nei prossimi 14 giorni
            </p>
          </div>
          <div className="space-y-1">
            {scadenzeUrgenti.slice(0, 3).map(s => {
              const days = Math.ceil((new Date(s.scadenza) - now) / 86400000)
              return (
                <div key={s.id} className="flex items-center gap-2 text-xs text-amber-700">
                  <span className={`w-1.5 h-1.5 rounded-full ${days < 0 ? 'bg-red-500' : days <= 3 ? 'bg-orange-500' : 'bg-amber-400'}`} />
                  <span className="font-medium">{s.descrizione}</span>
                  <span className="text-amber-500">
                    {days < 0 ? `scaduta ${Math.abs(days)} gg fa` : days === 0 ? 'oggi' : `tra ${days} gg`}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card">
          <h3 className="font-display text-verde-700 font-semibold mb-4">
            Andamento Mensile — Spese vs Entrate
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData} barSize={12}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `€${v}`} />
              <Tooltip formatter={(v) => fmtEur(v)} />
              <Legend />
              <Bar dataKey="Spese"   fill="#c62828" radius={[4,4,0,0]} />
              <Bar dataKey="Entrate" fill="#2e8b57" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="font-display text-verde-700 font-semibold mb-4">
            Tendenza Netto Mensile
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyData.map(d => ({ ...d, Netto: d.Entrate - d.Spese }))}>
              <defs>
                <linearGradient id="netto" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#2e8b57" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2e8b57" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `€${v}`} />
              <Tooltip formatter={(v) => fmtEur(v)} />
              <Area type="monotone" dataKey="Netto" stroke="#2e8b57" fill="url(#netto)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
