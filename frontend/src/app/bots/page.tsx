'use client';

import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { ScriptFileViewer } from '@/components/bots/script-file-viewer';

export default function BotsPage() {
  const router = useRouter();

  const handleScriptSelect = (scriptName: string) => {
    router.push(`/bots/${encodeURIComponent(scriptName)}`);
  };

  return (
    <MainLayout>
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Bot Scripts</h1>
            <p className="text-sm text-muted-foreground">
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