
import { BoundingBox } from '@/types/face-detection-internal';

// Expand bounding box to capture more complete face
export const expandBoundingBox = (
  bounds: BoundingBox,
  canvasWidth: number,
  canvasHeight: number,
  expandFactor: number = 1.5
): BoundingBox => {
  // Expand by the specified factor in each direction to capture full face
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

// Check if two bounding boxes overlap significantly
export const hasSignificantOverlap = (
  box1: BoundingBox,
  box2: BoundingBox
): boolean => {
  return (
    Math.abs(box1.x - box2.x) < box1.width / 2 &&
    Math.abs(box1.y - box2.y) < box1.height / 2
  );
};
