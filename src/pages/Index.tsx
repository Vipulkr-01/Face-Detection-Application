
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Video, Download, Play, Pause, Square, Users } from 'lucide-react';
import { VideoCapture } from '@/components/VideoCapture';
import { FaceGallery } from '@/components/FaceGallery';
import { DetectedFace } from '@/types/face-detection';

const Index = () => {
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [detectedFaces, setDetectedFaces] = useState<DetectedFace[]>([]);
  const [videoSource, setVideoSource] = useState<'webcam' | 'file' | null>(null);
  const [currentFaceCount, setCurrentFaceCount] = useState(0);

  const handleFaceDetected = (face: DetectedFace) => {
    setDetectedFaces(prev => [...prev, face]);
  };

  const handleFaceCountUpdate = (count: number) => {
    setCurrentFaceCount(count);
  };

  const handleClearFaces = () => {
    setDetectedFaces([]);
    setCurrentFaceCount(0);
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

  const handleStartStop = () => {
    if (!videoSource) {
      alert('Please select a video source first');
      return;
    }
    setIsVideoActive(!isVideoActive);
  };

  const handleVideoSourceChange = (source: 'webcam' | 'file') => {
    setVideoSource(source);
    setIsVideoActive(false);
    setCurrentFaceCount(0);
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
                Video Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Video Source Selection */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Video Source:</p>
                <div className="grid grid-cols-1 gap-2">
                  <Button
                    onClick={() => handleVideoSourceChange('webcam')}
                    variant={videoSource === 'webcam' ? 'default' : 'outline'}
                    className="w-full"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Webcam
                  </Button>
                  
                  <Button
                    onClick={() => handleVideoSourceChange('file')}
                    variant={videoSource === 'file' ? 'default' : 'outline'}
                    className="w-full"
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Video File
                  </Button>
                </div>
              </div>

              {/* Start/Stop Controls */}
              <div className="pt-4 border-t space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Video Feed:</p>
                <Button
                  onClick={handleStartStop}
                  variant={isVideoActive ? 'destructive' : 'default'}
                  className="w-full"
                  disabled={!videoSource}
                >
                  {isVideoActive ? (
                    <>
                      <Square className="w-4 h-4 mr-2" />
                      Stop Feed
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Start Feed
                    </>
                  )}
                </Button>
              </div>

              {/* Face Detection Stats */}
              <div className="pt-4 border-t space-y-2">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span className="text-sm font-medium">Current Faces:</span>
                  </div>
                  <span className="text-lg font-bold text-primary">{currentFaceCount}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium">Total Captured:</span>
                  <span className="text-lg font-bold text-green-600">{detectedFaces.length}</span>
                </div>
              </div>

              {/* Download and Clear Options */}
              {detectedFaces.length > 0 && (
                <div className="pt-4 border-t space-y-2">
                  <Button
                    onClick={handleDownloadAll}
                    variant="secondary"
                    className="w-full"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download All ({detectedFaces.length})
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
                {isVideoActive && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    LIVE
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {videoSource && isVideoActive ? (
                <VideoCapture
                  source={videoSource}
                  onFaceDetected={handleFaceDetected}
                  onFaceCountUpdate={handleFaceCountUpdate}
                  isActive={isVideoActive}
                />
              ) : (
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Camera className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    {!videoSource ? (
                      <p className="text-muted-foreground">Select a video source and click Start Feed</p>
                    ) : (
                      <p className="text-muted-foreground">Click "Start Feed" to begin detection</p>
                    )}
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
              <CardTitle>Detected Faces Gallery ({detectedFaces.length} faces)</CardTitle>
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
