
import { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Play, Pause, Upload } from 'lucide-react';
import { detectFaces } from '@/utils/faceDetection';
import { DetectedFace } from '@/types/face-detection';

interface VideoCaptureProps {
  source: 'webcam' | 'file';
  onFaceDetected: (face: DetectedFace) => void;
  onFaceCountUpdate: (count: number) => void;
  isActive: boolean;
}

export const VideoCapture = ({ source, onFaceDetected, onFaceCountUpdate, isActive }: VideoCaptureProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isActive && source === 'webcam') {
      startWebcam();
    } else if (!isActive) {
      stopDetection();
      if (videoRef.current && source === 'webcam') {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
    
    return () => {
      stopDetection();
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isActive, source]);

  const startWebcam = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        videoRef.current.play();
        setIsPlaying(true);
        startDetection();
      }
    } catch (error) {
      console.error('Error accessing webcam:', error);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && videoRef.current) {
      const url = URL.createObjectURL(file);
      videoRef.current.src = url;
      videoRef.current.load();
    }
  };

  const togglePlayback = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        stopDetection();
      } else {
        videoRef.current.play();
        startDetection();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const startDetection = () => {
    intervalRef.current = setInterval(() => {
      detectAndDrawFaces();
    }, 100); // Run detection every 100ms for real-time performance
  };

  const stopDetection = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    onFaceCountUpdate(0);
  };

  const detectAndDrawFaces = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas || video.readyState !== 4) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      // Detect faces
      const faces = await detectFaces(canvas);
      
      // Update current face count
      onFaceCountUpdate(faces.length);
      
      // Draw bounding boxes
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 3;
      ctx.font = '16px Arial';
      ctx.fillStyle = '#00ff00';

      faces.forEach((face, index) => {
        const { x, y, width, height } = face.boundingBox;
        
        // Draw rectangle
        ctx.strokeRect(x, y, width, height);
        
        // Draw label
        ctx.fillText(`Face ${index + 1}`, x, y - 10);
        
        // Create expanded crop area for fuller face capture
        const expandFactor = 2.0; // Increase crop area by 2x
        const expandedWidth = Math.min(width * expandFactor, canvas.width);
        const expandedHeight = Math.min(height * expandFactor, canvas.height);
        
        // Center the expanded area around the original detection
        const expandedX = Math.max(0, x - (expandedWidth - width) / 2);
        const expandedY = Math.max(0, y - (expandedHeight - height) / 2);
        
        // Ensure we don't go outside canvas bounds
        const finalX = Math.min(expandedX, canvas.width - expandedWidth);
        const finalY = Math.min(expandedY, canvas.height - expandedHeight);
        const finalWidth = Math.min(expandedWidth, canvas.width - finalX);
        const finalHeight = Math.min(expandedHeight, canvas.height - finalY);
        
        // Crop and save face with expanded area
        const faceCanvas = document.createElement('canvas');
        const faceCtx = faceCanvas.getContext('2d');
        
        if (faceCtx) {
          faceCanvas.width = finalWidth;
          faceCanvas.height = finalHeight;
          
          faceCtx.drawImage(
            video,
            finalX, finalY, finalWidth, finalHeight,
            0, 0, finalWidth, finalHeight
          );
          
          const faceImageData = faceCanvas.toDataURL('image/png');
          
          onFaceDetected({
            ...face,
            imageData: faceImageData
          });
        }
      });
    } catch (error) {
      console.error('Face detection error:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <video
          ref={videoRef}
          className="w-full aspect-video bg-black rounded-lg"
          playsInline
          muted
          style={{ display: 'none' }}
        />
        <canvas
          ref={canvasRef}
          className="w-full aspect-video bg-black rounded-lg"
        />
      </div>

      {source === 'file' && (
        <div className="flex gap-2 items-center">
          <Input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
          >
            <Upload className="w-4 h-4 mr-2" />
            Select Video File
          </Button>

          {videoRef.current?.src && (
            <Button onClick={togglePlayback} variant="outline">
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Play
                </>
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
