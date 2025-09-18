# Annotation System UI/UX Fixes PRD

## Overview
The annotation system is functionally complete but needs UI/UX refinements for production readiness. This PRD outlines critical fixes needed for the canvas viewport, color consistency, and export options.

## Critical Issues to Fix

### 1. Canvas Viewport Problem (HIGH PRIORITY)
**Issue**: When canvas is set to 16:9 aspect ratio, it gets wide but doesn't show the entire canvas in the viewport
**Current Behavior**: Canvas extends beyond visible area without proper scrolling or scaling
**Required Fix**:
- Implement auto-fit to container with proper scaling
- Ensure entire canvas is always visible regardless of aspect ratio
- Add horizontal/vertical scrolling if canvas exceeds viewport
- Consider implementing "Fit to Screen" button for quick reset

### 2. Color Scheme Consistency (MEDIUM PRIORITY)
**Issue**: Colors don't match the rest of the application's dark theme
**Current State**: Mixed color scheme with some light elements
**Required Fix**:
- Update all UI elements to match Director's Palette dark theme
- Use consistent slate-800/slate-900 backgrounds
- Purple accent colors for active states
- White text on dark backgrounds throughout

### 3. Export Format Cleanup (LOW PRIORITY)
**Issue**: Too many export options cluttering the interface
**Current Options**: PNG, JPEG, SVG, PDF
**Required Options Only**:
- Download Canvas (PNG/JPEG)
- Copy to Clipboard
- Save to Gallery
**Remove**: SVG and PDF export options

### 4. Background Color Text Styling (LOW PRIORITY)
**Issue**: Text under "Background Color" section is not properly styled
**Required Fix**:
- Ensure consistent text styling
- Fix alignment and spacing
- Match text color to theme (white/slate-300)

## Technical Implementation Tasks

### Task 1: Fix Canvas Viewport Scaling
- Modify SimpleWorkingCanvas component to handle responsive scaling
- Implement container-aware sizing that maintains aspect ratio
- Add overflow handling for large canvases
- Test all aspect ratios (1:1, 16:9, 9:16) fit properly

### Task 2: Update Color Theme
- Audit all components in post-production folder
- Replace light backgrounds with slate-800/900
- Update border colors to slate-600/700
- Ensure purple-500/600 for accents
- Update all text to white/slate-300

### Task 3: Remove Unnecessary Export Options
- Edit CanvasExporter component
- Remove SVG export functionality
- Remove PDF export functionality
- Keep only PNG, JPEG, clipboard, and gallery options
- Simplify export UI

### Task 4: Fix Background Color Section
- Update text styling in CanvasSettings component
- Fix label alignment and spacing
- Ensure consistent font sizes and colors

### Task 5: Test Image Drag & Resize
- Import test image
- Verify drag functionality works
- Verify resize handles appear and function
- Test aspect ratio lock during resize
- Ensure images stay within canvas bounds

## Acceptance Criteria

1. **Canvas Viewport**
   - [ ] 16:9 canvas fully visible without horizontal scroll
   - [ ] 9:16 canvas fully visible without vertical scroll
   - [ ] 1:1 canvas properly centered and scaled
   - [ ] All aspect ratios auto-fit to available space

2. **Color Consistency**
   - [ ] All backgrounds use slate-800/900
   - [ ] All borders use slate-600/700
   - [ ] Active states use purple-500/600
   - [ ] All text is white or slate-300

3. **Export Options**
   - [ ] Only PNG/JPEG download available
   - [ ] Copy to clipboard works
   - [ ] Save to gallery works
   - [ ] No SVG or PDF options visible

4. **Text Styling**
   - [ ] Background color label properly styled
   - [ ] Consistent spacing and alignment
   - [ ] Matches overall theme

5. **Image Functionality**
   - [ ] Images can be imported
   - [ ] Images can be dragged to new positions
   - [ ] Images can be resized with handles
   - [ ] Aspect ratio maintained during resize

## Testing Requirements

Before marking ANY task complete:
1. Test in development environment
2. Check all aspect ratios work
3. Verify no console errors
4. Test on different screen sizes
5. Run build to ensure no compilation errors

## Priority Order

1. Fix canvas viewport issue (blocks usability)
2. Update color scheme (improves consistency)
3. Clean up export options (reduces confusion)
4. Fix text styling (minor polish)
5. Verify image drag/resize (validation)

## Success Metrics

- Canvas is fully usable at all aspect ratios
- UI matches Director's Palette design system
- Export workflow is simplified and clear
- All interactive features work as expected
- Zero console errors during operation