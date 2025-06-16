
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Video, Download, Play, Pause, Square } from 'lucide-react';
import { VideoCapture } from '@/components/VideoCapture';
import { FaceGallery } from '@/components/FaceGallery';
import { DetectedFace } from '@/types/face-detection';

const Index = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [detectedFaces, setDetectedFaces] = useState<DetectedFace[]>([]);
  const [videoSource, setVideoSource] = useState<'webcam' | 'file' | null>(null);

  const handleFaceDetected = (face: DetectedFace) => {
    setDetectedFaces(prev => [...prev, face]);
  };

  const handleClearFaces = () => {
    setDetectedFaces([]);
  };

  const handleDownloadAll = () => {
    detectedFaces.forEach((face, index) => {
      const link = document.createElement('a');
      link.href = face.imageData;
      link.download = `face_${face.timestamp}_${index}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Face Detection Application
          </h1>
          <p className="text-xl text-muted-foreground">
            Real-time face detection with video capture and face cropping
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Controls */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Video Source
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => setVideoSource('webcam')}
                variant={videoSource === 'webcam' ? 'default' : 'outline'}
                className="w-full"
              >
                <Camera className="w-4 h-4 mr-2" />
                Use Webcam
              </Button>
              
              <Button
                onClick={() => setVideoSource('file')}
                variant={videoSource === 'file' ? 'default' : 'outline'}
                className="w-full"
              >
                <Video className="w-4 h-4 mr-2" />
                Upload Video File
              </Button>

              {detectedFaces.length > 0 && (
                <div className="pt-4 border-t space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Detected Faces: {detectedFaces.length}
                  </p>
                  <Button
                    onClick={handleDownloadAll}
                    variant="secondary"
                    className="w-full"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download All Faces
                  </Button>
                  <Button
                    onClick={handleClearFaces}
                    variant="outline"
                    className="w-full"
                  >
                    <Square className="w-4 h-4 mr-2" />
                    Clear Gallery
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Video Display */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="w-5 h-5" />
                Live Video Feed
              </CardTitle>
            </CardHeader>
            <CardContent>
              {videoSource ? (
                <VideoCapture
                  source={videoSource}
                  onFaceDetected={handleFaceDetected}
                  isActive={videoSource !== null}
                />
              ) : (
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Camera className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Select a video source to start</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Face Gallery */}
        {detectedFaces.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Detected Faces Gallery</CardTitle>
            </CardHeader>
            <CardContent>
              <FaceGallery faces={detectedFaces} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;
