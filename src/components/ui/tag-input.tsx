'use client'

import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from './badge'

interface TagInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  maxTags?: number
  className?: string
  error?: string
}

export function TagInput({
  value = [],
  onChange,
  placeholder = 'Type and press Enter...',
  maxTags = 10,
  className,
  error,
}: TagInputProps) {
  const [inputValue, setInputValue] = React.useState('')
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault()
      if (value.length < maxTags && !value.includes(inputValue.trim())) {
        onChange([...value, inputValue.trim()])
        setInputValue('')
      }
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove))
  }

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn(
          'flex flex-wrap gap-2 rounded-md border border-input bg-transparent p-2 min-h-[42px] focus-within:ring-1 focus-within:ring-ring',
          error && 'border-destructive focus-within:ring-destructive'
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tag) => (
          <Badge key={tag} variant="secondary" className="gap-1">
            {tag}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                removeTag(tag)
              }}
              className="ml-1 rounded-full hover:bg-muted"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? placeholder : ''}
          disabled={value.length >= maxTags}
          className="flex-1 min-w-[120px] bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
        />
      </div>
      <div className="mt-1 flex justify-between text-xs text-muted-foreground">
        <span>{error && <span className="text-destructive">{error}</span>}</span>
        <span>
          {value.length}/{maxTags}
        </span>
      </div>
    </div>
  )
}
