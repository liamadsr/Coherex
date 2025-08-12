'use client'

import { useState } from 'react'
import { 
  Users,
  MessageSquare,
  Bot,
  Clock,
  Calendar,
  Activity,
  TrendingUp,
  Globe
} from 'lucide-react'
import { Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, LineChart, Cell } from 'recharts'

import { MainLayout } from '@/components/layouts/MainLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function AnalyticsUsagePage() {
  const [timeRange, setTimeRange] = useState('7d')
  const [viewType, setViewType] = useState('daily')

  // Mock data
  const usageData = [
    { date: 'Mon', conversations: 245, uniqueUsers: 180, messages: 1420 },
    { date: 'Tue', conversations: 280, uniqueUsers: 210, messages: 1680 },
    { date: 'Wed', conversations: 320, uniqueUsers: 245, messages: 1920 },
    { date: 'Thu', conversations: 290, uniqueUsers: 220, messages: 1740 },
    { date: 'Fri', conversations: 350, uniqueUsers: 280, messages: 2100 },
    { date: 'Sat', conversations: 180, uniqueUsers: 140, messages: 1080 },
    { date: 'Sun', conversations: 150, uniqueUsers: 120, messages: 900 },
  ]

  const hourlyActivity = [
    { hour: '00', activity: 20 },
    { hour: '02', activity: 15 },
    { hour: '04', activity: 10 },
    { hour: '06', activity: 25 },
    { hour: '08', activity: 80 },
    { hour: '10', activity: 95 },
    { hour: '12', activity: 100 },
    { hour: '14', activity: 90 },
    { hour: '16', activity: 85 },
    { hour: '18', activity: 70 },
    { hour: '20', activity: 50 },
    { hour: '22', activity: 35 },
  ]

  const channelUsage = [
    { channel: 'Email', count: 5420, percentage: 45, growth: '+12%' },
    { channel: 'Slack', count: 3612, percentage: 30, growth: '+8%' },
    { channel: 'Web Chat', count: 2408, percentage: 20, growth: '+15%' },
    { channel: 'Teams', count: 601, percentage: 5, growth: '-2%' },
  ]

  const agentUsage = [
    { name: 'Technical Bot', conversations: 620, avgDuration: '3.2 min', peakHour: '2PM' },
    { name: 'Support Sarah', conversations: 450, avgDuration: '4.5 min', peakHour: '10AM' },
    { name: 'Sales Alex', conversations: 380, avgDuration: '6.8 min', peakHour: '3PM' },
    { name: 'Marketing Emma', conversations: 410, avgDuration: '5.1 min', peakHour: '11AM' },
  ]

  const usageStats = [
    {
      title: 'Total Conversations',
      value: '1,815',
      subtitle: 'This week',
      icon: MessageSquare,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20'
    },
    {
      title: 'Unique Users',
      value: '1,395',
      subtitle: '+12% from last week',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20'
    },
    {
      title: 'Avg Session Duration',
      value: '4.7 min',
      subtitle: '+0.3 min increase',
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20'
    },
    {
      title: 'Peak Activity',
      value: '12-2 PM',
      subtitle: 'Most active hours',
      icon: Activity,
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Usage Analytics</h1>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <Calendar className="w-4 h-4 mr-2" />
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
            Track platform usage patterns and user engagement metrics
          </p>
        </div>

        {/* Usage Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {usageStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
                <p className="text-2xl font-bold mb-1">{stat.value}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{stat.subtitle}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Usage Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Usage Trends</CardTitle>
              <CardDescription>Conversations, users, and messages over time</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={viewType} onValueChange={setViewType}>
                <TabsList className="mb-4">
                  <TabsTrigger value="daily">Daily</TabsTrigger>
                  <TabsTrigger value="conversations">Conversations</TabsTrigger>
                  <TabsTrigger value="users">Users</TabsTrigger>
                </TabsList>

                <TabsContent value="daily">
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={usageData}>
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
                      <Bar dataKey="conversations" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </TabsContent>

                <TabsContent value="conversations">
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={usageData}>
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
                      <Line type="monotone" dataKey="conversations" stroke="#3b82f6" strokeWidth={2} />
                      <Line type="monotone" dataKey="messages" stroke="#10b981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </TabsContent>

                <TabsContent value="users">
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={usageData}>
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
                      <Line type="monotone" dataKey="uniqueUsers" stroke="#8b5cf6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hourly Activity Pattern</CardTitle>
              <CardDescription>Platform activity throughout the day</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={hourlyActivity}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis dataKey="hour" className="text-gray-600 dark:text-gray-400" />
                  <YAxis className="text-gray-600 dark:text-gray-400" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgb(255 255 255)', 
                      border: '1px solid rgb(229 231 235)',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="activity" radius={[4, 4, 0, 0]}>
                    {hourlyActivity.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.activity > 80 ? '#10b981' : '#3b82f6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Channel and Agent Usage */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Channel Usage Distribution</CardTitle>
              <CardDescription>Conversations by communication channel</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {channelUsage.map((channel, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Globe className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        <span className="font-medium">{channel.channel}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {channel.count.toLocaleString()} conversations
                        </span>
                        <Badge variant={channel.growth.startsWith('+') ? 'default' : 'secondary'}>
                          {channel.growth}
                        </Badge>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${channel.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Agent Usage</CardTitle>
              <CardDescription>Most active agents by conversation volume</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {agentUsage.map((agent, index) => (
                  <div key={index} className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                          <Bot className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{agent.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {agent.conversations} conversations
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{agent.avgDuration}</p>
                        <p className="text-xs text-gray-500">Peak: {agent.peakHour}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}