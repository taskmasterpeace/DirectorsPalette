  const handleCopyPrompt = () => {
    if (image.prompt) {
      navigator.clipboard.writeText(image.prompt)
      toast({
        title: "Prompt Copied",
        description: "The prompt has been copied to your clipboard"
      })
    }
  }

  // Handle image click/touch with proper event management
  const handleImageClick = (e: React.MouseEvent | React.TouchEvent) => {
    // Prevent any parent event handlers
    e.stopPropagation()
    // Call the zoom function
    onZoom()
  }

  // Handle dropdown button click/touch
  const handleDropdownClick = (e: React.MouseEvent | React.TouchEvent) => {
    // Stop propagation to prevent image click
    e.stopPropagation()
    // The dropdown will handle its own state
  }

  return (
    <div className="relative group rounded-lg overflow-hidden bg-slate-800 border border-slate-700 transition-all hover:border-purple-600/50">
      {/* Main image - show in native aspect ratio */}
      <img
        src={image.url}
        alt={image.prompt?.slice(0, 50) || 'Generated image'}
        className="w-full h-auto cursor-zoom-in touch-manipulation"
        onClick={handleImageClick}
        onTouchEnd={handleImageClick}
      />

      {/* Model icon - transparent background */}
      <div className="absolute top-2 left-2 pointer-events-none text-sm drop-shadow-lg">
        {getModelIcon(image.model)}
      </div>

      {/* Reference badge if exists */}
      {image.reference && (
        <div className="absolute top-2 right-2 pointer-events-none">
          <Badge className="bg-green-600 text-white px-2 py-1 text-xs">
            <Tag className="w-3 h-3 mr-1" />
            {image.reference}
          </Badge>
        </div>
      )}

      {/* Action menu button - mobile-friendly bottom-right position with hover effects */}
      {showActions && (
        <div className="absolute bottom-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="secondary"
                className="h-11 w-11 p-0 bg-slate-700/95 hover:bg-slate-600 border-slate-600 touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"