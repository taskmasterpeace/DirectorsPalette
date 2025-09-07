'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface HelpSectionProps {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  badge?: string
}

export function HelpSection({ title, icon, children, badge }: HelpSectionProps) {
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          {icon}
          {title}
          {badge && <Badge variant="secondary" className="ml-auto">{badge}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
      </CardContent>
    </Card>
  )
}