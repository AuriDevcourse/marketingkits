const CANVAS_WIDTH = 1500;
const CANVAS_HEIGHT = 1500;
const BACKGROUND_IMAGE = './images/bg1.jpg'; // Background image
const OVERLAY_IMAGE = './images/attending.png'; // Overlay with cutout
const FONT_FAMILY = 'Archivo Expanded';
const FONT_SIZE = 60;
const FONT_WEIGHT = 600;
const TEXT_X = 80;
const TEXT_Y = 340;

// Profile image area
const PROFILE_X = 1050;
const PROFILE_Y = 1050;
const PROFILE_SIZE = 450;

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
  // Clear all canvases
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  bgCtx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  overlayCtx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Draw the background image
  const bgImg = new Image();
  bgImg.crossOrigin = 'anonymous';
  bgImg.onload = () => {
    // Draw background
    bgCtx.drawImage(bgImg, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw the profile image if it exists
    if (profileImage) {
      const scaledWidth = profileImage.width * profileScale;
      const scaledHeight = profileImage.height * profileScale;
      
      // Calculate position to center the image in the profile area
      const x = PROFILE_X + (PROFILE_SIZE - scaledWidth) / 2 + profileX;
      const y = PROFILE_Y + (PROFILE_SIZE - scaledHeight) / 2 + profileY;
      
      // Draw the profile image on the background
      bgCtx.drawImage(profileImage, x, y, scaledWidth, scaledHeight);
    }
    
    // Draw the background canvas to the main canvas
    ctx.drawImage(bgCanvas, 0, 0);
    
    // Draw the overlay (text and cutout) on top
    drawOverlay();
  };
  bgImg.onerror = (e) => console.error('Error loading background image:', e);
  bgImg.src = BACKGROUND_IMAGE;
}

function drawOverlay() {
  // Draw the overlay image (transparent cutout)
  const overlayImg = new Image();
  overlayImg.crossOrigin = 'anonymous';
  overlayImg.onload = () => {
    // Draw the overlay image (with transparency)
    overlayCtx.drawImage(overlayImg, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw the text on the overlay
    overlayCtx.font = `${FONT_WEIGHT} ${FONT_SIZE}px '${FONT_FAMILY}'`;
    overlayCtx.fillStyle = '#f2f2f2';
    overlayCtx.textBaseline = 'top';
    overlayCtx.fillText(customText, TEXT_X, TEXT_Y);
    
    overlayCtx.font = `300 50px '${FONT_FAMILY}'`;
    overlayCtx.fillStyle = '#f2f2f2';
    overlayCtx.fillText(secondText, TEXT_X, TEXT_Y + 100);
    
    // Draw the overlay onto the main canvas
    ctx.drawImage(overlayCanvas, 0, 0);
    
    // Draw debug rectangle for profile area (remove in production)
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.strokeRect(PROFILE_X, PROFILE_Y, PROFILE_SIZE, PROFILE_SIZE);
  };
  overlayImg.onerror = (e) => console.error('Error loading overlay image:', e);
  overlayImg.src = OVERLAY_IMAGE;
}

// Handle image upload
document.getElementById('imageUpload').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  if (!file.type.match('image.*')) {
    alert('Please select a valid image file (JPEG, PNG, etc.)');
    return;
  }
  
  if (file.size > 5 * 1024 * 1024) {
    alert('Image size should be less than 5MB');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = function(event) {
    const img = new Image();
    img.onload = function() {
      // Resize the image to fit within the profile area if it's too large
      const maxSize = Math.max(CANVAS_WIDTH, CANVAS_HEIGHT) * 2;
      const resizedImg = resizeImageToFit(img, maxSize, maxSize);
      
      resizedImg.onload = function() {
        profileImage = resizedImg;
        profileScale = 1.0;
        profileX = 0;
        profileY = 0;
        
        // Auto-scale to fit the profile area if the image is smaller
        const profileAreaSize = PROFILE_SIZE * 0.8;
        const scaleToFit = Math.min(
          profileAreaSize / resizedImg.width,
          profileAreaSize / resizedImg.height
        );
        
        if (scaleToFit > 1) {
          document.getElementById('scaleControl').value = scaleToFit.toFixed(2);
          profileScale = scaleToFit;
          document.getElementById('scaleValue').textContent = `${Math.round(scaleToFit * 100)}%`;
        }
        
        draw();
      };
    };
    img.src = event.target.result;
  };
  reader.onerror = function() {
    alert('Error reading the image file');
  };
  reader.readAsDataURL(file);
});

// Handle scale control
document.getElementById('scaleControl').addEventListener('input', function(e) {
  profileScale = parseFloat(e.target.value);
  document.getElementById('scaleValue').textContent = `${Math.round(profileScale * 100)}%`;
  draw();
});

// Handle position controls
document.getElementById('positionX').addEventListener('input', function(e) {
  profileX = parseInt(e.target.value);
  document.getElementById('positionXValue').textContent = profileX;
  draw();
});

document.getElementById('positionY').addEventListener('input', function(e) {
  profileY = parseInt(e.target.value);
  document.getElementById('positionYValue').textContent = profileY;
  draw();
});

// Handle text updates
document.getElementById('updateText').addEventListener('click', () => {
  customText = document.getElementById('customText').value;
  secondText = document.getElementById('secondText').value;
  draw();
});

// Function to resize image while maintaining aspect ratio
function resizeImageToFit(img, maxWidth, maxHeight) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Calculate new dimensions
  let width = img.width;
  let height = img.height;
  
  if (width > maxWidth || height > maxHeight) {
    const ratio = Math.min(maxWidth / width, maxHeight / height);
    width = Math.floor(width * ratio);
    height = Math.floor(height * ratio);
  }
  
  canvas.width = width;
  canvas.height = height;
  
  // Draw and resize the image
  ctx.drawImage(img, 0, 0, width, height);
  
  // Create a new image with the resized data
  const resizedImage = new Image();
  resizedImage.src = canvas.toDataURL('image/jpeg', 0.9);
  return resizedImage;
}

// Handle download
function downloadCanvas() {
  // Create a temporary canvas for the final image
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = CANVAS_WIDTH;
  tempCanvas.height = CANVAS_HEIGHT;
  const tempCtx = tempCanvas.getContext('2d');
  
  // Draw the current canvas to the temporary canvas
  const bgImg = new Image();
  bgImg.onload = () => {
    // Draw background
    tempCtx.drawImage(bgImg, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw the profile image if it exists
    if (profileImage) {
      const scaledWidth = profileImage.width * profileScale;
      const scaledHeight = profileImage.height * profileScale;
      
      // Calculate position to center the image in the profile area
      const x = PROFILE_X + (PROFILE_SIZE - scaledWidth) / 2 + profileX;
      const y = PROFILE_Y + (PROFILE_SIZE - scaledHeight) / 2 + profileY;
      
      // Draw the profile image
      tempCtx.drawImage(profileImage, x, y, scaledWidth, scaledHeight);
    }
    
    // Draw the overlay image
    const overlayImg = new Image();
    overlayImg.onload = () => {
      // Draw the overlay image (with transparency)
      tempCtx.drawImage(overlayImg, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      // Draw the text
      tempCtx.font = `${FONT_WEIGHT} ${FONT_SIZE}px '${FONT_FAMILY}'`;
      tempCtx.fillStyle = '#f2f2f2';
      tempCtx.textBaseline = 'top';
      tempCtx.fillText(customText, TEXT_X, TEXT_Y);
      
      tempCtx.font = `300 50px '${FONT_FAMILY}'`;
      tempCtx.fillStyle = '#f2f2f2';
      tempCtx.fillText(secondText, TEXT_X, TEXT_Y + 100);
      
      // Create download link
      const link = document.createElement('a');
      link.download = 'techbbq-profile.jpg';
      link.href = tempCanvas.toDataURL('image/jpeg', 1.0);
      link.click();
    };
    overlayImg.src = OVERLAY_IMAGE;
  };
  bgImg.src = BACKGROUND_IMAGE;
}

// Initial draw with empty text
window.onload = () => {
  // Set up UI controls
  document.getElementById('scaleValue').textContent = '100%';
  document.getElementById('positionXValue').textContent = '0';
  document.getElementById('positionYValue').textContent = '0';
  
  // Set up range inputs
  document.getElementById('positionX').min = -200;
  document.getElementById('positionX').max = 200;
  document.getElementById('positionY').min = -200;
  document.getElementById('positionY').max = 200;
  
  // Set up download button
  document.getElementById('downloadBtn').addEventListener('click', downloadCanvas);
  
  // Initial draw
  draw();
};
