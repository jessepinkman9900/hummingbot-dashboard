"use client"

import * as React from "react"
import { ChevronDown, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface SearchableSelectOption {
  value: string
  label: string
}

interface SearchableSelectProps {
  options: SearchableSelectOption[]
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  emptyMessage?: string
  tabIndex?: number
}

export function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder = "Select option...",
  disabled = false,
  className,
  emptyMessage = "No options found",
  tabIndex,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [highlightedIndex, setHighlightedIndex] = React.useState(0)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const listRef = React.useRef<HTMLDivElement>(null)
  const searchInputRef = React.useRef<HTMLInputElement>(null)

  // Sort options alphabetically
  const sortedOptions = React.useMemo(() => {
    return [...options].sort((a, b) => a.label.localeCompare(b.label))
  }, [options])

  // Filter options based on search query
  const filteredOptions = React.useMemo(() => {
    if (!searchQuery.trim()) return sortedOptions
    return sortedOptions.filter(option =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      option.value.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [sortedOptions, searchQuery])

  // Get the selected option
  const selectedOption = React.useMemo(() => {
    return sortedOptions.find(option => option.value === value)
  }, [sortedOptions, value])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setOpen(true);
        setHighlightedIndex(0);
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        setOpen(false);
        setSearchQuery('');
        setHighlightedIndex(0);
        break;
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredOptions[highlightedIndex]) {
          onValueChange?.(filteredOptions[highlightedIndex].value);
          setOpen(false);
          setSearchQuery('');
          setHighlightedIndex(0);
        }
        break;
    }
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
        setSearchQuery("")
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Reset highlighted index when filtered options change
  React.useEffect(() => {
    if (filteredOptions.length > 0) {
      setHighlightedIndex(prev => {
        if (prev >= filteredOptions.length) {
          return 0;
        }
        return prev;
      });
    }
  }, [filteredOptions.length])

  // Focus the search input when dropdown opens
  React.useEffect(() => {
    if (open && searchInputRef.current) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus()
      }, 150)
      return () => clearTimeout(timer)
    }
  }, [open])

  // Scroll highlighted option into view
  React.useEffect(() => {
    if (listRef.current && open) {
      const highlightedElement = listRef.current.children[highlightedIndex] as HTMLElement
      if (highlightedElement) {
        const container = listRef.current
        const elementTop = highlightedElement.offsetTop
        const elementBottom = elementTop + highlightedElement.offsetHeight
        const containerTop = container.scrollTop
        const containerBottom = containerTop + container.clientHeight

        if (elementTop < containerTop) {
          container.scrollTop = elementTop
        } else if (elementBottom > containerBottom) {
          container.scrollTop = elementBottom - container.clientHeight
        }
      }
    }
  }, [highlightedIndex, open])

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <Button
        type="button"
        variant="outline"
        className={cn("w-full justify-between text-left font-normal", className)}
        disabled={disabled}
        onClick={() => {
          const wasOpen = open
          setOpen(!open)
          if (!wasOpen) {
            setHighlightedIndex(0)
            setTimeout(() => {
              searchInputRef.current?.focus()
            }, 100)
          }
        }}
        onKeyDown={handleKeyDown}
        tabIndex={tabIndex}
      >
        <span className={cn("block truncate", !selectedOption && "text-muted-foreground")}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </Button>

      {open && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border border-border rounded-md shadow-lg">
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                ref={searchInputRef}
                placeholder="Type to search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-8 pr-8 h-9"
                tabIndex={0}
                role="combobox"
                aria-expanded={open}
                aria-autocomplete="list"
                aria-controls="combobox-options"
                autoFocus
              />
              {searchQuery && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-2"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
          
          <div 
            ref={listRef} 
            className="max-h-60 overflow-auto"
            id="combobox-options"
            role="listbox"
          >
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-2 text-sm text-muted-foreground">
                {emptyMessage}
              </div>
            ) : (
              filteredOptions.map((option, index) => (
                <div
                  key={option.value}
                  role="option"
                  aria-selected={option.value === value}
                  data-highlighted={index === highlightedIndex}
                  className={cn(
                    "cursor-pointer px-4 py-2 text-sm hover:bg-accent transition-colors",
                    index === highlightedIndex && "bg-accent",
                    option.value === value && "bg-primary/10 text-primary font-medium"
                  )}
                  onClick={() => {
                    onValueChange?.(option.value)
                    setOpen(false)
                    setSearchQuery("")
                  }}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  {option.label}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}