'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface CodeViewerProps {
  content: string
  language?: string
  className?: string
  editable?: boolean
  onChange?: (value: string) => void
}

export function CodeViewer({ 
  content, 
  language, 
  className,
  editable = false,
  onChange
}: CodeViewerProps) {
  // Detect language from content if not provided
  const detectLanguage = (text: string): string => {
    // First check if language hint is provided
    if (language) {
      // Normalize common extensions to language names
      const langMap: Record<string, string> = {
        'js': 'javascript',
        'jsx': 'javascript',
        'ts': 'typescript',
        'tsx': 'typescript',
        'py': 'python',
        'yml': 'yaml',
        'md': 'markdown',
        'json': 'json'
      }
      return langMap[language] || language
    }
    
    // Otherwise detect from content
    if (text.includes('import React') || text.includes('export default')) return 'javascript'
    if (text.includes('def ') || text.includes('import ') || text.includes('class ')) return 'python'
    if (text.includes('<?php')) return 'php'
    if (text.includes('<!DOCTYPE') || text.includes('<html')) return 'html'
    if (text.includes('{') && text.includes('}') && text.includes(':')) return 'json'
    return 'text'
  }

  const lang = detectLanguage(content)

  // Simple syntax highlighting using React elements instead of dangerouslySetInnerHTML
  const highlightCode = (code: string, lang: string): React.ReactNode => {
    if (!code) return <span className="text-gray-500">Empty file</span>

    const lines = code.split('\n')
    
    return (
      <div className="font-mono text-sm">
        {lines.map((line, lineIndex) => (
          <div key={lineIndex} className="flex hover:bg-gray-50 dark:hover:bg-gray-900/50">
            <span className="select-none pr-4 text-gray-500 dark:text-gray-600 text-right w-12 flex-shrink-0">
              {lineIndex + 1}
            </span>
            <span className="flex-1 whitespace-pre">
              <SyntaxHighlightedLine line={line} language={lang} />
            </span>
          </div>
        ))}
      </div>
    )
  }

  if (editable) {
    return (
      <textarea
        value={content}
        onChange={(e) => onChange?.(e.target.value)}
        className={cn(
          "w-full h-full font-mono text-sm resize-none",
          "bg-transparent border-0 focus:outline-none focus:ring-0",
          "text-gray-900 dark:text-gray-100 p-4",
          className
        )}
        placeholder="Enter code..."
        spellCheck={false}
      />
    )
  }

  return (
    <div className={cn("overflow-auto", className)}>
      {highlightCode(content, lang)}
    </div>
  )
}

// Component to highlight a single line of code
function SyntaxHighlightedLine({ line, language }: { line: string; language: string }) {
  // Keywords for different languages
  const keywords: Record<string, Set<string>> = {
    python: new Set(['def', 'class', 'import', 'from', 'if', 'else', 'elif', 'for', 'while', 'return', 'try', 'except', 'with', 'as', 'lambda', 'yield', 'await', 'async', 'True', 'False', 'None', 'and', 'or', 'not', 'in', 'is', 'print', 'len', 'range', 'str', 'int', 'float', 'list', 'dict', 'set', 'tuple']),
    javascript: new Set(['const', 'let', 'var', 'function', 'class', 'import', 'export', 'from', 'if', 'else', 'for', 'while', 'return', 'try', 'catch', 'finally', 'throw', 'new', 'this', 'async', 'await', 'true', 'false', 'null', 'undefined', 'console', 'JSON', 'Math', 'Object', 'Array', 'String']),
    typescript: new Set(['const', 'let', 'var', 'function', 'class', 'import', 'export', 'from', 'if', 'else', 'for', 'while', 'return', 'try', 'catch', 'finally', 'throw', 'new', 'this', 'async', 'await', 'true', 'false', 'null', 'undefined', 'interface', 'type', 'enum', 'namespace', 'module', 'declare', 'abstract']),
  }

  const langKeywords = keywords[language] || keywords.javascript

  // Parse the line into tokens
  const tokens: React.ReactNode[] = []
  let currentIndex = 0
  
  // Check for comments first (preserve leading whitespace)
  const trimmedLine = line.trimStart()
  const leadingSpaces = line.length - trimmedLine.length
  
  if (language === 'python' && trimmedLine.startsWith('#')) {
    return (
      <>
        {leadingSpaces > 0 && <span style={{ whiteSpace: 'pre' }}>{' '.repeat(leadingSpaces)}</span>}
        <span className="text-gray-500 dark:text-gray-400 italic">{trimmedLine}</span>
      </>
    )
  }
  if ((language === 'javascript' || language === 'typescript') && trimmedLine.startsWith('//')) {
    return (
      <>
        {leadingSpaces > 0 && <span style={{ whiteSpace: 'pre' }}>{' '.repeat(leadingSpaces)}</span>}
        <span className="text-gray-500 dark:text-gray-400 italic">{trimmedLine}</span>
      </>
    )
  }

  // Simple tokenizer
  const regex = /("[^"]*"|'[^']*'|`[^`]*`|\b\w+\b|\d+\.?\d*|[^\w\s"'`]+|\s+)/g
  let match

  while ((match = regex.exec(line)) !== null) {
    const token = match[0]
    
    // Preserve spaces by converting to non-breaking spaces
    if (/^\s+$/.test(token)) {
      tokens.push(
        <span key={currentIndex} style={{ whiteSpace: 'pre' }}>
          {token}
        </span>
      )
    }
    // String literals
    else if (token.startsWith('"') || token.startsWith("'") || token.startsWith('`')) {
      tokens.push(
        <span key={currentIndex} className="text-green-600 dark:text-green-400">
          {token}
        </span>
      )
    }
    // Numbers
    else if (/^\d+\.?\d*$/.test(token)) {
      tokens.push(
        <span key={currentIndex} className="text-blue-600 dark:text-blue-400">
          {token}
        </span>
      )
    }
    // Keywords
    else if (langKeywords.has(token)) {
      tokens.push(
        <span key={currentIndex} className="text-purple-600 dark:text-purple-400 font-medium">
          {token}
        </span>
      )
    }
    // Function/class names (simplified detection)
    else if (currentIndex > 0 && (
      (language === 'python' && (line.includes(`def ${token}`) || line.includes(`class ${token}`))) ||
      ((language === 'javascript' || language === 'typescript') && (line.includes(`function ${token}`) || line.includes(`class ${token}`)))
    )) {
      tokens.push(
        <span key={currentIndex} className="text-blue-600 dark:text-blue-400 font-medium">
          {token}
        </span>
      )
    }
    // Default text
    else {
      tokens.push(<span key={currentIndex}>{token}</span>)
    }
    
    currentIndex++
  }

  return <>{tokens}</>
}