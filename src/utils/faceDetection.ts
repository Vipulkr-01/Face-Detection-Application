
import { DetectedFace } from '@/types/face-detection';
import { FaceDetectionConfig } from '@/types/face-detection-internal';
import { isSkinRegion } from './skinDetection';
import { expandBoundingBox, hasSignificantOverlap } from './boundingBoxUtils';
import { findFaceBounds } from './faceRegionDetection';

// Default configuration for face detection
const DEFAULT_CONFIG: FaceDetectionConfig = {
  minFaceSize: 40,
  maxFaceSize: 250,
  scanStepSize: 15,
  skinThreshold: 0.25,
  expandFactor: 1.5
};

// Simple face detection using a basic algorithm
// In a real application, you would use MediaPipe, TensorFlow.js, or OpenCV.js
export const detectFaces = async (
  canvas: HTMLCanvasElement,
  config: Partial<FaceDetectionConfig> = {}
): Promise<DetectedFace[]> => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];

  // Merge with default configuration
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  // Get image data
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  const faces: DetectedFace[] = [];
  
  // Scan the image in a grid pattern with configurable steps for better detection
  for (let y = 0; y < canvas.height - finalConfig.minFaceSize; y += finalConfig.scanStepSize) {
    for (let x = 0; x < canvas.width - finalConfig.minFaceSize; x += finalConfig.scanStepSize) {
      // Check for skin-like colors in this region
      if (isSkinRegion(data, x, y, finalConfig.minFaceSize, canvas.width, canvas.height, finalConfig.skinThreshold)) {
        // Find the bounds of this face-like region
        const bounds = findFaceBounds(data, x, y, canvas.width, canvas.height, finalConfig.maxFaceSize);
        
        if (bounds && bounds.width >= finalConfig.minFaceSize && bounds.height >= finalConfig.minFaceSize) {
          // Avoid duplicate detections by checking if this overlaps with existing faces
          const overlap = faces.some(face => 
            hasSignificantOverlap(face.boundingBox, bounds)
          );
          
          if (!overlap) {
            // Expand the bounding box to capture more of the face and surrounding area
            const expandedBounds = expandBoundingBox(bounds, canvas.width, canvas.height, finalConfig.expandFactor);
            
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
