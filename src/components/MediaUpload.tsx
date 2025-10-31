import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, Play, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface MediaUploadProps {
  onUpload: (files: File[]) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
  existingMedia?: string[];
}

export const MediaUpload: React.FC<MediaUploadProps> = ({
  onUpload,
  maxFiles = 5,
  acceptedTypes = ['image/*', 'video/*'],
  existingMedia = []
}) => {
  const { user } = useAuth();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + selectedFiles.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const newFiles = [...selectedFiles, ...files];
    setSelectedFiles(newFiles);

    const newPreviews = [...previews];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push(e.target?.result as string);
        setPreviews([...newPreviews]);
      };
      reader.readAsDataURL(file);
    });

    onUpload(newFiles);
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
    onUpload(newFiles);
  };

  const openCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });

      setStream(mediaStream);
      setIsCameraOpen(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions.');
    }
  };

  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraOpen(false);
  };

  const addWatermarkToImage = (canvas: HTMLCanvasElement): HTMLCanvasElement => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    const now = new Date();
    const timestamp = now.toLocaleString('en-IN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });

    const userName = user?.name || 'Unknown User';
    const userRole = user?.role || '';
    const territory = user?.territory || '';

    const padding = 15;
    const lineHeight = 25;
    const fontSize = 18;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    const textLines = [
      timestamp,
      userName,
      `${userRole}${territory ? ' | ' + territory : ''}`
    ];

    const maxWidth = Math.max(...textLines.map(line => {
      ctx.font = `bold ${fontSize}px Arial`;
      return ctx.measureText(line).width;
    }));

    const boxHeight = (textLines.length * lineHeight) + (padding * 2);
    const boxWidth = maxWidth + (padding * 2);

    ctx.fillRect(
      canvas.width - boxWidth - 10,
      canvas.height - boxHeight - 10,
      boxWidth,
      boxHeight
    );

    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.textAlign = 'right';

    textLines.forEach((line, index) => {
      ctx.fillText(
        line,
        canvas.width - padding - 10,
        canvas.height - boxHeight - 10 + padding + (lineHeight * (index + 1))
      );
    });

    return canvas;
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const watermarkedCanvas = addWatermarkToImage(canvas);

    watermarkedCanvas.toBlob((blob) => {
      if (!blob) return;

      const timestamp = new Date().getTime();
      const file = new File(
        [blob],
        `photo_${timestamp}.jpg`,
        { type: 'image/jpeg' }
      );

      const newFiles = [...selectedFiles, file];
      setSelectedFiles(newFiles);

      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviews([...previews, e.target?.result as string]);
      };
      reader.readAsDataURL(file);

      onUpload(newFiles);
      closeCamera();
    }, 'image/jpeg', 0.95);
  };

  return (
    <div className="space-y-4">
      {!isCameraOpen ? (
        <div className="flex gap-2">
          <button
            onClick={openCamera}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Camera className="w-4 h-4" />
            Click Pic from Laptop
          </button>

          <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
            <Upload className="w-4 h-4" />
            Upload from Device
            <input
              type="file"
              multiple
              accept={acceptedTypes.join(',')}
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-auto"
            />
            <canvas ref={canvasRef} className="hidden" />

            <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg text-sm">
              <div className="font-semibold">{user?.name || 'User'}</div>
              <div className="text-xs">{user?.role || ''} {user?.territory ? `| ${user.territory}` : ''}</div>
              <div className="text-xs mt-1">
                {new Date().toLocaleString('en-IN', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: true
                })}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={capturePhoto}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              <Camera className="w-5 h-5" />
              Capture Photo
            </button>

            <button
              onClick={closeCamera}
              className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {(previews.length > 0 || existingMedia.length > 0) && !isCameraOpen && (
        <div className="grid grid-cols-2 gap-2">
          {existingMedia.map((media, index) => (
            <div key={`existing-${index}`} className="relative">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                {media.includes('video') ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <Play className="w-8 h-8 text-gray-400" />
                  </div>
                ) : (
                  <img
                    src={media}
                    alt={`Media ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </div>
          ))}

          {previews.map((preview, index) => (
            <div key={`preview-${index}`} className="relative">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                {selectedFiles[index]?.type.startsWith('video/') ? (
                  <video
                    src={preview}
                    className="w-full h-full object-cover"
                    controls
                  />
                ) : (
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <button
                onClick={() => removeFile(index)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {!isCameraOpen && (
        <p className="text-sm text-gray-500">
          {selectedFiles.length + existingMedia.length}/{maxFiles} files selected
        </p>
      )}
    </div>
  );
};
