'use client'

import { ReferenceImagesSection } from "./ReferenceImagesSection"
import { PromptSection } from "./PromptSection"
import { GenerationSettings } from "./GenerationSettings"
import { GenerationGallery } from "./GenerationGallery"
import { useGen4Logic } from "./useGen4Logic"
import { Gen4Props } from "./types"
import ReferenceLibraryBrowser from "@/app/components/ReferenceLibraryBrowser"
import { PromptTemplateManager } from "@/components/shared/PromptTemplateManager"

export function Gen4Refactored(props: Gen4Props) {
  const {
    showPromptTemplates,
    setShowPromptTemplates,
    showLibraryBrowser,
    setShowLibraryBrowser,
    handleSaveToLibrary,
    handleSwapReference,
    handlePasteToSlot,
    handleAddTag
  } = useGen4Logic({
    gen4Generations: props.gen4Generations,
    gen4ReferenceImages: props.gen4ReferenceImages,
    gen4Prompt: props.gen4Prompt,
    gen4Settings: props.gen4Settings,
    generateGen4: props.generateGen4,
    removeGeneration: props.removeGeneration,
    saveToLibrary: props.saveToLibrary
  })

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Image Generation</h2>
        <div className="text-sm text-muted-foreground">
          Model: {props.gen4Settings.model || 'gen4'}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Settings & References */}
        <div className="space-y-6">
          <GenerationSettings
            settings={props.gen4Settings}
            onSettingsChange={props.setGen4Settings}
          />

          <ReferenceImagesSection
            referenceImages={props.gen4ReferenceImages}
            fileInputRef={props.gen4FileInputRef}
            onFileUpload={props.handleFileUpload}
            onDrop={props.handleDrop}
            onDragOver={props.handleDragOver}
            onRemoveImage={props.removeImage}
            onSwapReference={handleSwapReference}
            onPasteToSlot={handlePasteToSlot}
            onBrowseLibrary={() => setShowLibraryBrowser(true)}
          />
        </div>

        {/* Middle Column - Prompt & Generate */}
        <div className="space-y-6">
          <PromptSection
            prompt={props.gen4Prompt}
            onPromptChange={props.setGen4Prompt}
            onGenerate={props.generateGen4}
            isProcessing={props.gen4Processing}
            onShowTemplates={() => setShowPromptTemplates(true)}
          />
        </div>

        {/* Right Column - Generations Gallery */}
        <div>
          <GenerationGallery
            generations={props.gen4Generations}
            onOpenFullscreen={props.openFullscreenImage}
            onDownload={props.downloadFile}
            onCopyPrompt={props.copyToClipboard}
            onRemove={props.removeGeneration}
            onAddTag={handleAddTag}
            onRemoveTag={props.removeTagFromGen4Image}
            onReplaceReference={props.replaceReferenceWithGen}
            onSendToWorkspace={props.sendGenerationToWorkspace}
            onSaveToLibrary={handleSaveToLibrary}
          />
        </div>
      </div>

      {/* Modals */}
      {showPromptTemplates && (
        <PromptTemplateManager
          isOpen={showPromptTemplates}
          onClose={() => setShowPromptTemplates(false)}
          onApplyTemplate={(template) => {
            props.setGen4Prompt(template.prompt)
            setShowPromptTemplates(false)
          }}
        />
      )}

      {showLibraryBrowser && (
        <ReferenceLibraryBrowser
          isOpen={showLibraryBrowser}
          onClose={() => setShowLibraryBrowser(false)}
          onSelectReference={(ref) => {
            // Handle reference selection
            console.log('Selected reference:', ref)
            setShowLibraryBrowser(false)
          }}
        />
      )}
    </div>
  )
}

export default Gen4Refactored