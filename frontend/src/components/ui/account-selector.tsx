'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { ChevronDown, User, Search, X, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useAccounts } from '@/lib/hooks/useAccountsQuery';
import { useAccountsUIStore } from '@/lib/store/accounts-ui-store';

export function AccountSelector() {
  const { data: accounts = [], isLoading } = useAccounts();
  const { selectedAccount, setSelectedAccount } = useAccountsUIStore();
  
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Set default account to "master_account" if it exists and no account is selected
  useEffect(() => {
    if (accounts.length > 0 && !selectedAccount) {
      const defaultAccount = accounts.find(account => account === 'master_account') || accounts[0];
      setSelectedAccount(defaultAccount);
    }
  }, [accounts, selectedAccount, setSelectedAccount]);

  // Sort accounts alphabetically
  const sortedAccounts = useMemo(() => {
    return [...accounts].sort((a, b) => a.localeCompare(b));
  }, [accounts]);

  // Filter accounts based on search query
  const filteredAccounts = useMemo(() => {
    if (!searchQuery.trim()) return sortedAccounts;
    return sortedAccounts.filter(account =>
      account.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [sortedAccounts, searchQuery]);

  // Maximum visible items before showing "more" indicator
  const MAX_VISIBLE_ITEMS = 5;
  const hasMoreItems = filteredAccounts.length > MAX_VISIBLE_ITEMS;
  const displayedAccounts = filteredAccounts.slice(0, MAX_VISIBLE_ITEMS);

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
          prev < filteredAccounts.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredAccounts[highlightedIndex]) {
          setSelectedAccount(filteredAccounts[highlightedIndex]);
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

  // Reset highlighted index when filtered accounts change
  useEffect(() => {
    if (filteredAccounts.length > 0) {
      setHighlightedIndex(prev => {
        if (prev >= filteredAccounts.length) {
          return 0;
        }
        return prev;
      });
    }
  }, [filteredAccounts.length]);

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

  if (isLoading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <User className="h-4 w-4 mr-2" />
        Loading...
      </Button>
    );
  }

  if (accounts.length === 0) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <User className="h-4 w-4 mr-2" />
        No accounts
      </Button>
    );
  }

  const displayAccount = selectedAccount || 'Select Account';

  return (
    <div ref={containerRef} className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="gap-2"
        onClick={() => {
          setOpen(!open);
          if (!open) {
            setHighlightedIndex(0);
          }
        }}
        onKeyDown={handleKeyDown}
      >
        <User className="h-4 w-4" />
        <span className="max-w-32 truncate">{displayAccount}</span>
        <ChevronDown className={cn("h-3 w-3 transition-transform", open && "rotate-180")} />
      </Button>

      {open && (
        <div className="absolute top-full right-0 z-50 mt-1 w-72 bg-background border border-border rounded-md shadow-lg">
          {/* Search Input */}
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search accounts..."
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
          
          {/* Account List */}
          <div ref={listRef} className="max-h-60 overflow-auto">
            {filteredAccounts.length === 0 ? (
              <div className="px-4 py-2 text-sm text-muted-foreground">
                No accounts found
              </div>
            ) : (
              <>
                {displayedAccounts.map((account, index) => (
                  <div
                    key={account}
                    className={cn(
                      "cursor-pointer px-4 py-2 text-sm hover:bg-accent transition-colors flex items-center gap-2",
                      index === highlightedIndex && "bg-accent",
                      account === selectedAccount && "bg-primary/10 text-primary font-medium"
                    )}
                    onClick={() => {
                      setSelectedAccount(account);
                      setOpen(false);
                      setSearchQuery('');
                      setHighlightedIndex(0);
                    }}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    <User className="h-4 w-4" />
                    {account}
                  </div>
                ))}
                
                {/* More items indicator */}
                {hasMoreItems && !searchQuery && (
                  <div className="px-4 py-2 text-sm text-muted-foreground border-t border-border flex items-center gap-2">
                    <MoreHorizontal className="h-4 w-4" />
                    <span>+{filteredAccounts.length - MAX_VISIBLE_ITEMS} more accounts</span>
                    <span className="text-xs">(type to search)</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}