'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { SettingsTab } from '@/app/post-production/components/tabs/SettingsTab'
import { defaultSettings } from '@/lib/post-production/settings-data'

export default function SettingsPage() {
  const router = useRouter()
  const [settings, setSettings] = useState(defaultSettings)

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-800">
        <div className="container mx-auto max-w-7xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => router.push('/')}
                className="flex items-center gap-2 text-slate-300 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Director's Palette
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Content */}
      <div className="container mx-auto max-w-7xl p-6">
        <SettingsTab settings={settings} setSettings={setSettings} />
      </div>
    </div>
  )
}