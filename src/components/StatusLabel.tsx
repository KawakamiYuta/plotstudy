type StatusLabelProps = {
  label: string
  value: React.ReactNode
}

export function StatusLabel({ label, value }: StatusLabelProps) {
  return (
    <div className="status-label">
      <span className="status-label-name">{label}</span>
      <span className="status-label-value">{value}</span>
    </div>
  )
}