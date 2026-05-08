import { useEffect, useState } from 'react'
import { db } from '../lib/supabase'
import { Plus } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import ExportBar from '../components/ExportBar'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import { format } from 'date-fns'

const TIPI = ['Potatura','Irrigazione','Sfalcio erba','Trinciatura','Raccolta',
              'Sistemazione terreno','Manutenzione attrezzature','Concimazione',
              'Rippatura','Estirpatore','Fresatura','Aratura','Altro']

const empty = { data:'', appezzamento:'', tipo_lavorazione:'', operatore:'',
                mezzo:'', ore_lavorate:'', carburante_litri:'', costo:'', note:'' }

export default function Lavorazioni() {
  const [rows, setRows]     = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]   = useState(false)
  const [form, setForm]     = useState(empty)
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    db.getAll('lavorazioni', { order: 'data', asc: false })
      .then(setRows).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const openNew  = () => { setForm(empty); setModal(true) }
  const openEdit = (row) => { setForm(row); setModal(true) }

  const save = async () => {
    if (!form.data) return alert('La data è obbligatoria')
    setSaving(true)
    try {
      if (form.id) await db.update('lavorazioni', form.id, form)
      else         await db.insert('lavorazioni', form)
      setModal(false); load()
    } catch(e) { alert(e.message) }
    finally { setSaving(false) }
  }

  const remove = async (id) => {
    if (!confirm('Eliminare questa lavorazione?')) return
    await db.remove('lavorazioni', id); load()
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const columns = [
    { key: 'data',            label: 'Data',         width: 100,
      render: v => v ? format(new Date(v), 'dd/MM/yyyy') : '—' },
    { key: 'appezzamento',    label: 'Appezzamento'  },
    { key: 'tipo_lavorazione',label: 'Tipo'          },
    { key: 'operatore',       label: 'Operatore'     },
    { key: 'mezzo',           label: 'Mezzo'         },
    { key: 'ore_lavorate',    label: 'Ore',   width: 70 },
    { key: 'costo',           label: 'Costo (€)', width: 100,
      render: v => v ? `€ ${parseFloat(v).toFixed(2)}` : '—' },
  ]

  const totOre  = rows.reduce((a,r) => a + (parseFloat(r.ore_lavorate)||0), 0)
  const totCost = rows.reduce((a,r) => a + (parseFloat(r.costo)||0), 0)

  return (
    <div className="fade-in space-y-5">
      <PageHeader icon="⚙️" title="Registro Lavorazioni"
        subtitle="Tutte le operazioni colturali effettuate nell'agrumeto"
        actions={<><ExportBar data={rows} columns={columns} title="Registro Lavorazioni" filename="lavorazioni" /><button className="btn-primary" onClick={openNew}><Plus size={16}/>Nuova lavorazione</button></>}
      />

      {/* Totali */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card bg-verde-50 border-0 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Ore totali</p>
          <p className="text-2xl font-bold font-mono text-verde-700">{totOre.toFixed(1)} h</p>
        </div>
        <div className="card bg-red-50 border-0 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Costo totale</p>
          <p className="text-2xl font-bold font-mono text-red-700">€ {totCost.toFixed(2)}</p>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <DataTable columns={columns} data={rows} loading={loading}
          onEdit={openEdit} onDelete={remove}
          emptyMessage="Nessuna lavorazione registrata — clicca + per aggiungerne una"
        />
      </div>

      {modal && (
        <Modal title={form.id ? 'Modifica Lavorazione' : 'Nuova Lavorazione'} onClose={() => setModal(false)}>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Data *</label>
              <input className="input" type="date" value={form.data} onChange={e=>set('data',e.target.value)}/></div>
            <div><label className="label">Appezzamento</label>
              <input className="input" value={form.appezzamento} onChange={e=>set('appezzamento',e.target.value)}/></div>
            <div><label className="label">Tipo lavorazione</label>
              <select className="input" value={form.tipo_lavorazione} onChange={e=>set('tipo_lavorazione',e.target.value)}>
                <option value="">— Seleziona —</option>
                {TIPI.map(t=><option key={t}>{t}</option>)}
              </select></div>
            <div><label className="label">Operatore</label>
              <input className="input" value={form.operatore} onChange={e=>set('operatore',e.target.value)}/></div>
            <div><label className="label">Mezzo/Attrezzo</label>
              <input className="input" value={form.mezzo} onChange={e=>set('mezzo',e.target.value)}/></div>
            <div><label className="label">Ore lavorate</label>
              <input className="input" type="number" step="0.5" value={form.ore_lavorate} onChange={e=>set('ore_lavorate',e.target.value)}/></div>
            <div><label className="label">Carburante (L)</label>
              <input className="input" type="number" step="0.1" value={form.carburante_litri} onChange={e=>set('carburante_litri',e.target.value)}/></div>
            <div><label className="label">Costo (€)</label>
              <input className="input" type="number" step="0.01" value={form.costo} onChange={e=>set('costo',e.target.value)}/></div>
            <div className="col-span-2"><label className="label">Note</label>
              <textarea className="input" rows={2} value={form.note} onChange={e=>set('note',e.target.value)}/></div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button className="btn-secondary" onClick={()=>setModal(false)}>Annulla</button>
            <button className="btn-primary" onClick={save} disabled={saving}>
              {saving ? 'Salvataggio…' : 'Salva'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
