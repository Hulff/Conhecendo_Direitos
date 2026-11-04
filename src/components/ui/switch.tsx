import type { InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type SwitchProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>

export function Switch({ className, ...props }: SwitchProps) {
  return (
    <input
      type="checkbox"
      role="switch"
      className={cn('peer relative h-7 w-12 cursor-pointer appearance-none rounded-full border border-border bg-secondary transition-colors checked:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-foreground after:transition-transform checked:after:translate-x-5 checked:after:bg-primary-foreground', className)}
      {...props}
    />
  )
}
