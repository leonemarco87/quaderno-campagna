import { useState } from 'react'
import { useConfig } from '../hooks/useConfig'
import { Plus, Trash2, Settings } from 'lucide-react'
import PageHeader from '../components/PageHeader'

const SEZIONI = [
  { key: 'tipo_lavorazione',       label: '⚙️ Tipi di Lavorazione' },
  { key: 'tipo_concime',           label: '🌱 Tipi di Concime' },
  { key: 'metodo_distribuzione',   label: '🚜 Metodi di Distribuzione' },
  { key: 'motivazione_trattamento',label: '🌿 Motivazioni Trattamento' },
  { key: 'categoria_spesa',        label: '💸 Categorie Spesa' },
  { key: 'destinazione_vendita',   label: '🌾 Destinazioni Vendita' },
]

function SezioneElenco({ categoria, label }) {
  const { config, addItem, removeItem } = useConfig()
  const [nuovo, setNuovo]   = useState('')
  const [saving, setSaving] = useState(false)
  const items = config[categoria] || []

  const handleAdd = async () => {
    if (!nuovo.trim()) return
    const voci = nuovo.split(/[,\n]/).map(v => v.trim()).filter(v => v.length > 0)
    const duplicati = voci.filter(v =>
      items.some(i => i.valore.toLowerCase() === v.toLowerCase())
    )
    if (duplicati.length > 0) {
      alert(`Già presenti: ${duplicati.join(', ')}`)
      return
    }
    setSaving(true)
    try {
      for (const voce of voci) {
        await addItem(categoria, voce)
      }
      setNuovo('')
    } finally { setSaving(false) }
  }

  const handleRemove = async (id, valore) => {
    if (!confirm(`Eliminare "${valore}"?`)) return
    await removeItem(id)
  }

  return (
    <div className="card">
      <h3 className="font-display font-semibold text-verde-700 text-base mb-3">{label}</h3>

      <div className="space-y-1.5 mb-4 max-h-48 overflow-y-auto">
        {items.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-3">Nessuna voce — aggiungine una</p>
        )}
        {items.map(item => (
          <div key={item.id}
            className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg group">
            <span className="text-sm text-gray-700">{item.valore}</span>
            {item.valore !== 'Altro' && (
              <button
                onClick={() => handleRemove(item.id, item.valore)}
                className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                title="Elimina"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <textarea
          className="input text-sm resize-none"
          placeholder={`Una voce sola oppure più voci separate da virgola\nes: Voce1, Voce2, Voce3`}
          rows={2}
          value={nuovo}
          onChange={e => setNuovo(e.target.value)}
        />
        <button
          onClick={handleAdd}
          disabled={saving || !nuovo.trim()}
          className="btn-primary justify-center disabled:opacity-50"
        >
          <Plus size={14} />
          {saving ? 'Aggiunta in corso…' : 'Aggiungi'}
        </button>
      </div>
    </div>
  )
}

export default function Impostazioni() {
  const { loading } = useConfig()

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-verde-400">
      <div className="w-8 h-8 border-2 border-verde-200 border-t-verde-600 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="fade-in space-y-5">
      <PageHeader
        icon="⚙️"
        title="Impostazioni"
        subtitle="Personalizza gli elenchi del gestionale senza toccare il codice"
      />

      <div className="card bg-verde-50 border-verde-200">
        <div className="flex items-start gap-3">
          <Settings size={18} className="text-verde-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-verde-800 font-medium text-sm">Come funziona</p>
            <p className="text-verde-600 text-xs mt-0.5">
              Scrivi una voce sola oppure più voci separate da virgola (es: Boro, Calcio, Magnesio)
              e clicca Aggiungi. Le voci vengono ordinate alfabeticamente. La voce "Altro" non può essere eliminata.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SEZIONI.map(s => (
          <SezioneElenco key={s.key} categoria={s.key} label={s.label} />
        ))}
      </div>
    </div>
  )
}
