import { useEffect, useRef, type DialogHTMLAttributes, type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface DrawerProps extends Omit<DialogHTMLAttributes<HTMLDialogElement>, 'open' | 'onClose'> {
  open: boolean
  dismissible?: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
}

export function Drawer({ open, dismissible = false, onOpenChange, className, children, onCancel, ...props }: DrawerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      if (typeof dialog.showModal === 'function') dialog.showModal()
      else dialog.setAttribute('open', '')
    } else if (!open && dialog.open) {
      if (typeof dialog.close === 'function') dialog.close()
      else dialog.removeAttribute('open')
    }
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      className={cn('drawer-surface', className)}
      aria-modal="true"
      onCancel={(event) => {
        onCancel?.(event)
        if (dismissible) onOpenChange(false)
        else event.preventDefault()
      }}
      {...props}
    >
      {children}
    </dialog>
  )
}

export function DrawerTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn('drawer-title', className)} {...props} />
}

export function DrawerDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('drawer-description', className)} {...props} />
}
