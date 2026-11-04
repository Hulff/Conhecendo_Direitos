import type { InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type SwitchProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>

export function Switch({ className, ...props }: SwitchProps) {
  return (
    <input
      type="checkbox"
      role="switch"
      className={cn('peer relative h-12 w-12 shrink-0 cursor-pointer appearance-none rounded-full border-0 bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background before:absolute before:inset-x-0 before:top-2.5 before:h-7 before:rounded-full before:border before:border-border before:bg-secondary before:transition-colors checked:before:bg-primary after:absolute after:left-0.5 after:top-3 after:h-6 after:w-6 after:rounded-full after:bg-foreground after:transition-transform checked:after:translate-x-5 checked:after:bg-primary-foreground', className)}
      {...props}
    />
  )
}
