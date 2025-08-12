'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowRight, 
  Check, 
  Sparkles, 
  Users, 
  Brain, 
  Zap,
  FileText,
  Database,
  Code,
  GitBranch,
  Cloud,
  Shield,
  Globe,
  ChevronRight,
  Github,
  Twitter,
  Linkedin,
  Menu,
  X,
  Play,
  Bot,
  Workflow,
  Settings,
  Mail,
  Sun,
  Moon,
  Laptop
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { submitToWaitlist } from '@/lib/waitlist'
import { WaitlistModal } from '@/components/WaitlistModal'
import { useTheme } from 'next-themes'

// Feature cards data
const features = [
  {
    id: 'ai-agents',
    icon: Users,
    title: 'Teams & Agents',
    description: 'Build intelligent employees that understand context and help run your business.',
    gradient: 'from-gray-700 to-gray-900'
  },
  {
    id: 'mcp',
    icon: Sparkles,
    title: 'Model Context Protocol',
    description: 'Connect your AI employees to all your tools and services through MCP.',
    gradient: 'from-gray-700 to-gray-900'
  },
  {
    id: 'knowledge',
    icon: Brain,
    title: 'Knowledge Sources',
    description: 'Choose which agents get access to what - databases, SOPs, SharePoint, and allocate resources.',
    gradient: 'from-gray-700 to-gray-900'
  },
  {
    id: 'integrations',
    icon: Zap,
    title: 'Integrations',
    description: 'Connect to Slack for conversations, HubSpot for reports, and all your business tools.',
    gradient: 'from-gray-700 to-gray-900'
  },
  {
    id: 'multi-channel',
    icon: Globe,
    title: 'Multi-Channel',
    description: 'They\'re everywhere you are - own inbox, phone number, email, chat, Slack. Tell them where to be.',
    gradient: 'from-gray-700 to-gray-900'
  },
  {
    id: 'enterprise',
    icon: Shield,
    title: 'Enterprise Ready',
    description: 'Stay in control with audit logs, conversation history, and a dashboard showing everything your agents do.',
    gradient: 'from-gray-700 to-gray-900'
  }
]

// Integration logos
const integrations = [
  { 
    name: 'Slack',
    slug: 'slack',
    lightColor: '000000', // Black for light mode
    darkColor: 'FFFFFF' // White for dark mode
  },
  { 
    name: 'Discord',
    slug: 'discord', 
    lightColor: '000000', // Black for light mode
    darkColor: 'FFFFFF' // White for dark mode
  },
  { 
    name: 'HubSpot',
    slug: 'hubspot',
    lightColor: '000000', // Black for light mode
    darkColor: 'FFFFFF' // White for dark mode
  },
  { 
    name: 'Salesforce',
    slug: 'salesforce',
    lightColor: '000000', // Black for light mode
    darkColor: 'FFFFFF' // White for dark mode
  },
  { 
    name: 'GitHub',
    slug: 'github',
    lightColor: '000000', // Black for light mode
    darkColor: 'FFFFFF' // White for dark mode
  },
  { 
    name: 'Google Docs',
    slug: 'googledocs', 
    lightColor: '000000', // Black for light mode
    darkColor: 'FFFFFF' // White for dark mode
  },
  { 
    name: 'Confluence',
    slug: 'confluence',
    lightColor: '000000', // Black for light mode
    darkColor: 'FFFFFF' // White for dark mode
  },
  { 
    name: 'Notion',
    slug: 'notion',
    lightColor: '000000', // Black for light mode
    darkColor: 'FFFFFF' // White for dark mode
  },
]

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [waitlistModalOpen, setWaitlistModalOpen] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white page-guides-light dark:page-guides-dark">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 bg-transparent py-2`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`panel flex items-center justify-between h-14 sm:h-16 px-3 sm:px-4 ${scrolled ? 'shadow-md' : ''}` }>
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-3">
                <Image
                  src="/images/coherex-Dark.png"
                  alt="COHEREX Logo"
                  width={32}
                  height={32}
                  className="flex-shrink-0"
                />
                <span className="text-xl font-bold text-black dark:text-white">COHEREX</span>
              </Link>
              
              <div className="hidden md:flex items-center ml-10 space-x-8">
                <Link href="#features" className="text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors">
                  Features
                </Link>
                <Link href="#integrations" className="text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors">
                  Integrations
                </Link>
                <Link href="#solutions" className="text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors">
                  Solutions
                </Link>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-4">
              <Button variant="outline" size="icon" className="bg-white dark:bg-black border-gray-300 dark:border-gray-600 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900 hover:border-gray-400 dark:hover:border-gray-500 focus:ring-0 focus:ring-offset-0" asChild>
                <a href="https://github.com/liamadsr/Coherex" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
              </Button>
              <Button variant="outline" size="icon" className="bg-white dark:bg-black border-gray-300 dark:border-gray-600 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900 hover:border-gray-400 dark:hover:border-gray-500 focus:ring-0 focus:ring-offset-0" asChild>
                <a href="https://discord.gg/6V64wxyf" target="_blank" rel="noopener noreferrer" aria-label="Discord">
                  <img 
                    src="https://cdn.simpleicons.org/discord/000000"
                    alt="Discord logo"
                    className="w-5 h-5 dark:hidden"
                  />
                  <img 
                    src="https://cdn.simpleicons.org/discord/FFFFFF"
                    alt="Discord logo"
                    className="w-5 h-5 hidden dark:block"
                  />
                </a>
              </Button>
              <Button 
                onClick={() => setWaitlistModalOpen(true)}
                className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 focus:ring-0 focus:ring-offset-0 transition-colors"
              >
                <Mail className="w-4 h-4 mr-2" />
                Join Waitlist
              </Button>
              <Button variant="outline" className="bg-white dark:bg-black border-gray-300 dark:border-gray-600 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900 hover:border-gray-400 dark:hover:border-gray-500 focus:ring-0 focus:ring-offset-0" asChild>
                <Link href="/auth/login">Sign In</Link>
              </Button>
              
              {/* Theme dropdown - far right */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="bg-white dark:bg-black border-gray-300 dark:border-gray-600 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900 hover:border-gray-400 dark:hover:border-gray-500 focus:ring-0 focus:ring-offset-0"
                  >
                    <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setTheme('light')} className="cursor-pointer">
                    <Sun className="mr-2 h-4 w-4" />
                    <span>Light</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme('dark')} className="cursor-pointer">
                    <Moon className="mr-2 h-4 w-4" />
                    <span>Dark</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme('system')} className="cursor-pointer">
                    <Laptop className="mr-2 h-4 w-4" />
                    <span>System</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-white/95 dark:bg-black/95 backdrop-blur-xl border-b border-gray-200 dark:border-neutral-800/50"
          >
            <div className="px-4 pt-2 pb-4 space-y-2">
              <Link href="#features" className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white">
                Features
              </Link>
              <Link href="#integrations" className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white">
                Integrations
              </Link>
              <Link href="#solutions" className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white">
                Solutions
              </Link>
              <a href="https://github.com/liamadsr/Coherex" target="_blank" rel="noopener noreferrer" className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white">
                <svg className="inline w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub Repository
              </a>
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="px-3 py-1 text-xs font-medium text-gray-500 dark:text-gray-400">Theme</div>
                <button
                  onClick={() => setTheme('light')}
                  className="flex items-center w-full px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white"
                >
                  <Sun className="w-5 h-5 mr-2" />
                  Light
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className="flex items-center w-full px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white"
                >
                  <Moon className="w-5 h-5 mr-2" />
                  Dark
                </button>
                <button
                  onClick={() => setTheme('system')}
                  className="flex items-center w-full px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white"
                >
                  <Laptop className="w-5 h-5 mr-2" />
                  System
                </button>
              </div>
              <div className="pt-4 space-y-2">
                <Button variant="outline" className="w-full bg-white dark:bg-transparent border-gray-300 dark:border-gray-600 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900" asChild>
                  <Link href="/auth/login">Sign In</Link>
                </Button>
                <Button 
                  onClick={() => setWaitlistModalOpen(true)}
                  className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 focus:ring-0 focus:ring-offset-0 transition-colors"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Join Waitlist
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section - blueprint/wireframe aesthetic */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Section uses panel-contained grid; no full-bleed grid here */}
        <div className="absolute inset-0" />
        {/* Soft vignette */}
        <div className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
        {/* Subtle orbs (kept minimal) */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-gray-500 rounded-full filter blur-[120px] opacity-10 blur-stable" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gray-600 rounded-full filter blur-[120px] opacity-10 blur-stable" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="panel panel-grid panel-grid-small-light dark:panel-grid-small-dark p-6 sm:p-10 md:p-12">
          <motion.div
            initial={mounted ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
            animate={mounted ? { opacity: 1, y: 0 } : undefined}
            transition={mounted ? { duration: 0.8 } : undefined}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              The Open Source Platform
              <br />
              for AI Employees
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              We're building a community-driven, open source platform for creating, deploying, and managing intelligent AI employees.
              Join us in shaping the future of AI automation.
            </p>
            
            <div className="flex flex-col items-center gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Command pill to echo the docs aesthetic */}
                <Button size="lg" variant="outline" className="text-lg px-8 bg-white dark:bg-transparent border-dashed border-2 border-gray-400 dark:border-gray-600 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900 focus:ring-0 focus:ring-offset-0" asChild>
                  <a href="https://github.com/liamadsr/Coherex" target="_blank" rel="noopener noreferrer">
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    Star on GitHub
                  </a>
                </Button>
                <Button 
                  size="lg" 
                  onClick={() => setWaitlistModalOpen(true)}
                  className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 focus:ring-0 focus:ring-offset-0 transition-colors text-lg px-8 border-2 border-dashed dark:border-gray-300"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Join Waitlist
                </Button>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Get early access and help shape the future of AI agents
              </p>
            </div>
            
            <div className="mt-12 flex items-center justify-center space-x-8 text-gray-600 dark:text-gray-500">
              <div className="flex items-center">
                <Check className="w-5 h-5 mr-2 text-black dark:text-white" />
                <span>100% Open Source</span>
              </div>
              <div className="flex items-center">
                <Check className="w-5 h-5 mr-2 text-black dark:text-white" />
                <span>Community Driven</span>
              </div>
              <div className="flex items-center">
                <Check className="w-5 h-5 mr-2 text-black dark:text-white" />
                <span>Easy to Use</span>
              </div>
            </div>
          </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section: dashed cards */}
      <section id="features" className="py-20 relative no-flash">
        <div className="absolute inset-0" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="panel panel-grid panel-grid-light dark:panel-grid-dark p-8 md:p-12">
          <motion.div
            initial={mounted ? { opacity: 0 } : { opacity: 1 }}
            whileInView={mounted ? { opacity: 1 } : undefined}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              What we're building
              <br />
              <span className="text-gray-600 dark:text-gray-300">
                together
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              COHEREX will be the open source standard for building, deploying, and managing AI agents.
              Here's what's coming:
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.id}
                initial={mounted ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
                whileInView={mounted ? { opacity: 1, y: 0 } : undefined}
                viewport={{ once: true, amount: 0.3 }}
                transition={mounted ? { 
                  duration: 0.5,
                  delay: index * 0.1,
                  ease: "easeOut"
                } : undefined}
                className="group relative bg-gray-50 dark:bg-[#050505] rounded-2xl p-8 hover:bg-gray-100 dark:hover:bg-[#0a0a0a] transition-all duration-300 no-flash border-2 border-dashed border-gray-300 dark:border-neutral-700"
                style={{ minHeight: '250px' }}
              >
                <div className="w-14 h-14 rounded-xl p-3 mb-6">
                  <feature.icon className="w-full h-full text-gray-700 dark:text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                <ChevronRight className="absolute bottom-8 right-8 w-5 h-5 text-gray-500 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors" />
              </motion.div>
            ))}
          </div>
          </div>
        </div>
      </section>

      {/* Integrations Section: blueprint band */}
      <section id="integrations" className="py-20 relative overflow-hidden no-flash">
        <div className="absolute inset-0" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="panel panel-grid panel-grid-light dark:panel-grid-dark p-8 md:p-12">
          <motion.div
            initial={mounted ? { opacity: 0 } : { opacity: 1 }}
            whileInView={mounted ? { opacity: 1 } : undefined}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Built to connect with
              <br />
              <span className="text-gray-600 dark:text-gray-300">
                everything
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              COHEREX will integrate seamlessly with the tools your team already uses.
              Open source means endless possibilities.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {integrations.map((integration, index) => (
              <motion.div
                key={integration.name}
                initial={mounted ? { opacity: 0, scale: 0.9 } : { opacity: 1, scale: 1 }}
                whileInView={mounted ? { opacity: 1, scale: 1 } : undefined}
                viewport={{ once: true, amount: 0.3 }}
                transition={mounted ? { 
                  duration: 0.4,
                  delay: index * 0.05,
                  ease: "easeOut"
                } : undefined}
                className="bg-gray-50 dark:bg-[#050505] rounded-xl p-6 text-center hover:bg-gray-100 dark:hover:bg-[#0a0a0a] transition-all duration-300 hover:scale-105 no-flash border-2 border-dashed border-gray-300 dark:border-neutral-700"
              >
                <div className="mb-3 w-12 h-12 flex items-center justify-center mx-auto">
                  {(integration.name === 'Teams' || integration.name === 'SharePoint') ? (
                    // Use fallback text for Teams and SharePoint since they might not be available
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-800 dark:text-white font-bold text-sm">
                      {integration.name === 'Teams' ? 'T' : 'SP'}
                    </div>
                  ) : (
                    <>
                      <img 
                        src={`https://cdn.simpleicons.org/${integration.slug}/${integration.lightColor}`}
                        alt={`${integration.name} logo`}
                        className="w-8 h-8 dark:hidden"
                      />
                      <img 
                        src={`https://cdn.simpleicons.org/${integration.slug}/${integration.darkColor}`}
                        alt={`${integration.name} logo`}
                        className="w-8 h-8 hidden dark:block"
                      />
                    </>
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-400">{integration.name}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <p className="text-gray-700 dark:text-gray-300 mb-4">And 100+ more integrations</p>
            <Button variant="outline" className="bg-white dark:bg-transparent border-2 border-dashed border-gray-400 dark:border-gray-600 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 focus:ring-0 focus:ring-offset-0 transition-all">
              View All Integrations
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={mounted ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
            whileInView={mounted ? { opacity: 1, y: 0 } : undefined}
            viewport={{ once: true }}
            className="panel panel-grid panel-grid-light dark:panel-grid-dark p-10 md:p-12 no-flash"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Be part of building
              <br />
              the future of AI employees
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              Join our community of developers, researchers, and companies working together to create the open source platform for AI automation.
            </p>
            <div className="flex flex-col items-center gap-6">
              <Button 
                size="lg" 
                onClick={() => setWaitlistModalOpen(true)}
                className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 focus:ring-0 focus:ring-offset-0 transition-colors text-lg px-8"
              >
                <Mail className="w-5 h-5 mr-2" />
                Get Early Access
              </Button>
              <div className="flex gap-4">
                <Button size="lg" variant="outline" className="text-lg px-8 bg-white dark:bg-transparent border-2 border-dashed border-gray-400 dark:border-gray-600 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 focus:ring-0 focus:ring-offset-0 transition-all" asChild>
                  <a href="https://github.com/liamadsr/Coherex" target="_blank" rel="noopener noreferrer">
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    Star on GitHub
                  </a>
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 bg-white dark:bg-transparent border-2 border-dashed border-gray-400 dark:border-gray-600 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 focus:ring-0 focus:ring-offset-0 transition-all" asChild>
                  <a href="https://discord.gg/6V64wxyf" target="_blank" rel="noopener noreferrer">
                    <img 
                      src="https://cdn.simpleicons.org/discord/000000"
                      alt="Discord logo"
                      className="w-5 h-5 mr-2 dark:hidden"
                    />
                    <img 
                      src="https://cdn.simpleicons.org/discord/FFFFFF"
                      alt="Discord logo"
                      className="w-5 h-5 mr-2 hidden dark:block"
                    />
                    Join Discord
                  </a>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-200 dark:border-neutral-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Image
                  src="/images/coherex-Dark.png"
                  alt="COHEREX Logo"
                  width={32}
                  height={32}
                  className="flex-shrink-0"
                />
                <span className="text-xl font-bold text-black dark:text-white">COHEREX</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                The open source platform for AI agents.
              </p>
              <div className="flex space-x-4 mt-4">
                <a href="https://github.com/liamadsr/Coherex" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li><Link href="#" className="hover:text-gray-900 dark:hover:text-white">Features</Link></li>
                <li><Link href="#" className="hover:text-gray-900 dark:hover:text-white">Integrations</Link></li>
                <li><Link href="#" className="hover:text-gray-900 dark:hover:text-white">Documentation</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li><Link href="#" className="hover:text-gray-900 dark:hover:text-white">About</Link></li>
                <li><Link href="#" className="hover:text-gray-900 dark:hover:text-white">Blog</Link></li>
                <li><Link href="#" className="hover:text-gray-900 dark:hover:text-white">Careers</Link></li>
                <li><Link href="#" className="hover:text-gray-900 dark:hover:text-white">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li><Link href="#" className="hover:text-gray-900 dark:hover:text-white">Privacy</Link></li>
                <li><Link href="#" className="hover:text-gray-900 dark:hover:text-white">Terms</Link></li>
                <li><Link href="#" className="hover:text-gray-900 dark:hover:text-white">Security</Link></li>
                <li><Link href="#" className="hover:text-gray-900 dark:hover:text-white">Compliance</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-neutral-800/50 text-center text-gray-600 dark:text-gray-400">
            <p>&copy; 2025 COHEREX. Open Source Project.</p>
          </div>
        </div>
      </footer>
      
      {/* Waitlist Modal */}
      <WaitlistModal 
        isOpen={waitlistModalOpen} 
        onClose={() => setWaitlistModalOpen(false)} 
      />
    </div>
  )
}