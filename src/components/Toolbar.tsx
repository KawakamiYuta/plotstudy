type ToolbarProps = {
  children: React.ReactNode
}

export function Toolbar({children}:ToolbarProps){
  return (
    <div className="control-panel">
      {children}
    </div>
  )
}