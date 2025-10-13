'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { scriptsApi } from '@/lib/api/scripts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  ArrowLeft,
  Save,
  Download,
  FileText,
  Code,
  AlertCircle,
  CheckCircle,
  Clock,
  GitCompare,
  Edit3
} from 'lucide-react';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

// Dynamically import Monaco Editor and Diff Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-muted/20">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-muted-foreground">Loading editor...</p>
      </div>
    </div>
  ),
});

const MonacoDiffEditor = dynamic(() => 
  import('@monaco-editor/react').then(mod => ({ default: mod.DiffEditor })), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-muted/20">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-muted-foreground">Loading diff editor...</p>
      </div>
    </div>
  ),
});

interface ScriptEditorProps {
  scriptName: string;
  onBack: () => void;
}
export function ScriptEditor({ scriptName, onBack }: ScriptEditorProps) {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState(''); // Store original content for diff
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'edit' | 'diff'>('edit'); // Toggle between editor and diff view
  const [monacoEditor, setMonacoEditor] = useState<any>(null); // Store Monaco editor instance
  const [editableScriptName, setEditableScriptName] = useState(() => {
    if (scriptName.startsWith('new_script_')) {
      return 'my_strategy'; // Default name without .py
    }
    // Remove .py extension from existing script names
    return scriptName.endsWith('.py') ? scriptName.slice(0, -3) : scriptName;
  });
  const [isEditingName, setIsEditingName] = useState(false);
  const queryClient = useQueryClient();

  // Check if this is a new script (doesn't exist yet)
  const isNewScript = scriptName.startsWith('new_script_');

  const { 
    data: scriptResponse, 
    isLoading,
    error,
    refetch 
  } = useQuery({
    queryKey: ['script', scriptName],
    queryFn: () => scriptsApi.getScript(scriptName),
    enabled: !isNewScript, // Don't fetch for new scripts
    retry: (failureCount, error: any) => {
      // Don't retry on 404 for new scripts
      if (error?.status === 404 && isNewScript) return false;
      return failureCount < 3;
    },
  });

  const saveMutation = useMutation({
    mutationFn: ({ name, content }: { name: string; content: string }) =>
      scriptsApi.createOrUpdateScript(name, content),
    onSuccess: () => {
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      setOriginalContent(content); // Update original content after successful save
      toast.success('Script saved successfully');
      // Invalidate the scripts list to refresh it
      queryClient.invalidateQueries({ queryKey: ['scripts'] });
    },
    onError: (error: any) => {
      toast.error(`Failed to save script: ${error?.message || 'Unknown error'}`);
    },
  });

  // Initialize content for existing or new scripts
  useEffect(() => {
    if (isNewScript) {
      // Set default content for new Python scripts
      const defaultContent = `"""
Hummingbot Strategy Template

This is a template for creating custom Hummingbot strategies using the v2 framework.
Replace this with your own trading logic.

Author: Your Name
Created: ${new Date().toISOString().split('T')[0]}
"""

import os
from decimal import Decimal
from typing import Dict, List, Optional, Set

from hummingbot.client.hummingbot_application import HummingbotApplication
from hummingbot.connector.connector_base import ConnectorBase
from hummingbot.data_feed.candles_feed.data_types import CandlesConfig
from hummingbot.strategy.strategy_v2_base import StrategyV2Base, StrategyV2ConfigBase
from hummingbot.strategy_v2.models.base import RunnableStatus
from hummingbot.strategy_v2.models.executor_actions import CreateExecutorAction, StopExecutorAction


class MyStrategyConfig(StrategyV2ConfigBase):
    """
    Configuration class for the strategy.
    Add your configuration parameters here.
    """
    script_file_name: str = os.path.basename(__file__)
    
    # Market configuration
    markets: Dict[str, Set[str]] = {
        "binance_paper_trade": {"BTC-USDT", "ETH-USDT"}
    }
    
    # Candles configuration for market data
    candles_config: List[CandlesConfig] = []
    
    # Risk management
    max_global_drawdown_quote: Optional[float] = 1000.0  # Max loss in USDT
    max_controller_drawdown_quote: Optional[float] = 500.0  # Max loss per controller


class MyStrategy(StrategyV2Base):
    """
    A custom strategy template for Hummingbot v2.
    
    This strategy demonstrates the basic structure and key methods
    you need to implement for a trading strategy.
    """
    
    def __init__(self, connectors: Dict[str, ConnectorBase]):
        super().__init__(connectors)
        self.trade_count = 0
        
    def on_tick(self):
        """
        Called on every tick. Implement your main trading logic here.
        
        This method is called periodically and is where you should:
        - Analyze market conditions
        - Make trading decisions
        - Create or manage orders
        """
        # Example: Log current status every 100 ticks
        self.trade_count += 1
        if self.trade_count % 100 == 0:
            self.logger().info(f"Strategy running - tick #{self.trade_count}")
            
        # TODO: Add your trading logic here
        # Example: Check market conditions and place orders
        # self._check_market_conditions()
        # self._manage_positions()
        
    def format_status(self) -> str:
        """
        Returns a formatted string with the strategy status.
        This will be displayed in the Hummingbot status output.
        """
        lines = []
        lines.append("\\n  Strategy Status:")
        lines.append(f"    Trades executed: {self.trade_count}")
        lines.append(f"    Active orders: {len(self.get_active_orders())}")
        
        # Add market data if available
        for connector_name, connector in self.connectors.items():
            if hasattr(connector, 'get_price'):
                for market in self.config.markets.get(connector_name, []):
                    try:
                        price = connector.get_price(market, True)
                        lines.append(f"    {market} price: {price:.6f}")
                    except Exception:
                        lines.append(f"    {market} price: N/A")
        
        return "\\n".join(lines)
    
    def get_active_orders(self) -> List:
        """
        Returns a list of currently active orders.
        """
        active_orders = []
        for connector in self.connectors.values():
            if hasattr(connector, 'in_flight_orders'):
                active_orders.extend(connector.in_flight_orders.values())
        return active_orders
    
    def _check_market_conditions(self):
        """
        Analyze market conditions to determine trading opportunities.
        
        TODO: Implement your market analysis logic here.
        Examples:
        - Check price movements
        - Analyze order book depth  
        - Calculate technical indicators
        - Check volume patterns
        """
        pass
    
    def _manage_positions(self):
        """
        Manage existing positions and orders.
        
        TODO: Implement your position management logic here.
        Examples:
        - Check stop losses
        - Take profits
        - Rebalance positions
        - Cancel old orders
        """
        pass

# Example configuration instance
# You can modify these values or load them from a config file
config = MyStrategyConfig()
`;
      setContent(defaultContent);
      setOriginalContent(defaultContent); // Set original content for new scripts
    } else if (scriptResponse?.data) {
      const scriptContent = scriptResponse.data.content || '';
      setContent(scriptContent);
      setOriginalContent(scriptContent); // Store the original content from API
    }
  }, [scriptResponse, isNewScript]);

  const handleContentChange = useCallback((newContent: string | undefined) => {
    if (newContent !== undefined && newContent !== content) {
      setContent(newContent);
      setHasUnsavedChanges(true);
    }
  }, [content]);

  const handleSave = useCallback(async () => {
    try {
      // Use the editable script name for new scripts (without .py), original for existing ones
      const nameToSave = isNewScript ? editableScriptName : scriptName;
      await saveMutation.mutateAsync({ name: nameToSave, content });
    } catch {
      // Error handled in mutation
    }
  }, [saveMutation, scriptName, editableScriptName, content, isNewScript]);

  const handleNameEdit = () => {
    if (isNewScript) {
      setIsEditingName(true);
    }
  };

  const handleNameSave = () => {
    setIsEditingName(false);
    // Sanitize the name (remove invalid characters, but don't add .py since it's shown separately)
    let sanitizedName = editableScriptName.trim();
    // Remove invalid filename characters
    sanitizedName = sanitizedName.replace(/[<>:"/\\|?*]/g, '_');
    // Remove .py if user typed it (since we show it separately)
    if (sanitizedName.endsWith('.py')) {
      sanitizedName = sanitizedName.slice(0, -3);
    }
    setEditableScriptName(sanitizedName);
  };

  const handleNameCancel = () => {
    setIsEditingName(false);
    setEditableScriptName(scriptName);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSave();
    } else if (e.key === 'Escape') {
      handleNameCancel();
    }
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${scriptName}.py`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Script downloaded');
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === 'edit' ? 'diff' : 'edit');
  };

  const hasChangesToShow = content !== originalContent;

  // Function to calculate diff and apply decorations using Monaco's built-in diff computation
  const applyDiffDecorations = useCallback((editor: any) => {
    if (!editor || !originalContent || !content || originalContent === content) {
      // Clear decorations if no changes
      editor.deltaDecorations([], []);
      return;
    }

    const monaco = (window as any).monaco;
    if (!monaco || !monaco.editor.computeDiff) {
      console.warn('Monaco diff computation not available');
      return;
    }

    try {
      // Use Monaco's built-in diff computation
      const originalModel = monaco.editor.createModel(originalContent, 'python');
      const modifiedModel = monaco.editor.createModel(content, 'python');

      // Compute the diff
      const diffResult = monaco.editor.computeDiff(originalModel, modifiedModel);
      const decorations: any[] = [];

      if (diffResult && diffResult.changes) {
        diffResult.changes.forEach((change: any) => {
          const { originalStartLineNumber, originalEndLineNumber, modifiedStartLineNumber, modifiedEndLineNumber } = change;

          // Handle different types of changes
          if (originalStartLineNumber === 0) {
            // Pure insertion - lines were added
            for (let line = modifiedStartLineNumber; line <= modifiedEndLineNumber; line++) {
              decorations.push({
                range: new monaco.Range(line, 1, line, 1),
                options: {
                  isWholeLine: true,
                  className: 'git-diff-added-line',
                  linesDecorationsClassName: 'git-diff-added-gutter',
                  glyphMarginClassName: 'git-diff-added-glyph',
                  overviewRuler: {
                    color: '#28a745',
                    position: monaco.editor.OverviewRulerLane.Full
                  }
                }
              });
            }
          } else if (modifiedStartLineNumber === 0) {
            // Pure deletion - show deleted lines with special styling
            // For deletions, we need to show them at the position where they would appear
            // We'll insert them at the closest available line position
            const insertPosition = originalStartLineNumber;
            for (let i = 0; i < (originalEndLineNumber - originalStartLineNumber + 1); i++) {
              decorations.push({
                range: new monaco.Range(insertPosition + i, 1, insertPosition + i, 1),
                options: {
                  isWholeLine: true,
                  className: 'git-diff-deleted-line',
                  linesDecorationsClassName: 'git-diff-deleted-gutter',
                  glyphMarginClassName: 'git-diff-deleted-glyph',
                  overviewRuler: {
                    color: '#dc3545',
                    position: monaco.editor.OverviewRulerLane.Full
                  }
                }
              });
            }
          } else {
            // Modification - lines were changed
            for (let line = modifiedStartLineNumber; line <= modifiedEndLineNumber; line++) {
              decorations.push({
                range: new monaco.Range(line, 1, line, 1),
                options: {
                  isWholeLine: true,
                  className: 'git-diff-modified-line',
                  linesDecorationsClassName: 'git-diff-modified-gutter',
                  glyphMarginClassName: 'git-diff-modified-glyph',
                  overviewRuler: {
                    color: '#ffc107',
                    position: monaco.editor.OverviewRulerLane.Full
                  }
                }
              });
            }
          }
        });
      }

      // Clean up temporary models
      originalModel.dispose();
      modifiedModel.dispose();

      // Apply decorations
      editor.deltaDecorations([], decorations);
    } catch (error) {
      console.error('Monaco diff computation failed:', error);
    }
  }, [originalContent, content]);

  // Update decorations when content changes
  useEffect(() => {
    if (monacoEditor && viewMode === 'edit') {
      applyDiffDecorations(monacoEditor);
    }
  }, [monacoEditor, content, originalContent, viewMode, applyDiffDecorations]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  const getLanguage = () => {
    if (scriptName.endsWith('.py')) return 'python';
    if (scriptName.endsWith('.yml') || scriptName.endsWith('.yaml')) return 'yaml';
    if (scriptName.endsWith('.json')) return 'json';
    return 'python'; // Default to Python
  };

  const getFileIcon = () => {
    if (scriptName.endsWith('.py')) {
      return <Code className="h-5 w-5 text-blue-500" />;
    }
    return <FileText className="h-5 w-5 text-gray-500" />;
  };

  if (error && !isNewScript) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-8 space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Failed to Load Script
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Could not load the script &quot;{scriptName}&quot;. It may not exist or there was a connection error.
          </p>
          <div className="flex space-x-2">
            <Button onClick={onBack} variant="outline">
              Back to Scripts
            </Button>
            <Button onClick={() => refetch()} variant="default">
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col h-full">
      <div className="flex items-center gap-4 mb-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        {/* <div className="space-y-1">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Plug className="h-8 w-8" />
            {connectorName}
          </h1>
          <p className="text-muted-foreground">
            Connector configuration and trading rules
          </p>
        </div> */}
      </div>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            {getFileIcon()}
            <div>
              <h2 className="text-lg font-semibold text-foreground flex items-center space-x-2">
                {isNewScript && isEditingName ? (
                  <div className="flex items-center">
                    <Input
                      value={editableScriptName}
                      onChange={(e) => setEditableScriptName(e.target.value)}
                      onBlur={handleNameSave}
                      onKeyDown={handleNameKeyDown}
                      className="h-7 text-lg font-semibold bg-transparent border-dashed pr-0 rounded-r-none border-r-0"
                      placeholder="Enter script name..."
                      autoFocus
                    />
                    <span className="h-7 px-2 bg-muted border border-l-0 border-dashed rounded-r-md text-lg font-semibold text-muted-foreground flex items-center">
                      .py
                    </span>
                  </div>
                ) : (
                  <span 
                    className={isNewScript ? "cursor-pointer hover:text-primary" : ""}
                    onClick={handleNameEdit}
                    title={isNewScript ? "Click to edit name" : ""}
                  >
                    {isNewScript ? `${editableScriptName}.py` : scriptName}
                  </span>
                )}
                {isNewScript && (
                  <Badge variant="secondary" className="text-xs">
                    New
                  </Badge>
                )}
                {hasChangesToShow && !isNewScript && (
                  <Badge variant="outline" className="text-xs border-orange-400 text-orange-600">
                    Modified
                  </Badge>
                )}
              </h2>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                {hasUnsavedChanges ? (
                  <span className="flex items-center space-x-1 text-orange-600">
                    <Clock className="h-3 w-3" />
                    <span>Unsaved changes</span>
                  </span>
                ) : lastSaved ? (
                  <span className="flex items-center space-x-1 text-green-600">
                    <CheckCircle className="h-3 w-3" />
                    <span>Saved {lastSaved.toLocaleTimeString()}</span>
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={toggleViewMode}
                  variant={viewMode === 'diff' ? 'default' : 'ghost'}
                  size="sm"
                  disabled={!hasChangesToShow}
                  className="flex items-center space-x-2"
                >
                  {viewMode === 'diff' ? (
                    <>
                      <Edit3 className="h-4 w-4" />
                      <span>Edit</span>
                    </>
                  ) : (
                    <>
                      <GitCompare className="h-4 w-4" />
                      <span>Diff</span>
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {viewMode === 'diff' 
                  ? 'Switch to edit mode' 
                  : hasChangesToShow 
                    ? 'View changes inline (like VSCode)'
                    : 'No changes to show in diff view'
                }
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div className="w-px h-4 bg-border" />
          <Button onClick={handleDownload} variant="ghost" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={saveMutation.isPending || (!hasUnsavedChanges && !isNewScript)}
            size="sm"
          >
            {saveMutation.isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 relative">
        {isLoading && !isNewScript ? (
          <div className="absolute inset-0 bg-muted/20 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-muted-foreground">Loading script...</p>
            </div>
          </div>
        ) : viewMode === 'diff' ? (
          // Diff Editor View
          <div className="h-full flex flex-col">
            <div className="bg-muted/30 px-4 py-2 border-b border-border flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <span className="text-muted-foreground">Removed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span className="text-muted-foreground">Added</span>
                </div>
                <div className="text-muted-foreground">•</div>
                <span className="text-muted-foreground">Inline diff view</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {hasChangesToShow ? 'Changes detected' : 'No changes'}
              </div>
            </div>
            <div className="flex-1">
              <MonacoDiffEditor
                height="100%"
                language={getLanguage()}
                theme="vs-dark"
                original={originalContent}
                modified={content}
                options={{
                  readOnly: false,
                  minimap: { enabled: true },
                  fontSize: 14,
                  lineNumbers: 'on',
                  roundedSelection: false,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  wordWrap: 'on',
                  folding: true,
                  renderSideBySide: false, // Inline diff view
                  ignoreTrimWhitespace: false,
                  renderWhitespace: 'selection',
                  diffCodeLens: true,
                  diffWordWrap: 'on',
                  renderIndicators: true,
                  originalEditable: false,
                  enableSplitViewResizing: false,
                  renderOverviewRuler: true,
                  maxComputationTime: 5000,
                  diffAlgorithm: 'advanced', // Use advanced diff algorithm
                }}
                onMount={(editor) => {
                  // Enable editing on the modified side
                  const modifiedEditor = editor.getModifiedEditor();
                  modifiedEditor.onDidChangeModelContent(() => {
                    const newContent = modifiedEditor.getValue();
                    if (newContent !== content) {
                      setContent(newContent);
                      setHasUnsavedChanges(newContent !== originalContent);
                    }
                  });
                  
                  // Store reference for potential future use
                  setMonacoEditor(modifiedEditor);
                }}
              />
            </div>
          </div>
        ) : (
          // Regular Editor View
          <MonacoEditor
            height="100%"
            language={getLanguage()}
            theme="vs-dark"
            value={content}
            onChange={handleContentChange}
            options={{
              minimap: { enabled: true },
              fontSize: 14,
              lineNumbers: 'on',
              roundedSelection: false,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              wordWrap: 'on',
              folding: true,
              renderLineHighlight: 'all',
              suggestOnTriggerCharacters: true,
              acceptSuggestionOnEnter: 'on',
              tabSize: 4,
              insertSpaces: true,
              detectIndentation: false,
              renderWhitespace: 'selection',
              rulers: [80, 120],
              glyphMargin: true, // Enable glyph margin for diff indicators
              showFoldingControls: 'always',
            }}
            onMount={(editor) => {
              setMonacoEditor(editor);
              
              // Set up change listener for real-time diff updates
              editor.onDidChangeModelContent(() => {
                // Debounce the diff calculation to avoid excessive computation
                setTimeout(() => {
                  if (hasChangesToShow) {
                    applyDiffDecorations(editor);
                  }
                }, 100);
              });
              
              // Apply initial diff decorations
              if (hasChangesToShow) {
                applyDiffDecorations(editor);
              }
            }}
          />
        )}
      </div>

      {/* Status Bar */}
      <div className="border-t border-border bg-card px-6 py-2 flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center space-x-4">
          <span>{getLanguage().toUpperCase()}</span>
          <span>•</span>
          <span>UTF-8</span>
          <span>•</span>
          <span>{content.split('\n').length} lines</span>
          {viewMode === 'diff' && (
            <>
              <span>•</span>
              <span className="flex items-center space-x-2">
                <GitCompare className="h-3 w-3" />
                <span>
                  {hasChangesToShow 
                    ? 'Showing inline changes' 
                    : 'No changes to display'
                  }
                </span>
              </span>
            </>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {viewMode === 'edit' && hasUnsavedChanges && (
            <span className="text-orange-600">Press Ctrl+S to save</span>
          )}
          {viewMode === 'diff' && hasChangesToShow && (
            <span className="text-blue-600">
              Switch to Edit mode to modify the script
            </span>
          )}
        </div>
      </div>
    </div>
  );
}