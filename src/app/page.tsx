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
  MessageSquare,
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
  Settings
} from 'lucide-react'
import { Button } from '@/components/ui/button'

// Feature cards data
const features = [
  {
    id: 'ai-agents',
    icon: Bot,
    title: 'AI Agents',
    description: 'Build intelligent agents that understand context and execute tasks autonomously.',
    gradient: 'from-gray-700 to-gray-900'
  },
  {
    id: 'mcp',
    icon: Workflow,
    title: 'Model Context Protocol',
    description: 'Connect to any tool or service through standardized MCP servers.',
    gradient: 'from-gray-600 to-gray-800'
  },
  {
    id: 'knowledge',
    icon: Database,
    title: 'Knowledge Sources',
    description: 'Integrate with SharePoint, Confluence, databases, and more.',
    gradient: 'from-gray-700 to-gray-900'
  },
  {
    id: 'integrations',
    icon: Zap,
    title: 'Integrations',
    description: 'Connect with HubSpot, Salesforce, Slack, and your favorite tools.',
    gradient: 'from-gray-600 to-gray-800'
  },
  {
    id: 'multi-channel',
    icon: MessageSquare,
    title: 'Multi-Channel',
    description: 'Deploy agents across email, chat, phone, and API endpoints.',
    gradient: 'from-gray-700 to-gray-900'
  },
  {
    id: 'enterprise',
    icon: Shield,
    title: 'Enterprise Ready',
    description: 'Built with security, compliance, and scalability in mind.',
    gradient: 'from-gray-600 to-gray-800'
  }
]

// Integration logos
const integrations = [
  { name: 'Slack', abbr: 'SL' },
  { name: 'Teams', abbr: 'MS' },
  { name: 'HubSpot', abbr: 'HS' },
  { name: 'Salesforce', abbr: 'SF' },
  { name: 'GitHub', abbr: 'GH' },
  { name: 'SharePoint', abbr: 'SP' },
  { name: 'Confluence', abbr: 'CF' },
  { name: 'Notion', abbr: 'NT' },
]

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-black/80 backdrop-blur-xl border-b border-gray-800' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-3">
                <Image
                  src="/images/coherex-Dark.png"
                  alt="COHEREX Logo"
                  width={32}
                  height={32}
                  className="flex-shrink-0"
                />
                <span className="text-xl font-bold">COHEREX</span>
              </Link>
              
              <div className="hidden md:flex items-center ml-10 space-x-8">
                <Link href="#features" className="text-gray-300 hover:text-white transition-colors">
                  Features
                </Link>
                <Link href="#integrations" className="text-gray-300 hover:text-white transition-colors">
                  Integrations
                </Link>
                <Link href="#solutions" className="text-gray-300 hover:text-white transition-colors">
                  Solutions
                </Link>
                <Link href="#pricing" className="text-gray-300 hover:text-white transition-colors">
                  Pricing
                </Link>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button className="bg-white text-black hover:bg-gray-300 focus:ring-0 focus:ring-offset-0 transition-colors" asChild>
                <Link href="/register">
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
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
            className="md:hidden bg-black/95 backdrop-blur-xl border-b border-gray-800"
          >
            <div className="px-4 pt-2 pb-4 space-y-2">
              <Link href="#features" className="block px-3 py-2 text-gray-300 hover:text-white">
                Features
              </Link>
              <Link href="#integrations" className="block px-3 py-2 text-gray-300 hover:text-white">
                Integrations
              </Link>
              <Link href="#solutions" className="block px-3 py-2 text-gray-300 hover:text-white">
                Solutions
              </Link>
              <Link href="#pricing" className="block px-3 py-2 text-gray-300 hover:text-white">
                Pricing
              </Link>
              <div className="pt-4 space-y-2">
                <Button variant="outline" className="w-full bg-transparent border-gray-500 text-white hover:bg-white/10 hover:border-white/30 hover:text-white focus:ring-0 focus:ring-offset-0 transition-all" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button className="w-full bg-white text-black hover:bg-gray-300 focus:ring-0 focus:ring-offset-0 transition-colors" asChild>
                  <Link href="/register">Get Started</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/20 via-black to-gray-800/20" />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
        
        {/* Animated gradient orbs - removed animate-pulse to reduce flashing */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gray-500 rounded-full filter blur-[128px] opacity-20 blur-stable" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gray-600 rounded-full filter blur-[128px] opacity-20 blur-stable" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={mounted ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
            animate={mounted ? { opacity: 1, y: 0 } : undefined}
            transition={mounted ? { duration: 0.8 } : undefined}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Build AI Agents
              <br />
              That Actually Work
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 mb-8 max-w-3xl mx-auto">
              The enterprise platform for creating, deploying, and managing intelligent AI agents 
              that integrate with your existing tools and workflows.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-black hover:bg-gray-300 focus:ring-0 focus:ring-offset-0 transition-colors text-lg px-8" asChild>
                <Link href="/register">
                  Start Building
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent border-gray-500 text-white hover:bg-white/10 hover:border-white/30 hover:text-white focus:ring-0 focus:ring-offset-0 transition-all" asChild>
                <Link href="#demo">
                  <Play className="w-5 h-5 mr-2" />
                  Watch Demo
                </Link>
              </Button>
            </div>
            
            <div className="mt-12 flex items-center justify-center space-x-8 text-gray-500">
              <div className="flex items-center">
                <Check className="w-5 h-5 mr-2 text-white" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center">
                <Check className="w-5 h-5 mr-2 text-white" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center">
                <Check className="w-5 h-5 mr-2 text-white" />
                <span>SOC2 compliant</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 relative no-flash">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={mounted ? { opacity: 0 } : { opacity: 1 }}
            whileInView={mounted ? { opacity: 1 } : undefined}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything you need to build
              <br />
              <span className="text-gray-300">
                production-ready AI agents
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              From simple chatbots to complex autonomous systems, coherex provides the tools 
              and infrastructure you need.
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
                className="group relative bg-gray-900 rounded-2xl p-8 hover:bg-gray-850 transition-all duration-300 no-flash"
                style={{ minHeight: '250px' }}
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} p-3 mb-6`}>
                  <feature.icon className="w-full h-full text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
                <ChevronRight className="absolute bottom-8 right-8 w-5 h-5 text-gray-600 group-hover:text-gray-400 transition-colors" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section id="integrations" className="py-20 relative overflow-hidden no-flash">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/10 to-transparent" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={mounted ? { opacity: 0 } : { opacity: 1 }}
            whileInView={mounted ? { opacity: 1 } : undefined}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Connects with your
              <br />
              <span className="text-gray-300">
                entire tech stack
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Seamlessly integrate with the tools your team already uses. 
              No complex setup, just connect and go.
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
                className="bg-gray-900 rounded-xl p-6 text-center hover:bg-gray-850 transition-all duration-300 hover:scale-105 no-flash"
              >
                <div className="text-2xl font-bold mb-3 bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto">{integration.abbr}</div>
                <p className="text-gray-400">{integration.name}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <p className="text-gray-400 mb-4">And 100+ more integrations</p>
            <Button variant="outline" className="bg-transparent border-gray-500 text-white hover:bg-white/10 hover:border-white/30 hover:text-white focus:ring-0 focus:ring-offset-0 transition-all">
              View All Integrations
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={mounted ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
            whileInView={mounted ? { opacity: 1, y: 0 } : undefined}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 rounded-3xl p-12 backdrop-blur-xl border border-gray-700 no-flash"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Ready to transform your business
              <br />
              with AI agents?
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              Join thousands of companies already using coherex to automate their workflows.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-black hover:bg-gray-300 focus:ring-0 focus:ring-offset-0 transition-colors text-lg px-8" asChild>
                <Link href="/register">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent border-gray-500 text-white hover:bg-white/10 hover:border-white/30 hover:text-white focus:ring-0 focus:ring-offset-0 transition-all" asChild>
                <Link href="/contact">
                  Talk to Sales
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-800">
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
                <span className="text-xl font-bold">COHEREX</span>
              </div>
              <p className="text-gray-400">
                The enterprise platform for AI agents.
              </p>
              <div className="flex space-x-4 mt-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <Github className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white">Features</Link></li>
                <li><Link href="#" className="hover:text-white">Integrations</Link></li>
                <li><Link href="#" className="hover:text-white">Pricing</Link></li>
                <li><Link href="#" className="hover:text-white">Documentation</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white">About</Link></li>
                <li><Link href="#" className="hover:text-white">Blog</Link></li>
                <li><Link href="#" className="hover:text-white">Careers</Link></li>
                <li><Link href="#" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white">Privacy</Link></li>
                <li><Link href="#" className="hover:text-white">Terms</Link></li>
                <li><Link href="#" className="hover:text-white">Security</Link></li>
                <li><Link href="#" className="hover:text-white">Compliance</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2024 coherex. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}