'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { scriptsApi } from '@/lib/api/scripts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  FileText,
  Search,
  Plus,
  FolderOpen,
  AlertCircle,
  Code,
  Filter,
  Edit,
  Settings,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';

interface ScriptFileViewerProps {
  onScriptSelect: (scriptName: string) => void;
}

export function ScriptFileViewer({ onScriptSelect }: ScriptFileViewerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'python' | 'config'>('all');

  const { 
    data: scriptsResponse, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['scripts'],
    queryFn: () => scriptsApi.listScripts(),
    retry: 1,
    retryDelay: 1000,
    // Provide default data in case of connection error
    placeholderData: { 
      data: [], 
      status: 200, 
      message: 'Success', 
      timestamp: new Date() 
    },
  });

  const scripts = scriptsResponse?.data || [];

  const filteredScripts = scripts.filter(script => {
    const matchesSearch = script.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || 
      (filterType === 'python' && script.endsWith('.py')) ||
      (filterType === 'config' && script.endsWith('.yml'));
    return matchesSearch && matchesFilter;
  });

  const handleScriptEdit = (scriptName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onScriptSelect(scriptName);
  };

  const handleConfigEdit = (scriptName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement config editing functionality
    toast.info(`Edit configuration for ${scriptName}`);
  };

  const handleScriptDelete = (scriptName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement delete functionality with confirmation
    toast.info(`Delete ${scriptName}`);
  };

  const handleCreateNew = () => {
    // For now, create a new script with a default name
    const newScriptName = `new_script_${Date.now()}`;
    onScriptSelect(newScriptName);
  };

  const getScriptIcon = (filename: string) => {
    if (filename.endsWith('.py')) {
      return <Code className="h-4 w-4 text-blue-500" />;
    }
    if (filename.endsWith('.yml') || filename.endsWith('.yaml')) {
      return <FileText className="h-4 w-4 text-green-500" />;
    }
    return <FileText className="h-4 w-4 text-gray-500" />;
  };

  const getScriptBadge = (filename: string) => {
    if (filename.endsWith('.py')) {
      return <Badge variant="secondary" className="text-xs">Python</Badge>;
    }
    if (filename.endsWith('.yml') || filename.endsWith('.yaml')) {
      return <Badge variant="outline" className="text-xs">Config</Badge>;
    }
    return null;
  };

  if (error) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-8 space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Cannot Connect to Hummingbot API
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Make sure the Hummingbot API is running on localhost:8000 and try again.
            <br />You can still create and edit scripts locally.
          </p>
          <div className="flex space-x-2">
            <Button onClick={() => refetch()} variant="outline">
              Retry Connection
            </Button>
            <Button onClick={handleCreateNew} variant="default">
              Create New Script
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col h-full">
      {/* Header with Search and Actions */}
      <div className="p-6 border-b border-border bg-card/50">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FolderOpen className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium text-foreground">Scripts Directory</span>
              <Badge variant="secondary" className="text-xs">
                {filteredScripts.length} files
              </Badge>
            </div>
            <Button onClick={handleCreateNew} size="sm" className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>New Script</span>
            </Button>
          </div>

          {/* Search and Filter */}
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search scripts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as typeof filterType)}
                className="px-3 py-2 rounded-md border border-border bg-background text-sm"
              >
                <option value="all">All Files</option>
                <option value="python">Python Scripts</option>
                <option value="config">Config Files</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Scripts List */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="p-6">
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between py-3 px-4 border-b border-border">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : filteredScripts.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {searchQuery ? 'No matching scripts found' : 'No scripts available'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery 
                ? 'Try adjusting your search terms or filters'
                : 'Create your first bot script to get started'
              }
            </p>
            {!searchQuery && (
              <Button onClick={handleCreateNew} variant="default">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Script
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredScripts.map((script) => (
              <div
                key={script}
                className="flex items-center justify-between py-3 px-6 hover:bg-muted/50 transition-colors group cursor-pointer"
                onClick={() => onScriptSelect(script)}
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {getScriptIcon(script)}
                  <span className="text-sm font-medium text-foreground truncate">
                    {script.endsWith('.py') ? script : `${script}.py`}
                  </span>
                  {getScriptBadge(script)}
                </div>
                
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => handleScriptEdit(script, e)}
                    className="h-8 w-8 p-0 hover:bg-primary/10"
                    title="Edit file"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => handleConfigEdit(script, e)}
                    className="h-8 w-8 p-0 hover:bg-blue-500/10"
                    title="Edit configuration"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => handleScriptDelete(script, e)}
                    className="h-8 w-8 p-0 hover:bg-destructive/10 text-destructive"
                    title="Delete script"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}