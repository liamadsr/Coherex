'use client'

import { useState } from 'react'
import { 
  Search,
  FileText,
  Sparkles,
  Clock,
  Filter,
  ChevronRight,
  Tag,
  Calendar,
  User,
  Database,
  ExternalLink,
  Star,
  TrendingUp,
  Hash,
  MessageSquare
} from 'lucide-react'

import { MainLayout } from '@/components/layouts/MainLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'

export default function KnowledgeSearchPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchMode, setSearchMode] = useState('semantic')
  const [selectedSources, setSelectedSources] = useState<string[]>(['all'])
  const [dateRange, setDateRange] = useState('all')
  const [relevanceThreshold, setRelevanceThreshold] = useState([0.7])

  // Mock search results
  const searchResults = [
    {
      id: 1,
      title: 'API Authentication Guide',
      content: 'Learn how to authenticate your API requests using OAuth 2.0. This guide covers the complete authentication flow including obtaining access tokens, refreshing tokens, and handling authentication errors...',
      source: 'API Reference',
      document: 'authentication.md',
      relevance: 0.95,
      lastModified: '2024-01-27',
      author: 'Dev Team',
      tags: ['api', 'authentication', 'oauth'],
      chunks: 3,
      highlighted: true
    },
    {
      id: 2,
      title: 'Getting Started with OAuth',
      content: 'OAuth 2.0 is the industry-standard protocol for authorization. This document explains how to implement OAuth in your application, including setting up client credentials and handling the authorization code flow...',
      source: 'Product Documentation',
      document: 'oauth-guide.pdf',
      relevance: 0.89,
      lastModified: '2024-01-25',
      author: 'John Smith',
      tags: ['oauth', 'security', 'tutorial'],
      chunks: 2
    },
    {
      id: 3,
      title: 'Common Authentication Errors',
      content: 'This FAQ covers the most common authentication errors you might encounter, including invalid client credentials, expired tokens, and scope-related issues. Each error includes troubleshooting steps...',
      source: 'Customer Support FAQs',
      document: 'auth-errors.xlsx',
      relevance: 0.82,
      lastModified: '2024-01-24',
      author: 'Support Team',
      tags: ['authentication', 'errors', 'troubleshooting'],
      chunks: 5
    },
    {
      id: 4,
      title: 'Token Refresh Implementation',
      content: 'Example code showing how to implement automatic token refresh in various programming languages. Includes best practices for token storage and security considerations...',
      source: 'Code Examples',
      document: 'token-refresh.js',
      relevance: 0.78,
      lastModified: '2024-01-22',
      author: 'Dev Team',
      tags: ['code', 'tokens', 'implementation'],
      chunks: 1
    },
  ]

  const popularSearches = [
    'API authentication',
    'Error handling',
    'Integration guide',
    'Rate limits',
    'Webhook setup',
    'Data export'
  ]

  const sources = [
    { value: 'all', label: 'All Sources' },
    { value: 'api-reference', label: 'API Reference' },
    { value: 'product-docs', label: 'Product Documentation' },
    { value: 'faqs', label: 'Customer Support FAQs' },
    { value: 'code-examples', label: 'Code Examples' },
    { value: 'tech-specs', label: 'Technical Specifications' },
  ]

  const toggleSource = (source: string) => {
    if (source === 'all') {
      setSelectedSources(['all'])
    } else {
      setSelectedSources(prev => {
        const filtered = prev.filter(s => s !== 'all')
        if (filtered.includes(source)) {
          const newSources = filtered.filter(s => s !== source)
          return newSources.length === 0 ? ['all'] : newSources
        } else {
          return [...filtered, source]
        }
      })
    }
  }

  return (
    <MainLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Knowledge Search</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Search across all your knowledge base documents
          </p>
        </div>

        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search your knowledge base..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-24 h-12 text-lg"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                  <Badge variant="secondary" className="cursor-pointer">
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI Search
                  </Badge>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Popular searches:</span>
                {popularSearches.map((search, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchQuery(search)}
                  >
                    {search}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search Mode */}
                <div>
                  <Label className="text-sm font-medium mb-3">Search Mode</Label>
                  <Select value={searchMode} onValueChange={setSearchMode}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="semantic">Semantic Search</SelectItem>
                      <SelectItem value="keyword">Keyword Match</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sources */}
                <div>
                  <Label className="text-sm font-medium mb-3">Sources</Label>
                  <div className="space-y-2">
                    {sources.map(source => (
                      <div key={source.value} className="flex items-center space-x-2">
                        <Checkbox 
                          checked={selectedSources.includes(source.value)}
                          onCheckedChange={() => toggleSource(source.value)}
                        />
                        <Label className="text-sm font-normal cursor-pointer">
                          {source.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Date Range */}
                <div>
                  <Label className="text-sm font-medium mb-3">Date Modified</Label>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">Last 7 days</SelectItem>
                      <SelectItem value="month">Last 30 days</SelectItem>
                      <SelectItem value="year">Last year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Relevance Threshold */}
                <div>
                  <div className="flex justify-between mb-3">
                    <Label className="text-sm font-medium">Relevance Threshold</Label>
                    <span className="text-sm text-gray-600">{(relevanceThreshold[0] * 100).toFixed(0)}%</span>
                  </div>
                  <Slider
                    value={relevanceThreshold}
                    onValueChange={setRelevanceThreshold}
                    min={0}
                    max={1}
                    step={0.05}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search Results */}
          <div className="lg:col-span-3">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Found {searchResults.length} results matching "{searchQuery || 'authentication'}"
              </p>
              <Select defaultValue="relevance">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="date">Date Modified</SelectItem>
                  <SelectItem value="popularity">Popularity</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              {searchResults.map((result) => (
                <Card key={result.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-semibold hover:text-blue-600 cursor-pointer">
                            {result.title}
                          </h3>
                          {result.highlighted && (
                            <Badge variant="default" className="bg-yellow-500">
                              <Star className="w-3 h-3 mr-1" />
                              Best Match
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <span className="flex items-center">
                            <Database className="w-3 h-3 mr-1" />
                            {result.source}
                          </span>
                          <span className="flex items-center">
                            <FileText className="w-3 h-3 mr-1" />
                            {result.document}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {result.lastModified}
                          </span>
                          <span className="flex items-center">
                            <User className="w-3 h-3 mr-1" />
                            {result.author}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {(result.relevance * 100).toFixed(0)}% match
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {result.chunks} chunks
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">
                      {result.content}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {result.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <Button variant="ghost" size="sm">
                        View Details
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Related Searches */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-base">Related Searches</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    OAuth 2.0 flow
                  </Button>
                  <Button variant="outline" size="sm">
                    <Hash className="w-3 h-3 mr-1" />
                    JWT tokens
                  </Button>
                  <Button variant="outline" size="sm">
                    <MessageSquare className="w-3 h-3 mr-1" />
                    API key management
                  </Button>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Security best practices
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}