import { useEffect, useState } from 'react'
import { db } from '../lib/supabase'
import { Plus, AlertTriangle } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import { format, differenceInDays } from 'date-fns'
import ExportBar from '../components/ExportBar'
import { useConfig } from '../hooks/useConfig'

const PAGAMENTI = ['Bonifico','Contanti','Assegno','Carta di credito','RID','Altro']

// ─── SPESE ──────────────────────────────────────────────────────────────────
const CATEGORIE_SPESE = ['Concimi','Fitofarmaci','Carburante','Attrezzature','Manutenzione',
  'Manodopera','Acqua/Irrigazione','Energia elettrica','Tasse/Contributi','Assicurazioni','Packaging','Trasporti','Altro']
const emptySpesa = { data:'', categoria:'', descrizione:'', fornitore:'',
  metodo_pagamento:'', numero_fattura:'', fattura:false, iva_pct:22, imponibile:'', totale:'', note:'' }

export function Spese() {
  const { getList } = useConfig()
  const CATEGORIE_SPESE_DYN = getList('categoria_spesa')
  const [rows, setRows]     = useState([])
  const [loading, setL]     = useState(true)
  const [modal, setModal]   = useState(false)
  const [form, setForm]     = useState(emptySpesa)
  const [saving, setSaving] = useState(false)
  const load = () => { setL(true); db.getAll('spese',{order:'data',asc:false}).then(setRows).finally(()=>setL(false)) }
  useEffect(load, [])
  const set = (k,v) => setForm(f => {
    const next = {...f,[k]:v}
    if(k==='imponibile'||k==='iva_pct') {
      const imp = parseFloat(k==='imponibile'?v:f.imponibile)||0
      const iva = parseFloat(k==='iva_pct'?v:f.iva_pct)||0
      next.totale = (imp*(1+iva/100)).toFixed(2)
    }
    return next
  })
  const save = async () => {
    if(!form.data) return alert('La data è obbligatoria')
    setSaving(true)
    try {
      if(form.id) await db.update('spese',form.id,form)
      else        await db.insert('spese',form)
      setModal(false); load()
    } catch(e){alert(e.message)} finally{setSaving(false)}
  }
  const remove = async (id) => { if(!confirm('Eliminare?'))return; await db.remove('spese',id); load() }
  const cols = [
    { key:'data',       label:'Data',      width:100, render:v=>v?format(new Date(v),'dd/MM/yyyy'):'—' },
    { key:'categoria',  label:'Categoria' },
    { key:'descrizione',label:'Descrizione' },
    { key:'fornitore',  label:'Fornitore' },
    { key:'fattura',    label:'Fattura',   width:80,  render:v=><span className={v?'badge-green':'badge-gray'}>{v?'Sì':'No'}</span> },
    { key:'totale',     label:'Totale (€)',width:110, render:v=>v?`€ ${parseFloat(v).toFixed(2)}`:'—' },
  ]
  const tot = rows.reduce((a,r)=>a+(parseFloat(r.totale)||0),0)
  return (
    <div className="fade-in space-y-5">
      <PageHeader icon="💸" title="Spese Aziendali" subtitle="Registro di tutte le uscite"
        actions={<><ExportBar data={rows} columns={cols} title="Spese Aziendali" filename="spese" /><button className="btn-primary" onClick={()=>{setForm(emptySpesa);setModal(true)}}><Plus size={16}/>Nuova spesa</button></>}
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
                <option value="">— Seleziona —</option>{(CATEGORIE_SPESE_DYN.length ? CATEGORIE_SPESE_DYN : CATEGORIE_SPESE).map(c=><option key={c}>{c}</option>)}
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
  const { getList: getListE } = useConfig()
  const DESTINAZIONI_DYN = getListE('destinazione_vendita')
  const [rows, setRows]     = useState([])
  const [loading, setL]     = useState(true)
  const [modal, setModal]   = useState(false)
  const [form, setForm]     = useState(emptyEntrata)
  const [saving, setSaving] = useState(false)
  const load = () => { setL(true); db.getAll('entrate',{order:'data',asc:false}).then(setRows).finally(()=>setL(false)) }
  useEffect(load, [])
  const set = (k,v) => setForm(f => {
    const next = {...f,[k]:v}
    if(k==='quantita_kg'||k==='prezzo_al_kg') {
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
    { key:'prezzo_al_kg',label:'€/kg',      width:80,  render:v=>v?`€ ${parseFloat(v).toFixed(2)}`:'—' },
    { key:'destinazione',label:'Destinazione' },
    { key:'fatturato',   label:'Fatturato', width:90,  render:v=><span className={v?'badge-green':'badge-gray'}>{v?'Sì':'No'}</span> },
    { key:'totale',      label:'Totale (€)',width:110, render:v=>v?`€ ${parseFloat(v).toFixed(2)}`:'—' },
  ]
  const tot   = rows.reduce((a,r)=>a+(parseFloat(r.totale)||0),0)
  const totKg = rows.reduce((a,r)=>a+(parseFloat(r.quantita_kg)||0),0)
  return (
    <div className="fade-in space-y-5">
      <PageHeader icon="🌾" title="Entrate e Vendite" subtitle="Registro di tutte le vendite"
        actions={<><ExportBar data={rows} columns={cols} title="Entrate e Vendite" filename="entrate" /><button className="btn-primary" onClick={()=>{setForm(emptyEntrata);setModal(true)}}><Plus size={16}/>Nuova vendita</button></>}
      />
      <div className="grid grid-cols-2 gap-3">
        <div className="card bg-verde-50 border-0 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Totale entrate</p>
          <p className="text-3xl font-bold font-mono text-verde-700">€ {tot.toLocaleString('it-IT',{minimumFractionDigits:2})}</p>
        </div>
        <div className="card bg-yellow-50 border-0 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Kg venduti</p>
          <p className="text-3xl font-bold font-mono text-yellow-600">{totKg.toLocaleString('it-IT')} kg</p>
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
                <option value="">— Seleziona —</option>{(DESTINAZIONI_DYN.length ? DESTINAZIONI_DYN : DESTINAZIONI).map(d=><option key={d}>{d}</option>)}
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

// ─── MAGAZZINO ──────────────────────────────────────────────────────────────
const CAT_MAG = ['Fitofarmaci','Concimi','Carburante','Attrezzature','Materiali','Irrigazione','Packaging','Altro']
const UNITA   = ['kg','L','pz','sacchi','flaconi','m','rotoli','Altro']
const emptyMag = { nome_prodotto:'', categoria:'', quantita_disponibile:'', unita:'', quantita_minima:'', prezzo_acquisto:'', fornitore:'', scadenza:'', lotto:'', note:'' }

export function Magazzino() {
  const [rows, setRows]     = useState([])
  const [loading, setL]     = useState(true)
  const [modal, setModal]   = useState(false)
  const [form, setForm]     = useState(emptyMag)
  const [saving, setSaving] = useState(false)
  const load = () => { setL(true); db.getAll('magazzino',{order:'nome_prodotto',asc:true}).then(setRows).finally(()=>setL(false)) }
  useEffect(load, [])
  const set = (k,v) => setForm(f=>({...f,[k]:v}))
  const save = async () => {
    if(!form.nome_prodotto) return alert('Il nome prodotto è obbligatorio')
    setSaving(true)
    try {
      if(form.id) await db.update('magazzino',form.id,form)
      else        await db.insert('magazzino',form)
      setModal(false); load()
    } catch(e){alert(e.message)} finally{setSaving(false)}
  }
  const remove = async (id) => { if(!confirm('Eliminare?'))return; await db.remove('magazzino',id); load() }
  const statoScorte = (row) => {
    const q = parseFloat(row.quantita_disponibile)||0
    const m = parseFloat(row.quantita_minima)||0
    if(q<=m) return <span className="badge-red">⚠️ Esaurito</span>
    if(q<=m*1.5) return <span className="badge-yellow">🟡 Scarso</span>
    return <span className="badge-green">✅ OK</span>
  }
  const statoScadenza = (row) => {
    if(!row.scadenza) return '—'
    const d = differenceInDays(new Date(row.scadenza), new Date())
    if(d<0)   return <span className="badge-red">🔴 Scaduto</span>
    if(d<=30) return <span className="badge-yellow">🟡 In scadenza</span>
    return <span className="badge-green">🟢 OK</span>
  }
  const cols = [
    { key:'nome_prodotto',        label:'Prodotto' },
    { key:'categoria',            label:'Categoria' },
    { key:'quantita_disponibile', label:'Q.tà', width:80 },
    { key:'unita',                label:'UM',   width:60 },
    { key:'quantita_minima',      label:'Min.', width:60 },
    { key:'id',    label:'Scorte',    width:110, render:(_,r)=>statoScorte(r) },
    { key:'scadenza', label:'Scadenza', width:100, render:v=>v?format(new Date(v),'dd/MM/yyyy'):'—' },
    { key:'fornitore', label:'Stato scad.', width:120, render:(_,r)=>statoScadenza(r) },
  ]
  const alerts = rows.filter(r=>(parseFloat(r.quantita_disponibile)||0)<=(parseFloat(r.quantita_minima)||0))
  return (
    <div className="fade-in space-y-5">
      <PageHeader icon="📦" title="Magazzino Prodotti" subtitle="Gestione scorte con avvisi automatici"
        actions={<><ExportBar data={rows} columns={cols} title="Magazzino Prodotti" filename="magazzino" /><button className="btn-primary" onClick={()=>{setForm(emptyMag);setModal(true)}}><Plus size={16}/>Nuovo prodotto</button></>}
      />
      {alerts.length>0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2 mb-1"><AlertTriangle size={15} className="text-red-500"/>
            <p className="text-red-700 font-semibold text-sm">{alerts.length} prodott{alerts.length===1?'o':'i'} in esaurimento</p>
          </div>
          {alerts.map(r=><p key={r.id} className="text-xs text-red-600 ml-5">• {r.nome_prodotto} — rimasti: {r.quantita_disponibile} {r.unita}</p>)}
        </div>
      )}
      <div className="card p-0 overflow-hidden">
        <DataTable columns={cols} data={rows} loading={loading} onEdit={r=>{setForm(r);setModal(true)}} onDelete={remove} emptyMessage="Magazzino vuoto"/>
      </div>
      {modal && (
        <Modal title={form.id?'Modifica Prodotto':'Nuovo Prodotto'} onClose={()=>setModal(false)} wide>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><label className="label">Nome prodotto *</label><input className="input" value={form.nome_prodotto} onChange={e=>set('nome_prodotto',e.target.value)}/></div>
            <div><label className="label">Categoria</label>
              <select className="input" value={form.categoria} onChange={e=>set('categoria',e.target.value)}>
                <option value="">— Seleziona —</option>{CAT_MAG.map(c=><option key={c}>{c}</option>)}
              </select></div>
            <div><label className="label">Unità</label>
              <select className="input" value={form.unita} onChange={e=>set('unita',e.target.value)}>
                <option value="">— Seleziona —</option>{UNITA.map(u=><option key={u}>{u}</option>)}
              </select></div>
            <div><label className="label">Q.tà disponibile</label><input className="input" type="number" step="0.1" value={form.quantita_disponibile} onChange={e=>set('quantita_disponibile',e.target.value)}/></div>
            <div><label className="label">Q.tà minima (alert)</label><input className="input" type="number" step="0.1" value={form.quantita_minima} onChange={e=>set('quantita_minima',e.target.value)}/></div>
            <div><label className="label">Prezzo acquisto (€)</label><input className="input" type="number" step="0.01" value={form.prezzo_acquisto} onChange={e=>set('prezzo_acquisto',e.target.value)}/></div>
            <div><label className="label">Fornitore</label><input className="input" value={form.fornitore} onChange={e=>set('fornitore',e.target.value)}/></div>
            <div><label className="label">Scadenza</label><input className="input" type="date" value={form.scadenza||''} onChange={e=>set('scadenza',e.target.value)}/></div>
            <div><label className="label">Lotto</label><input className="input" value={form.lotto} onChange={e=>set('lotto',e.target.value)}/></div>
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

// ─── CONCIMAZIONI ───────────────────────────────────────────────────────────
const TIPI_CONC = ['Nitrato ammonico','Urea','Solfato potassico','Perfosfato','Concime organico','Concime fogliare','Fertirrigazione','Compost','Altro']
const METODI    = ['Fertirrigazione','Spandimento manuale','Spargiconcime','Irrorazione fogliare','Interramento','Altro']
const emptyConc = { data:'', tipo_concime:'', quantita:'', unita:'kg', metodo_distribuzione:'', zona:'', operatore:'', npk:'', costo:'', note:'' }

export function Concimazioni() {
  const { getList: getListC } = useConfig()
  const TIPI_CONC_DYN = getListC('tipo_concime')
  const METODI_DYN    = getListC('metodo_distribuzione')
  const [rows, setRows]     = useState([])
  const [loading, setL]     = useState(true)
  const [modal, setModal]   = useState(false)
  const [form, setForm]     = useState(emptyConc)
  const [saving, setSaving] = useState(false)
  const load = () => { setL(true); db.getAll('concimazioni',{order:'data',asc:false}).then(setRows).finally(()=>setL(false)) }
  useEffect(load, [])
  const set = (k,v) => setForm(f=>({...f,[k]:v}))
  const save = async () => {
    if(!form.data) return alert('La data è obbligatoria')
    setSaving(true)
    try {
      if(form.id) await db.update('concimazioni',form.id,form)
      else        await db.insert('concimazioni',form)
      setModal(false); load()
    } catch(e){alert(e.message)} finally{setSaving(false)}
  }
  const remove = async (id) => { if(!confirm('Eliminare?'))return; await db.remove('concimazioni',id); load() }
  const cols = [
    { key:'data',                label:'Data',    width:100, render:v=>v?format(new Date(v),'dd/MM/yyyy'):'—' },
    { key:'tipo_concime',        label:'Concime' },
    { key:'quantita',            label:'Q.tà',   width:80 },
    { key:'unita',               label:'UM',      width:60 },
    { key:'metodo_distribuzione',label:'Metodo' },
    { key:'zona',                label:'Zona' },
    { key:'operatore',           label:'Operatore' },
    { key:'costo',               label:'Costo (€)', width:100, render:v=>v?`€ ${parseFloat(v).toFixed(2)}`:'—' },
  ]
  const tot = rows.reduce((a,r)=>a+(parseFloat(r.costo)||0),0)
  return (
    <div className="fade-in space-y-5">
      <PageHeader icon="🌱" title="Registro Concimazioni" subtitle="Piano di fertilizzazione dell'agrumeto"
        actions={<><ExportBar data={rows} columns={cols} title="Registro Concimazioni" filename="concimazioni" /><button className="btn-primary" onClick={()=>{setForm(emptyConc);setModal(true)}}><Plus size={16}/>Nuova concimazione</button></>}
      />
      <div className="grid grid-cols-2 gap-3">
        <div className="card bg-verde-50 border-0 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Totale concimazioni</p>
          <p className="text-2xl font-bold font-mono text-verde-700">{rows.length}</p>
        </div>
        <div className="card bg-red-50 border-0 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Costo totale</p>
          <p className="text-2xl font-bold font-mono text-red-700">€ {tot.toFixed(2)}</p>
        </div>
      </div>
      <div className="card p-0 overflow-hidden">
        <DataTable columns={cols} data={rows} loading={loading} onEdit={r=>{setForm(r);setModal(true)}} onDelete={remove} emptyMessage="Nessuna concimazione registrata"/>
      </div>
      {modal && (
        <Modal title={form.id?'Modifica Concimazione':'Nuova Concimazione'} onClose={()=>setModal(false)}>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Data *</label><input className="input" type="date" value={form.data} onChange={e=>set('data',e.target.value)}/></div>
            <div><label className="label">Tipo concime</label>
              <select className="input" value={form.tipo_concime} onChange={e=>set('tipo_concime',e.target.value)}>
                <option value="">— Seleziona —</option>{(TIPI_CONC_DYN.length ? TIPI_CONC_DYN : TIPI_CONC).map(t=><option key={t}>{t}</option>)}
              </select></div>
            <div><label className="label">Quantità</label><input className="input" type="number" step="0.1" value={form.quantita} onChange={e=>set('quantita',e.target.value)}/></div>
            <div><label className="label">Unità</label>
              <select className="input" value={form.unita} onChange={e=>set('unita',e.target.value)}>
                {['kg','L','sacchi'].map(u=><option key={u}>{u}</option>)}
              </select></div>
            <div><label className="label">Metodo</label>
              <select className="input" value={form.metodo_distribuzione} onChange={e=>set('metodo_distribuzione',e.target.value)}>
                <option value="">— Seleziona —</option>{(METODI_DYN.length ? METODI_DYN : METODI).map(m=><option key={m}>{m}</option>)}
              </select></div>
            <div><label className="label">Zona</label><input className="input" value={form.zona} onChange={e=>set('zona',e.target.value)}/></div>
            <div><label className="label">Operatore</label><input className="input" value={form.operatore} onChange={e=>set('operatore',e.target.value)}/></div>
            <div><label className="label">N-P-K</label><input className="input" placeholder="es. 20-10-10" value={form.npk} onChange={e=>set('npk',e.target.value)}/></div>
            <div><label className="label">Costo (€)</label><input className="input" type="number" step="0.01" value={form.costo} onChange={e=>set('costo',e.target.value)}/></div>
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

// ─── PRODUZIONE ─────────────────────────────────────────────────────────────
const QUALITA   = ['Extra (Cat. I)','Prima scelta','Seconda scelta','Industria','Scarto']
const DEST_PROD = ['Mercato fresco','Industria (succo)','Export','Cooperativa','Vendita diretta','Autoconsumo']
const emptyProd = { data_raccolta:'', appezzamento:'', quantita_kg:'', qualita:'', destinazione:'', prezzo_medio:'', ricavo_totale:'', note:'' }

export function Produzione() {
  const [rows, setRows]     = useState([])
  const [loading, setL]     = useState(true)
  const [modal, setModal]   = useState(false)
  const [form, setForm]     = useState(emptyProd)
  const [saving, setSaving] = useState(false)
  const load = () => { setL(true); db.getAll('produzione',{order:'data_raccolta',asc:false}).then(setRows).finally(()=>setL(false)) }
  useEffect(load, [])
  const set = (k,v) => setForm(f => {
    const next={...f,[k]:v}
    if(k==='quantita_kg'||k==='prezzo_medio') {
      const kg=parseFloat(k==='quantita_kg'?v:f.quantita_kg)||0
      const pr=parseFloat(k==='prezzo_medio'?v:f.prezzo_medio)||0
      next.ricavo_totale=(kg*pr).toFixed(2)
    }
    return next
  })
  const save = async () => {
    if(!form.data_raccolta) return alert('La data è obbligatoria')
    setSaving(true)
    try {
      if(form.id) await db.update('produzione',form.id,form)
      else        await db.insert('produzione',form)
      setModal(false); load()
    } catch(e){alert(e.message)} finally{setSaving(false)}
  }
  const remove = async (id) => { if(!confirm('Eliminare?'))return; await db.remove('produzione',id); load() }
  const cols = [
    { key:'data_raccolta', label:'Data',    width:100, render:v=>v?format(new Date(v),'dd/MM/yyyy'):'—' },
    { key:'appezzamento',  label:'Appezzamento' },
    { key:'quantita_kg',   label:'Kg',      width:90 },
    { key:'qualita',       label:'Qualità' },
    { key:'destinazione',  label:'Destinazione' },
    { key:'prezzo_medio',  label:'€/kg',    width:80,  render:v=>v?`€ ${parseFloat(v).toFixed(2)}`:'—' },
    { key:'ricavo_totale', label:'Ricavo',  width:110, render:v=>v?`€ ${parseFloat(v).toFixed(2)}`:'—' },
  ]
  const totKg  = rows.reduce((a,r)=>a+(parseFloat(r.quantita_kg)||0),0)
  const totRic = rows.reduce((a,r)=>a+(parseFloat(r.ricavo_totale)||0),0)
  return (
    <div className="fade-in space-y-5">
      <PageHeader icon="🍋" title="Registro Produzione" subtitle="Monitoraggio rese e qualità del raccolto"
        actions={<><ExportBar data={rows} columns={cols} title="Registro Produzione" filename="produzione" /><button className="btn-primary" onClick={()=>{setForm(emptyProd);setModal(true)}}><Plus size={16}/>Nuova raccolta</button></>}
      />
      <div className="grid grid-cols-2 gap-3">
        <div className="card bg-yellow-50 border-0 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Kg totali raccolti</p>
          <p className="text-2xl font-bold font-mono text-yellow-600">{totKg.toLocaleString('it-IT')} kg</p>
        </div>
        <div className="card bg-verde-50 border-0 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Ricavo totale</p>
          <p className="text-2xl font-bold font-mono text-verde-700">€ {totRic.toLocaleString('it-IT',{minimumFractionDigits:2})}</p>
        </div>
      </div>
      <div className="card p-0 overflow-hidden">
        <DataTable columns={cols} data={rows} loading={loading} onEdit={r=>{setForm(r);setModal(true)}} onDelete={remove} emptyMessage="Nessuna raccolta registrata"/>
      </div>
      {modal && (
        <Modal title={form.id?'Modifica Raccolta':'Nuova Raccolta'} onClose={()=>setModal(false)}>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Data raccolta *</label><input className="input" type="date" value={form.data_raccolta} onChange={e=>set('data_raccolta',e.target.value)}/></div>
            <div><label className="label">Appezzamento</label><input className="input" value={form.appezzamento} onChange={e=>set('appezzamento',e.target.value)}/></div>
            <div><label className="label">Quantità (kg)</label><input className="input" type="number" step="0.1" value={form.quantita_kg} onChange={e=>set('quantita_kg',e.target.value)}/></div>
            <div><label className="label">Qualità</label>
              <select className="input" value={form.qualita} onChange={e=>set('qualita',e.target.value)}>
                <option value="">— Seleziona —</option>{QUALITA.map(q=><option key={q}>{q}</option>)}
              </select></div>
            <div><label className="label">Destinazione</label>
              <select className="input" value={form.destinazione} onChange={e=>set('destinazione',e.target.value)}>
                <option value="">— Seleziona —</option>{DEST_PROD.map(d=><option key={d}>{d}</option>)}
              </select></div>
            <div><label className="label">Prezzo medio (€/kg)</label><input className="input" type="number" step="0.01" value={form.prezzo_medio} onChange={e=>set('prezzo_medio',e.target.value)}/></div>
            <div><label className="label">Ricavo totale (€)</label><input className="input" type="number" step="0.01" value={form.ricavo_totale} onChange={e=>set('ricavo_totale',e.target.value)}/></div>
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

// ─── SCADENZARIO ────────────────────────────────────────────────────────────
const TIPI_SCA = ['Trattamento fitosanitario','Irrigazione programmata','Concimazione',
  'Manutenzione macchine','Potatura','Raccolta','Pagamento fornitore',
  'Scadenza documento','Rinnovo patentino','Analisi terreno','Altro']
const emptySca = { scadenza:'', tipo_attivita:'', descrizione:'', priorita:'MEDIA', stato:'In attesa', responsabile:'', note:'' }

export function Scadenzario() {
  const [rows, setRows]     = useState([])
  const [loading, setL]     = useState(true)
  const [modal, setModal]   = useState(false)
  const [form, setForm]     = useState(emptySca)
  const [saving, setSaving] = useState(false)
  const load = () => { setL(true); db.getAll('scadenzario',{order:'scadenza',asc:true}).then(setRows).finally(()=>setL(false)) }
  useEffect(load, [])
  const set = (k,v) => setForm(f=>({...f,[k]:v}))
  const save = async () => {
    if(!form.scadenza) return alert('La data è obbligatoria')
    setSaving(true)
    try {
      if(form.id) await db.update('scadenzario',form.id,form)
      else        await db.insert('scadenzario',form)
      setModal(false); load()
    } catch(e){alert(e.message)} finally{setSaving(false)}
  }
  const remove = async (id) => { if(!confirm('Eliminare?'))return; await db.remove('scadenzario',id); load() }
  const daysBadge = (row) => {
    if(row.stato==='Completato') return <span className="badge-green">✅ Fatto</span>
    const d = differenceInDays(new Date(row.scadenza), new Date())
    if(d<0)   return <span className="badge-red">🔴 Scaduta {Math.abs(d)}gg fa</span>
    if(d===0) return <span className="badge-red">🔴 Oggi!</span>
    if(d<=7)  return <span className="badge-yellow">🟡 Tra {d} gg</span>
    return <span className="badge-green">🟢 Tra {d} gg</span>
  }
  const cols = [
    { key:'scadenza',     label:'Scadenza',  width:100, render:v=>v?format(new Date(v),'dd/MM/yyyy'):'—' },
    { key:'tipo_attivita',label:'Tipo' },
    { key:'descrizione',  label:'Descrizione' },
    { key:'priorita',     label:'Priorità',  width:90, render:v=>{
      const c=v==='URGENTE'?'badge-red':v==='MEDIA'?'badge-yellow':'badge-green'
      return <span className={c}>{v}</span>
    }},
    { key:'stato', label:'Stato', width:130, render:(_,r)=>daysBadge(r) },
    { key:'responsabile', label:'Responsabile' },
  ]
  const urgenti = rows.filter(r=>r.stato!=='Completato'&&differenceInDays(new Date(r.scadenza),new Date())<=7)
  return (
    <div className="fade-in space-y-5">
      <PageHeader icon="📋" title="Scadenzario" subtitle="Attività programmate e scadenze importanti"
        actions={<><ExportBar data={rows} columns={cols} title="Scadenzario" filename="scadenzario" /><button className="btn-primary" onClick={()=>{setForm(emptySca);setModal(true)}}><Plus size={16}/>Nuova scadenza</button></>}
      />
      {urgenti.length>0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2 mb-1"><AlertTriangle size={15} className="text-red-500"/>
            <p className="text-red-700 font-semibold text-sm">{urgenti.length} scadenz{urgenti.length===1?'a':'e'} urgenti entro 7 giorni</p>
          </div>
          {urgenti.map(r=><p key={r.id} className="text-xs text-red-600 ml-5">• {r.descrizione}</p>)}
        </div>
      )}
      <div className="card p-0 overflow-hidden">
        <DataTable columns={cols} data={rows} loading={loading} onEdit={r=>{setForm(r);setModal(true)}} onDelete={remove} emptyMessage="Nessuna scadenza programmata"/>
      </div>
      {modal && (
        <Modal title={form.id?'Modifica Scadenza':'Nuova Scadenza'} onClose={()=>setModal(false)}>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Scadenza *</label><input className="input" type="date" value={form.scadenza} onChange={e=>set('scadenza',e.target.value)}/></div>
            <div><label className="label">Tipo attività</label>
              <select className="input" value={form.tipo_attivita} onChange={e=>set('tipo_attivita',e.target.value)}>
                <option value="">— Seleziona —</option>{TIPI_SCA.map(t=><option key={t}>{t}</option>)}
              </select></div>
            <div className="col-span-2"><label className="label">Descrizione</label><input className="input" value={form.descrizione} onChange={e=>set('descrizione',e.target.value)}/></div>
            <div><label className="label">Priorità</label>
              <select className="input" value={form.priorita} onChange={e=>set('priorita',e.target.value)}>
                <option value="URGENTE">🔴 URGENTE</option>
                <option value="MEDIA">🟡 MEDIA</option>
                <option value="BASSA">🟢 BASSA</option>
              </select></div>
            <div><label className="label">Stato</label>
              <select className="input" value={form.stato} onChange={e=>set('stato',e.target.value)}>
                <option>In attesa</option><option>In corso</option><option>Completato</option><option>Annullato</option>
              </select></div>
            <div><label className="label">Responsabile</label><input className="input" value={form.responsabile} onChange={e=>set('responsabile',e.target.value)}/></div>
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
