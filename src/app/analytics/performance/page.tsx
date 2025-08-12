'use client'

import { useState } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter
} from 'lucide-react'
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, PieChart, Pie, Cell } from 'recharts'

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
import { Progress } from '@/components/ui/progress'

export default function AnalyticsPerformancePage() {
  const [timeRange, setTimeRange] = useState('7d')
  const [metricType, setMetricType] = useState('all')

  // Mock data
  const performanceData = [
    { time: '00:00', accuracy: 92, responseTime: 1.8, successRate: 88 },
    { time: '04:00', accuracy: 88, responseTime: 2.1, successRate: 85 },
    { time: '08:00', accuracy: 95, responseTime: 1.5, successRate: 92 },
    { time: '12:00', accuracy: 97, responseTime: 1.2, successRate: 95 },
    { time: '16:00', accuracy: 94, responseTime: 1.6, successRate: 91 },
    { time: '20:00', accuracy: 90, responseTime: 1.9, successRate: 87 },
  ]

  const agentMetrics = [
    { name: 'Customer Support Sarah', accuracy: 96, responseTime: 1.2, successRate: 94, conversations: 450, status: 'excellent' },
    { name: 'Sales Agent Alex', accuracy: 92, responseTime: 1.8, successRate: 89, conversations: 380, status: 'good' },
    { name: 'Technical Support Bot', accuracy: 88, responseTime: 0.9, successRate: 85, conversations: 620, status: 'fair' },
    { name: 'Marketing Assistant Emma', accuracy: 94, responseTime: 1.5, successRate: 91, conversations: 410, status: 'good' },
    { name: 'Operations Helper David', accuracy: 90, responseTime: 1.7, successRate: 87, conversations: 350, status: 'fair' },
  ]

  const resolutionBreakdown = [
    { name: 'Resolved', value: 78, color: '#10b981' },
    { name: 'Escalated', value: 15, color: '#f59e0b' },
    { name: 'Unresolved', value: 7, color: '#ef4444' },
  ]

  const performanceStats = [
    {
      title: 'Average Accuracy',
      value: '93.2%',
      change: '+2.1%',
      trend: 'up',
      icon: CheckCircle,
    },
    {
      title: 'Avg Response Time',
      value: '1.48s',
      change: '-0.2s',
      trend: 'down',
      icon: Clock,
    },
    {
      title: 'Success Rate',
      value: '89.2%',
      change: '+3.5%',
      trend: 'up',
      icon: Activity,
    },
    {
      title: 'Error Rate',
      value: '2.3%',
      change: '-0.8%',
      trend: 'down',
      icon: AlertCircle,
    },
  ]

  return (
    <MainLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Performance Analytics</h1>
            <div className="flex gap-2">
              <Select value={metricType} onValueChange={setMetricType}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Metric type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Metrics</SelectItem>
                  <SelectItem value="accuracy">Accuracy</SelectItem>
                  <SelectItem value="response">Response Time</SelectItem>
                  <SelectItem value="success">Success Rate</SelectItem>
                </SelectContent>
              </Select>
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
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Analyze agent performance metrics and identify areas for improvement
          </p>
        </div>

        {/* Performance Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {performanceStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
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

        {/* Performance Trends Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
              <CardDescription>Key performance metrics over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis dataKey="time" className="text-gray-600 dark:text-gray-400" />
                  <YAxis className="text-gray-600 dark:text-gray-400" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgb(255 255 255)', 
                      border: '1px solid rgb(229 231 235)',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="accuracy" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="successRate" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={{ fill: '#10b981' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resolution Breakdown</CardTitle>
              <CardDescription>Conversation outcomes</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={resolutionBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {resolutionBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {resolutionBreakdown.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium">{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Agent Performance Table */}
        <Card>
          <CardHeader>
            <CardTitle>Agent Performance Details</CardTitle>
            <CardDescription>Individual agent metrics and performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {agentMetrics.map((agent, index) => (
                <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                        {agent.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <h4 className="font-semibold">{agent.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {agent.conversations} conversations
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant={agent.status === 'excellent' ? 'default' : agent.status === 'good' ? 'secondary' : 'outline'}
                    >
                      {agent.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Accuracy</span>
                        <span className="text-sm font-medium">{agent.accuracy}%</span>
                      </div>
                      <Progress value={agent.accuracy} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Response Time</span>
                        <span className="text-sm font-medium">{agent.responseTime}s</span>
                      </div>
                      <Progress value={(2.5 - agent.responseTime) * 40} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Success Rate</span>
                        <span className="text-sm font-medium">{agent.successRate}%</span>
                      </div>
                      <Progress value={agent.successRate} className="h-2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}