import { useEffect, useRef, type DialogHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface DialogProps extends Omit<DialogHTMLAttributes<HTMLDialogElement>, 'open'> {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
}

export function Dialog({ open, onOpenChange, children, className, ...props }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      className={cn('w-[calc(100%-2rem)] max-w-lg rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-2xl backdrop:bg-black/70', className)}
      onCancel={(event) => { props.onCancel?.(event); onOpenChange(false) }}
      onClose={(event) => { props.onClose?.(event); onOpenChange(false) }}
      {...props}
    >
      {children}
    </dialog>
  )
}

export function DialogContent(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props
  return <div className={cn('space-y-4', className)} {...rest} />
}

export function DialogHeader(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props
  return <div className={cn('space-y-2 text-left', className)} {...rest} />
}

export function DialogTitle(props: React.HTMLAttributes<HTMLHeadingElement>) {
  const { className, ...rest } = props
  return <h2 className={cn('text-xl font-bold', className)} {...rest} />
}
