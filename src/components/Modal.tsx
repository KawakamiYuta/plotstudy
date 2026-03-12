type ModalProps = {
  open: boolean
  title?: string
  onClose: () => void
  children: React.ReactNode
  footer?: React.ReactNode
}

export function Modal({
  open,
  title,
  onClose,
  children,
  footer
}: ModalProps) {

  if (!open) return null

  return (
    <div className="modal-overlay">
      <div className="modal">

        {title && <h3>{title}</h3>}

        <div className="modal-body">
          {children}
        </div>

        {footer && (
          <div className="modal-buttons">
            {footer}
          </div>
        )}

      </div>
    </div>
  )
}