import { LucideIcon } from 'lucide-react'

export interface BoostPack {
  name: string
  points: number
  price: number
  icon: LucideIcon
  gradient: string
  ring: string
  description: string
  popular?: boolean
}

export interface FormatCard {
  icon: string
  name: string
  desc: string
  color: string
}

export interface CompetitorData {
  name: string
  price: string
  features: string
  color: string
}

export interface SocialProofStat {
  value: string
  label: string
}

export interface AuthUser {
  name?: string
  email?: string
}

export interface LandingPageProps {
  isAuthenticated: boolean
  user?: AuthUser | null
}

export interface AuthenticatedFeaturesProps extends LandingPageProps {
  userCredits: number
  onBoostPurchase: (boostPackId: string) => Promise<void>
}