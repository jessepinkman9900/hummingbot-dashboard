'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Palette, ChevronDown, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useTheme } from '@/lib/themes/provider';
import { THEMES } from '@/lib/themes/config';

export function ThemePicker() {
  const { theme, setTheme } = useTheme();

  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Filter themes based on search query
  const filteredThemes = useMemo(() => {
    if (!searchQuery.trim()) return THEMES;
    return THEMES.filter(themeOption =>
      themeOption.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      themeOption.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setOpen(true);
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
          prev < filteredThemes.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredThemes[highlightedIndex]) {
          setTheme(filteredThemes[highlightedIndex].id);
          setOpen(false);
          setSearchQuery('');
          setHighlightedIndex(0);
        }
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
        setSearchQuery('');
        setHighlightedIndex(0);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  // Reset highlighted index when filtered themes change
  useEffect(() => {
    if (filteredThemes.length > 0) {
      setHighlightedIndex(prev => {
        if (prev >= filteredThemes.length) {
          return 0;
        }
        return prev;
      });
    }
  }, [filteredThemes.length]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (listRef.current && open) {
      const highlightedElement = listRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedElement) {
        const container = listRef.current;
        const elementTop = highlightedElement.offsetTop;
        const elementBottom = elementTop + highlightedElement.offsetHeight;
        const containerTop = container.scrollTop;
        const containerBottom = containerTop + container.clientHeight;

        if (elementTop < containerTop) {
          container.scrollTop = elementTop;
        } else if (elementBottom > containerBottom) {
          container.scrollTop = elementBottom - container.clientHeight;
        }
      }
    }
  }, [highlightedIndex, open]);

  const currentTheme = THEMES.find(t => t.id === theme);

  return (
    <div ref={containerRef} className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => {
          setOpen(!open);
          if (!open) {
            setHighlightedIndex(0);
          }
        }}
        onKeyDown={handleKeyDown}
      >
        <Palette className="h-4 w-4" />
        <span className="sr-only">Open theme picker</span>
      </Button>

      {open && (
        <div className="absolute top-full right-0 z-50 mt-1 w-80 bg-background border border-border rounded-md shadow-lg">
          {/* Search Input */}
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search themes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-8 pr-8 h-9"
                autoFocus
              />
              {searchQuery && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-2"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          {/* Theme List */}
          <div ref={listRef} className="max-h-80 overflow-auto">
            {filteredThemes.length === 0 ? (
              <div className="px-4 py-2 text-sm text-muted-foreground">
                No themes found
              </div>
            ) : (
              <>
                {filteredThemes.map((themeOption, index) => (
                  <div
                    key={themeOption.id}
                    className={cn(
                      "cursor-pointer px-4 py-3 hover:bg-accent transition-colors",
                      index === highlightedIndex && "bg-accent",
                      themeOption.id === theme && "bg-primary/10 text-primary font-medium"
                    )}
                    onClick={() => {
                      setTheme(themeOption.id);
                      setOpen(false);
                      setSearchQuery('');
                      setHighlightedIndex(0);
                    }}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    <div className="flex items-center gap-2">
                      <Palette className="h-4 w-4" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{themeOption.name}</div>
                        <div className="text-xs text-muted-foreground">{themeOption.description}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}