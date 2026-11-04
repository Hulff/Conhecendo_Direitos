import { useState, type HTMLAttributes, type KeyboardEvent, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  defaultValue: string
  value?: string
  onValueChange?: (value: string) => void
}

export function Tabs({ defaultValue, value, onValueChange, className, children, ...props }: TabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue)
  const selected = value ?? internalValue
  return (
    <TabsContext.Provider value={{ selected, select: (next) => { setInternalValue(next); onValueChange?.(next) } }}>
      <div className={className} {...props}>{children}</div>
    </TabsContext.Provider>
  )
}

import { createContext, useContext } from 'react'
const TabsContext = createContext<{ selected: string; select: (value: string) => void }>({ selected: '', select: () => undefined })

export function TabsList({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div role="tablist" className={cn('inline-flex min-h-14 items-center rounded-xl bg-secondary p-1', className)} {...props} />
}

interface TabProps extends HTMLAttributes<HTMLButtonElement> { value: string }
export function TabsTrigger({ value, className, children, onClick, onKeyDown, ...props }: TabProps) {
  const tabs = useContext(TabsContext)
  const active = tabs.selected === value
  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    onKeyDown?.(event)
    if (event.defaultPrevented) return
    const buttons = Array.from(event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ?? [])
    const currentIndex = buttons.indexOf(event.currentTarget)
    const nextIndex = event.key === 'ArrowRight'
      ? (currentIndex + 1) % buttons.length
      : event.key === 'ArrowLeft'
        ? (currentIndex - 1 + buttons.length) % buttons.length
        : event.key === 'Home'
          ? 0
          : event.key === 'End'
            ? buttons.length - 1
            : -1
    if (nextIndex < 0 || !buttons[nextIndex]) return
    event.preventDefault()
    const nextButton = buttons[nextIndex]
    const nextValue = nextButton.dataset.value
    nextButton.focus()
    if (nextValue) tabs.select(nextValue)
  }
  return (
    <button type="button" role="tab" aria-selected={active} tabIndex={active ? 0 : -1}
      className={cn('min-h-12 rounded-lg px-4 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', active && 'bg-card text-foreground shadow', className)}
      data-value={value}
      onKeyDown={handleKeyDown}
      onClick={(event) => { onClick?.(event); tabs.select(value) }} {...props}>
      {children}
    </button>
  )
}

interface TabsContentProps extends HTMLAttributes<HTMLDivElement> { value: string; children: ReactNode }
export function TabsContent({ value, children, ...props }: TabsContentProps) {
  return useContext(TabsContext).selected === value ? <div role="tabpanel" tabIndex={0} {...props}>{children}</div> : null
}
