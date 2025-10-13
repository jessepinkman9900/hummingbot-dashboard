'use client';

import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { ScriptFileViewer } from '@/components/bots/script-file-viewer';
import { Bot } from 'lucide-react';

export default function BotsPage() {
  const router = useRouter();

  const handleScriptSelect = (scriptName: string) => {
    router.push(`/bots/${encodeURIComponent(scriptName)}`);
  };

  return (
    <MainLayout>
      <div className="h-full flex flex-col space-y-6">
        {/* Page Header */}
        <div className="flex items-center space-x-2">
          <Bot className="h-8 w-8" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Bot Scripts</h1>
            <p className="text-muted-foreground">
              Manage and edit your bot scripts with syntax highlighting and validation
            </p>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <ScriptFileViewer onScriptSelect={handleScriptSelect} />
        </div>
      </div>
    </MainLayout>
  );
}