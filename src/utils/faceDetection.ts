import { DetectedFace } from '@/types/face-detection';

// Simple face detection using a basic algorithm
// In a real application, you would use MediaPipe, TensorFlow.js, or OpenCV.js
export const detectFaces = async (canvas: HTMLCanvasElement): Promise<DetectedFace[]> => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];

  // Get image data
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Simple face detection algorithm using skin tone detection
  // This is a basic implementation for demonstration purposes
  const faces: DetectedFace[] = [];
  const minFaceSize = 60; // Increased minimum face size
  const maxFaceSize = 300; // Increased maximum face size
  
  // Scan the image in a grid pattern
  for (let y = 0; y < canvas.height - minFaceSize; y += 30) {
    for (let x = 0; x < canvas.width - minFaceSize; x += 30) {
      // Check for skin-like colors in this region
      if (isSkinRegion(data, x, y, minFaceSize, canvas.width, canvas.height)) {
        // Find the bounds of this face-like region
        const bounds = findFaceBounds(data, x, y, canvas.width, canvas.height, maxFaceSize);
        
        if (bounds && bounds.width >= minFaceSize && bounds.height >= minFaceSize) {
          // Avoid duplicate detections by checking if this overlaps with existing faces
          const overlap = faces.some(face => 
            Math.abs(face.boundingBox.x - bounds.x) < bounds.width / 2 &&
            Math.abs(face.boundingBox.y - bounds.y) < bounds.height / 2
          );
          
          if (!overlap) {
            // Expand the bounding box to capture more of the face and surrounding area
            const expandedBounds = expandBoundingBox(bounds, canvas.width, canvas.height);
            
            faces.push({
              id: `face_${Date.now()}_${Math.random()}`,
              timestamp: new Date().toISOString(),
              imageData: '', // Will be filled by the calling function
              boundingBox: expandedBounds,
              confidence: 0.7 + Math.random() * 0.3 // Simulated confidence
            });
          }
        }
      }
    }
  }
  
  return faces;
};

// Expand bounding box to capture more complete face
const expandBoundingBox = (
  bounds: { x: number; y: number; width: number; height: number },
  canvasWidth: number,
  canvasHeight: number
) => {
  // Expand by 50% in each direction to capture full face
  const expandFactor = 1.5;
  const newWidth = Math.min(bounds.width * expandFactor, canvasWidth);
  const newHeight = Math.min(bounds.height * expandFactor, canvasHeight);
  
  // Center the expanded box around the original detection
  const newX = Math.max(0, bounds.x - (newWidth - bounds.width) / 2);
  const newY = Math.max(0, bounds.y - (newHeight - bounds.height) / 2);
  
  // Ensure we don't go outside canvas bounds
  const finalX = Math.min(newX, canvasWidth - newWidth);
  const finalY = Math.min(newY, canvasHeight - newHeight);
  
  return {
    x: Math.round(finalX),
    y: Math.round(finalY),
    width: Math.round(newWidth),
    height: Math.round(newHeight)
  };
};

// Check if a region contains skin-like colors
const isSkinRegion = (
  data: Uint8ClampedArray,
  x: number,
  y: number,
  size: number,
  width: number,
  height: number
): boolean => {
  let skinPixels = 0;
  let totalPixels = 0;
  
  for (let dy = 0; dy < size && y + dy < height; dy += 5) {
    for (let dx = 0; dx < size && x + dx < width; dx += 5) {
      const index = ((y + dy) * width + (x + dx)) * 4;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      
      if (isSkinColor(r, g, b)) {
        skinPixels++;
      }
      totalPixels++;
    }
  }
  
  return skinPixels / totalPixels > 0.3; // At least 30% skin-like pixels
};

// Simple skin color detection
const isSkinColor = (r: number, g: number, b: number): boolean => {
  // Basic skin color detection in RGB space
  return (
    r > 95 && g > 40 && b > 20 &&
    r > g && r > b &&
    Math.abs(r - g) > 15 &&
    (r - g) > 15
  );
};

// Find the bounds of a face-like region
const findFaceBounds = (
  data: Uint8ClampedArray,
  startX: number,
  startY: number,
  width: number,
  height: number,
  maxSize: number
): { x: number; y: number; width: number; height: number } | null => {
  let minX = startX;
  let maxX = startX;
  let minY = startY;
  let maxY = startY;
  
  // Expand the region while we find skin-like pixels
  let expanded = true;
  let iterations = 0;
  
  while (expanded && iterations < 20) {
    expanded = false;
    iterations++;
    
    // Try to expand in each direction
    if (minX > 0) {
      let foundSkin = false;
      for (let y = minY; y <= maxY; y += 3) {
        const index = (y * width + (minX - 1)) * 4;
        if (isSkinColor(data[index], data[index + 1], data[index + 2])) {
          foundSkin = true;
          break;
        }
      }
      if (foundSkin) {
        minX--;
        expanded = true;
      }
    }
    
    if (maxX < width - 1) {
      let foundSkin = false;
      for (let y = minY; y <= maxY; y += 3) {
        const index = (y * width + (maxX + 1)) * 4;
        if (isSkinColor(data[index], data[index + 1], data[index + 2])) {
          foundSkin = true;
          break;
        }
      }
      if (foundSkin) {
        maxX++;
        expanded = true;
      }
    }
    
    if (minY > 0) {
      let foundSkin = false;
      for (let x = minX; x <= maxX; x += 3) {
        const index = ((minY - 1) * width + x) * 4;
        if (isSkinColor(data[index], data[index + 1], data[index + 2])) {
          foundSkin = true;
          break;
        }
      }
      if (foundSkin) {
        minY--;
        expanded = true;
      }
    }
    
    if (maxY < height - 1) {
      let foundSkin = false;
      for (let x = minX; x <= maxX; x += 3) {
        const index = ((maxY + 1) * width + x) * 4;
        if (isSkinColor(data[index], data[index + 1], data[index + 2])) {
          foundSkin = true;
          break;
        }
      }
      if (foundSkin) {
        maxY++;
        expanded = true;
      }
    }
    
    // Stop if the region gets too large
    if (maxX - minX > maxSize || maxY - minY > maxSize) {
      break;
    }
  }
  
  const faceWidth = maxX - minX;
  const faceHeight = maxY - minY;
  
  // Make the region more square (faces are typically wider than they are tall)
  const size = Math.max(faceWidth, faceHeight);
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  
  return {
    x: Math.max(0, Math.round(centerX - size / 2)),
    y: Math.max(0, Math.round(centerY - size / 2)),
    width: Math.min(size, width),
    height: Math.min(size, height)
  };
};
