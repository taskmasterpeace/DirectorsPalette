/**
 * Safe Clipboard Utilities
 * Handles clipboard operations with proper fallbacks for different browser contexts
 */

export async function safeClipboardWrite(text: string): Promise<boolean> {
  try {
    // First try modern clipboard API (requires HTTPS)
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }
    
    // Fallback to execCommand for HTTP or older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'
    
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    
    const successful = document.execCommand('copy')
    document.body.removeChild(textArea)
    
    return successful
    
  } catch (error) {
    console.error('Clipboard write failed:', error)
    return false
  }
}

export async function safeClipboardRead(): Promise<string | null> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      return await navigator.clipboard.readText()
    }
    
    // No reliable fallback for reading clipboard in non-secure contexts
    return null
    
  } catch (error) {
    console.error('Clipboard read failed:', error)
    return null
  }
}

export function isClipboardAvailable(): boolean {
  return !!(navigator.clipboard || document.queryCommandSupported?.('copy'))
}

export function getClipboardErrorMessage(): string {
  if (!navigator.clipboard && !document.queryCommandSupported?.('copy')) {
    return 'Clipboard not supported in this browser'
  }
  
  if (!window.isSecureContext) {
    return 'Clipboard requires HTTPS. Use file download instead.'
  }
  
  return 'Clipboard access denied. Check browser permissions.'
}