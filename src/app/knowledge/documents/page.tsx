'use client'

import { useState } from 'react'
import { 
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  Trash2,
  MoreVertical,
  Calendar,
  User,
  Tag,
  FolderOpen,
  FileCode,
  Image,
  FileSpreadsheet,
  File,
  Clock,
  Hash,
  ChevronRight
} from 'lucide-react'

import { MainLayout } from '@/components/layouts/MainLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Checkbox } from '@/components/ui/checkbox'

export default function KnowledgeDocumentsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterSource, setFilterSource] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [selectedDocs, setSelectedDocs] = useState<number[]>([])

  // Mock data for documents
  const documents = [
    {
      id: 1,
      name: 'Getting Started Guide.pdf',
      type: 'pdf',
      icon: FileText,
      source: 'Product Documentation',
      size: '2.4 MB',
      modified: '2024-01-28',
      modifiedBy: 'John Smith',
      tags: ['onboarding', 'tutorial'],
      chunks: 45,
      references: 12
    },
    {
      id: 2,
      name: 'API Authentication.md',
      type: 'markdown',
      icon: FileCode,
      source: 'API Reference',
      size: '145 KB',
      modified: '2024-01-27',
      modifiedBy: 'Sarah Johnson',
      tags: ['api', 'security', 'authentication'],
      chunks: 18,
      references: 34
    },
    {
      id: 3,
      name: 'Product Screenshots',
      type: 'folder',
      icon: FolderOpen,
      source: 'Product Documentation',
      size: '15.3 MB',
      modified: '2024-01-26',
      modifiedBy: 'Design Team',
      tags: ['ui', 'screenshots'],
      chunks: 0,
      references: 8,
      itemCount: 24
    },
    {
      id: 4,
      name: 'Customer FAQ.xlsx',
      type: 'spreadsheet',
      icon: FileSpreadsheet,
      source: 'Customer Support FAQs',
      size: '890 KB',
      modified: '2024-01-25',
      modifiedBy: 'Support Team',
      tags: ['faq', 'support'],
      chunks: 89,
      references: 156
    },
    {
      id: 5,
      name: 'Architecture Diagram.png',
      type: 'image',
      icon: Image,
      source: 'Technical Specifications',
      size: '3.2 MB',
      modified: '2024-01-24',
      modifiedBy: 'Dev Team',
      tags: ['architecture', 'diagram'],
      chunks: 1,
      references: 23
    },
    {
      id: 6,
      name: 'Employee Handbook.pdf',
      type: 'pdf',
      icon: FileText,
      source: 'Company Policies',
      size: '5.6 MB',
      modified: '2024-01-23',
      modifiedBy: 'HR Department',
      tags: ['hr', 'policies', 'handbook'],
      chunks: 124,
      references: 45
    },
    {
      id: 7,
      name: 'Integration Examples',
      type: 'folder',
      icon: FolderOpen,
      source: 'Code Examples',
      size: '8.9 MB',
      modified: '2024-01-22',
      modifiedBy: 'Dev Team',
      tags: ['code', 'examples', 'integration'],
      chunks: 0,
      references: 67,
      itemCount: 15
    },
    {
      id: 8,
      name: 'Release Notes v2.5.txt',
      type: 'text',
      icon: File,
      source: 'Product Documentation',
      size: '45 KB',
      modified: '2024-01-21',
      modifiedBy: 'Product Team',
      tags: ['release', 'changelog'],
      chunks: 8,
      references: 12
    },
  ]

  const sources = ['All Sources', 'Product Documentation', 'API Reference', 'Customer Support FAQs', 'Technical Specifications', 'Company Policies', 'Code Examples']
  const fileTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'pdf', label: 'PDF' },
    { value: 'markdown', label: 'Markdown' },
    { value: 'folder', label: 'Folders' },
    { value: 'spreadsheet', label: 'Spreadsheets' },
    { value: 'image', label: 'Images' },
    { value: 'text', label: 'Text Files' },
  ]

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesSource = filterSource === 'all' || doc.source === filterSource
    const matchesType = filterType === 'all' || doc.type === filterType
    
    return matchesSearch && matchesSource && matchesType
  })

  const toggleDocSelection = (id: number) => {
    setSelectedDocs(prev => 
      prev.includes(id) 
        ? prev.filter(docId => docId !== id)
        : [...prev, id]
    )
  }

  const toggleAllSelection = () => {
    if (selectedDocs.length === filteredDocuments.length) {
      setSelectedDocs([])
    } else {
      setSelectedDocs(filteredDocuments.map(doc => doc.id))
    }
  }

  return (
    <MainLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Documents</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Browse and manage all documents in your knowledge base
              </p>
            </div>
            <div className="flex gap-2">
              {selectedDocs.length > 0 && (
                <>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export ({selectedDocs.length})
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete ({selectedDocs.length})
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">1,234</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Documents</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FolderOpen className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">156</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Folders</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Hash className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">8,542</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Chunks</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">2h ago</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Last Updated</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="search"
              placeholder="Search documents or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterSource} onValueChange={setFilterSource}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              {sources.slice(1).map(source => (
                <SelectItem key={source} value={source}>{source}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[200px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              {fileTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Documents Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox 
                    checked={selectedDocs.length === filteredDocuments.length && filteredDocuments.length > 0}
                    onCheckedChange={toggleAllSelection}
                  />
                </TableHead>
                <TableHead>Document</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Modified</TableHead>
                <TableHead>Chunks</TableHead>
                <TableHead>References</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.map((doc) => (
                <TableRow key={doc.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <TableCell>
                    <Checkbox 
                      checked={selectedDocs.includes(doc.id)}
                      onCheckedChange={() => toggleDocSelection(doc.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <doc.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">{doc.name}</p>
                          {doc.type === 'folder' && (
                            <span className="text-sm text-gray-500">({doc.itemCount} items)</span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          {doc.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              <Tag className="w-3 h-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{doc.source}</Badge>
                  </TableCell>
                  <TableCell>{doc.size}</TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{doc.modified}</p>
                      <p className="text-xs text-gray-500">{doc.modifiedBy}</p>
                    </div>
                  </TableCell>
                  <TableCell>{doc.chunks > 0 ? doc.chunks : '-'}</TableCell>
                  <TableCell>{doc.references}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </MainLayout>
  )
}