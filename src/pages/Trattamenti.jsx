import { useEffect, useState } from 'react'
import { db } from '../lib/supabase'
import { Plus, AlertTriangle } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import { format } from 'date-fns'

const MOTIVAZIONI = ['Crittogame','Insetti','Cocciniglie','Afidi','Mosca dei frutti',
                     'Alternaria','Muffa grigia','Preventivo','Carenza nutrizionale','Altro']
const METEO = ['Soleggiato','Nuvoloso','Vento debole','Assenza vento','Umidità alta','Temperatura ottimale']

const empty = { data:'', coltura:'Limone', prodotto:'', principio_attivo:'', dose:'',
                acqua_litri_ha:'', motivazione:'', operatore:'', carenza_giorni:'',
                meteo:'', lotto_prodotto:'', fornitore:'', costo:'', note:'' }

export default function Trattamenti() {
  const [rows, setRows]     = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]   = useState(false)
  const [form, setForm]     = useState(empty)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  const load = () => {
    setLoading(true)
    db.getAll('trattamenti', { order: 'data', asc: false })
      .then(setRows).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const validate = () => {
    const e = {}
    if (!form.data)            e.data = 'Obbligatorio'
    if (!form.prodotto)        e.prodotto = 'Obbligatorio'
    if (!form.principio_attivo) e.principio_attivo = 'Obbligatorio'
    if (!form.motivazione)     e.motivazione = 'Obbligatorio'
    if (!form.operatore)       e.operatore = 'Obbligatorio'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const openNew  = () => { setForm(empty); setErrors({}); setModal(true) }
  const openEdit = (row) => { setForm(row); setErrors({}); setModal(true) }

  const save = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      if (form.id) await db.update('trattamenti', form.id, form)
      else         await db.insert('trattamenti', form)
      setModal(false); load()
    } catch(e) { alert(e.message) }
    finally { setSaving(false) }
  }

  const remove = async (id) => {
    if (!confirm('Eliminare questo trattamento?')) return
    await db.remove('trattamenti', id); load()
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const columns = [
    { key: 'data',            label: 'Data', width: 100,
      render: v => v ? format(new Date(v), 'dd/MM/yyyy') : '—' },
    { key: 'prodotto',        label: 'Prodotto' },
    { key: 'principio_attivo',label: 'Principio Attivo' },
    { key: 'motivazione',     label: 'Motivazione' },
    { key: 'operatore',       label: 'Operatore' },
    { key: 'carenza_giorni',  label: 'Carenza', width: 80,
      render: v => v ? `${v} gg` : '—' },
    { key: 'costo',           label: 'Costo', width: 90,
      render: v => v ? `€ ${parseFloat(v).toFixed(2)}` : '—' },
  ]

  const totCost = rows.reduce((a,r) => a + (parseFloat(r.costo)||0), 0)

  const F = ({ k, label, type='text', options, required }) => (
    <div>
      <label className="label">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>
      {options
        ? <select className={`input ${errors[k] ? 'border-red-400' : ''}`} value={form[k]} onChange={e=>set(k,e.target.value)}>
            <option value="">— Seleziona —</option>
            {options.map(o=><option key={o}>{o}</option>)}
          </select>
        : <input className={`input ${errors[k] ? 'border-red-400' : ''}`} type={type}
            value={form[k]} onChange={e=>set(k,e.target.value)}/>
      }
      {errors[k] && <p className="text-red-500 text-xs mt-0.5">{errors[k]}</p>}
    </div>
  )

  return (
    <div className="fade-in space-y-5">
      <PageHeader icon="🌿" title="Registro Trattamenti Fitosanitari"
        subtitle="Registro obbligatorio per legge — campi * obbligatori"
        actions={<button className="btn-primary" onClick={openNew}><Plus size={16}/>Nuovo trattamento</button>}
      />

      <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-sm text-amber-800">
        <AlertTriangle size={15}/> Registro obbligatorio per legge — conservare per almeno 3 anni
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="card bg-verde-50 border-0 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Trattamenti totali</p>
          <p className="text-2xl font-bold font-mono text-verde-700">{rows.length}</p>
        </div>
        <div className="card bg-red-50 border-0 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Costo totale</p>
          <p className="text-2xl font-bold font-mono text-red-700">€ {totCost.toFixed(2)}</p>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <DataTable columns={columns} data={rows} loading={loading}
          onEdit={openEdit} onDelete={remove}
          emptyMessage="Nessun trattamento registrato"
        />
      </div>

      {modal && (
        <Modal title={form.id ? 'Modifica Trattamento' : 'Nuovo Trattamento'} onClose={()=>setModal(false)} wide>
          <div className="grid grid-cols-2 gap-3">
            <F k="data"            label="Data"             type="date"    required />
            <F k="coltura"         label="Coltura" />
            <F k="prodotto"        label="Prodotto"                        required />
            <F k="principio_attivo" label="Principio Attivo"              required />
            <F k="dose"            label="Dose (kg/L/ha)" />
            <F k="acqua_litri_ha"  label="Acqua (L/ha)"   type="number" />
            <F k="motivazione"     label="Motivazione"    options={MOTIVAZIONI} required />
            <F k="operatore"       label="Operatore"                      required />
            <F k="carenza_giorni"  label="Carenza (giorni)" type="number" />
            <F k="meteo"           label="Condizioni meteo" options={METEO} />
            <F k="lotto_prodotto"  label="Lotto prodotto" />
            <F k="fornitore"       label="Fornitore" />
            <F k="costo"           label="Costo (€)"      type="number" />
            <div className="col-span-2"><F k="note" label="Note" /></div>
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
