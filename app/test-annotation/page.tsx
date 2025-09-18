'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function TestAnnotationPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to post-production layout tab
    router.push('/post-production#layout')
  }, [router])

  return (
    <div className="container mx-auto p-6 text-white">
      <p>Redirecting to post-production layout...</p>
    </div>
  )
}