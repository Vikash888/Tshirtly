'use client';

import { useEffect, useState } from 'react';
import { rtdb, auth } from '@/lib/firebase';
import { ref, set, get, onValue } from 'firebase/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';

export default function RTDBTestPage() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const { user } = useAuth();

  const addResult = (name: string, success: boolean, message: string, data?: any) => {
    setTestResults(prev => [...prev, { name, success, message, data, timestamp: Date.now() }]);
  };

  const runTests = async () => {
    setTestResults([]);
    setIsTesting(true);

    try {
      // Test 1: Check RTDB initialization
      addResult('RTDB Initialization', true, 'RTDB instance exists', { url: rtdb.app.options.databaseURL });

      // Test 2: Check authentication
      const currentUser = auth.currentUser;
      if (currentUser) {
        addResult('Authentication', true, `User logged in as ${currentUser.email}`, { uid: currentUser.uid });
      } else {
        addResult('Authentication', false, 'No user logged in', null);
        setIsTesting(false);
        return;
      }

      // Test 3: Check connection status
      const connectedRef = ref(rtdb, '.info/connected');
      const connectedSnapshot = await get(connectedRef);
      const isConnected = connectedSnapshot.val();
      addResult('Connection Status', isConnected, isConnected ? 'Connected to RTDB' : 'Not connected', null);

      // Test 4: Try to read from test path
      try {
        const testReadRef = ref(rtdb, 'test/read');
        const readSnapshot = await get(testReadRef);
        addResult('Read Test', true, 'Read operation successful', { value: readSnapshot.val() });
      } catch (error: any) {
        addResult('Read Test', false, `Read failed: ${error.message}`, { error: error.code });
      }

      // Test 5: Try to write to test path
      try {
        const testWriteRef = ref(rtdb, `test/write/${Date.now()}`);
        await set(testWriteRef, {
          message: 'Test write',
          userId: currentUser.uid,
          timestamp: Date.now()
        });
        addResult('Write Test', true, 'Write operation successful', { path: testWriteRef.toString() });
      } catch (error: any) {
        addResult('Write Test', false, `Write failed: ${error.message}`, { error: error.code });
      }

      // Test 6: Try to write to orders path
      try {
        const testOrderRef = ref(rtdb, `orders/test_${Date.now()}`);
        await set(testOrderRef, {
          userId: currentUser.uid,
          userEmail: currentUser.email || 'no-email',
          items: [{ test: true }],
          totalPrice: 99.99,
          status: 'pending',
          createdAt: Date.now(),
          updatedAt: Date.now()
        });
        addResult('Orders Write Test', true, 'Successfully wrote to /orders/', { path: testOrderRef.toString() });
      } catch (error: any) {
        addResult('Orders Write Test', false, `Orders write failed: ${error.message}`, { 
          error: error.code,
          details: error
        });
      }

    } catch (error: any) {
      addResult('Test Error', false, `Unexpected error: ${error.message}`, { error });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Firebase RTDB Diagnostic Tool</CardTitle>
          <CardDescription>
            Test your Firebase Realtime Database connection and permissions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button onClick={runTests} disabled={isTesting || !user}>
              {isTesting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running Tests...
                </>
              ) : (
                'Run Diagnostic Tests'
              )}
            </Button>
            {!user && (
              <Alert>
                <AlertDescription>Please sign in to run tests</AlertDescription>
              </Alert>
            )}
          </div>

          {testResults.length > 0 && (
            <div className="space-y-3 mt-6">
              <h3 className="font-semibold text-lg">Test Results:</h3>
              {testResults.map((result, index) => (
                <Alert key={index} variant={result.success ? 'default' : 'destructive'}>
                  <div className="flex items-start gap-3">
                    {result.success ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <div className="flex-1">
                      <AlertTitle>{result.name}</AlertTitle>
                      <AlertDescription className="mt-2">
                        {result.message}
                        {result.data && (
                          <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        )}
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          )}

          <div className="mt-8 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Troubleshooting Steps:</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Ensure you're signed in with a valid account</li>
              <li>Check Firebase Console → Realtime Database → Rules</li>
              <li>Verify the database has been created (not just enabled)</li>
              <li>Deploy rules using: <code className="bg-background px-2 py-1 rounded">firebase deploy --only database</code></li>
              <li>Check browser console for detailed error messages</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
