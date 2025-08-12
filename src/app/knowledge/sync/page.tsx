'use client'

import { useState } from 'react'
import { 
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  Calendar,
  Activity,
  Pause,
  Play,
  Settings,
  TrendingUp,
  TrendingDown,
  Timer,
  Database,
  Globe,
  GitBranch,
  FileText,
  Link
} from 'lucide-react'

import { MainLayout } from '@/components/layouts/MainLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

export default function KnowledgeSyncPage() {
  const [autoSync, setAutoSync] = useState(true)
  const [timeRange, setTimeRange] = useState('24h')

  // Mock data
  const syncStatus = [
    {
      id: 1,
      name: 'Product Documentation',
      type: 'website',
      icon: Globe,
      status: 'syncing',
      progress: 67,
      lastSync: '2 hours ago',
      nextSync: 'in progress',
      documents: { total: 156, synced: 104, failed: 0 },
      duration: '3 min 45 sec',
      frequency: 'Every 6 hours'
    },
    {
      id: 2,
      name: 'Customer Support FAQs',
      type: 'database',
      icon: Database,
      status: 'completed',
      progress: 100,
      lastSync: '5 minutes ago',
      nextSync: 'in 55 minutes',
      documents: { total: 89, synced: 89, failed: 0 },
      duration: '1 min 12 sec',
      frequency: 'Every hour'
    },
    {
      id: 3,
      name: 'API Reference',
      type: 'git',
      icon: GitBranch,
      status: 'scheduled',
      progress: 0,
      lastSync: '1 day ago',
      nextSync: 'in 2 hours',
      documents: { total: 234, synced: 234, failed: 0 },
      duration: '5 min 30 sec',
      frequency: 'Daily'
    },
    {
      id: 4,
      name: 'Code Examples',
      type: 'git',
      icon: GitBranch,
      status: 'error',
      progress: 45,
      lastSync: '6 hours ago',
      nextSync: 'manual sync required',
      documents: { total: 92, synced: 41, failed: 51 },
      duration: '2 min 15 sec',
      frequency: 'Every 12 hours',
      error: 'Authentication failed - Invalid credentials'
    },
    {
      id: 5,
      name: 'Technical Specifications',
      type: 'confluence',
      icon: Link,
      status: 'completed',
      progress: 100,
      lastSync: '12 hours ago',
      nextSync: 'in 12 hours',
      documents: { total: 178, synced: 178, failed: 0 },
      duration: '4 min 22 sec',
      frequency: 'Every 24 hours'
    },
  ]

  const syncHistory = [
    { time: '2 minutes ago', source: 'Customer Support FAQs', status: 'success', duration: '1m 12s', documents: 89 },
    { time: '2 hours ago', source: 'Product Documentation', status: 'success', duration: '3m 45s', documents: 156 },
    { time: '6 hours ago', source: 'Code Examples', status: 'failed', duration: '2m 15s', documents: 41, error: 'Auth failed' },
    { time: '12 hours ago', source: 'Technical Specifications', status: 'success', duration: '4m 22s', documents: 178 },
    { time: '1 day ago', source: 'API Reference', status: 'success', duration: '5m 30s', documents: 234 },
  ]

  const stats = [
    {
      title: 'Active Syncs',
      value: '1',
      subtitle: 'Currently running',
      icon: RefreshCw,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20'
    },
    {
      title: 'Success Rate',
      value: '94.5%',
      subtitle: 'Last 24 hours',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      change: '+2.3%',
      trend: 'up'
    },
    {
      title: 'Failed Syncs',
      value: '1',
      subtitle: 'Requires attention',
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900/20'
    },
    {
      title: 'Avg Sync Time',
      value: '3.2 min',
      subtitle: 'Per source',
      icon: Timer,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
      change: '-0.5 min',
      trend: 'down'
    },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'syncing':
        return <RefreshCw className="w-4 h-4 animate-spin" />
      case 'completed':
        return <CheckCircle className="w-4 h-4" />
      case 'error':
        return <AlertCircle className="w-4 h-4" />
      case 'scheduled':
        return <Clock className="w-4 h-4" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'syncing':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20'
      case 'completed':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20'
      case 'error':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20'
      case 'scheduled':
        return 'text-gray-600 bg-gray-100 dark:bg-gray-800'
      default:
        return ''
    }
  }

  return (
    <MainLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sync Status</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Monitor and manage knowledge base synchronization
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-sync"
                  checked={autoSync}
                  onCheckedChange={setAutoSync}
                />
                <Label htmlFor="auto-sync">Auto-sync</Label>
              </div>
              <Button>
                <RefreshCw className="w-4 h-4 mr-2" />
                Sync All
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  {stat.change && (
                    <div className="flex items-center text-sm">
                      {stat.trend === 'up' ? (
                        <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-green-600 mr-1" />
                      )}
                      <span className="text-green-600">{stat.change}</span>
                    </div>
                  )}
                </div>
                <p className="text-2xl font-bold mb-1">{stat.value}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{stat.subtitle}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="active" className="space-y-6">
          <TabsList>
            <TabsTrigger value="active">Active Syncs</TabsTrigger>
            <TabsTrigger value="history">Sync History</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {syncStatus.map((source) => (
              <Card key={source.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <div className={`p-2 rounded-lg ${
                        source.status === 'error' 
                          ? 'bg-red-100 dark:bg-red-900/20' 
                          : 'bg-blue-100 dark:bg-blue-900/20'
                      }`}>
                        <source.icon className={`w-6 h-6 ${
                          source.status === 'error'
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-blue-600 dark:text-blue-400'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-semibold">{source.name}</h3>
                          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(source.status)}`}>
                            {getStatusIcon(source.status)}
                            <span>{source.status}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                          <span>Last sync: {source.lastSync}</span>
                          <span>•</span>
                          <span>Next sync: {source.nextSync}</span>
                          <span>•</span>
                          <span>Frequency: {source.frequency}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {source.status === 'syncing' && (
                        <Button variant="outline" size="sm">
                          <Pause className="w-4 h-4" />
                        </Button>
                      )}
                      {source.status === 'scheduled' && (
                        <Button variant="outline" size="sm">
                          <Play className="w-4 h-4" />
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {source.status === 'syncing' && (
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{source.progress}%</span>
                      </div>
                      <Progress value={source.progress} className="h-2" />
                      <p className="text-xs text-gray-500">
                        Syncing document {Math.floor(source.documents.total * source.progress / 100)} of {source.documents.total}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Total Documents</p>
                      <p className="font-medium">{source.documents.total}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Synced</p>
                      <p className="font-medium text-green-600">{source.documents.synced}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Failed</p>
                      <p className="font-medium text-red-600">{source.documents.failed}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Duration</p>
                      <p className="font-medium">{source.duration}</p>
                    </div>
                  </div>

                  {source.error && (
                    <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <p className="text-sm text-red-600 dark:text-red-400">
                        <AlertCircle className="w-4 h-4 inline mr-1" />
                        {source.error}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Recent Sync History</h3>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Last hour</SelectItem>
                  <SelectItem value="24h">Last 24 hours</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {syncHistory.map((item, index) => (
                    <div key={index} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${
                            item.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                          }`} />
                          <div>
                            <p className="font-medium">{item.source}</p>
                            <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
                              <span>{item.time}</span>
                              <span>•</span>
                              <span>{item.documents} documents</span>
                              <span>•</span>
                              <span>{item.duration}</span>
                              {item.error && (
                                <>
                                  <span>•</span>
                                  <span className="text-red-600">{item.error}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <Badge variant={item.status === 'success' ? 'default' : 'destructive'}>
                          {item.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Sync Schedule</CardTitle>
                <CardDescription>Configure when each source should be synchronized</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {syncStatus.map((source) => (
                    <div key={source.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <source.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <div>
                          <p className="font-medium">{source.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {source.frequency}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Select defaultValue={source.frequency}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Every 15 minutes">Every 15 minutes</SelectItem>
                            <SelectItem value="Every 30 minutes">Every 30 minutes</SelectItem>
                            <SelectItem value="Every hour">Every hour</SelectItem>
                            <SelectItem value="Every 6 hours">Every 6 hours</SelectItem>
                            <SelectItem value="Every 12 hours">Every 12 hours</SelectItem>
                            <SelectItem value="Daily">Daily</SelectItem>
                            <SelectItem value="Weekly">Weekly</SelectItem>
                            <SelectItem value="Manual">Manual only</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="outline" size="sm">
                          <Calendar className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}