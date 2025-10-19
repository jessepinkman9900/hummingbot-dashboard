'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, SlidersHorizontal, Code, FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CodeEditor } from '@/components/ui/code-editor';
import {
  getControllerConfigTemplate,
  getControllerCode,
  ControllerConfigTemplate,
  ControllerCode,
} from '@/lib/api/controllers';

export default function ControllerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const controllerType = params.controllerType as string;
  const controllerName = params.controllerName as string;

  const [configTemplate, setConfigTemplate] = useState<ControllerConfigTemplate>({});
  const [controllerCode, setControllerCode] = useState<ControllerCode | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [loadingCode, setLoadingCode] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);

  // Fetch both config template and code simultaneously when page loads
  useEffect(() => {
    const fetchControllerData = async () => {
      if (!controllerType || !controllerName) return;

      try {
        // Set loading states
        setLoadingConfig(true);
        setLoadingCode(true);

        // Fetch both config template and code in parallel
        const [configResult, codeResult] = await Promise.allSettled([
          getControllerConfigTemplate(controllerType, controllerName),
          getControllerCode(controllerType, controllerName),
        ]);

        // Handle config template result
        if (configResult.status === 'fulfilled') {
          setConfigTemplate(configResult.value || {});
        } else {
          console.error('Error fetching config template:', configResult.reason);
          if (configResult.reason instanceof Error && configResult.reason.message.includes('401')) {
            setConfigError('Authentication required. Please configure your API credentials.');
          } else {
            setConfigError(configResult.reason instanceof Error ? configResult.reason.message : 'An error occurred');
          }
        }

        // Handle controller code result
        if (codeResult.status === 'fulfilled') {
          setControllerCode(codeResult.value);
        } else {
          console.error('Error fetching controller code:', codeResult.reason);
          if (codeResult.reason instanceof Error && codeResult.reason.message.includes('401')) {
            setCodeError('Authentication required. Please configure your API credentials.');
          } else {
            setCodeError(codeResult.reason instanceof Error ? codeResult.reason.message : 'An error occurred');
          }
        }
      } catch (err) {
        console.error('Unexpected error fetching controller data:', err);
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
        setConfigError(errorMessage);
        setCodeError(errorMessage);
      } finally {
        // Always set loading to false for both
        setLoadingConfig(false);
        setLoadingCode(false);
      }
    };

    fetchControllerData();
  }, [controllerType, controllerName]);

  const formatConfigKey = (key: string) => {
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatType = (type: string) => {
    return type.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const configFields = Object.keys(configTemplate);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <SlidersHorizontal className="h-8 w-8" />
              {controllerName}
            </h1>
            <p className="text-muted-foreground">
              {formatType(controllerType)} Controller
            </p>
          </div>
        </div>

        <Tabs defaultValue="config" className="space-y-6">
          <TabsList>
            <TabsTrigger value="config" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Config Template
            </TabsTrigger>
            <TabsTrigger value="code" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Controller Code
            </TabsTrigger>
          </TabsList>

          {/* Config Template Tab */}
          <TabsContent value="config" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Configuration Template
                  <Badge variant="secondary">{configFields.length} fields</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingConfig ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-3 border rounded">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    ))}
                  </div>
                ) : configError ? (
                  <Alert variant="destructive">
                    <AlertDescription>{configError}</AlertDescription>
                  </Alert>
                ) : configFields.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No configuration fields available
                  </div>
                ) : (
                  <div className="space-y-3">
                    {configFields.map((field) => {
                      const config = configTemplate[field];
                      return (
                        <div
                          key={field}
                          className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50"
                        >
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{formatConfigKey(field)}</p>
                              {config.required && (
                                <Badge variant="destructive" className="text-xs">Required</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground font-mono">{field}</p>
                            <div className="flex items-center gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Type: </span>
                                <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{config.type}</code>
                              </div>
                              {config.default !== null && config.default !== undefined && (
                                <div>
                                  <span className="text-muted-foreground">Default: </span>
                                  <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                                    {typeof config.default === 'object'
                                      ? JSON.stringify(config.default)
                                      : String(config.default)}
                                  </code>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Controller Code Tab */}
          <TabsContent value="code" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Controller Source Code
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingCode ? (
                  <div className="space-y-4">
                    <Skeleton className="h-96 w-full" />
                  </div>
                ) : codeError ? (
                  <Alert variant="destructive">
                    <AlertDescription>{codeError}</AlertDescription>
                  </Alert>
                ) : !controllerCode ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No code available
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          Name: <span className="font-mono">{controllerCode.name}</span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Type: <span className="font-mono">{formatType(controllerCode.type)}</span>
                        </p>
                      </div>
                      <Badge variant="outline">Python</Badge>
                    </div>
                    <CodeEditor
                      value={controllerCode.content}
                      language="python"
                      height="600px"
                      readOnly={true}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
