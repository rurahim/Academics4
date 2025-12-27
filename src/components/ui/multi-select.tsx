'use client'

import * as React from 'react'
import { Check, ChevronDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from './badge'

interface MultiSelectProps {
  options: { value: string; label: string }[]
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  className?: string
  error?: string
  maxItems?: number
}

export function MultiSelect({
  options,
  value = [],
  onChange,
  placeholder = 'Select items...',
  className,
  error,
  maxItems,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredOptions = options.filter(
    (option) =>
      option.label.toLowerCase().includes(search.toLowerCase()) ||
      option.value.toLowerCase().includes(search.toLowerCase())
  )

  const toggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue))
    } else if (!maxItems || value.length < maxItems) {
      onChange([...value, optionValue])
    }
  }

  const removeOption = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(value.filter((v) => v !== optionValue))
  }

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <div
        className={cn(
          'flex flex-wrap gap-1 min-h-[42px] w-full rounded-md border border-input bg-transparent p-2 text-sm shadow-sm cursor-pointer',
          error && 'border-destructive',
          isOpen && 'ring-1 ring-ring'
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        {value.length === 0 ? (
          <span className="text-muted-foreground">{placeholder}</span>
        ) : (
          value.map((v) => {
            const option = options.find((o) => o.value === v)
            return (
              <Badge key={v} variant="secondary" className="gap-1">
                {option?.label || v}
                <button
                  type="button"
                  onClick={(e) => removeOption(v, e)}
                  className="ml-1 rounded-full hover:bg-muted"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )
          })
        )}
        <ChevronDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
          <div className="p-2">
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-ring"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="max-h-[200px] overflow-auto p-1">
            {filteredOptions.length === 0 ? (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">No options found</div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={cn(
                    'flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm cursor-pointer hover:bg-accent',
                    value.includes(option.value) && 'bg-accent'
                  )}
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleOption(option.value)
                  }}
                >
                  <div
                    className={cn(
                      'flex h-4 w-4 items-center justify-center rounded-sm border',
                      value.includes(option.value)
                        ? 'bg-primary text-primary-foreground'
                        : 'opacity-50'
                    )}
                  >
                    {value.includes(option.value) && <Check className="h-3 w-3" />}
                  </div>
                  {option.label}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
    </div>
  )
}
