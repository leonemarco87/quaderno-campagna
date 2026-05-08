import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// ─── EXCEL EXPORT ────────────────────────────────────────────────────────────
export function exportToExcel(data, columns, filename = 'export') {
  // Costruisce le righe con solo le colonne visibili
  const headers = columns.map(c => c.label)
  const rows = data.map(row =>
    columns.map(col => {
      const val = row[col.key]
      if (col.key === 'fattura' || col.key === 'fatturato') return val ? 'Sì' : 'No'
      if (typeof val === 'boolean') return val ? 'Sì' : 'No'
      return val ?? ''
    })
  )

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])

  // Larghezze colonne
  ws['!cols'] = columns.map(c => ({ wch: Math.max(c.label.length + 2, 14) }))

  // Stile intestazioni (solo xlsx supporta stili base)
  const range = XLSX.utils.decode_range(ws['!ref'])
  for (let C = range.s.c; C <= range.e.c; C++) {
    const cellAddr = XLSX.utils.encode_cell({ r: 0, c: C })
    if (ws[cellAddr]) {
      ws[cellAddr].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '1A5C2A' } },
        alignment: { horizontal: 'center' }
      }
    }
  }

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Dati')
  XLSX.writeFile(wb, `${filename}_${today()}.xlsx`)
}

// ─── PDF EXPORT ──────────────────────────────────────────────────────────────
export function exportToPDF(data, columns, title, filename = 'export') {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  // Intestazione
  doc.setFillColor(26, 92, 42)
  doc.rect(0, 0, 210, 22, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(`🍋  ${title}`, 14, 14)

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text(`Limone di Rocca Imperiale IGP  |  Stampato il ${todayFull()}`, 14, 19)

  // Tabella
  const headers = columns.map(c => c.label)
  const rows = data.map(row =>
    columns.map(col => {
      const val = row[col.key]
      if (col.key === 'fattura' || col.key === 'fatturato') return val ? 'Sì' : 'No'
      if (typeof val === 'boolean') return val ? 'Sì' : 'No'
      // Formatta date
      if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}/.test(val)) {
        return val.split('T')[0].split('-').reverse().join('/')
      }
      // Formatta numeri euro
      if (col.key.includes('costo') || col.key.includes('totale') ||
          col.key.includes('ricavo') || col.key.includes('prezzo') ||
          col.key.includes('imponibile')) {
        return val ? `€ ${parseFloat(val).toFixed(2)}` : '—'
      }
      return val ?? '—'
    })
  )

  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 28,
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      overflow: 'linebreak',
    },
    headStyles: {
      fillColor: [26, 92, 42],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center',
    },
    alternateRowStyles: {
      fillColor: [200, 230, 201],
    },
    bodyStyles: {
      textColor: [30, 30, 30],
    },
    margin: { left: 10, right: 10 },
    tableWidth: 'auto',
    didDrawPage: (data) => {
      // Footer con numero pagina
      const pageCount = doc.internal.getNumberOfPages()
      doc.setFontSize(7)
      doc.setTextColor(150)
      doc.text(
        `Pagina ${data.pageNumber} di ${pageCount}  |  Quaderno di Campagna — Limone IGP`,
        105, 290,
        { align: 'center' }
      )
    }
  })

  doc.save(`${filename}_${today()}.pdf`)
}

// ─── EXPORT COMPLETO (tutti i fogli in un unico Excel) ───────────────────────
export async function exportFullExcel(sheets) {
  const wb = XLSX.utils.book_new()

  for (const { name, data, columns } of sheets) {
    if (!data || data.length === 0) continue

    const headers = columns.map(c => c.label)
    const rows = data.map(row =>
      columns.map(col => {
        const val = row[col.key]
        if (typeof val === 'boolean') return val ? 'Sì' : 'No'
        return val ?? ''
      })
    )

    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])
    ws['!cols'] = columns.map(c => ({ wch: Math.max(c.label.length + 2, 14) }))
    XLSX.utils.book_append_sheet(wb, ws, name.slice(0, 31)) // max 31 chars
  }

  XLSX.writeFile(wb, `QuadernoCampagna_completo_${today()}.xlsx`)
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function today() {
  return new Date().toISOString().slice(0, 10).replace(/-/g, '')
}

function todayFull() {
  return new Date().toLocaleDateString('it-IT', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}
