'use client';

import { Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function GithubButton() {
  const handleClick = () => {
    window.open('https://github.com/jessepinkman9900/hummingbot-dashboard', '_blank');
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClick}
            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
            aria-label="View on GitHub"
          >
            <Github className="h-3 w-3" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          <div>
            <p className="font-semibold">View on GitHub</p>
            <p className="text-muted-foreground">Visit the repository</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
