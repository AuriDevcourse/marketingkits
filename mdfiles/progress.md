## Completed Features
- [x] Canvas layout and structure
- [x] Background switching logic
- [x] Text input with live preview
- [x] Image upload and masking behind PNG cutout
- [x] Advanced image manipulation:
  - [x] Drag and drop positioning
  - [x] Corner scaling with visible anchors
  - [x] Natural scaling behavior
  - [x] Visual feedback for interactions
  - [x] Image positioning with horizontal and vertical sliders
- [x] JPG export functionality with download button

## Remaining Tasks
- [ ] Final layout polish
- [ ] Testing on different devices

## Latest Updates
- Implemented JPG export functionality with download button
- Added styled download UI with hover effects
- Set maximum quality for exported images
- Added corner scaling with visible anchor points
- Implemented natural center-based scaling
- Added visual feedback for drag/scale areas
- Fixed layer ordering (profile behind background)
- Implemented image positioning with horizontal and vertical sliders.
- The horizontal slider is controlled by the formula: `profileX = centerX + offset`.
- The vertical slider is controlled by the formula: `profileY = centerY + offset`.
- Swapped the order of width and height assignments in both slider event listeners to ensure that the maxSize is applied to the correct dimension first, maintaining the aspect ratio.