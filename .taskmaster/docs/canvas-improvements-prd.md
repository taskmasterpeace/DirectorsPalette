# Canvas Annotation System Improvements PRD

## Overview
The Layout & Annotation Canvas needs UX improvements to simplify the interface and enhance drawing functionality.

## Current Issues
1. Shape creation requires tool switching to resize (bad UX flow)
2. No fill option for shapes (only outlines)
3. Canvas positioned too low on screen
4. Background color options overcomplicated
5. Layer system non-functional
6. Too much vertical spacing in left sidebar
7. Missing "Send to Gallery" integration

## Requirements

### 1. Shape Drawing Behavior
- **Current**: Click to create shape at fixed size, must switch to select tool to resize
- **Required**: Click and drag to create shape with desired size in one motion
- Keep current tool active after drawing shape (no auto-switch to select)

### 2. Fill Options for Shapes
- Add toggle for "Fill" vs "Outline" mode
- When Fill is ON: Shapes are filled with selected color
- When Fill is OFF: Shapes are outlined only (current behavior)
- Apply to: Rectangle, Circle, all shape tools

### 3. Canvas Positioning
- Move canvas higher on screen (reduce top padding)
- Canvas should be closer to header for better screen utilization

### 4. Simplify Background Color
- Remove all background color options
- Set canvas background to white permanently
- Remove color picker and preset buttons
- This saves significant vertical space

### 5. Reorganize Left Sidebar
- Move Canvas Size selector to top of sidebar
- Remove Background Color section entirely
- Move Drawing Tools section up to fill space
- Reduce spacing between sections

### 6. Remove Layer System
- Delete entire Layers panel from right sidebar
- Layer functionality is non-operational
- Simplifies interface significantly
- Undo/Redo provides sufficient history management

### 7. Export & Share Improvements
- Verify "Copy to Clipboard" works
- Verify "Download Canvas" works
- Change "Send to Tab" options to include "Send to Gallery"
- Remove "Shot Editor" option (doesn't exist)
- Keep: Shot Creator, Shot Animator, Gallery

### 8. Drawing Tools Enhancement
- Add Fill/Outline toggle button in Drawing Tools section
- Position near color picker
- Visual indicator for current mode

## Technical Implementation

### Shape Drawing Fix
- Implement mouse down + drag to create shapes
- Calculate size based on drag distance
- Don't auto-switch tools after shape creation

### Fill Mode Implementation
- Add boolean state for fillMode
- When true: Use fill property on shapes
- When false: Use stroke property only

### Layout Adjustments
- Reduce canvas container top margin
- Reorganize sidebar component order
- Remove Layer Manager component entirely

### Simplified State
- Remove layer-related state from CanvasState
- Remove backgroundColor from props
- Hardcode white background

## Success Criteria
1. Can draw filled shapes without tool switching
2. Canvas uses more vertical screen space
3. Interface is cleaner with fewer options
4. All export functions work correctly
5. Can send canvas to Gallery
6. Background is always white
7. No layer UI visible

## Priority
- High: Shape drawing behavior fix
- High: Fill option for shapes
- Medium: Canvas positioning
- Medium: Remove layers
- Low: Sidebar reorganization