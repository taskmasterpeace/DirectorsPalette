'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Upload,
  Clipboard,
  Trash2,
  Plus,
  Edit,
  X,
  Expand
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import type { Gen4ReferenceImage } from '@/lib/post-production/enhanced-types'
import { getImageDimensions } from '@/lib/post-production/helpers'
import { dbManager } from '@/lib/post-production/indexeddb'
import InlineTagEditor from '@/app/post-production/components/InlineTagEditor'
import { useIsMobile } from '@/hooks/use-mobile'

interface Gen4ReferenceManagerProps {
  gen4ReferenceImages: Gen4ReferenceImage[]
  setGen4ReferenceImages: (images: Gen4ReferenceImage[]) => void
  compact?: boolean
  maxImages?: number
  editingMode?: boolean
}

export function Gen4ReferenceManager({
  gen4ReferenceImages,
  setGen4ReferenceImages,
  compact = false,
  maxImages = 3,
  editingMode = false
}: Gen4ReferenceManagerProps) {
  const { toast } = useToast()
  const isMobile = useIsMobile()
  const [editingTagsId, setEditingTagsId] = useState<string | null>(null)
  const [fullscreenImage, setFullscreenImage] = useState<Gen4ReferenceImage | null>(null)

  // Mobile-first progressive disclosure: Start with 1, show 2 when 1 is filled, show 3 when 2 is filled, etc.
  
  useEffect(() => {
    // Load saved images from IndexedDB on component mount
    const loadImages = async () => {
      try {
        const savedImages = await dbManager.getReferenceImages();
        if (savedImages && savedImages.length > 0) {
          setGen4ReferenceImages(savedImages);
        }
      } catch (error) {
        console.error('Failed to load reference images:', error);