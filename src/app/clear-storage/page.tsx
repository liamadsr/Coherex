'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ClearStoragePage() {
  const router = useRouter()

  useEffect(() => {
    // Clear all localStorage
    localStorage.clear()
    
    // Clear all cookies
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
    })
    
    // Redirect to login
    router.push('/login')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-600">Clearing storage...</p>
    </div>
  )
}