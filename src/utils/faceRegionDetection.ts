
import { BoundingBox } from '@/types/face-detection-internal';
import { isSkinColor } from './skinDetection';

// Find the bounds of a face-like region
export const findFaceBounds = (
  data: Uint8ClampedArray,
  startX: number,
  startY: number,
  width: number,
  height: number,
  maxSize: number
): BoundingBox | null => {
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
