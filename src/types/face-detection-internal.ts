
export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FaceDetectionConfig {
  minFaceSize: number;
  maxFaceSize: number;
  scanStepSize: number;
  skinThreshold: number;
  expandFactor: number;
}
