'use client'

import { useState } from 'react'
import { 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calculator,
  CreditCard,
  PieChart as PieChartIcon,
  AlertCircle,
  Download
} from 'lucide-react'
import { Line, Bar, Pie, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, BarChart, PieChart, Cell } from 'recharts'

import { MainLayout } from '@/components/layouts/MainLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function AnalyticsCostsPage() {
  const [timeRange, setTimeRange] = useState('30d')
  const [costView, setCostView] = useState('overview')

  // Mock data
  const dailyCosts = [
    { date: '1 Jan', cost: 145, budget: 150 },
    { date: '5 Jan', cost: 168, budget: 150 },
    { date: '10 Jan', cost: 142, budget: 150 },
    { date: '15 Jan', cost: 178, budget: 150 },
    { date: '20 Jan', cost: 135, budget: 150 },
    { date: '25 Jan', cost: 155, budget: 150 },
    { date: '30 Jan', cost: 162, budget: 150 },
  ]

  const costBreakdown = [
    { category: 'API Calls', value: 45, amount: '$2,250', color: '#3b82f6' },
    { category: 'Storage', value: 20, amount: '$1,000', color: '#10b981' },
    { category: 'Compute', value: 25, amount: '$1,250', color: '#8b5cf6' },
    { category: 'Bandwidth', value: 10, amount: '$500', color: '#f59e0b' },
  ]

  const agentCosts = [
    { name: 'Technical Bot', conversations: 620, cost: 186, costPerConv: 0.30 },
    { name: 'Support Sarah', conversations: 450, cost: 158, costPerConv: 0.35 },
    { name: 'Sales Alex', conversations: 380, cost: 171, costPerConv: 0.45 },
    { name: 'Marketing Emma', conversations: 410, cost: 143, costPerConv: 0.35 },
  ]

  const costTrends = [
    { month: 'Oct', actual: 4200, projected: 4000 },
    { month: 'Nov', actual: 4500, projected: 4200 },
    { month: 'Dec', actual: 4800, projected: 4500 },
    { month: 'Jan', actual: 5000, projected: 4800 },
  ]

  const costStats = [
    {
      title: 'Total Cost (MTD)',
      value: '$5,000',
      change: '+8%',
      trend: 'up',
      icon: DollarSign,
      subtitle: 'vs last month'
    },
    {
      title: 'Cost per Conversation',
      value: '$0.42',
      change: '-12%',
      trend: 'down',
      icon: Calculator,
      subtitle: 'Improved efficiency'
    },
    {
      title: 'Budget Utilization',
      value: '87%',
      change: '+5%',
      trend: 'up',
      icon: PieChartIcon,
      subtitle: 'Of $5,750 budget'
    },
    {
      title: 'Projected Monthly',
      value: '$5,400',
      change: '+$400',
      trend: 'up',
      icon: TrendingUp,
      subtitle: 'End of month estimate'
    },
  ]

  return (
    <MainLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Cost Analytics</h1>
            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="12m">Last 12 months</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor and optimize your AI agent operational costs
          </p>
        </div>

        {/* Cost Alert */}
        {dailyCosts.some(d => d.cost > d.budget) && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Budget Alert</AlertTitle>
            <AlertDescription>
              Your daily costs have exceeded the budget on 2 days this month. Consider optimizing agent usage or adjusting your budget.
            </AlertDescription>
          </Alert>
        )}

        {/* Cost Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {costStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <div className="flex items-center text-sm">
                    {stat.trend === 'up' ? (
                      <TrendingUp className={`w-4 h-4 mr-1 ${stat.title.includes('Cost per') ? 'text-red-600' : 'text-green-600'}`} />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-green-600 mr-1" />
                    )}
                    <span className={stat.title.includes('Cost per') && stat.trend === 'down' ? 'text-green-600' : stat.trend === 'up' && !stat.title.includes('Budget') ? 'text-red-600' : 'text-gray-600'}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <p className="text-2xl font-bold mb-1">{stat.value}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{stat.subtitle}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Cost Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Daily Cost Trends</CardTitle>
              <CardDescription>Actual costs vs budget allocation</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyCosts}>
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
                  <Line 
                    type="monotone" 
                    dataKey="cost" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="budget" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cost Breakdown</CardTitle>
              <CardDescription>By service category</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={costBreakdown}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                  >
                    {costBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {costBreakdown.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm">{item.category}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium">{item.amount}</span>
                      <span className="text-xs text-gray-500 ml-1">({item.value}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Agent Cost Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Agent Cost Analysis</CardTitle>
              <CardDescription>Cost efficiency by agent</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {agentCosts.map((agent, index) => (
                  <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{agent.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {agent.conversations} conversations
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">${agent.cost}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          ${agent.costPerConv}/conv
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(agent.cost / 200) * 100}%` }}
                        />
                      </div>
                      <Badge variant={agent.costPerConv < 0.40 ? 'default' : 'secondary'}>
                        {agent.costPerConv < 0.40 ? 'Efficient' : 'Review'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cost Projections</CardTitle>
              <CardDescription>Actual vs projected monthly costs</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={costTrends}>
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
                  <Bar dataKey="actual" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="projected" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Cost Optimization Tips */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Cost Optimization Opportunities</CardTitle>
            <CardDescription>Recommendations to reduce operational costs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <CreditCard className="w-8 h-8 text-blue-600 mb-2" />
                <h4 className="font-semibold mb-1">Optimize API Calls</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Batch similar requests to reduce API call volume by up to 30%
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <Calculator className="w-8 h-8 text-green-600 mb-2" />
                <h4 className="font-semibold mb-1">Agent Efficiency</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Sales Alex has 25% higher cost per conversation than average
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <TrendingDown className="w-8 h-8 text-purple-600 mb-2" />
                <h4 className="font-semibold mb-1">Off-Peak Usage</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Schedule non-critical tasks during off-peak hours for 15% savings
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}