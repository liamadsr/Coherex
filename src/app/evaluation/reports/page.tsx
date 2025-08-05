'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Download, Calendar, Filter, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react'

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

export default function EvaluationReportsPage() {
  const router = useRouter()
  const [timeRange, setTimeRange] = useState('7d')
  const [reportType, setReportType] = useState('all')

  // Mock data
  const reports = [
    {
      id: '1',
      title: 'Weekly Performance Report',
      type: 'performance',
      date: '2024-01-15',
      status: 'completed',
      metrics: {
        accuracy: 94.5,
        change: +2.3
      }
    },
    {
      id: '2',
      title: 'Monthly Agent Comparison',
      type: 'comparison',
      date: '2024-01-10',
      status: 'completed',
      metrics: {
        accuracy: 91.2,
        change: -0.8
      }
    },
    {
      id: '3',
      title: 'Evaluation Criteria Analysis',
      type: 'criteria',
      date: '2024-01-08',
      status: 'processing',
      metrics: {
        accuracy: null,
        change: null
      }
    }
  ]

  const getReportIcon = (type: string) => {
    switch (type) {
      case 'performance':
        return BarChart3
      case 'comparison':
        return TrendingUp
      case 'criteria':
        return FileText
      default:
        return FileText
    }
  }

  return (
    <MainLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Evaluation Reports</h1>
            <Button>
              Generate Report
            </Button>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            View and download comprehensive evaluation reports
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-8">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[200px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>

          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-[200px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Report type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reports</SelectItem>
              <SelectItem value="performance">Performance</SelectItem>
              <SelectItem value="comparison">Comparison</SelectItem>
              <SelectItem value="criteria">Criteria Analysis</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reports List */}
        <div className="grid gap-4">
          {reports.map((report) => {
            const Icon = getReportIcon(report.type)
            
            return (
              <Card key={report.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                        <Icon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{report.title}</h3>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Generated on {new Date(report.date).toLocaleDateString()}
                          </span>
                          <Badge variant="secondary" className="capitalize">
                            {report.type}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      {report.metrics.accuracy && (
                        <div className="text-right">
                          <p className="text-2xl font-bold">{report.metrics.accuracy}%</p>
                          <div className="flex items-center justify-end">
                            {report.metrics.change > 0 ? (
                              <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                            )}
                            <span className={`text-sm ${report.metrics.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {report.metrics.change > 0 ? '+' : ''}{report.metrics.change}%
                            </span>
                          </div>
                        </div>
                      )}
                      
                      <Badge 
                        variant={report.status === 'completed' ? 'default' : 'secondary'}
                      >
                        {report.status}
                      </Badge>

                      <Button 
                        size="sm" 
                        variant="outline"
                        disabled={report.status !== 'completed'}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Empty State */}
        {reports.length === 0 && (
          <Card className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No reports available</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Generate your first report to see insights
            </p>
            <Button>Generate Report</Button>
          </Card>
        )}
      </div>
    </MainLayout>
  )
}