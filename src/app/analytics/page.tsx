'use client'

import { useState } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Bot, 
  MessageSquare, 
  Clock,
  DollarSign,
  Activity
} from 'lucide-react'
import { Line, Bar, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, BarChart } from 'recharts'

import { MainLayout } from '@/components/layouts/MainLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function AnalyticsOverviewPage() {
  const [timeRange, setTimeRange] = useState('7d')

  // Mock data
  const conversationData = [
    { date: 'Mon', conversations: 245, resolved: 220 },
    { date: 'Tue', conversations: 280, resolved: 260 },
    { date: 'Wed', conversations: 320, resolved: 295 },
    { date: 'Thu', conversations: 290, resolved: 275 },
    { date: 'Fri', conversations: 350, resolved: 320 },
    { date: 'Sat', conversations: 180, resolved: 165 },
    { date: 'Sun', conversations: 150, resolved: 140 },
  ]

  const agentPerformance = [
    { name: 'Sarah', satisfaction: 96, conversations: 450 },
    { name: 'Alex', satisfaction: 92, conversations: 380 },
    { name: 'Bot', satisfaction: 88, conversations: 620 },
    { name: 'Emma', satisfaction: 94, conversations: 410 },
    { name: 'David', satisfaction: 90, conversations: 350 },
  ]

  const stats = [
    {
      title: 'Total Conversations',
      value: '12,543',
      change: '+12.5%',
      trend: 'up',
      icon: MessageSquare,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20'
    },
    {
      title: 'Active Agents',
      value: '24',
      change: '+2',
      trend: 'up',
      icon: Bot,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20'
    },
    {
      title: 'Avg Response Time',
      value: '1.8s',
      change: '-0.3s',
      trend: 'down',
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20'
    },
    {
      title: 'Cost per Conversation',
      value: '$0.42',
      change: '-8%',
      trend: 'down',
      icon: DollarSign,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20'
    },
  ]

  return (
    <MainLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics Overview</h1>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor your AI agents' performance and platform metrics
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div className="flex items-center text-sm">
                    {stat.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-green-600 mr-1" />
                    )}
                    <span className="text-green-600">{stat.change}</span>
                  </div>
                </div>
                <p className="text-2xl font-bold mb-1">{stat.value}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Conversation Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Conversation Trends</CardTitle>
              <CardDescription>Daily conversations and resolution rate</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={conversationData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis dataKey="date" className="text-gray-600 dark:text-gray-400" />
                  <YAxis className="text-gray-600 dark:text-gray-400" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgb(255 255 255)', 
                      border: '1px solid rgb(229 231 235)',
                      borderRadius: '8px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="conversations" 
                    stroke="#3b82f6" 
                    fill="#3b82f6" 
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="resolved" 
                    stroke="#10b981" 
                    fill="#10b981" 
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Agent Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Top Agent Performance</CardTitle>
              <CardDescription>Satisfaction scores by agent</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={agentPerformance}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis dataKey="name" className="text-gray-600 dark:text-gray-400" />
                  <YAxis className="text-gray-600 dark:text-gray-400" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgb(255 255 255)', 
                      border: '1px solid rgb(229 231 235)',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="satisfaction" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Additional Insights */}
        <div className="mt-8">
          <Tabs defaultValue="agents" className="w-full">
            <TabsList>
              <TabsTrigger value="agents">Agent Insights</TabsTrigger>
              <TabsTrigger value="channels">Channel Performance</TabsTrigger>
              <TabsTrigger value="satisfaction">User Satisfaction</TabsTrigger>
            </TabsList>

            <TabsContent value="agents" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-2">Most Active Agent</h3>
                    <p className="text-2xl font-bold">Technical Bot</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">620 conversations</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-2">Highest Satisfaction</h3>
                    <p className="text-2xl font-bold">Sarah</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">96% satisfaction</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-2">Fastest Response</h3>
                    <p className="text-2xl font-bold">Alex</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">0.8s avg response</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="channels" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <Activity className="w-8 h-8 text-blue-600 mb-2" />
                    <h3 className="font-semibold mb-1">Email</h3>
                    <p className="text-2xl font-bold">45%</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">of conversations</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <Activity className="w-8 h-8 text-purple-600 mb-2" />
                    <h3 className="font-semibold mb-1">Slack</h3>
                    <p className="text-2xl font-bold">30%</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">of conversations</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <Activity className="w-8 h-8 text-green-600 mb-2" />
                    <h3 className="font-semibold mb-1">Web Chat</h3>
                    <p className="text-2xl font-bold">20%</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">of conversations</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <Activity className="w-8 h-8 text-orange-600 mb-2" />
                    <h3 className="font-semibold mb-1">Teams</h3>
                    <p className="text-2xl font-bold">5%</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">of conversations</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="satisfaction" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Very Satisfied</span>
                        <span className="text-sm text-gray-600">68%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '68%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Satisfied</span>
                        <span className="text-sm text-gray-600">24%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '24%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Neutral</span>
                        <span className="text-sm text-gray-600">6%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                        <div className="bg-gray-600 h-2 rounded-full" style={{ width: '6%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Unsatisfied</span>
                        <span className="text-sm text-gray-600">2%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                        <div className="bg-red-600 h-2 rounded-full" style={{ width: '2%' }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  )
}