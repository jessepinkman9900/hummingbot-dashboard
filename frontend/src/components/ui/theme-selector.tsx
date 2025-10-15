// 'use client';

// import React, { useEffect, useRef, useState, useMemo } from 'react';
// import { ChevronDown, Palette, Search, X, MoreHorizontal } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { cn } from '@/lib/utils';
// import { useTheme } from '@/lib/themes/provider';
// import { THEMES } from '@/lib/themes/config';

// export function ThemeSelector() {
//   const { theme, setTheme } = useTheme();
  
//   const [open, setOpen] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [highlightedIndex, setHighlightedIndex] = useState(0);
//   const containerRef = useRef<HTMLDivElement>(null);
//   const listRef = useRef<HTMLDivElement>(null);

//   // Sort themes alphabetically
//   const sortedThemes = useMemo(() => {
//     return [...THEMES].sort((a, b) => a.name.localeCompare(b.name));
//   }, []);

//   // Filter themes based on search query
//   const filteredThemes = useMemo(() => {
//     if (!searchQuery.trim()) return sortedThemes;
//     return sortedThemes.filter(theme =>
//       theme.name.toLowerCase().includes(searchQuery.toLowerCase())
//     );
//   }, [sortedThemes, searchQuery]);

//   // Maximum visible items before showing "more" indicator
//   const MAX_VISIBLE_ITEMS = 5;
//   const hasMoreItems = filteredThemes.length > MAX_VISIBLE_ITEMS;
//   const displayedThemes = filteredThemes.slice(0, MAX_VISIBLE_ITEMS);

//   // Handle keyboard navigation
//   const handleKeyDown = (e: React.KeyboardEvent) => {
//     if (!open) {
//       if (e.key === 'Enter' || e.key === ' ') {
//         e.preventDefault();
//         setOpen(true);
//       }
//       return;
//     }

//     switch (e.key) {
//       case 'Escape':
//         setOpen(false);
//         setSearchQuery('');
//         setHighlightedIndex(0);
//         break;
//       case 'ArrowDown':
//         e.preventDefault();
//         setHighlightedIndex(prev => 
//           prev < filteredThemes.length - 1 ? prev + 1 : prev
//         );
//         break;
//       case 'ArrowUp':
//         e.preventDefault();
//         setHighlightedIndex(prev => prev > 0 ? prev - 1 : prev);
//         break;
//       case 'Enter':
//         e.preventDefault();
//         if (filteredThemes[highlightedIndex]) {
//           setTheme(filteredThemes[highlightedIndex].id);
//           setOpen(false);
//           setSearchQuery('');
//           setHighlightedIndex(0);
//         }
//         break;
//     }
//   };

//   // Close dropdown when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
//         setOpen(false);
//         setSearchQuery('');
//         setHighlightedIndex(0);
//       }
//     };

//     if (open) {
//       document.addEventListener('mousedown', handleClickOutside);
//       return () => document.removeEventListener('mousedown', handleClickOutside);
//     }
//   }, [open]);

//   // Reset highlighted index when filtered themes change
//   useEffect(() => {
//     if (filteredThemes.length > 0) {
//       setHighlightedIndex(prev => {
//         if (prev >= filteredThemes.length) {
//           return 0;
//         }
//         return prev;
//       });
//     }
//   }, [filteredThemes.length]);

//   // Scroll highlighted item into view
//   useEffect(() => {
//     if (listRef.current && open) {
//       const highlightedElement = listRef.current.children[highlightedIndex] as HTMLElement;
//       if (highlightedElement) {
//         const container = listRef.current;
//         const elementTop = highlightedElement.offsetTop;
//         const elementBottom = elementTop + highlightedElement.offsetHeight;
//         const containerTop = container.scrollTop;
//         const containerBottom = containerTop + container.clientHeight;

//         if (elementTop < containerTop) {
//           container.scrollTop = elementTop;
//         } else if (elementBottom > containerBottom) {
//           container.scrollTop = elementBottom - container.clientHeight;
//         }
//       }
//     }
//   }, [highlightedIndex, open]);

//   const currentTheme = THEMES.find(t => t.id === theme);
//   const displayTheme = currentTheme?.name || 'Select Theme';

//   return (
//     <div ref={containerRef} className="relative">
//       <Button
//         variant="ghost"
//         size="sm"
//         className="gap-2"
//         onClick={() => {
//           setOpen(!open);
//           if (!open) {
//             setHighlightedIndex(0);
//           }
//         }}
//         onKeyDown={handleKeyDown}
//       >
//         <Palette className="h-4 w-4" />
//         <span className="max-w-32 truncate">{displayTheme}</span>
//         <ChevronDown className={cn("h-3 w-3 transition-transform", open && "rotate-180")} />
//       </Button>

//       {open && (
//         <div className="absolute top-full right-0 z-50 mt-1 w-72 bg-background border border-border rounded-md shadow-lg">
//           {/* Search Input */}
//           <div className="p-2 border-b border-border">
//             <div className="relative">
//               <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
//               <Input
//                 placeholder="Search themes..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 onKeyDown={handleKeyDown}
//                 className="pl-8 pr-8 h-9"
//                 autoFocus
//               />
//               {searchQuery && (
//                 <Button
//                   type="button"
//                   variant="ghost"
//                   size="sm"
//                   className="absolute right-0 top-0 h-full px-2"
//                   onClick={() => setSearchQuery('')}
//                 >
//                   <X className="h-3 w-3" />
//                 </Button>
//               )}
//             </div>
//           </div>
          
//           {/* Theme List */}
//           <div ref={listRef} className="max-h-60 overflow-auto">
//             {filteredThemes.length === 0 ? (
//               <div className="px-4 py-2 text-sm text-muted-foreground">
//                 No themes found
//               </div>
//             ) : (
//               <>
//                 {displayedThemes.map((themeOption, index) => (
//                   <div
//                     key={themeOption.id}
//                     className={cn(
//                       "cursor-pointer px-4 py-2 text-sm hover:bg-accent transition-colors flex items-center gap-2",
//                       index === highlightedIndex && "bg-accent",
//                       themeOption.id === theme && "bg-primary/10 text-primary font-medium"
//                     )}
//                     onClick={() => {
//                       setTheme(themeOption.id);
//                       setOpen(false);
//                       setSearchQuery('');
//                       setHighlightedIndex(0);
//                     }}
//                     onMouseEnter={() => setHighlightedIndex(index)}
//                   >
//                     <Palette className="h-4 w-4" />
//                     {themeOption.name}
//                   </div>
//                 ))}
                
//                 {/* More items indicator */}
//                 {hasMoreItems && !searchQuery && (
//                   <div className="px-4 py-2 text-sm text-muted-foreground border-t border-border flex items-center gap-2">
//                     <MoreHorizontal className="h-4 w-4" />
//                     <span>+{filteredThemes.length - MAX_VISIBLE_ITEMS} more themes</span>
//                     <span className="text-xs">(type to search)</span>
//                   </div>
//                 )}
//               </>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
