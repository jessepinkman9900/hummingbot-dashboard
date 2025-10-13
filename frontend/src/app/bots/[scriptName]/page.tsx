'use client';

import { useRouter, useParams } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { ScriptEditor } from '@/components/bots/script-editor';

export default function ScriptPage() {
  const router = useRouter();
  const params = useParams();
  const scriptName = params.scriptName as string;

  const handleBackToList = () => {
    router.push('/bots');
  };

  return (
    <MainLayout>
      <div className="h-full flex flex-col">
        <ScriptEditor
          scriptName={decodeURIComponent(scriptName)}
          onBack={handleBackToList}
        />
      </div>
    </MainLayout>
  );
}