'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown, Check } from 'lucide-react'

// Simple select for basic use cases
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string
  options: { value: string; label: string }[]
  placeholder?: string
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, options, placeholder, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          className={cn(
            'flex h-9 w-full appearance-none rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-destructive focus-visible:ring-destructive',
            className
          )}
          ref={ref}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50 pointer-events-none" />
        {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
      </div>
    )
  }
)
Select.displayName = 'Select'

// Composable Select components (shadcn-style)
interface SelectContextValue {
  value: string
  onValueChange: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
  disabled: boolean
  labels: Map<string, string>
  registerLabel: (value: string, label: string) => void
}

const SelectContext = React.createContext<SelectContextValue | null>(null)

interface SelectRootProps {
  value?: string
  onValueChange?: (value: string) => void
  defaultValue?: string
  disabled?: boolean
  children: React.ReactNode
}

const SelectRoot = ({ value: controlledValue, onValueChange, defaultValue = '', disabled = false, children }: SelectRootProps) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue)
  const [open, setOpen] = React.useState(false)
  const [labels] = React.useState(() => new Map<string, string>())

  const value = controlledValue !== undefined ? controlledValue : internalValue

  const handleValueChange = React.useCallback((newValue: string) => {
    if (disabled) return
    if (controlledValue === undefined) {
      setInternalValue(newValue)
    }
    onValueChange?.(newValue)
  }, [controlledValue, onValueChange, disabled])

  const handleSetOpen = React.useCallback((newOpen: boolean) => {
    if (disabled) return
    setOpen(newOpen)
  }, [disabled])

  const registerLabel = React.useCallback((itemValue: string, label: string) => {
    labels.set(itemValue, label)
  }, [labels])

  return (
    <SelectContext.Provider value={{ value, onValueChange: handleValueChange, open, setOpen: handleSetOpen, disabled, labels, registerLabel }}>
      <div className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  )
}

const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
  const context = React.useContext(SelectContext)
  if (!context) throw new Error('SelectTrigger must be used within SelectRoot')

  return (
    <button
      type="button"
      ref={ref}
      disabled={context.disabled}
      onClick={() => context.setOpen(!context.open)}
      className={cn(
        'flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  )
})
SelectTrigger.displayName = 'SelectTrigger'

const SelectValue = ({ placeholder }: { placeholder?: string }) => {
  const context = React.useContext(SelectContext)
  if (!context) throw new Error('SelectValue must be used within SelectRoot')

  const displayValue = context.value ? (context.labels.get(context.value) || context.value) : null

  return (
    <span className={cn(!context.value && 'text-muted-foreground')}>
      {displayValue || placeholder}
    </span>
  )
}

const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const context = React.useContext(SelectContext)
  if (!context) throw new Error('SelectContent must be used within SelectRoot')

  const contentRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contentRef.current && !contentRef.current.parentElement?.contains(event.target as Node)) {
        context.setOpen(false)
      }
    }

    if (context.open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [context.open, context])

  // Always render children to register labels, but hide visually when closed
  return (
    <div
      ref={contentRef}
      className={cn(
        'absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm',
        !context.open && 'hidden',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
SelectContent.displayName = 'SelectContent'

interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  textValue?: string
}

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ className, children, value, textValue, ...props }, ref) => {
    const context = React.useContext(SelectContext)
    if (!context) throw new Error('SelectItem must be used within SelectRoot')

    // Register the label for this item
    React.useEffect(() => {
      const label = textValue || (typeof children === 'string' ? children : value)
      context.registerLabel(value, label)
    }, [value, children, textValue, context])

    const isSelected = context.value === value

    return (
      <div
        ref={ref}
        className={cn(
          'relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100',
          isSelected && 'bg-gray-100',
          className
        )}
        onClick={() => {
          context.onValueChange(value)
          context.setOpen(false)
        }}
        {...props}
      >
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          {isSelected && <Check className="h-4 w-4" />}
        </span>
        {children}
      </div>
    )
  }
)
SelectItem.displayName = 'SelectItem'

// Export both simple and composable versions
export {
  Select,
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
}
