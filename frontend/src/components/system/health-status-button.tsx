'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Activity, Plus, Trash2, ExternalLink, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import { storeBasicAuthCredentials } from '@/lib/api/client';

interface HealthUrl {
  id: string;
  name: string;
  url: string;
  status: 'healthy' | 'warning' | 'error' | 'checking';
  lastChecked?: Date;
  responseTime?: number;
  username?: string;
  password?: string;
}

interface HealthStatusButtonProps {
  className?: string;
}

export function HealthStatusButton({ className }: HealthStatusButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAddingUrl, setIsAddingUrl] = useState(false);
  const [editingUrlId, setEditingUrlId] = useState<string | null>(null);
  const [newUrl, setNewUrl] = useState({ name: '', url: '', username: '', password: '' });
  const [editUrl, setEditUrl] = useState({ name: '', url: '', username: '', password: '' });

  // Initialize URLs - start with default to avoid hydration mismatch
  const [urls, setUrls] = useState<HealthUrl[]>([
    {
      id: '1',
      name: 'Hummingbot API',
      url: 'http://localhost:8000/',
      status: 'error' as const,
      lastChecked: undefined,
      responseTime: undefined,
      username: 'admin',
      password: 'admin',
    }
  ]);

  // Initialize selected URL - start with default to avoid hydration mismatch
  const [selectedUrlId, setSelectedUrlId] = useState<string>('1');

  const selectedUrl = urls.find(url => url.id === selectedUrlId);
  const currentStatus = selectedUrl?.status || 'error';

  // Load data from localStorage after component mounts to avoid hydration issues
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedUrls = localStorage.getItem('healthMonitorUrls');
        const savedSelectedId = localStorage.getItem('healthMonitorSelectedUrl');
        
        if (savedUrls) {
          const parsedUrls = JSON.parse(savedUrls);
          // Convert date strings back to Date objects
          const urlsWithDates = parsedUrls.map((url: any) => ({
            ...url,
            lastChecked: url.lastChecked ? new Date(url.lastChecked) : undefined,
          }));
          setUrls(urlsWithDates);
        } else {
          // Save default URLs if none exist
          localStorage.setItem('healthMonitorUrls', JSON.stringify(urls));
        }
        
        if (savedSelectedId) {
          setSelectedUrlId(savedSelectedId);
        } else {
          localStorage.setItem('healthMonitorSelectedUrl', selectedUrlId);
        }
        
        // Store default admin credentials if no data exists
        if (!savedUrls || !savedSelectedId) {
          storeBasicAuthCredentials('admin', 'admin');
          console.log('[HealthStatus] Stored default admin credentials');
        }
      } catch (error) {
        console.warn('Failed to load health URLs from localStorage:', error);
      }
    }
  }, []); // Run only once on mount

  // Save URLs to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('healthMonitorUrls', JSON.stringify(urls));
      } catch (error) {
        console.warn('Failed to save health URLs to localStorage:', error);
      }
    }
  }, [urls]);

  // Save selected URL to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('healthMonitorSelectedUrl', selectedUrlId);
        
        // Also store credentials of the selected URL separately
        const selectedUrl = urls.find(url => url.id === selectedUrlId);
        if (selectedUrl?.username && selectedUrl?.password) {
          storeBasicAuthCredentials(selectedUrl.username, selectedUrl.password);
        }
      } catch (error) {
        console.warn('Failed to save selected URL to localStorage:', error);
      }
    }
  }, [selectedUrlId, urls]);

  // Ensure selectedUrlId is valid when URLs change
  useEffect(() => {
    if (urls.length > 0 && !urls.find(url => url.id === selectedUrlId)) {
      setSelectedUrlId(urls[0].id);
    }
  }, [urls, selectedUrlId]);

  // Health check function
  const checkHealth = async (url: HealthUrl): Promise<HealthUrl> => {
    const startTime = Date.now();
    
    try {
      // Update status to checking
      setUrls(prev => prev.map(u => 
        u.id === url.id ? { ...u, status: 'checking' as const } : u
      ));

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const headers: Record<string, string> = {
        'Accept': 'application/json',
      };

      // Add Basic Auth if credentials are provided
      if (url.username && url.password) {
        const credentials = btoa(`${url.username}:${url.password}`);
        headers.Authorization = `Basic ${credentials}`;
      }

      const response = await fetch(url.url, {
        method: 'GET',
        signal: controller.signal,
        headers,
      });

      clearTimeout(timeoutId);

      const responseTime = Date.now() - startTime;
      
      // Determine status based on response
      let status: 'healthy' | 'warning' | 'error';
      
      if (response.ok) {
        // Check if response time is reasonable (less than 2 seconds)
        status = responseTime < 2000 ? 'healthy' : 'warning';
      } else {
        // HTTP error codes (4xx, 5xx)
        status = response.status >= 500 ? 'error' : 'warning';
      }

      return {
        ...url,
        status,
        lastChecked: new Date(),
        responseTime,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      // Log error for debugging
      console.warn(`Health check failed for ${url.name} (${url.url}):`, error);
      
      return {
        ...url,
        status: 'error',
        lastChecked: new Date(),
        responseTime,
      };
    }
  };

  // Check health for selected URL
  const handleHealthCheck = async () => {
    if (!selectedUrl) return;

    try {
      const updatedUrl = await checkHealth(selectedUrl);
      setUrls(prev => prev.map(url => 
        url.id === selectedUrl.id ? updatedUrl : url
      ));
      
      // Provide specific feedback based on result
      const responseTimeText = updatedUrl.responseTime ? ` (${updatedUrl.responseTime}ms)` : '';
      
      switch (updatedUrl.status) {
        case 'healthy':
          toast.success(`✅ ${selectedUrl.name} is healthy${responseTimeText}`);
          break;
        case 'warning':
          toast(`⚠️ ${selectedUrl.name} responded but may have issues${responseTimeText}`);
          break;
        case 'error':
          toast.error(`❌ ${selectedUrl.name} is not responding${responseTimeText}`);
          break;
      }
    } catch (error) {
      toast.error(`Health check failed for ${selectedUrl.name}`);
    }
  };

  // Add new URL
  const handleAddUrl = () => {
    if (!newUrl.name.trim() || !newUrl.url.trim()) {
      toast.error('Please provide both name and URL');
      return;
    }

    const newHealthUrl: HealthUrl = {
      id: Date.now().toString(),
      name: newUrl.name.trim(),
      url: newUrl.url.trim(),
      status: 'error', // Default to error until first check
      username: newUrl.username.trim(),
      password: newUrl.password.trim(),
    };

    setUrls(prev => [...prev, newHealthUrl]);
    setSelectedUrlId(newHealthUrl.id);
    
    // Store credentials separately in localStorage if provided
    if (newUrl.username.trim() && newUrl.password.trim()) {
      storeBasicAuthCredentials(newUrl.username.trim(), newUrl.password.trim());
    }
    
    setNewUrl({ name: '', url: '', username: '', password: '' });
    setIsAddingUrl(false);
    toast.success('URL added successfully');
  };

  // Start editing URL
  const handleStartEdit = (url: HealthUrl) => {
    setEditingUrlId(url.id);
    setEditUrl({ 
      name: url.name, 
      url: url.url,
      username: url.username || '',
      password: url.password || ''
    });
    setIsAddingUrl(false);
  };

  // Save edited URL
  const handleSaveEdit = () => {
    if (!editUrl.name.trim() || !editUrl.url.trim()) {
      toast.error('Please provide both name and URL');
      return;
    }

    setUrls(prev => prev.map(url => 
      url.id === editingUrlId 
        ? { 
            ...url, 
            name: editUrl.name.trim(), 
            url: editUrl.url.trim(), 
            username: editUrl.username.trim(),
            password: editUrl.password.trim(),
            status: 'error' as const 
          }
        : url
    ));
    
    // Store credentials separately in localStorage if provided
    if (editUrl.username.trim() && editUrl.password.trim()) {
      storeBasicAuthCredentials(editUrl.username.trim(), editUrl.password.trim());
    }
    
    setEditingUrlId(null);
    setEditUrl({ name: '', url: '', username: '', password: '' });
    toast.success('URL updated successfully');
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingUrlId(null);
    setEditUrl({ name: '', url: '', username: '', password: '' });
  };

  // Remove URL
  const handleRemoveUrl = (urlId: string) => {
    setUrls(prev => prev.filter(url => url.id !== urlId));
    if (selectedUrlId === urlId) {
      const remainingUrls = urls.filter(url => url.id !== urlId);
      setSelectedUrlId(remainingUrls[0]?.id || '');
    }
    toast.success('URL removed');
  };

  // Clear all localStorage data (for debugging/reset)
  const handleClearStorage = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('healthMonitorUrls');
      localStorage.removeItem('healthMonitorSelectedUrl');
      console.log('[HealthStatus] Cleared localStorage, reloading...');
      window.location.reload();
    }
  };

  // Reset to default configuration
  const handleResetToDefaults = () => {
    const defaultUrls: HealthUrl[] = [
      {
        id: '1',
        name: 'Hummingbot API',
        url: 'http://localhost:8000/health',
        status: 'error' as const,
        lastChecked: undefined,
        responseTime: undefined,
        username: 'admin',
        password: 'admin',
      }
    ];
    
    setUrls(defaultUrls);
    setSelectedUrlId('1');
    console.log('[HealthStatus] Reset to default configuration');
    toast.success('Reset to default configuration');
  };

  // Auto-check health every 10 seconds for selected URL
  useEffect(() => {
    if (!selectedUrl) return;

    // Check immediately when URL is selected
    checkHealth(selectedUrl).then(updatedUrl => {
      setUrls(prev => prev.map(url => 
        url.id === selectedUrl.id ? updatedUrl : url
      ));
    });

    // Then check every 10 seconds
    const interval = setInterval(() => {
      checkHealth(selectedUrl).then(updatedUrl => {
        setUrls(prev => prev.map(url => 
          url.id === selectedUrl.id ? updatedUrl : url
        ));
      });
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [selectedUrlId]);

  // Get badge variant based on status
  const getBadgeVariant = (status: HealthUrl['status']) => {
    switch (status) {
      case 'healthy': return 'default';
      case 'warning': return 'secondary';
      case 'error': return 'destructive';
      case 'checking': return 'outline';
      default: return 'outline';
    }
  };

  // Get badge color classes based on status
  const getBadgeClasses = (status: HealthUrl['status']) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200';
      case 'warning': return 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200';
      case 'checking': return 'bg-blue-100 text-blue-800 border-blue-200 animate-pulse';
      default: return '';
    }
  };

  // Get status text
  const getStatusText = (status: HealthUrl['status']) => {
    switch (status) {
      case 'healthy': return 'Healthy';
      case 'warning': return 'Warning';
      case 'error': return 'Error';
      case 'checking': return 'Checking...';
      default: return 'Unknown';
    }
  };

  return (
    <>
      <Badge 
        variant={getBadgeVariant(currentStatus)}
        className={`cursor-pointer transition-colors ${getBadgeClasses(currentStatus)} ${className}`}
        onClick={() => setIsOpen(true)}
      >
        <Activity className="h-3 w-3 mr-1" />
        {getStatusText(currentStatus)}
      </Badge>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>System Health Monitor</DialogTitle>
            <DialogDescription>
              Monitor and manage health check URLs for your services
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* URL Selection */}
            <div className="space-y-2">
              <Label htmlFor="url-select">Select URL to monitor</Label>
              <div className="flex gap-2">
                <Select value={selectedUrlId} onValueChange={setSelectedUrlId}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a URL to monitor" />
                  </SelectTrigger>
                  <SelectContent>
                    {urls.map((url) => (
                      <SelectItem key={url.id} value={url.id}>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            url.status === 'healthy' ? 'bg-green-500' :
                            url.status === 'warning' ? 'bg-amber-500' :
                            url.status === 'checking' ? 'bg-blue-500' :
                            'bg-red-500'
                          }`} />
                          {url.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsAddingUrl(true)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Current URL Info */}
            {selectedUrl && (
              <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{selectedUrl.name}</h4>
                    <p className="text-sm text-muted-foreground">{selectedUrl.url}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(selectedUrl.url, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                    {urls.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveUrl(selectedUrl.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant={getBadgeVariant(selectedUrl.status)} className={getBadgeClasses(selectedUrl.status)}>
                      {getStatusText(selectedUrl.status)}
                    </Badge>
                  </div>
                  {selectedUrl.responseTime && (
                    <div className="text-muted-foreground">
                      {selectedUrl.responseTime}ms
                    </div>
                  )}
                </div>
                
                {selectedUrl.lastChecked && (
                  <div className="text-xs text-muted-foreground">
                    Last checked: {selectedUrl.lastChecked.toLocaleTimeString()}
                  </div>
                )}
              </div>
            )}

            {/* Add URL Form */}
            {isAddingUrl && (
              <div className="space-y-3 p-4 border rounded-lg">
                <h4 className="font-medium">Add New URL</h4>
                <div className="space-y-2">
                  <Label htmlFor="url-name">Name</Label>
                  <Input
                    id="url-name"
                    placeholder="e.g., Main API"
                    value={newUrl.name}
                    onChange={(e) => setNewUrl(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="url-address">URL</Label>
                  <Input
                    id="url-address"
                    placeholder="e.g., http://localhost:8080/health"
                    value={newUrl.url}
                    onChange={(e) => setNewUrl(prev => ({ ...prev, url: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="url-username">Username (Optional)</Label>
                  <Input
                    id="url-username"
                    placeholder="Basic Auth username"
                    value={newUrl.username}
                    onChange={(e) => setNewUrl(prev => ({ ...prev, username: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="url-password">Password (Optional)</Label>
                  <Input
                    id="url-password"
                    type="password"
                    placeholder="Basic Auth password"
                    value={newUrl.password}
                    onChange={(e) => setNewUrl(prev => ({ ...prev, password: e.target.value }))}
                  />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleAddUrl}>
                    Add URL
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsAddingUrl(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* All URLs Management */}
            {urls.length > 1 && (
              <div className="space-y-3">
                <h4 className="font-medium">All URLs</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {urls.map((url) => (
                    <div key={url.id} className="p-3 border rounded-lg">
                      {editingUrlId === url.id ? (
                        // Edit form
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label htmlFor={`edit-name-${url.id}`}>Name</Label>
                            <Input
                              id={`edit-name-${url.id}`}
                              value={editUrl.name}
                              onChange={(e) => setEditUrl(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="Enter name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`edit-url-${url.id}`}>URL</Label>
                            <Input
                              id={`edit-url-${url.id}`}
                              type="url"
                              value={editUrl.url}
                              onChange={(e) => setEditUrl(prev => ({ ...prev, url: e.target.value }))}
                              placeholder="https://example.com/health"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`edit-username-${url.id}`}>Username (Optional)</Label>
                            <Input
                              id={`edit-username-${url.id}`}
                              value={editUrl.username}
                              onChange={(e) => setEditUrl(prev => ({ ...prev, username: e.target.value }))}
                              placeholder="Basic Auth username"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`edit-password-${url.id}`}>Password (Optional)</Label>
                            <Input
                              id={`edit-password-${url.id}`}
                              type="password"
                              value={editUrl.password}
                              onChange={(e) => setEditUrl(prev => ({ ...prev, password: e.target.value }))}
                              placeholder="Basic Auth password"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={handleSaveEdit}>
                              Save
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        // Display mode
                        <div className="flex items-center justify-between">
                          <div 
                            className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer hover:bg-muted/50 rounded-md p-2 -m-2 transition-colors"
                            onClick={() => {
                              if (selectedUrlId !== url.id) {
                                setSelectedUrlId(url.id);
                                toast.success(`Switched to monitoring ${url.name}`);
                              }
                            }}
                          >
                            <div className={`w-2 h-2 rounded-full ${
                              url.status === 'healthy' ? 'bg-green-500' : 
                              url.status === 'warning' ? 'bg-amber-500' : 
                              url.status === 'checking' ? 'bg-blue-500' :
                              'bg-red-500'
                            }`} />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{url.name}</div>
                              <div className="text-sm text-muted-foreground truncate">{url.url}</div>
                            </div>
                            {selectedUrlId === url.id && (
                              <Badge variant="secondary" className="text-xs">
                                Active
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStartEdit(url)}
                              title="Edit URL"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveUrl(url.id)}
                              title="Remove URL"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Development Debug Info */}
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-muted-foreground border-t pt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span>💾 Data persisted to localStorage</span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleResetToDefaults}
                      className="text-xs h-6 px-2"
                    >
                      Reset Defaults
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearStorage}
                      className="text-xs h-6 px-2"
                    >
                      Clear Storage
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>🔄 Auto-polling every 10 seconds</span>
                  {selectedUrl?.lastChecked && (
                    <span className="text-xs">
                      Last: {selectedUrl.lastChecked.toLocaleTimeString()}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Close
            </Button>
            <Button onClick={handleHealthCheck} disabled={!selectedUrl || selectedUrl.status === 'checking'}>
              {selectedUrl?.status === 'checking' ? 'Checking...' : 'Check Now'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}