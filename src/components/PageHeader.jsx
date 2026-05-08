export default function PageHeader({ icon, title, subtitle, actions }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-verde-100 flex items-center justify-center text-xl shrink-0">
          {icon}
        </div>
        <div>
          <h1 className="font-display text-verde-700 text-xl font-bold leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-gray-400 text-xs mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
