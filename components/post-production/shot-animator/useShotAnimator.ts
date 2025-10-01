'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/components/auth/AuthProvider'
import { useUnifiedGalleryStore } from '@/stores/unified-gallery-store'
import { ImageData, VideoGeneration, VideoSettings } from './types'
import { SEEDANCE_MODELS } from './constants'
import { convertToBase64, dataURLtoFile, generateId } from "@/lib/post-production/helpers"
import { dbManager } from "@/lib/post-production/indexeddb"

export interface JobStatus {
  jobId: string;
  status: "processing" | "completed" | "failed" | "merging";
  total: number;
  completed: number;
  tasks: Array<{
    filename: string;
    prompt: string;
    status: string;
    outputUrl?: string;
    error?: string;
  }>;
  mergedOutputUrl?: string;
}

export function useShotAnimator(
  referenceImages?: (string | File)[],
  onReferenceImagesChange?: (images: (string | File)[]) => void,
  seed?: number,
  onSeedChange?: (seed: number) => void,
  lastFrameImages?: string[]
) {
  const { toast } = useToast()
  const { user } = useAuth()
  const { recentImages } = useUnifiedGalleryStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // State
  const [videoSettings, setVideoSettings] = useState<VideoSettings>({
    prompt: '',
    model: 'seedance-lite',
    resolution: '720p',
    duration: 5,
    aspectRatio: '16:9',
    seed: seed || Math.floor(Math.random() * 1000000),
    motionIntensity: 50,
    cameraFixed: false,
  })
  const [mode, setMode] = useState<"seedance" | "kontext">("seedance");
  const [generations, setGenerations] = useState<VideoGeneration[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null)
  const [generatedVideos, setGeneratedVideos] = useState<VideoGeneration[]>([]);
  const [filteredImages, setFilteredImages] = useState<ImageData[]>([])
  const [showOnlySelected, setShowOnlySelected] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "date" | "status">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [selectedImages, setSelectedImages] = useState<ImageData[]>([])
  const [showGallery, setShowGallery] = useState(false)

  const updateImagesWithResults = async (status: JobStatus) => {
    setSelectedImages((prev) =>
      prev.map((img) => {
        const task = status.tasks.find((t) => t.filename === img.file?.name);
        if (task) {
          const updatedVideos = task.outputUrl
            ? [...(img.videos || []), task.outputUrl]
            : img.videos;

          // Save updated video to IndexedDB
          if (task.outputUrl) {
            saveVideoToIndexedDB(img.id, task.outputUrl, img);
          }

          return {
            ...img,
            status: task.status as any,
            outputUrl: task.outputUrl ? task.outputUrl : img.outputUrl,
            videos: updatedVideos,
            error: task.error,
          };
        }
        return img;
      })
    );
  };

  // Helper function to save video to IndexedDB
  const saveVideoToIndexedDB = async (imageId: string, videoUrl: string, imageData: ImageData) => {
    try {
      const dbImage = await dbManager.getImage(imageId);
      if (!dbImage) return;

      const existingVideos = Array.isArray(dbImage.videos) ? [...dbImage.videos] : [];

      // Add new video URL if it doesn't exist
      if (!existingVideos.includes(videoUrl)) {
        existingVideos.push(videoUrl);

        const updatedImageData = {
          name: imageData.file?.name ?? dbImage.filename ?? "Unnamed Image",
          type: imageData.file?.type ?? dbImage.type ?? "image/png",
          size: imageData.file?.size ?? dbImage.size ?? 0,
        };

        await dbManager.saveImage(
          imageId,
          updatedImageData,
          dbImage.fileUrl || "",
          imageData.preview || dbImage.preview || dbImage.fileUrl,
          imageData.prompt ?? dbImage.prompt,
          imageData.selected ?? dbImage.selected,
          imageData.status ?? dbImage.status,
          existingVideos,
          imageData.mode ?? dbImage.mode,
          imageData.referenceImages ?? dbImage.referenceImages ?? [],
          imageData.lastFramePreview ?? dbImage.lastFramePreview ?? ""
        );
      }
    } catch (error) {
      console.error(`❌ Error saving video to IndexedDB for image ${imageId}:`, error);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (jobStatus && jobStatus.status === "processing") {
      interval = setInterval(async () => {
        try {
          const response = await fetch(`/api/job-status/${jobStatus.jobId}`);
          if (response.ok) {
            const updatedStatus = await response.json();
            setJobStatus(updatedStatus);

            if (
              updatedStatus.status === "completed" ||
              updatedStatus.status === "failed"
            ) {
              await updateImagesWithResults(updatedStatus);
            }
          }
        } catch (error) {
          console.error("Error polling job status:", error);
        }
      }, 2000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [jobStatus]);

  useEffect(() => {
    const initializeData = async () => {
      await loadFromIndexedDB();
    };

    initializeData();
  }, []);

  // Helper functions
  const loadFromIndexedDB = async () => {
    try {
      const [images, animatorReferences] = await Promise.all([
        dbManager.getImages(),
        dbManager.getAnimatorReferences()
      ]);
      const mergedImages = [...images];
      animatorReferences.forEach(ref => {
        const existingIndex = mergedImages.findIndex(img => img.id === ref.id);
        if (existingIndex >= 0) {
          mergedImages[existingIndex] = { ...mergedImages[existingIndex], ...ref };
        } else {
          mergedImages.push(ref);
        }
      });
      setSelectedImages(mergedImages);
      setFilteredImages(mergedImages);
      return mergedImages;
    } catch (error) {
      console.error("Error loading from IndexedDB:", error);
      return [];
    }
  };

  // Function to manually save a video URL to an image
  const addVideoToImage = async (imageId: string, videoUrl: string) => {
    try {
      // Update state
      setSelectedImages(prev => prev.map(img => {
        if (img.id === imageId) {
          const existingVideos = Array.isArray(img.videos) ? [...img.videos] : [];
          if (!existingVideos.includes(videoUrl)) {
            existingVideos.push(videoUrl);
            return { ...img, videos: existingVideos };
          }
        }
        return img;
      }));

      // Update IndexedDB
      const dbImage = await dbManager.getImage(imageId);
      if (dbImage) {
        const existingVideos = Array.isArray(dbImage.videos) ? [...dbImage.videos] : [];
        if (!existingVideos.includes(videoUrl)) {
          existingVideos.push(videoUrl);
          const updatedImageData = {
            name: dbImage.filename ?? "Unnamed Image",
            type: dbImage.type ?? "image/png",
            size: dbImage.size ?? 0,
          };

          await dbManager.saveImage(
            imageId,
            updatedImageData,
            dbImage.fileUrl || "",
            dbImage.preview,
            dbImage.prompt,
            dbImage.selected,
            dbImage.status,
            existingVideos,
            dbImage.mode
          );
        }
      }
    } catch (error) {
      console.error(`❌ Error manually adding video to image ${imageId}:`, error);
    }
  };

  // Credit calculation
  const selectedModel = SEEDANCE_MODELS.find(m => m.id === videoSettings.model)!
  const totalCredits = videoSettings.duration * selectedModel.creditsPerSecond

  // Handlers
  const handleFileUpload = async (files: FileList | null) => {
    try {
      if (!files) return;

      const newImages: ImageData[] = [];
      const filesArray = Array.from(files);

      for await (const file of filesArray) {
        if (file.type.startsWith("image/")) {
          const id = generateId();
          const base64Data = await convertToBase64(file);
          newImages.push({
            id,
            file,
            fileUrl: "",
            preview: base64Data,
            prompt: "",
            selected: false,
            status: "idle",
            mode: mode,
            referenceImages: [],
            lastFramePreview: "",
          });
          // Save uploaded image to IndexedDB
          await dbManager.saveImage(
            id,
            file,
            "",
            base64Data || file?.name || "",
            "",
            false,
            "idle",
            [],
            mode,
            [],       // referenceImages
            ""        // lastFramePreview
          );
        }
      }
      setSelectedImages((prev) => [...prev, ...newImages]);
      toast({
        title: "Images uploaded",
        description: `${newImages.length} image(s) uploaded successfully`,
      });
    } catch (error) {
      console.error("Error uploading images:", error);
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      const newImages: ImageData[] = [];

      for (const item of clipboardItems) {
        for (const type of item.types) {
          if (type.startsWith("image/")) {
            const blob = await item.getType(type);
            const base64 = await convertToBase64(blob as File);
            newImages.push({
              id: generateId(),
              file: new File([blob], `pasted_${Date.now()}.png`, { type }),
              fileUrl: "",
              preview: base64,
              prompt: "",
              selected: false,
              status: "idle",
              mode,
              referenceImages: [],
              lastFramePreview: "",
            });
          }
        }
      }

      if (newImages.length > 0) {
        await dbManager.saveImages(newImages);
        setSelectedImages(prev => [...prev, ...newImages]);
        toast({ title: "Image Pasted", description: "Image from clipboard added" });
      }
    } catch (err) {
      toast({
        title: "Paste Failed",
        description: "Unable to paste image",
        variant: "destructive",
      });
    }
  };

  const uploadFile = async (fileOrUrl: File | string | File[] | string[]): Promise<string | string[]> => {
    if (!fileOrUrl) return [];

    // Handle array of files or URLs
    if (Array.isArray(fileOrUrl)) {
      // If it's an array of URLs, return them as is
      if (fileOrUrl.every(item => typeof item === 'string')) {
        return fileOrUrl as string[];
      }

      // Process files sequentially to avoid rate limiting
      const results = [];
      for (const file of fileOrUrl as File[]) {
        try {
          const formData = new FormData();
          formData.append('media', file);

          const response = await fetch('/api/upload-file-media', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to upload file');
          }

          const result = await response.json();
          if (result.urls?.get) {
            results.push(result.urls.get);
          }
        } catch (error) {
          console.error('Error uploading file:', error);
          // Continue with other files even if one fails
        }
      }
      return results;
    }

    // Handle single file or URL
    if (typeof fileOrUrl === 'string') {
      return fileOrUrl;
    }

    // Single file upload
    try {
      const formData = new FormData();
      formData.append('media', fileOrUrl);

      const response = await fetch('/api/upload-file-media', {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload file");
      }

      const result = await response.json();
      if (!result.urls?.get) {
        throw new Error('Invalid response from upload API');
      }

      return result.urls.get;
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const startGeneration = async (
    mode: "seedance",
    images: ImageData[]
  ) => {
    const modeImages = images.filter((img) => img?.mode === mode);
    const selectedImages = modeImages.filter(
      (img) => img?.selected && img?.prompt?.trim()
    );

    if (selectedImages.length === 0) {
      toast({
        title: "No images selected",
        description: "Please select images with prompts to generate videos",
        variant: "destructive",
      });
      return;
    }

    // Mark selected images as processing
    setSelectedImages((prev) =>
      prev.map((img) =>
        img.selected && img.mode === mode
          ? { ...img, status: "processing" }
          : img
      )
    );

    try {
      setIsGenerating(true);

      // Create initial VideoGeneration objects with pending status
      const initialGenerations: VideoGeneration[] = selectedImages.map((img) => ({
        id: img.id,
        prompt: img.prompt || '',
        model: videoSettings.model,
        resolution: videoSettings.resolution,
        duration: videoSettings.duration,
        aspectRatio: videoSettings.aspectRatio,
        status: 'pending' as const,
        progress: 0,
        startTime: new Date(),
        referenceImages: img.referenceImages,
        seed: videoSettings.seed
      }));

      // Add to generations state immediately
      setGenerations(prev => [...prev, ...initialGenerations]);
      const fileUrls = await Promise.all(
        selectedImages.map(async (img) => {
          if (img.file) {
            const uploadResult = await uploadFile(img.file);
            return { id: img.id, url: uploadResult };
          }

          const dbImg = await dbManager.getImage(img.id);
          if (dbImg?.fileUrl) return { id: img.id, url: dbImg.fileUrl };

          if (dbImg?.preview) {
            try {
              const file = dataURLtoFile(dbImg.preview, `image-${img.id}.png`);
              const uploadResult = await uploadFile(file);
              return { id: img.id, url: uploadResult };
            } catch (error) {
              console.error("Error converting base64 to blob:", error);
            }
          }

          return { id: img.id, url: null };
        })
      );

      // Create Promise.all for the generate-media API calls
      const generationPromises = selectedImages.map(async (img, index) => {
        const fileUrl = fileUrls[index];

        if (!fileUrl || !fileUrl.url) {
          return {
            filename: img.id,
            prompt: img.prompt || "",
            status: "failed",
            error: "Failed to get image URL",
          };
        }

        // Upload reference images if they exist
        let referenceUrls: string[] = [];
        if (img.referenceImages && img.referenceImages.length > 0) {
          // Separate files and URLs
          const refFiles = img.referenceImages.filter((ref): ref is File => ref instanceof File);
          const existingUrls = img.referenceImages
            .filter((ref): ref is string => typeof ref === 'string');

          // Upload files if any
          if (refFiles.length > 0) {
            const uploadedRefs = await uploadFile(refFiles);
            referenceUrls = Array.isArray(uploadedRefs) ? uploadedRefs : [uploadedRefs];
          }

          // Add existing URLs
          referenceUrls = [...referenceUrls, ...existingUrls];
        }
        // Upload last frame if exists
        const lastFrameUrl = img.lastFrameFile
          ? await uploadFile(img.lastFrameFile)
          : undefined;

        // Create payload for this specific image
        const payload = {
          fileUrl: typeof fileUrl.url === "string" ? fileUrl.url : (Array.isArray(fileUrl.url) ? fileUrl.url[0] : ""),
          lastFrameUrl,
          prompt: img.prompt,
          resolution: videoSettings?.resolution,
          duration: videoSettings?.duration,
          camera_fixed: videoSettings?.cameraFixed || false,
          mode,
          seedanceModel: videoSettings?.model,
          filename: img.id,
          referenceImages: referenceUrls,
        };
        try {
          const response = await fetch("/api/generate-media", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const result = await response.json();
          return result.generatedResponse;
        } catch (error) {
          console.error(`Error generating video for image ${img.id}:`, error);
          return {
            filename: img.id,
            prompt: img.prompt || "",
            status: "failed",
            error: error instanceof Error ? error.message : "Unknown error occurred",
          };
        }
      });

      // Wait for all generation API calls to complete
      const generated = await Promise.all(generationPromises);

      // Update existing generations with results
      setGenerations(prev => prev.map(gen => {
        const selectedImg = selectedImages.find(img => img.id === gen.id);
        if (!selectedImg) return gen;

        const resultIndex = selectedImages.findIndex(img => img.id === gen.id);
        const result = generated[resultIndex];
        // Try multiple possible field names for video URL
        const videoUrl = result.outputUrl || result.videoUrl || result.url || result.output_url || result.video_url || null;

        return {
          ...gen,
          status: result.status === 'completed' ? 'completed' :
            result.status === 'failed' ? 'failed' : 'processing',
          progress: result.status === 'completed' ? 100 : 0,
          videoUrl: videoUrl,
          error: result.error,
          endTime: result.status === 'completed' ? new Date() : undefined,
        };
      }));
      console.log("generated", generated)
      setGeneratedVideos(generated);
      setJobStatus({
        jobId: `batch-${Date.now()}`, // Adding the required jobId field
        status: "completed",
        total: selectedImages.length,
        completed: generated.filter(g => g.status === "completed").length,
        tasks: generated
      });

      // Update selectedImages with completed status and new videos
      setSelectedImages((prev) => {
        const updated = prev.map((img) => {
          if (img.selected && img.mode === mode) {
            // Find the generated result for this image
            const genResult = generated.find(g => g.filename === img.id);
            if (genResult && genResult.outputUrl) {
              const existingVideos = Array.isArray(img.videos) ? [...img.videos] : [];
              if (!existingVideos.includes(genResult.outputUrl)) {
                existingVideos.push(genResult.outputUrl);
              }
              return {
                ...img,
                status: "completed",
                videos: existingVideos,
                outputUrl: genResult.outputUrl
              };
            }
            return { ...img, status: "completed" };
          }
          return img;
        });
        return updated;
      });

      // Update indexed DB with new videos
      for (const image of modeImages) {
        const dbImage = await dbManager.getImage(image.id);
        if (!dbImage) continue;

        // Find the generated result for this image
        const genResult = generated.find(g => g.filename === image.id);
        if (!genResult) continue;

        const newVideoUrl = genResult?.outputUrl;
        const fileUrl = genResult?.fileUrl || dbImage.fileUrl || "";

        const existingVideos = Array.isArray(dbImage.videos)
          ? [...dbImage.videos]
          : [];

        if (newVideoUrl && !existingVideos.includes(newVideoUrl)) {
          existingVideos.push(newVideoUrl);
        }

        const updatedImageData = {
          name: image.file?.name ?? dbImage.filename ?? "Unnamed Image",
          type: image.file?.type ?? dbImage.type ?? "image/png",
          size: image.file?.size ?? dbImage.size ?? 0,
        };

        await dbManager.saveImage(
          image.id,
          updatedImageData,
          fileUrl,
          image.preview ?? dbImage.preview,
          image.prompt ?? dbImage.prompt,
          image.selected ?? dbImage.selected,
          image.status ?? dbImage.status,
          existingVideos,
          image.mode ?? dbImage.mode
        );
      }
      toast({
        title: "Generation started",
        description: `Processing ${selectedImages.length} image(s)`,
      });
    } catch (error) {
      console.error("Generation error:", error);
      toast({
        title: "Generation failed",
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePause = () => {
    setIsGenerating(false)
  }

  const handleResume = () => {
    setIsGenerating(true)
  }

  const handleRemove = async (id: string) => {
    const imageToRemove = selectedImages.find(img => img.id === id);
    setSelectedImages((prev) => prev.filter((img) => img.id !== id));
    try {
      await dbManager.removeImage(id);
      const refs = await dbManager.getAnimatorReferences();
      const updatedRefs = refs.filter(ref => {
        if (ref.id !== id) {
          if (imageToRemove && ref.fileUrl === imageToRemove.fileUrl) {
            return false;
          }
          return true;
        }
        return false;
      });
      await dbManager.saveAnimatorReferences(updatedRefs);
    } catch (err) {
      console.warn(`Failed to remove image from stores: ${id}`, err);
    }
  };

  const handleDownload = async (videoUrl: string) => {
    try {
      // Fetch the video as a blob to force download
      const response = await fetch(videoUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch video');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `video_${Date.now()}.mp4`;

      document.body.appendChild(a);
      a.click();

      // Clean up
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download Started",
        description: "Your video download should begin shortly.",
      });
    } catch (error) {
      console.error('Download failed:', error);
      toast({
        title: "Download Failed",
        description: "Could not download the video. You can try right-clicking the video and selecting 'Save video as...'",
        variant: "destructive",
      });

      // Fallback: open in new tab if download fails
      window.open(videoUrl, '_blank');
    }
  }

  const handleImageSelect = (imageId: string) => {
    setSelectedImages(prev => {
      const isSelected = prev.some(img => img.id === imageId);
      if (isSelected) {
        // If image is already selected, remove it
        const newImages = prev.filter(img => img.id !== imageId);
        if (onReferenceImagesChange) {
          onReferenceImagesChange(newImages.map(img => img.preview).filter(Boolean));
        }
        return newImages;
      } else {
        // If image is not selected, add it with selected: true
        const newImage: ImageData = {
          id: imageId,
          preview: '',
          prompt: '',
          selected: true,
          status: 'idle' as const,
          mode: 'seedance' as const,
          file: undefined,
          fileUrl: '',
          videos: []
        };
        const newImages = [...prev, newImage];
        if (onReferenceImagesChange) {
          onReferenceImagesChange(newImages.map(img => img.preview).filter(Boolean));
        }
        return newImages;
      }
    });
  };

  const toggleImageSelection = (id: string) => {
    setSelectedImages((prev) => {
      const updatedImages = prev.map((img) =>
        img.id === id ? { ...img, selected: !img.selected } : img
      );

      // Save updated selection state to IndexedDB
      const updatedImage = updatedImages.find(img => img.id === id);
      if (updatedImage) {
        dbManager.saveImage(
          updatedImage.id,
          updatedImage.file || { name: updatedImage.filename || "Unknown", type: updatedImage.type, size: updatedImage.size },
          updatedImage.fileUrl,
          updatedImage.preview,
          updatedImage.prompt,
          updatedImage.selected, // This is the updated selection state
          updatedImage.status,
          updatedImage.videos || [],
          updatedImage.mode
        ).then(() => {
          console.log(`✅ Successfully saved selection state for image ${id}`);
        }).catch(error => {
          console.error("Failed to save image selection state:", error);
        });
      }

      return updatedImages;
    });
  };

  const selectedCount = selectedImages.filter((img) => img.selected).length;

  const filteredImagesData = useMemo(
    () => {
      const filtered = selectedImages
        .filter((img) => {
          // Always show images with generated videos
          if (img.videos && Array.isArray(img.videos) && img.videos.length > 0) {
            return true;
          }

          if (showOnlySelected && !img.selected) {
            return false;
          }
          if (
            searchQuery &&
            !img.file?.name?.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !img.prompt.toLowerCase().includes(searchQuery.toLowerCase())
          ) {
            return false;
          }
          return true;
        })
        .sort((a, b) => {
          let comparison = 0;
          switch (sortBy) {
            case "name":
              comparison = (a.file?.name || '').localeCompare(b.file?.name || '');
              break;
            case "date":
              comparison = a.id.localeCompare(b.id);
              break;
            case "status":
              comparison = a.status.localeCompare(b.status);
              break;
          }
          return sortOrder === "asc" ? comparison : -comparison;
        });
      return filtered;
    },
    [selectedImages, showOnlySelected, searchQuery, sortBy, sortOrder]
  );

  // Update filtered images when filteredImagesData changes
  useEffect(() => {
    setFilteredImages(filteredImagesData);
    if (filteredImagesData.length === 0 && selectedImages.length > 0) {
      setFilteredImages(selectedImages);
    }
  }, [filteredImagesData, selectedImages]);

  const selectAllImages = () => {
    const allSelected = selectedImages.every((img) => img.selected);
    setSelectedImages((prev) => {
      const updatedImages = prev.map((img) => ({ ...img, selected: !allSelected }));

      // Save all updated selection states to IndexedDB
      updatedImages.forEach(img => {
        dbManager.saveImage(
          img.id,
          img.file || { name: img.filename || "Unknown", type: img.type, size: img.size },
          img.fileUrl,
          img.preview,
          img.prompt,
          img.selected, // This is the updated selection state
          img.status,
          img.videos || [],
          img.mode
        ).catch(error => {
          console.error("Failed to save image selection state:", error);
        });
      });

      return updatedImages;
    });
  };

  const handleResumeGeneration = (id: string) => {
    setGenerations(prev => prev.map(gen =>
      gen.id === id ? { ...gen, status: 'processing' as const } : gen
    ));
  };

  const handleRemoveGeneration = (id: string) => {
    setGenerations(prev => prev.filter(gen => gen.id !== id));
  };

  return {
    startGeneration,
    selectedCount,
    filteredImages,
    filteredImagesData,
    mode,
    setMode,
    sortOrder,
    sortBy,
    setSortBy,
    showOnlySelected,
    selectAllImages,
    setShowOnlySelected,
    setSortOrder,
    // State
    videoSettings,
    setVideoSettings,
    generations,
    isGenerating,
    selectedImages,
    showGallery,
    setShowGallery,
    setSelectedImages,
    setSearchQuery,
    setFilteredImages,
    fileInputRef,
    totalCredits,
    jobStatus,
    searchQuery,
    generatedVideos,
    toggleImageSelection,
    // Handlers
    handleFileUpload,
    handlePasteFromClipboard,
    updateImagesWithResults,
    handlePause,
    handleResume,
    handleResumeGeneration,
    handleRemove,
    handleRemoveGeneration,
    handleDownload,
    handleImageSelect,
    addVideoToImage,
    // Data
    selectedModel,
    recentImages
  }
}