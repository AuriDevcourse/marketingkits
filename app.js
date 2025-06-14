const CANVAS_WIDTH = 1500;
const CANVAS_HEIGHT = 1500;
let currentOverlay = 'attending'; // 'attending' or 'speaking'
const OVERLAY_IMAGES = {
  attending: './images/attending.png',
  speaking: './images/speaking.png'
};

// Cache for loaded images
const imageCache = {
  background: null,
  attending: null,
  speaking: null,
  isLoaded: false
};

const FONT_FAMILY = '"Archivo Expanded", Archivo, Arial, sans-serif';
const FONT_SIZE = 60;
const FONT_WEIGHT = 600;
const TEXT_X = 80;
const TEXT_Y = 340;

// Profile image area
const PROFILE_X = 1050; // Start X for profile image
const PROFILE_Y = 1050; // Start Y for profile image
const PROFILE_SIZE = 450; // Size of the square area for profile image

const canvas = document.getElementById('main-canvas');
const ctx = canvas.getContext('2d');

// State
let customText = '';
let secondText = '';
let profileImage = null;
let profileScale = 1.0;
let profileX = 0;
let profileY = 0;

// Create a separate canvas for the background elements
const bgCanvas = document.createElement('canvas');
bgCanvas.width = CANVAS_WIDTH;
bgCanvas.height = CANVAS_HEIGHT;
const bgCtx = bgCanvas.getContext('2d');

// Create a canvas for the overlay (text and cutout)
const overlayCanvas = document.createElement('canvas');
overlayCanvas.width = CANVAS_WIDTH;
overlayCanvas.height = CANVAS_HEIGHT;
const overlayCtx = overlayCanvas.getContext('2d');

function draw() {
  if (!imageCache.isLoaded) return;
  
  // Clear all canvases
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  bgCtx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  overlayCtx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  
  // Draw the overlay image as the background
  if (imageCache[currentOverlay]) {
    bgCtx.drawImage(imageCache[currentOverlay], 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }
  
  // First draw the background to the main canvas
  ctx.drawImage(bgCanvas, 0, 0);
  
  // Then draw the profile image in the bottom right while maintaining aspect ratio
  if (profileImage) {
    // Calculate position based on slider values - default to bottom right
    const baseSize = Math.min(canvas.width, canvas.height) / 3;
    const scale = parseFloat(document.getElementById('scaleControl').value || 1.0);
    
    // Position adjustment from sliders
    const xOffset = parseInt(document.getElementById('positionX').value || 0);
    const yOffset = parseInt(document.getElementById('positionY').value || 0);
    
    // Fixed center point in the bottom right
    const centerX = canvas.width - baseSize/2 - 100 + xOffset; // 100px from right edge
    const centerY = canvas.height - baseSize/2 - 100 + yOffset; // 100px from bottom edge
    
    // Calculate size with scale while maintaining aspect ratio
    const maxSize = baseSize * scale;
    
    // Calculate dimensions that maintain aspect ratio
    let width, height;
    if (profileImage.width > profileImage.height) {
      // Landscape image
      width = maxSize;
      height = (profileImage.height / profileImage.width) * maxSize;
    } else {
      // Portrait or square image
      height = maxSize;
      width = (profileImage.width / profileImage.height) * maxSize;
    }
    
    // Calculate top-left corner to maintain the center point
    const x = centerX - width/2;
    const y = centerY - height/2;
    
    // Draw the profile image with proper aspect ratio
    ctx.drawImage(profileImage, x, y, width, height);
  }
  
  // Draw the overlay image again on top of the profile image
  if (imageCache[currentOverlay]) {
    ctx.drawImage(imageCache[currentOverlay], 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }
  
  // Draw text on the overlay canvas
  drawTextOnOverlay();
  
  // Draw the overlay canvas (with text) onto the main canvas
  ctx.drawImage(overlayCanvas, 0, 0);
  
  // Update the file size display after drawing
  updateFileSizeDisplay();
}

function drawProfileImage() {
  // Make sure we force a redraw even if imageCache isn't loaded yet
  // This ensures the profile image appears immediately after upload
  if (!imageCache.isLoaded) {
    // Draw just the profile image without the overlay
    if (profileImage) {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      // Calculate position based on slider values - default to bottom right
      const baseSize = Math.min(canvas.width, canvas.height) / 3;
      const scale = parseFloat(document.getElementById('scaleControl').value || 1.0);
      
      // Position adjustment from sliders
      const xOffset = parseInt(document.getElementById('positionX').value || 0);
      const yOffset = parseInt(document.getElementById('positionY').value || 0);
      
      // Fixed center point in the bottom right
      const centerX = canvas.width - baseSize/2 - 100 + xOffset; // 100px from right edge
      const centerY = canvas.height - baseSize/2 - 100 + yOffset; // 100px from bottom edge
      
      // Calculate size with scale while maintaining aspect ratio
      const maxSize = baseSize * scale;
      
      // Calculate dimensions that maintain aspect ratio
      let width, height;
      if (profileImage.width > profileImage.height) {
        // Landscape image
        width = maxSize;
        height = (profileImage.height / profileImage.width) * maxSize;
      } else {
        // Portrait or square image
        height = maxSize;
        width = (profileImage.width / profileImage.height) * maxSize;
      }
      
      // Calculate top-left corner to maintain the center point
      const x = centerX - width/2;
      const y = centerY - height/2;
      
      // Draw the profile image with proper aspect ratio
      ctx.drawImage(profileImage, x, y, width, height);
    }
  } else {
    // Use the main draw function to ensure text is preserved
    draw();
  }
}

// Function to redraw the main canvas with background and profile image
function redrawMainCanvas() {
  // Use the main draw function to ensure consistency
  draw();
}

// Draw overlay image
function drawOverlay(overlayType = currentOverlay) {
  if (!overlayType || !OVERLAY_IMAGES[overlayType] || !imageCache.isLoaded) return;
  
  // Clear the overlay canvas - we'll only use this for text
  overlayCtx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  
  // Draw text on the overlay canvas
  drawTextOnOverlay();
  
  // Update the main canvas with the overlay text
  ctx.drawImage(overlayCanvas, 0, 0);
}

// Function to resize image while maintaining aspect ratio
function resizeImageToFit(img, maxWidth, maxHeight) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Calculate new dimensions
  let width = img.width;
  let height = img.height;
  
  // Check if resizing is needed
  if (width > maxWidth || height > maxHeight) {
    const ratio = Math.min(maxWidth / width, maxHeight / height);
    width = Math.floor(width * ratio);
    height = Math.floor(height * ratio);
  }
  
  // Set canvas dimensions
  canvas.width = width;
  canvas.height = height;
  
  // Draw and resize the image
  ctx.drawImage(img, 0, 0, width, height);
  
  // Create a new image with the resized data
  const resizedImage = new Image();
  resizedImage.src = canvas.toDataURL('image/jpeg', 0.9);
  return resizedImage;
}

// Function to handle the selected file (either from input or drop)
function handleFile(file) {
  if (!file) return;
  
  // Check file type
  if (!file.type.match('image.*')) {
    alert('Please select a valid image file (JPEG, PNG, etc.)');
    return;
  }
  
  // Check file size (limit to 5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('Image size should be less than 5MB');
    return;
  }
  
  // Update the button text to show selected filename
  const fileButton = document.querySelector('.choose-file-button');
  if (fileButton) {
    fileButton.textContent = file.name.length > 20 ? file.name.substring(0, 17) + '...' : file.name;
  }
  
  const reader = new FileReader();
  
  reader.onload = function(event) {
    const img = new Image();
    img.onload = function() {
      const maxSize = Math.max(CANVAS_WIDTH, CANVAS_HEIGHT) * 2; // Allow 2x for high DPI
      const resizedImg = resizeImageToFit(img, maxSize, maxSize);
      
      profileImage = resizedImg;
      // Reset scale and position
      profileScale = 1.0;
      profileX = 0;
      profileY = 0;
      
      // Auto-scale to fit the profile area if the image is smaller
      const profileAreaSize = PROFILE_SIZE * 0.8; // 80% of the profile area
      const scaleToFit = Math.min(
        profileAreaSize / resizedImg.width,
        profileAreaSize / resizedImg.height
      );
      
      if (scaleToFit > 1) {
        document.getElementById('scaleControl').value = scaleToFit.toFixed(2);
        profileScale = scaleToFit;
        document.getElementById('scaleValue').textContent = `${Math.round(scaleToFit * 100)}%`;
      }
      
      // Use drawProfileImage instead of draw to ensure it renders even if imageCache isn't loaded
      drawProfileImage();
      // Update file size display
      updateFileSizeDisplay();
    };
    img.src = event.target.result;
  };
  
  reader.onerror = function() {
    alert('Error reading the image file');
  };
  
  reader.readAsDataURL(file);
}

// Handle image upload via input change
document.getElementById('imageUpload').addEventListener('change', function(e) {
  const file = e.target.files[0];
  handleFile(file);
});

// Handle drag and drop functionality
const dropContainer = document.querySelector('.drop-container');

// Prevent default drag behaviors
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
  dropContainer.addEventListener(eventName, preventDefaults, false);
  document.body.addEventListener(eventName, preventDefaults, false);
});

// Highlight drop area when item is dragged over it
['dragenter', 'dragover'].forEach(eventName => {
  dropContainer.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
  dropContainer.addEventListener(eventName, unhighlight, false);
});

// Handle drop
dropContainer.addEventListener('drop', handleDrop, false);

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

function highlight() {
  dropContainer.classList.add('highlight');
}

function unhighlight() {
  dropContainer.classList.remove('highlight');
}

function handleDrop(e) {
  const dt = e.dataTransfer;
  const file = dt.files[0];
  handleFile(file);
}

// Handle scale control
document.getElementById('scaleControl').addEventListener('input', function(e) {
  profileScale = parseFloat(e.target.value);
  // Use the main draw function to ensure everything is properly rendered
  draw();
});

// Handle scale buttons (increment by 0.1)
document.getElementById('scaleUp').addEventListener('click', function() {
  const scaleControl = document.getElementById('scaleControl');
  let value = parseFloat(scaleControl.value);
  value = Math.min(value + 0.1, 4.0); // Don't exceed max
  scaleControl.value = value;
  profileScale = value;
  // Use the main draw function to ensure everything is properly rendered
  draw();
});

document.getElementById('scaleDown').addEventListener('click', function() {
  const scaleControl = document.getElementById('scaleControl');
  let value = parseFloat(scaleControl.value);
  value = Math.max(value - 0.1, 0.1); // Don't go below min
  scaleControl.value = value;
  profileScale = value;
  // Use the main draw function to ensure everything is properly rendered
  draw();
});

// Handle horizontal position control
document.getElementById('positionX').addEventListener('input', function(e) {
  profileX = parseInt(e.target.value);
  // Use the main draw function to ensure everything is properly rendered
  draw();
});

// Handle horizontal position buttons (increment by 10)
document.getElementById('posXUp').addEventListener('click', function() {
  const posXControl = document.getElementById('positionX');
  let value = parseInt(posXControl.value);
  value = Math.min(value + 10, 400); // Don't exceed max
  posXControl.value = value;
  profileX = value;
  draw();
});

document.getElementById('posXDown').addEventListener('click', function() {
  const posXControl = document.getElementById('positionX');
  let value = parseInt(posXControl.value);
  value = Math.max(value - 10, -400); // Don't go below min
  posXControl.value = value;
  profileX = value;
  draw();
});

document.getElementById('positionY').addEventListener('input', function(e) {
  profileY = parseInt(e.target.value);
  draw();
});

// Handle vertical position buttons (increment by 10)
document.getElementById('posYUp').addEventListener('click', function() {
  const posYControl = document.getElementById('positionY');
  let value = parseInt(posYControl.value);
  value = Math.min(value + 10, 400); // Don't exceed max
  posYControl.value = value;
  profileY = value;
  draw();
});

document.getElementById('posYDown').addEventListener('click', function() {
  const posYControl = document.getElementById('positionY');
  let value = parseInt(posYControl.value);
  value = Math.max(value - 10, -400); // Don't go below min
  posYControl.value = value;
  profileY = value;
  draw();
});

// Handle text updates
document.getElementById('updateText').addEventListener('click', function() {
  customText = document.getElementById('customText').value || '';
  secondText = document.getElementById('secondText').value || '';
  
  draw();
});

// Wrap text function
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let lineCount = 0;
  
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    
    if (testWidth > maxWidth && i > 0) {
      ctx.fillText(line, x, y + (lineCount * lineHeight));
      line = words[i] + ' ';
      lineCount++;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y + (lineCount * lineHeight));
  return lineCount + 1;
}

// Wrap text function for download
function wrapTextDownload(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let lineCount = 0;
  const rightEdge = CANVAS_WIDTH - 90; // 90px from right edge
  
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    
    if (testWidth > maxWidth && i > 0) {
      ctx.fillText(line, x, y + (lineCount * lineHeight));
      line = words[i] + ' ';
      lineCount++;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y + (lineCount * lineHeight));
  return lineCount + 1;
}

// Switch overlay type
function setOverlayType(type) {
  if (OVERLAY_IMAGES[type] && currentOverlay !== type) {
    currentOverlay = type;
    // Redraw everything with the new overlay type
    draw();
  }
}

// Draw overlay image
function drawOverlay(overlayType = currentOverlay) {
  if (!overlayType || !OVERLAY_IMAGES[overlayType] || !imageCache.isLoaded) return;
  
  // Clear the overlay canvas
  overlayCtx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  
  // Draw the overlay from cache if available
  if (imageCache[overlayType]) {
    overlayCtx.drawImage(imageCache[overlayType], 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    redrawMainCanvas();
  } else {
    console.error(`Overlay image not found in cache: ${overlayType}`);
  }
}

// Draw text on overlay canvas
function drawTextOnOverlay() {
  if (!imageCache.isLoaded) return;
  
  // Clear the overlay canvas first to remove any previous text
  overlayCtx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  
  // Set up text styles
  const lineHeight = FONT_SIZE * 1.2;
  const jobLineHeight = 50 * 1.2;
  
  // Draw the name if it exists
  if (customText) {
    overlayCtx.save();
    overlayCtx.font = `600 ${FONT_SIZE}px ${FONT_FAMILY}`;
    overlayCtx.fillStyle = '#f2f2f2';
    overlayCtx.textBaseline = 'top';
    // Force the canvas to recognize the font by measuring text first
    overlayCtx.measureText('test');
    
    // Draw the name with text wrapping
    const nameLines = wrapText(overlayCtx, customText, TEXT_X, TEXT_Y, CANVAS_WIDTH - TEXT_X - 90, lineHeight);
    
    // Draw the job title/company if it exists
    if (secondText) {
      const jobTitleY = TEXT_Y + (nameLines * lineHeight) + 20;
      overlayCtx.font = `300 50px ${FONT_FAMILY}`;
      // Force the canvas to recognize the font
      overlayCtx.measureText('test');
      wrapText(overlayCtx, secondText, TEXT_X, jobTitleY, CANVAS_WIDTH - TEXT_X - 90, jobLineHeight);
    }
    overlayCtx.restore();
  }
  // If no name but there is a second text, still draw the second text
  else if (secondText) {
    overlayCtx.save();
    overlayCtx.font = `300 50px ${FONT_FAMILY}`;
    overlayCtx.fillStyle = '#f2f2f2';
    overlayCtx.textBaseline = 'top';
    // Force the canvas to recognize the font
    overlayCtx.measureText('test');
    wrapText(overlayCtx, secondText, TEXT_X, TEXT_Y, CANVAS_WIDTH - TEXT_X - 90, jobLineHeight);
    overlayCtx.restore();
  }
}

// Function to draw the canvas with all elements
function drawCanvas() {
  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw background image if available
  if (backgroundImage) {
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
  }
  
  // Draw the profile image if available
  if (profileImage) {
    // Calculate position based on slider values
    const x = canvas.width / 2 + parseInt(positionX.value);
    const y = canvas.height / 2 + parseInt(positionY.value);
    
    // Calculate size based on scale
    const scale = parseFloat(scaleControl.value);
    const size = Math.min(canvas.width, canvas.height) / 3 * scale;
    
    // Draw the circular profile image
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, size / 2, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    
    ctx.drawImage(profileImage, x - size / 2, y - size / 2, size, size);
    ctx.restore();
  }
  
  // Draw the overlay canvas (with text and overlay image)
  ctx.drawImage(overlayCanvas, 0, 0);
}

// Handle overlay type toggle
document.querySelectorAll('.toggle-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    // Remove active class from all buttons
    document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
    // Add active class to clicked button
    this.classList.add('active');
    // Set the overlay type
    setOverlayType(this.dataset.type);
  });
});

// Function to ensure fonts are loaded
function ensureFontsLoaded() {
  return new Promise((resolve) => {
    // This will force the browser to load the font
    const testText = 'Font Load Test';
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set initial font to something that exists
    ctx.font = '16px Arial';
    const initialWidth = ctx.measureText(testText).width;
    
    // Set to our font
    ctx.font = `600 ${FONT_SIZE}px ${FONT_FAMILY}`;
    
    // Check if the font is already loaded
    if (ctx.measureText(testText).width !== initialWidth) {
      return resolve();
    }
    
    // If not, wait for it
    document.fonts.ready.then(() => {
      resolve();
    });
  });
}

// Function to calculate and update file size display
function updateFileSizeDisplay() {
  // Create a temporary canvas to estimate file size
  const sizeCanvas = document.createElement('canvas');
  sizeCanvas.width = CANVAS_WIDTH;
  sizeCanvas.height = CANVAS_HEIGHT;
  const sizeCtx = sizeCanvas.getContext('2d');
  
  // Draw current canvas state
  sizeCtx.drawImage(canvas, 0, 0);
  
  // Get data URL and estimate size
  const dataURL = sizeCanvas.toDataURL('image/jpeg', 1.0);
  // Base64 string length * 0.75 gives approximate byte size
  const base64String = dataURL.split(',')[1];
  const approximateBytes = base64String.length * 0.75;
  
  // Convert to appropriate unit
  let fileSizeText;
  if (approximateBytes > 1048576) { // 1MB
    fileSizeText = (approximateBytes / 1048576).toFixed(1) + 'MB';
  } else if (approximateBytes > 1024) { // 1KB
    fileSizeText = Math.round(approximateBytes / 1024) + 'KB';
  } else {
    fileSizeText = Math.round(approximateBytes) + 'B';
  }
  
  // Update the file size tooltip
  const fileSizeTooltip = document.querySelector('.file-size-tooltip');
  if (fileSizeTooltip) {
    fileSizeTooltip.textContent = fileSizeText;
  }
}

// Handle download
async function downloadCanvas() {
  // Wait for fonts to be fully loaded
  await ensureFontsLoaded();
  
  // Create a temporary canvas for the final image
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = CANVAS_WIDTH;
  tempCanvas.height = CANVAS_HEIGHT;
  const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
  
  // First draw the current canvas state (background and profile image)
  tempCtx.drawImage(canvas, 0, 0);
  
  // Then draw the overlay (text and any other elements from the overlay canvas)
  const overlayImg = new Image();
  overlayImg.crossOrigin = 'anonymous';
  
  overlayImg.onload = () => {
    // Draw the overlay image (with transparency)
    tempCtx.drawImage(overlayImg, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw the text on top of everything
    const lineHeight = FONT_SIZE * 1.2;
    const jobLineHeight = 50 * 1.2; // 50 is the font size for job title
    
    // Draw the name with text wrapping
    const nameFont = `600 ${FONT_SIZE}px ${FONT_FAMILY}`;
    tempCtx.font = nameFont;
    tempCtx.fillStyle = '#f2f2f2';
    tempCtx.textBaseline = 'top';
    
    // Force canvas to recognize the font by measuring text first
    tempCtx.measureText('test');
    
    // Draw the wrapped name
    const nameLines = wrapTextDownload(tempCtx, customText, TEXT_X, TEXT_Y, CANVAS_WIDTH - TEXT_X - 90, lineHeight);
    
    // Draw the job title with text wrapping
    const jobTitleY = TEXT_Y + (nameLines * lineHeight) + 20;
    const jobFont = `300 50px ${FONT_FAMILY}`;
    tempCtx.font = jobFont;
    // Force canvas to recognize the font by measuring text first
    tempCtx.measureText('test');
    wrapTextDownload(tempCtx, secondText, TEXT_X, jobTitleY, CANVAS_WIDTH - TEXT_X - 90, jobLineHeight);
    
    // Create download link
    const link = document.createElement('a');
    // Set filename based on the selected overlay
    link.download = `techbbq-${currentOverlay}.jpg`;
    link.href = tempCanvas.toDataURL('image/jpeg', 1.0);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  overlayImg.onerror = (e) => {
    console.error('Error loading overlay for download:', e);
    // If overlay fails, still try to download what we have
    const link = document.createElement('a');
    // Set filename based on the selected overlay even in error case
    link.download = `techbbq-${currentOverlay}.jpg`;
    link.href = tempCanvas.toDataURL('image/jpeg', 1.0);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  overlayImg.src = OVERLAY_IMAGES[currentOverlay];
}

// Initialize the application
// Load all required images and fonts
function loadImages() {
  return new Promise((resolve) => {
    let loadedCount = 0;
    const totalImages = 2; // Only attending and speaking overlays
    
    const onImageLoad = () => {
      loadedCount++;
      if (loadedCount === totalImages) {
        // Wait for fonts to be loaded before resolving
        ensureFontsLoaded().then(() => {
          imageCache.isLoaded = true;
          resolve();
        });
      }
    };
    
        // We're not using a background image, just the overlay images
    // No need to initialize imageCache.background
    
    // Load overlays
    Object.keys(OVERLAY_IMAGES).forEach(type => {
      if (!imageCache[type]) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          imageCache[type] = img;
          onImageLoad();
        };
        img.onerror = () => {
          console.error(`Error loading ${type} overlay`);
          onImageLoad();
        };
        img.src = OVERLAY_IMAGES[type];
      } else {
        onImageLoad();
      }
    });
  });
}

function initApp() {
  // Set canvas size
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  
  // Set up scale control (10% to 400%)
  document.getElementById('scaleControl').min = 0.1;
  document.getElementById('scaleControl').max = 4.0;
  document.getElementById('scaleControl').step = 0.05;
  document.getElementById('scaleControl').value = 1.0;
  
  // Set up range inputs
  document.getElementById('positionX').min = -400;
  document.getElementById('positionX').max = 400;
  document.getElementById('positionY').min = -400;
  document.getElementById('positionY').max = 400;
  
  // Set up event listeners
  document.getElementById('updateText').addEventListener('click', () => {
    customText = document.getElementById('customText').value;
    secondText = document.getElementById('secondText').value;
    drawTextOnOverlay();
  });
  
  document.getElementById('downloadBtn').addEventListener('click', downloadCanvas);
  
  // Load all images first
  loadImages().then(() => {
    // Initial draw after all images are loaded
    draw();
    // Initialize file size display
    updateFileSizeDisplay();
  });
}

// Start the application when the window loads
window.onload = () => {
  initApp();
};
