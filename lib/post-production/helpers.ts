import { toast } from "@/hooks/use-toast";

/**
 * Copy a file URL to clipboard and show toast notification.
 */
export const copyToClipboard = async (fileUrl: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(fileUrl);
    toast({
      title: "URL copied to clipboard",
      description: "URL copied to clipboard!",
    });
  } catch (error) {
    console.error("Failed to copy URL:", error);
  }
};

/**
 * Download a file from a given URL handling CORS and displaying errors in console.
 */
export const downloadFile = async (fileUrl: string): Promise<void> => {
  const fileName = fileUrl.split("/").pop() || "file";
  try {
    const response = await fetch(fileUrl, { mode: "cors" });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Download failed:", error);
  }
};

/**
 * Prevents the default action for a drag-over event.
 */
export const handleDragOver = (e: React.DragEvent): void => {
  e.preventDefault();
};

/**
 * Convert a File or Blob to base64 data URL
 */
export async function convertToBase64(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Validate image file type
 */
export function isValidImageFile(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  return validTypes.includes(file.type);
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Detect aspect ratio from image dimensions
 */
export function detectAspectRatio(width: number, height: number): string {
  const ratio = width / height;
  
  // Define common aspect ratios with tolerance
  const aspectRatios = [
    { ratio: 16/9, label: "16:9" },
    { ratio: 4/3, label: "4:3" },
    { ratio: 1, label: "1:1" },
    { ratio: 3/4, label: "3:4" },
    { ratio: 9/16, label: "9:16" }
  ];
  
  // Find closest match
  let closest = aspectRatios[0];
  let minDiff = Math.abs(ratio - closest.ratio);
  
  for (const ar of aspectRatios) {
    const diff = Math.abs(ratio - ar.ratio);
    if (diff < minDiff) {
      minDiff = diff;
      closest = ar;
    }
  }
  
  // If difference is too large, return custom ratio
  if (minDiff > 0.1) {
    // Simplify to nearest common fraction
    if (ratio > 1) {
      return `${Math.round(ratio * 10) / 10}:1`;
    } else {
      return `1:${Math.round((1/ratio) * 10) / 10}`;
    }
  }
  
  return closest.label;
}

/**
 * Get image dimensions from file
 */
export async function getImageDimensions(file: File): Promise<{ width: number; height: number; aspectRatio: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const aspectRatio = detectAspectRatio(img.width, img.height);
      resolve({ 
        width: img.width, 
        height: img.height,
        aspectRatio
      });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image'));
    };
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Create a thumbnail from an image file
 */
export async function createThumbnail(file: File, maxWidth = 200, maxHeight = 200): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const objectUrl = URL.createObjectURL(file);
    
    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }
    
    img.onload = () => {
      // Clean up object URL to prevent memory leak
      URL.revokeObjectURL(objectUrl);
      
      // Calculate new dimensions
      let width = img.width;
      let height = img.height;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw resized image
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to blob
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create thumbnail'));
        }
      }, 'image/jpeg', 0.8);
    };
    
    img.onerror = (event) => {
      // Clean up object URL on error
      URL.revokeObjectURL(objectUrl);
      
      // Provide more detailed error message
      const errorMsg = `Failed to load image: ${file.name || 'unknown'}. The file may be corrupted, unsupported format, or too large.`;
      console.error(errorMsg, event);
      reject(new Error(errorMsg));
    };
    
    // Set crossOrigin to anonymous for better error handling
    img.crossOrigin = 'anonymous';
    img.src = objectUrl;
  });
}

