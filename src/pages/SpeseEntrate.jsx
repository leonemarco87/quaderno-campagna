// ─── SPESE ──────────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react'
import { db } from '../lib/supabase'
import { Plus } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import { format } from 'date-fns'

const CATEGORIE_SPESE = ['Concimi','Fitofarmaci','Carburante','Attrezzature','Manutenzione',
  'Manodopera','Acqua/Irrigazione','Energia elettrica','Tasse/Contributi','Assicurazioni','Packaging','Trasporti','Altro']
const PAGAMENTI = ['Bonifico','Contanti','Assegno','Carta di credito','RID','Altro']

const emptySpesa = { data:'', categoria:'', descrizione:'', fornitore:'',
  metodo_pagamento:'', numero_fattura:'', fattura:false, iva_pct:22, imponibile:'', totale:'', note:'' }

export function Spese() {
  const [rows, setRows]   = useState([])
  const [loading, setL]   = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm]   = useState(emptySpesa)
  const [saving, setSaving] = useState(false)

  const load = () => { setL(true); db.getAll('spese',{order:'data',asc:false}).then(setRows).finally(()=>setL(false)) }
  useEffect(load, [])

  const set = (k,v) => setForm(f => {
    const next = {...f, [k]:v}
    if (k==='imponibile'||k==='iva_pct') {
      const imp = parseFloat(k==='imponibile'?v:f.imponibile)||0
      const iva = parseFloat(k==='iva_pct'?v:f.iva_pct)||0
      next.totale = (imp*(1+iva/100)).toFixed(2)
    }
    return next
  })

  const save = async () => {
    if (!form.data) return alert('La data è obbligatoria')
    setSaving(true)
    try {
      if (form.id) await db.update('spese',form.id,form)
      else         await db.insert('spese',form)
      setModal(false); load()
    } catch(e){alert(e.message)} finally{setSaving(false)}
  }

  const remove = async (id) => { if(!confirm('Eliminare?'))return; await db.remove('spese',id); load() }

  const cols = [
    { key:'data',       label:'Data',      width:100, render:v=>v?format(new Date(v),'dd/MM/yyyy'):'—' },
    { key:'categoria',  label:'Categoria' },
    { key:'descrizione',label:'Descrizione' },
    { key:'fornitore',  label:'Fornitore' },
    { key:'fattura',    label:'Fattura', width:80, render:v=><span className={v?'badge-green':'badge-gray'}>{v?'Sì':'No'}</span> },
    { key:'totale',     label:'Totale (€)', width:110, render:v=>v?`€ ${parseFloat(v).toFixed(2)}`:'—' },
  ]

  const tot = rows.reduce((a,r)=>a+(parseFloat(r.totale)||0),0)

  return (
    <div className="fade-in space-y-5">
      <PageHeader icon="💸" title="Spese Aziendali" subtitle="Registro di tutte le uscite"
        actions={<button className="btn-primary" onClick={()=>{setForm(emptySpesa);setModal(true)}}><Plus size={16}/>Nuova spesa</button>}
      />
      <div className="card bg-red-50 border-0 text-center">
        <p className="text-xs text-gray-500 uppercase tracking-wide">Totale spese anno</p>
        <p className="text-3xl font-bold font-mono text-red-700">€ {tot.toLocaleString('it-IT',{minimumFractionDigits:2})}</p>
      </div>
      <div className="card p-0 overflow-hidden">
        <DataTable columns={cols} data={rows} loading={loading} onEdit={r=>{setForm(r);setModal(true)}} onDelete={remove} emptyMessage="Nessuna spesa registrata"/>
      </div>
      {modal && (
        <Modal title={form.id?'Modifica Spesa':'Nuova Spesa'} onClose={()=>setModal(false)} wide>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Data *</label><input className="input" type="date" value={form.data} onChange={e=>set('data',e.target.value)}/></div>
            <div><label className="label">Categoria</label>
              <select className="input" value={form.categoria} onChange={e=>set('categoria',e.target.value)}>
                <option value="">— Seleziona —</option>{CATEGORIE_SPESE.map(c=><option key={c}>{c}</option>)}
              </select></div>
            <div className="col-span-2"><label className="label">Descrizione</label><input className="input" value={form.descrizione} onChange={e=>set('descrizione',e.target.value)}/></div>
            <div><label className="label">Fornitore</label><input className="input" value={form.fornitore} onChange={e=>set('fornitore',e.target.value)}/></div>
            <div><label className="label">Metodo pagamento</label>
              <select className="input" value={form.metodo_pagamento} onChange={e=>set('metodo_pagamento',e.target.value)}>
                <option value="">— Seleziona —</option>{PAGAMENTI.map(p=><option key={p}>{p}</option>)}
              </select></div>
            <div><label className="label">N° Fattura</label><input className="input" value={form.numero_fattura} onChange={e=>set('numero_fattura',e.target.value)}/></div>
            <div><label className="label">Fattura ricevuta</label>
              <select className="input" value={form.fattura} onChange={e=>set('fattura',e.target.value==='true')}>
                <option value="false">No</option><option value="true">Sì</option>
              </select></div>
            <div><label className="label">IVA %</label>
              <select className="input" value={form.iva_pct} onChange={e=>set('iva_pct',e.target.value)}>
                <option value="4">4%</option><option value="10">10%</option><option value="22">22%</option>
              </select></div>
            <div><label className="label">Imponibile (€)</label><input className="input" type="number" step="0.01" value={form.imponibile} onChange={e=>set('imponibile',e.target.value)}/></div>
            <div><label className="label">Totale con IVA (€)</label><input className="input" type="number" step="0.01" value={form.totale} onChange={e=>set('totale',e.target.value)}/></div>
            <div className="col-span-2"><label className="label">Note</label><textarea className="input" rows={2} value={form.note} onChange={e=>set('note',e.target.value)}/></div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button className="btn-secondary" onClick={()=>setModal(false)}>Annulla</button>
            <button className="btn-primary" onClick={save} disabled={saving}>{saving?'Salvataggio…':'Salva'}</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ─── ENTRATE ────────────────────────────────────────────────────────────────
const DESTINAZIONI = ['Mercato locale','Grande distribuzione','Ristoratori','Privati','Export','Cooperativa','Altro']
const emptyEntrata = { data:'', cliente:'', quantita_kg:'', prezzo_al_kg:'', destinazione:'', fatturato:false, totale:'', metodo_pagamento:'', note:'' }

export function Entrate() {
  const [rows, setRows]   = useState([])
  const [loading, setL]   = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm]   = useState(emptyEntrata)
  const [saving, setSaving] = useState(false)

  const load = () => { setL(true); db.getAll('entrate',{order:'data',asc:false}).then(setRows).finally(()=>setL(false)) }
  useEffect(load, [])

  const set = (k,v) => setForm(f => {
    const next = {...f,[k]:v}
    if(k==='quantita_kg'||k==='prezzo_al_kg'){
      const kg  = parseFloat(k==='quantita_kg'?v:f.quantita_kg)||0
      const prc = parseFloat(k==='prezzo_al_kg'?v:f.prezzo_al_kg)||0
      next.totale = (kg*prc).toFixed(2)
    }
    return next
  })

  const save = async () => {
    if(!form.data) return alert('La data è obbligatoria')
    setSaving(true)
    try {
      if(form.id) await db.update('entrate',form.id,form)
      else        await db.insert('entrate',form)
      setModal(false); load()
    } catch(e){alert(e.message)} finally{setSaving(false)}
  }

  const remove = async (id) => { if(!confirm('Eliminare?'))return; await db.remove('entrate',id); load() }

  const cols = [
    { key:'data',        label:'Data',      width:100, render:v=>v?format(new Date(v),'dd/MM/yyyy'):'—' },
    { key:'cliente',     label:'Cliente' },
    { key:'quantita_kg', label:'Q.tà (kg)', width:90 },
    { key:'prezzo_al_kg',label:'€/kg',      width:80, render:v=>v?`€ ${parseFloat(v).toFixed(2)}`:'—' },
    { key:'destinazione',label:'Destinazione' },
    { key:'fatturato',   label:'Fatturato', width:90, render:v=><span className={v?'badge-green':'badge-gray'}>{v?'Sì':'No'}</span> },
    { key:'totale',      label:'Totale (€)',width:110, render:v=>v?`€ ${parseFloat(v).toFixed(2)}`:'—' },
  ]

  const tot = rows.reduce((a,r)=>a+(parseFloat(r.totale)||0),0)
  const totKg = rows.reduce((a,r)=>a+(parseFloat(r.quantita_kg)||0),0)

  return (
    <div className="fade-in space-y-5">
      <PageHeader icon="🌾" title="Entrate e Vendite" subtitle="Registro di tutte le vendite"
        actions={<button className="btn-primary" onClick={()=>{setForm(emptyEntrata);setModal(true)}}><Plus size={16}/>Nuova vendita</button>}
      />
      <div className="grid grid-cols-2 gap-3">
        <div className="card bg-verde-50 border-0 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Totale entrate</p>
          <p className="text-3xl font-bold font-mono text-verde-700">€ {tot.toLocaleString('it-IT',{minimumFractionDigits:2})}</p>
        </div>
        <div className="card bg-limone-100 border-0 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Kg venduti</p>
          <p className="text-3xl font-bold font-mono text-limone-600">{totKg.toLocaleString('it-IT')} kg</p>
        </div>
      </div>
      <div className="card p-0 overflow-hidden">
        <DataTable columns={cols} data={rows} loading={loading} onEdit={r=>{setForm(r);setModal(true)}} onDelete={remove} emptyMessage="Nessuna vendita registrata"/>
      </div>
      {modal && (
        <Modal title={form.id?'Modifica Vendita':'Nuova Vendita'} onClose={()=>setModal(false)} wide>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Data *</label><input className="input" type="date" value={form.data} onChange={e=>set('data',e.target.value)}/></div>
            <div><label className="label">Cliente</label><input className="input" value={form.cliente} onChange={e=>set('cliente',e.target.value)}/></div>
            <div><label className="label">Quantità (kg)</label><input className="input" type="number" step="0.1" value={form.quantita_kg} onChange={e=>set('quantita_kg',e.target.value)}/></div>
            <div><label className="label">Prezzo al kg (€)</label><input className="input" type="number" step="0.01" value={form.prezzo_al_kg} onChange={e=>set('prezzo_al_kg',e.target.value)}/></div>
            <div><label className="label">Destinazione</label>
              <select className="input" value={form.destinazione} onChange={e=>set('destinazione',e.target.value)}>
                <option value="">— Seleziona —</option>{DESTINAZIONI.map(d=><option key={d}>{d}</option>)}
              </select></div>
            <div><label className="label">Totale (€)</label><input className="input" type="number" step="0.01" value={form.totale} onChange={e=>set('totale',e.target.value)}/></div>
            <div><label className="label">Fatturato</label>
              <select className="input" value={form.fatturato} onChange={e=>set('fatturato',e.target.value==='true')}>
                <option value="false">No</option><option value="true">Sì</option>
              </select></div>
            <div><label className="label">Metodo pagamento</label>
              <select className="input" value={form.metodo_pagamento} onChange={e=>set('metodo_pagamento',e.target.value)}>
                <option value="">— Seleziona —</option>{PAGAMENTI.map(p=><option key={p}>{p}</option>)}
              </select></div>
            <div className="col-span-2"><label className="label">Note</label><textarea className="input" rows={2} value={form.note} onChange={e=>set('note',e.target.value)}/></div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button className="btn-secondary" onClick={()=>setModal(false)}>Annulla</button>
            <button className="btn-primary" onClick={save} disabled={saving}>{saving?'Salvataggio…':'Salva'}</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
