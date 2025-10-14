import { CredentialTest } from '@/components/auth/credential-test';

export default function CredentialTestPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Credential Storage Test</h1>
        <p className="text-muted-foreground mt-2">
          Test the localStorage credential storage functionality
        </p>
      </div>
      
      <CredentialTest />
      
      <div className="mt-8 max-w-md mx-auto">
        <div className="p-4 bg-muted rounded-lg">
          <h3 className="font-medium mb-2">How to test:</h3>
          <ol className="text-sm space-y-1 list-decimal list-inside">
            <li>Enter username and password above</li>
            <li>Click &quot;Store Credentials&quot;</li>
            <li>Click &quot;Retrieve&quot; to see stored credentials</li>
            <li>Check browser console for logs</li>
            <li>Test with the health status component</li>
          </ol>
        </div>
      </div>
    </div>
  );
}