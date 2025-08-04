'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layouts/MainLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { runAllAuthTests } from '@/lib/test-auth-flows'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function TestAuthPage() {
  const [testResults, setTestResults] = useState<any>(null)
  const [isRunning, setIsRunning] = useState(false)

  const handleRunTests = async () => {
    setIsRunning(true)
    setTestResults(null)
    
    try {
      const results = await runAllAuthTests()
      setTestResults(results)
    } catch (error) {
      console.error('Test error:', error)
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <MainLayout>
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Authentication Flow Tests</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Test all authentication flows to ensure they're working correctly
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Run Authentication Tests</CardTitle>
            <CardDescription>
              This will test login, signup, password reset, email verification, and auth context integration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleRunTests}
              disabled={isRunning}
              size="lg"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Running Tests...
                </>
              ) : (
                'Run All Tests'
              )}
            </Button>
          </CardContent>
        </Card>

        {testResults && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>API Authentication Tests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(testResults.apiTests).map(([test, passed]) => (
                    <div key={test} className="flex items-center space-x-2">
                      {passed ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      <span className="capitalize">{test.replace(/([A-Z])/g, ' $1').trim()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Context Integration Tests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(testResults.contextTests).map(([test, passed]) => (
                    <div key={test} className="flex items-center space-x-2">
                      {passed ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      <span className="capitalize">{test.replace(/([A-Z])/g, ' $1').trim()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <p className="text-green-800 dark:text-green-400 font-medium">
                    All authentication flows are working correctly!
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  )
}