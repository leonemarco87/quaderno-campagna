import { Pencil, Trash2, ChevronUp, ChevronDown } from 'lucide-react'

export default function DataTable({
  columns, data, onEdit, onDelete,
  emptyMessage = 'Nessun dato presente',
  loading = false,
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-verde-400">
        <div className="w-8 h-8 border-2 border-verde-300 border-t-verde-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100">
      <table className="w-full text-sm">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="table-header px-4 py-3 text-left whitespace-nowrap"
                style={{ width: col.width }}
              >
                {col.label}
              </th>
            ))}
            {(onEdit || onDelete) && (
              <th className="table-header px-3 py-3 text-center w-20">Azioni</th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + 1}
                className="text-center py-10 text-gray-400 text-sm"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr key={row.id || i} className="table-row">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-2.5 whitespace-nowrap">
                    {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                  </td>
                ))}
                {(onEdit || onDelete) && (
                  <td className="px-3 py-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(row)}
                          className="text-verde-500 hover:text-verde-700 hover:bg-verde-50 p-1.5 rounded-lg transition-colors"
                          title="Modifica"
                        >
                          <Pencil size={14} />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(row.id)}
                          className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                          title="Elimina"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
