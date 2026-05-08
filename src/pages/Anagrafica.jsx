import { useEffect, useState } from 'react'
import { db } from '../lib/supabase'
import { Save } from 'lucide-react'
import PageHeader from '../components/PageHeader'

const fields = [
  { k:'nome_azienda',        label:'Nome Azienda',              col:2 },
  { k:'proprietario',        label:'Proprietario / Conduttore', col:1 },
  { k:'piva',                label:'P.IVA / Codice Fiscale',    col:1 },
  { k:'cuaa',                label:'CUAA',                      col:1 },
  { k:'indirizzo',           label:'Indirizzo',                 col:1 },
  { k:'comune',              label:'Comune',                    col:1 },
  { k:'provincia',           label:'Provincia',                 col:1 },
  { k:'telefono',            label:'Telefono',                  col:1 },
  { k:'email',               label:'Email',                     col:1 },
  { k:'superficie_totale',   label:'Superficie totale (ha)',     col:1, type:'number' },
  { k:'superficie_agrumeto', label:'Superficie agrumeto (ha)',   col:1, type:'number' },
  { k:'num_piante',          label:'Numero piante',              col:1, type:'number' },
  { k:'varieta',             label:'Varietà',                   col:2 },
  { k:'sistema_irrigazione', label:'Sistema di irrigazione',    col:2 },
  { k:'certificazioni',      label:'Certificazioni',            col:2 },
  { k:'note',                label:'Note generali',             col:2, area:true },
]

const empty = fields.reduce((o,f)=>({...o,[f.k]:''}),{})

export default function Anagrafica() {
  const [form, setForm]     = useState({ ...empty, comune:'Rocca Imperiale', provincia:'CS', varieta:'Limone di Rocca Imperiale IGP', certificazioni:'IGP' })
  const [id, setId]         = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)

  useEffect(() => {
    db.getAll('anagrafica', { limit: 1 }).then(rows => {
      if (rows.length > 0) { setForm(rows[0]); setId(rows[0].id) }
    })
  }, [])

  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  const save = async () => {
    setSaving(true)
    try {
      if (id) await db.update('anagrafica', id, form)
      else {
        const r = await db.insert('anagrafica', form)
        setId(r.id)
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch(e) { alert(e.message) }
    finally { setSaving(false) }
  }

  return (
    <div className="fade-in space-y-5">
      <PageHeader icon="🏢" title="Anagrafica Azienda"
        subtitle="Dati identificativi dell'azienda agricola"
        actions={
          <button className="btn-primary" onClick={save} disabled={saving}>
            <Save size={16}/>{saving ? 'Salvataggio…' : saved ? '✅ Salvato!' : 'Salva'}
          </button>
        }
      />

      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map(f => (
            <div key={f.k} className={f.col === 2 ? 'md:col-span-2' : ''}>
              <label className="label">{f.label}</label>
              {f.area
                ? <textarea className="input" rows={3} value={form[f.k]||''} onChange={e=>set(f.k,e.target.value)}/>
                : <input className="input" type={f.type||'text'} value={form[f.k]||''} onChange={e=>set(f.k,e.target.value)}/>
              }
            </div>
          ))}
        </div>
      </div>

      <div className="card bg-limone-100 border-limone-200">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🍋</span>
          <div>
            <p className="font-display font-semibold text-verde-700 text-lg">
              {form.nome_azienda || 'La tua azienda'}
            </p>
            <p className="text-sm text-gray-500">
              {form.comune}{form.provincia ? ` (${form.provincia})` : ''} — {form.varieta}
            </p>
            {form.num_piante && (
              <p className="text-xs text-gray-400 mt-0.5">
                {form.num_piante} piante · {form.superficie_agrumeto} ha di agrumeto
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
