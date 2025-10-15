'use client';

import { Lock, LockOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';

export function ReadOnlyToggle() {
  const { readOnlyMode, toggleReadOnlyMode } = useAppStore();

  const handleToggle = () => {
    const newMode = !readOnlyMode;
    toggleReadOnlyMode();

    if (newMode) {
      toast.warning('Read-Only Mode Enabled', {
        description: 'Only GET requests are allowed. Data modifications are blocked.',
      });
    } else {
      toast.success('Read-Only Mode Disabled', {
        description: 'All operations are now allowed.',
      });
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggle}
            className={`h-6 px-2 text-xs ${
              readOnlyMode
                ? 'text-yellow-600 dark:text-yellow-500 hover:text-yellow-700 dark:hover:text-yellow-400'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            aria-label={readOnlyMode ? 'Disable read-only mode' : 'Enable read-only mode'}
          >
            {readOnlyMode ? (
              <Lock className="h-3 w-3" />
            ) : (
              <LockOpen className="h-3 w-3" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          {readOnlyMode ? (
            <div>
              <p className="font-semibold">Read-Only Mode: ON</p>
              <p className="text-muted-foreground">Only GET requests allowed</p>
              <p className="text-muted-foreground">Click to unlock</p>
            </div>
          ) : (
            <div>
              <p className="font-semibold">Read-Only Mode: OFF</p>
              <p className="text-muted-foreground">All operations allowed</p>
              <p className="text-muted-foreground">Click to lock</p>
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
