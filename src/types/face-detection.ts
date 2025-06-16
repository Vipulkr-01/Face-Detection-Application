
export interface DetectedFace {
  id: string;
  timestamp: string;
  imageData: string; // base64 image data
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  confidence?: number;
}

export interface FaceDetectionResult {
  faces: DetectedFace[];
  processedFrame: string;
}
