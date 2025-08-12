'use client'

import { useState } from 'react'
import { 
  TrendingUp,
  DollarSign,
  Users,
  Target,
  Award,
  Calculator,
  BarChart3,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { Line, Bar, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, BarChart, AreaChart, RadialBarChart, RadialBar } from 'recharts'

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

export default function AnalyticsROIPage() {
  const [timeRange, setTimeRange] = useState('90d')
  const [metricView, setMetricView] = useState('overview')

  // Mock data
  const roiTrend = [
    { month: 'Oct', roi: 220, target: 200 },
    { month: 'Nov', roi: 245, target: 200 },
    { month: 'Dec', roi: 280, target: 200 },
    { month: 'Jan', roi: 310, target: 250 },
  ]

  const savingsBreakdown = [
    { category: 'Labor Cost Reduction', savings: 45000, percentage: 40 },
    { category: 'Efficiency Gains', savings: 35000, percentage: 31 },
    { category: 'Error Reduction', savings: 20000, percentage: 18 },
    { category: 'Scale Benefits', savings: 12500, percentage: 11 },
  ]

  const performanceMetrics = [
    { metric: 'Customer Satisfaction', before: 72, after: 94, improvement: 30.6 },
    { metric: 'Response Time', before: 300, after: 45, improvement: 85 },
    { metric: 'Resolution Rate', before: 65, after: 89, improvement: 36.9 },
    { metric: 'Operational Efficiency', before: 60, after: 92, improvement: 53.3 },
  ]

  const agentROI = [
    { name: 'Customer Support Sarah', cost: 1580, value: 6200, roi: 292 },
    { name: 'Sales Agent Alex', cost: 1710, value: 5800, roi: 239 },
    { name: 'Technical Support Bot', cost: 1860, value: 7500, roi: 303 },
    { name: 'Marketing Assistant Emma', cost: 1430, value: 4900, roi: 243 },
  ]

  const roiStats = [
    {
      title: 'Current ROI',
      value: '310%',
      change: '+30%',
      trend: 'up',
      icon: TrendingUp,
      subtitle: 'vs last quarter'
    },
    {
      title: 'Total Savings',
      value: '$112.5K',
      change: '+$22.5K',
      trend: 'up',
      icon: DollarSign,
      subtitle: 'This quarter'
    },
    {
      title: 'Payback Period',
      value: '3.2 months',
      change: '-0.8 months',
      trend: 'down',
      icon: Calculator,
      subtitle: 'Faster recovery'
    },
    {
      title: 'Value Generated',
      value: '$468K',
      change: '+18%',
      trend: 'up',
      icon: Award,
      subtitle: 'Annual projection'
    },
  ]

  return (
    <MainLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">ROI Analytics</h1>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="6m">Last 6 months</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Measure the return on investment and business impact of your AI agents
          </p>
        </div>

        {/* ROI Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {roiStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <div className="flex items-center text-sm">
                    {stat.trend === 'up' ? (
                      <ArrowUpRight className="w-4 h-4 text-green-600 mr-1" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-green-600 mr-1" />
                    )}
                    <span className="text-green-600">{stat.change}</span>
                  </div>
                </div>
                <p className="text-2xl font-bold mb-1">{stat.value}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{stat.subtitle}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ROI Trend and Savings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>ROI Trend</CardTitle>
              <CardDescription>Return on investment over time vs target</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={roiTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis dataKey="month" className="text-gray-600 dark:text-gray-400" />
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
                    dataKey="roi" 
                    stroke="#3b82f6" 
                    fill="#3b82f6" 
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="target" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Savings Breakdown</CardTitle>
              <CardDescription>Cost savings by category this quarter</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {savingsBreakdown.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.category}</span>
                      <span className="text-sm font-bold">${(item.savings / 1000).toFixed(1)}K</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={item.percentage} className="flex-1" />
                      <span className="text-xs text-gray-500 w-10">{item.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">Total Savings</span>
                  <span className="text-lg font-bold text-green-600">$112.5K</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Improvements */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Performance Improvements</CardTitle>
            <CardDescription>Key metrics before and after AI agent implementation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {performanceMetrics.map((metric, index) => (
                <div key={index} className="text-center">
                  <h4 className="font-semibold mb-4">{metric.metric}</h4>
                  <div className="relative inline-flex items-center justify-center mb-4">
                    <svg className="w-32 h-32">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-gray-200 dark:text-gray-700"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 56 * (metric.after / 100)} ${2 * Math.PI * 56}`}
                        strokeDashoffset="0"
                        className="text-blue-600 transform -rotate-90 origin-center transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div>
                        <p className="text-2xl font-bold">{metric.metric === 'Response Time' ? `${metric.after}s` : `${metric.after}%`}</p>
                        <p className="text-xs text-gray-500">Current</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Before: {metric.metric === 'Response Time' ? `${metric.before}s` : `${metric.before}%`}
                    </p>
                    <Badge variant="default" className="bg-green-600">
                      +{metric.improvement}% improvement
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Agent ROI Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Agent ROI Analysis</CardTitle>
            <CardDescription>Individual agent cost vs value generated</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {agentROI.map((agent, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                        {agent.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <h4 className="font-semibold">{agent.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Cost: ${agent.cost} | Value: ${agent.value}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">{agent.roi}%</p>
                      <p className="text-xs text-gray-500">ROI</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-600 dark:text-gray-400">Cost Efficiency</span>
                        <span className="text-xs font-medium">{Math.round((agent.cost / 2000) * 100)}%</span>
                      </div>
                      <Progress value={(agent.cost / 2000) * 100} className="h-1.5" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-600 dark:text-gray-400">Value Generation</span>
                        <span className="text-xs font-medium">{Math.round((agent.value / 8000) * 100)}%</span>
                      </div>
                      <Progress value={(agent.value / 8000) * 100} className="h-1.5" />
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