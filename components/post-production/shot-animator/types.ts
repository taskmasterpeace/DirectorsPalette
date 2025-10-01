// Shot Animator Types and Constants

export interface SeeeDanceModel {
  id: 'seedance-lite' | 'seedance-pro'
  name: string
  description: string
  icon: string
  maxResolution: string
  creditsPerSecond: number
  features: string[]
  apiProvider: 'replicate' | 'aiml'
  endpoint: string
}

export interface VideoGeneration {
  id: string
  prompt: string
  model: 'seedance-lite' | 'seedance-pro'
  resolution: string
  duration: number
  aspectRatio: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  videoUrl?: string
  error?: string
  startTime?: Date
  endTime?: Date
  creditsUsed?: number
  referenceImages?: (string | File)[]
  seed?: number
}
export interface ShotAnimatorTabProps {
  className?: string
  galleryMode?: 'minimal' | 'full'
  onImageSelect?: (imageUrl: string) => void
  referenceImages?: (string | File)[]
  onReferenceImagesChange?: (images: (string | File)[]) => void
  seed?: number
  onSeedChange?: (seed: number) => void
  lastFrameImages?: string[]
}

export interface VideoSettings {
  prompt: string
  model: 'seedance-lite' | 'seedance-pro'
  resolution: string
  duration: number
  aspectRatio: string
  seed: number
  motionIntensity: number
  cameraFixed?: boolean
}

export interface EditHistoryItem {
  id: string;
  prompt: string;
  imageUrl: string;
  timestamp: number;
  model: "dev" | "max";
}

export interface ImageData {
  filename?: any;
  id: string;
  file?: File;
  type?: string;
  size?: number;
  fileUrl: string;
  preview: string;
  prompt: string;
  selected: boolean;
  status: "idle" | "processing" | "completed" | "failed";
  outputUrl?: string;
  videos?: string[];
  lastFrame?: File | null;
  lastFrameFile?: File | undefined;
  lastFramePreview?: string | null;
  error?: string;
  referenceImages?: (string | File)[];
  editHistory?: EditHistoryItem[];
  mode: "seedance" | "kontext";
}