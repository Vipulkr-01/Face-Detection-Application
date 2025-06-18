
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Eye } from 'lucide-react';
import { DetectedFace } from '@/types/face-detection';

interface FaceGalleryProps {
  faces: DetectedFace[];
}

export const FaceGallery = ({ faces }: FaceGalleryProps) => {
  const [selectedFace, setSelectedFace] = useState<DetectedFace | null>(null);

  const handleDownload = (face: DetectedFace) => {
    const link = document.createElement('a');
    link.href = face.imageData;
    link.download = `face_${face.timestamp}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViewImage = (face: DetectedFace) => {
    window.open(face.imageData, '_blank');
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {faces.map((face) => (
          <Card key={face.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardContent className="p-2">
              <div className="relative group">
                <img
                  src={face.imageData}
                  alt={`Detected face ${face.id}`}
                  className="w-full aspect-square object-cover rounded cursor-pointer"
                  onClick={() => setSelectedFace(face)}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    className="mr-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewImage(face);
                    }}
                  >
                    <Eye className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(face);
                    }}
                  >
                    <Download className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <div className="mt-2 text-xs text-center">
                <p className="text-muted-foreground">
                  {formatTimestamp(face.timestamp)}
                </p>
                {face.confidence && (
                  <p className="text-green-600">
                    {Math.round(face.confidence * 100)}%
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {faces.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No faces detected yet. Start video capture to begin detection.</p>
        </div>
      )}

      {/* Face Preview Modal */}
      {selectedFace && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setSelectedFace(null)}
        >
          <div className="max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <Card>
              <CardContent className="p-4">
                <img
                  src={selectedFace.imageData}
                  alt="Selected face"
                  className="w-full rounded-lg mb-4"
                />
                <div className="space-y-2 text-sm">
                  <p><strong>Timestamp:</strong> {formatTimestamp(selectedFace.timestamp)}</p>
                  <p><strong>Size:</strong> {selectedFace.boundingBox.width} × {selectedFace.boundingBox.height}</p>
                  {selectedFace.confidence && (
                    <p><strong>Confidence:</strong> {Math.round(selectedFace.confidence * 100)}%</p>
                  )}
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={() => handleDownload(selectedFace)}
                    className="flex-1"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    onClick={() => setSelectedFace(null)}
                    variant="outline"
                    className="flex-1"
                  >
                    Close
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
