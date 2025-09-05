/**
 * Client-side utilities for Song DNA
 * These functions must run in the browser, not on the server
 */

// Helper function to download JSON file
export function downloadJSON(data: string, filename: string) {
  if (typeof window === "undefined") return
  
  const blob = new Blob([data], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Helper function to copy to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof window === "undefined") return false
  
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.error("Failed to copy to clipboard:", error)
    return false
  }
}

// Helper function to read JSON file
export function readJSONFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result
      if (typeof content === "string") {
        resolve(content)
      } else {
        reject(new Error("Failed to read file"))
      }
    }
    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsText(file)
  })
}

// Format file size for display
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i]
}

// Generate filename for DNA export
export function generateDNAFilename(title: string, artist: string): string {
  const sanitize = (str: string) => str.replace(/[^a-z0-9]/gi, '-').toLowerCase()
  const timestamp = new Date().toISOString().split('T')[0]
  return `song-dna-${sanitize(artist)}-${sanitize(title)}-${timestamp}.json`
}