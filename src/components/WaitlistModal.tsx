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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
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
            <div className="bg-black rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
              {/* Header */}
              <div className="relative px-6 pt-6 pb-4">
                <button
                  onClick={onClose}
                  className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <h2 className="text-2xl font-bold text-white">Join the Waitlist</h2>
                <p className="text-gray-400 mt-1">
                  Be among the first to experience COHEREX when we launch
                </p>
              </div>
              
              {/* Form */}
              <form onSubmit={handleSubmit} className="px-6 pb-6">
                {success ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="py-8 text-center"
                  >
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">You're on the list!</h3>
                    <p className="text-gray-400">We'll notify you as soon as COHEREX is ready.</p>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name" className="text-white mb-2 block">
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        className="bg-gray-950 border-gray-700 text-white placeholder:text-gray-500 focus:outline-none focus:border-gray-600 focus:ring-0"
                        style={{ backgroundColor: '#0a0a0a' }}
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        disabled={loading}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="email" className="text-white mb-2 block">
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        className="bg-gray-950 border-gray-700 text-white placeholder:text-gray-500 focus:outline-none focus:border-gray-600 focus:ring-0"
                        style={{ backgroundColor: '#0a0a0a' }}
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        disabled={loading}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="company" className="text-white mb-2 block">
                        Company
                      </Label>
                      <Input
                        id="company"
                        type="text"
                        placeholder="Google, Microsoft, Startup, etc."
                        className="bg-gray-950 border-gray-700 text-white placeholder:text-gray-500 focus:outline-none focus:border-gray-600 focus:ring-0"
                        style={{ backgroundColor: '#0a0a0a' }}
                        value={formData.company}
                        onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                        disabled={loading}
                      />
                    </div>
                    
                    {error && (
                      <p className="text-red-400 text-sm">{error}</p>
                    )}
                    
                    <div className="pt-2 space-y-3">
                      <Button
                        type="submit"
                        className="w-full bg-white text-black hover:bg-gray-200 focus:outline-none focus:ring-0"
                        disabled={loading}
                      >
                        {loading ? 'Joining...' : 'Join Waitlist'}
                      </Button>
                      
                      <p className="text-xs text-gray-500 text-center">
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