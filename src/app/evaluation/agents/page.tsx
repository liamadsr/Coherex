'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Bot, Activity, TrendingUp, AlertCircle } from 'lucide-react'

import { MainLayout } from '@/components/layouts/MainLayout'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

export default function EvaluationAgentsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  // Mock data
  const agents = [
    {
      id: '1',
      name: 'Customer Support Sarah',
      accuracy: 96,
      totalEvaluations: 145,
      passRate: 92,
      avgResponseTime: '1.2s',
      lastEvaluated: '2 hours ago',
      status: 'passing',
      trend: 'up'
    },
    {
      id: '2',
      name: 'Sales Agent Alex',
      accuracy: 88,
      totalEvaluations: 89,
      passRate: 85,
      avgResponseTime: '1.8s',
      lastEvaluated: '1 day ago',
      status: 'warning',
      trend: 'down'
    },
    {
      id: '3',
      name: 'Technical Support Bot',
      accuracy: 94,
      totalEvaluations: 234,
      passRate: 90,
      avgResponseTime: '0.9s',
      lastEvaluated: '3 hours ago',
      status: 'passing',
      trend: 'stable'
    }
  ]

  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <MainLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Agent Evaluations</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track and monitor the performance of your AI agents through evaluations
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Agents</p>
                  <p className="text-2xl font-bold">{agents.length}</p>
                </div>
                <Bot className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Avg Accuracy</p>
                  <p className="text-2xl font-bold">92.7%</p>
                </div>
                <Activity className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Passing</p>
                  <p className="text-2xl font-bold">2/3</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Need Review</p>
                  <p className="text-2xl font-bold">1</p>
                </div>
                <AlertCircle className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Agents List */}
        <div className="space-y-4">
          {filteredAgents.map((agent) => (
            <Card 
              key={agent.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push(`/evaluation/agents/${agent.id}`)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                      {agent.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{agent.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Last evaluated {agent.lastEvaluated}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{agent.accuracy}%</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Accuracy</p>
                    </div>

                    <div className="text-center">
                      <p className="text-2xl font-bold">{agent.totalEvaluations}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Evaluations</p>
                    </div>

                    <div className="text-center">
                      <p className="text-2xl font-bold">{agent.passRate}%</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Pass Rate</p>
                    </div>

                    <Badge 
                      variant={agent.status === 'passing' ? 'default' : 'secondary'}
                      className={agent.status === 'warning' ? 'bg-orange-100 text-orange-800' : ''}
                    >
                      {agent.status}
                    </Badge>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Performance</span>
                    <span className="text-sm font-medium">{agent.accuracy}%</span>
                  </div>
                  <Progress value={agent.accuracy} className="h-2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  )
}