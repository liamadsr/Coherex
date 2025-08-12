'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { submitToWaitlist } from '@/lib/waitlist'
import { motion, AnimatePresence } from 'framer-motion'

interface WaitlistModalProps {
  isOpen: boolean
  onClose: () => void
}

export function WaitlistModal({ isOpen, onClose }: WaitlistModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    // Validate
    if (!formData.name || !formData.email || !formData.company) {
      setError('All fields are required')
      return
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email')
      return
    }
    
    setLoading(true)
    
    try {
      const result = await submitToWaitlist(formData)
      
      if (result.success) {
        setSuccess(true)
        setTimeout(() => {
          onClose()
          // Reset form after closing
          setTimeout(() => {
            setFormData({ name: '', email: '', company: '' })
            setSuccess(false)
          }, 300)
        }, 2000)
      } else {
        setError(result.error || 'Failed to join waitlist')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/80 dark:bg-black/80 z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
          >
            <div className="bg-white dark:bg-black border-4 border-solid border-black dark:border-white overflow-hidden relative">
              {/* Grid pattern background */}
              <div className="absolute inset-0 pointer-events-none opacity-50">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-100 dark:to-gray-900" />
                <div className="absolute inset-0" style={{
                  backgroundImage: `
                    linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px)
                  `,
                  backgroundSize: '24px 24px'
                }} />
              </div>
              
              {/* Header */}
              <div className="relative px-6 pt-6 pb-4 border-b-2 border-dashed border-gray-300 dark:border-gray-700">
                <button
                  onClick={onClose}
                  className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center border-2 border-dashed border-black dark:border-white text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                
                <h2 className="text-2xl font-bold text-black dark:text-white">Join the Waitlist</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Be among the first to experience COHEREX when we launch
                </p>
              </div>
              
              {/* Form */}
              <form onSubmit={handleSubmit} className="relative px-6 py-6">
                {success ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="py-8 text-center"
                  >
                    <div className="w-16 h-16 border-2 border-solid border-green-600 dark:border-green-400 flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="square" strokeLinejoin="miter" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-black dark:text-white mb-2">You're on the list!</h3>
                    <p className="text-gray-600 dark:text-gray-400">We'll notify you as soon as COHEREX is ready.</p>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name" className="text-black dark:text-white mb-2 block font-medium">
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        className="bg-white dark:bg-black border-2 border-solid border-black dark:border-white text-black dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-500 focus:outline-none focus:ring-0"
                        style={{ backgroundColor: 'transparent' }}
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        disabled={loading}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="email" className="text-black dark:text-white mb-2 block font-medium">
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        className="bg-white dark:bg-black border-2 border-solid border-black dark:border-white text-black dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-500 focus:outline-none focus:ring-0"
                        style={{ backgroundColor: 'transparent' }}
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        disabled={loading}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="company" className="text-black dark:text-white mb-2 block font-medium">
                        Company
                      </Label>
                      <Input
                        id="company"
                        type="text"
                        placeholder="Google, Microsoft, Startup, etc."
                        className="bg-white dark:bg-black border-2 border-solid border-black dark:border-white text-black dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-500 focus:outline-none focus:ring-0"
                        style={{ backgroundColor: 'transparent' }}
                        value={formData.company}
                        onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                        disabled={loading}
                      />
                    </div>
                    
                    {error && (
                      <div className="border-2 border-dashed border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-950/20 px-3 py-2">
                        <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                      </div>
                    )}
                    
                    <div className="pt-2 space-y-3">
                      <Button
                        type="submit"
                        className="w-full bg-[#F7941C] text-black hover:bg-[#E5861A] focus:outline-none focus:ring-0 border-2 border-solid border-black btn-texture-light py-2.5 font-medium"
                        disabled={loading}
                      >
                        {loading ? 'Joining...' : 'Join Waitlist'}
                      </Button>
                      
                      <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                        We respect your privacy and will never share your information.
                      </p>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}