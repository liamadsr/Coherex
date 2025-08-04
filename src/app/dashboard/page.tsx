'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Bot, 
  MessageCircle, 
  Clock, 
  TrendingUp, 
  Users, 
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Star
} from 'lucide-react'
import { Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

import { MainLayout } from '@/components/layouts/MainLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { mockApi } from '@/mock-data'
import { Agent, AnalyticsData } from '@/types'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/auth-context'
import { AuthLoading } from '@/components/auth/auth-loading'

// Mock chart data
const performanceData = [
  { name: '00:00', value: 65, accuracy: 92 },
  { name: '04:00', value: 45, accuracy: 88 },
  { name: '08:00', value: 85, accuracy: 95 },
  { name: '12:00', value: 95, accuracy: 97 },
  { name: '16:00', value: 75, accuracy: 94 },
  { name: '20:00', value: 55, accuracy: 90 },
]

const channelData = [
  { name: 'Email', value: 45, color: '#3b82f6' },
  { name: 'Slack', value: 30, color: '#10b981' },
  { name: 'Web Chat', value: 15, color: '#f59e0b' },
  { name: 'Teams', value: 10, color: '#8b5cf6' },
]

export default function DashboardPage() {
  const router = useRouter()
  const { isLoading: authLoading } = useAuth()
  const [agents, setAgents] = useState<Agent[]>([])
  const [recentActivity, setRecentActivity] = useState<Array<{id: string; type: string; title: string; description: string; time: string; icon: any; color: string}>>([])
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [agentsResult, analyticsResult] = await Promise.all([
          mockApi.getAgents(),
          mockApi.getAnalytics()
        ])

        setAgents(agentsResult.data || [])
        setAnalytics(analyticsResult.data)

        // Mock recent activity
        setRecentActivity([
          {
            id: '1',
            type: 'agent_created',
            title: 'Customer Support Sarah created',
            description: 'New agent deployed to handle customer inquiries',
            time: '2 minutes ago',
            icon: Bot,
            color: 'text-green-600'
          },
          {
            id: '2',
            type: 'conversation_completed',
            title: 'Conversation resolved',
            description: 'Sales Agent Alex successfully closed a lead',
            time: '5 minutes ago',
            icon: MessageCircle,
            color: 'text-blue-600'
          },
          {
            id: '3',
            type: 'evaluation_alert',
            title: 'Quality score improved',
            description: 'Support Team average accuracy increased to 96%',
            time: '15 minutes ago',
            icon: TrendingUp,
            color: 'text-purple-600'
          },
          {
            id: '4',
            type: 'integration_connected',
            title: 'Slack integration updated',
            description: 'Successfully connected to #customer-support channel',
            time: '1 hour ago',
            icon: Zap,
            color: 'text-orange-600'
          },
          {
            id: '5',
            type: 'agent_performance',
            title: 'Performance milestone',
            description: 'Data Analysis Agent processed 1000+ requests',
            time: '2 hours ago',
            icon: Activity,
            color: 'text-indigo-600'
          }
        ])
      } catch (error) {
        toast.error('Failed to load dashboard data')
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  if (authLoading) {
    return <AuthLoading />
  }

  const topPerformingAgents = agents
    .sort((a, b) => b.metrics.satisfactionScore - a.metrics.satisfactionScore)
    .slice(0, 5)

  const quickActions = [
    {
      title: 'Create Agent',
      description: 'Build a new AI agent',
      href: '/agents/new',
      icon: Bot,
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      title: 'Form Team',
      description: 'Create agent team',
      href: '/teams/new',
      icon: Users,
      color: 'bg-gray-600 hover:bg-gray-700'
    },
    {
      title: 'Visual Builder',
      description: 'Drag & drop builder',
      href: '/builder',
      icon: Zap,
      color: 'bg-gray-800 hover:bg-gray-900'
    }
  ]

  if (isLoading) {
    return (
      <MainLayout>
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4 md:p-6">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="p-4 md:p-8 space-y-6 md:space-y-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Welcome back, John! 👋
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Here&apos;s what&apos;s happening with your AI agents today
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {quickActions.map((action, index) => (
                <motion.div
                  key={action.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Button
                    onClick={() => action.title === 'Create Agent' ? router.push('/agents/new') : toast.info(`${action.title} feature coming soon!`)}
                    className={`${action.color} text-white`}
                  >
                    <action.icon className="w-4 h-4 mr-2" />
                    {action.title}
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
        >
          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Active Agents
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {analytics?.platformStats.totalAgents || 0}
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400 flex items-center mt-1">
                    <ArrowUpRight className="w-4 h-4 mr-1" />
                    +12% from last week
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <Bot className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Conversations Today
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {analytics?.platformStats.activeConversations || 0}
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400 flex items-center mt-1">
                    <ArrowUpRight className="w-4 h-4 mr-1" />
                    +8% from yesterday
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Avg Response Time
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {analytics?.platformStats.avgResponseTime || 0}s
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-400 flex items-center mt-1">
                    <ArrowDownRight className="w-4 h-4 mr-1" />
                    -15% faster
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Satisfaction Score
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {analytics?.platformStats.userSatisfaction || 0}
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400 flex items-center mt-1">
                    <ArrowUpRight className="w-4 h-4 mr-1" />
                    +0.2 from last month
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                  <Star className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>
                  Agent activity and accuracy over the last 24 hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={performanceData}>
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
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#3b82f6" 
                      fill="#3b82f6" 
                      fillOpacity={0.1}
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="accuracy" 
                      stroke="#10b981" 
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Channel Distribution</CardTitle>
                <CardDescription>
                  Conversations across different communication channels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={channelData}>
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
                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest updates from your AI agents and platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-800`}>
                        <activity.icon className={`w-5 h-5 ${activity.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {activity.title}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {activity.time}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Top Performing Agents */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Agents</CardTitle>
                <CardDescription>
                  Highest satisfaction scores this week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topPerformingAgents.map((agent, index) => (
                    <div key={agent.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {agent.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {agent.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            {agent.capabilities.join(', ')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={agent.status === 'active' ? 'default' : 'secondary'}>
                          {agent.status}
                        </Badge>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {agent.metrics.satisfactionScore.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  )
}