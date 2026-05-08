import { Printer, FileSpreadsheet, FileText } from 'lucide-react'
import { exportToExcel, exportToPDF } from '../lib/export'

export default function ExportBar({ data = [], columns = [], title = '', filename = 'export' }) {
  const handlePrint = () => window.print()

  const handleExcel = () => {
    if (data.length === 0) return alert('Nessun dato da esportare')
    exportToExcel(data, columns, filename)
  }

  const handlePDF = () => {
    if (data.length === 0) return alert('Nessun dato da esportare')
    exportToPDF(data, columns, title, filename)
  }

  return (
    <div className="flex items-center gap-2 flex-wrap" data-no-print>
      <button
        onClick={handlePrint}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                   bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
        title="Stampa pagina (A4 verticale)"
      >
        <Printer size={14} />
        Stampa
      </button>

      <button
        onClick={handleExcel}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                   bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
        title="Esporta in Excel (.xlsx)"
      >
        <FileSpreadsheet size={14} />
        Excel
      </button>

      <button
        onClick={handlePDF}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                   bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
        title="Esporta in PDF"
      >
        <FileText size={14} />
        PDF
      </button>
    </div>
  )
}
