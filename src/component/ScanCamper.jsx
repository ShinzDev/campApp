import React, { useState, useRef, useEffect } from 'react';
import { Camera, Users, Plus, Download, CheckCircle, XCircle, User, Square, RotateCcw } from 'lucide-react';

// Mock database - in production, replace with Supabase
const mockCampers = [
  { id: 1, name: 'John Doe', age: 12, qrCode: 'CAMPER001', registered: true },
  { id: 2, name: 'Jane Smith', age: 14, qrCode: 'CAMPER002', registered: true },
  { id: 3, name: 'Mike Johnson', age: 13, qrCode: 'CAMPER003', registered: true },
];

const QRScanner = ({ onScan, onError, isActive }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isActive && !scanning) {
      startCamera();
    } else if (!isActive && scanning) {
      stopCamera();
    }
    return () => stopCamera();
  }, [isActive]);

  const startCamera = async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
        setScanning(true);
        startScanning();
      }
    } catch (err) {
      setError('Camera access denied or not available');
      onError && onError(err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setScanning(false);
  };

  const startScanning = () => {
    const scanFrame = () => {
      if (videoRef.current && canvasRef.current && scanning) {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        const ctx = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);

        try {
          // Replace with real QR detection (e.g., jsQR)
          if (Math.random() > 0.95) {
            const mockCodes = ['CAMPER001', 'CAMPER002', 'CAMPER003'];
            const randomCode = mockCodes[Math.floor(Math.random() * mockCodes.length)];
            onScan(randomCode);
            return;
          }
        } catch (err) {
          console.error('QR scanning error:', err);
        }
        requestAnimationFrame(scanFrame);
      }
    };

    if (videoRef.current.readyState >= 2) {
      scanFrame();
    } else {
      videoRef.current.addEventListener('loadeddata', scanFrame);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-red-50 rounded-lg">
        <XCircle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-red-700 text-center">{error}</p>
        <button onClick={startCamera} className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 flex items-center">
          <RotateCcw className="w-4 h-4 mr-2" /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <video ref={videoRef} className="w-full max-w-md mx-auto rounded-lg bg-black" autoPlay playsInline muted />
      <canvas ref={canvasRef} className="hidden" />

      {scanning && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div className="w-48 h-48 border-2 border-blue-500 rounded-lg">
              {[['top-0 left-0', 'border-t-4 border-l-4 rounded-tl-lg'],
                ['top-0 right-0', 'border-t-4 border-r-4 rounded-tr-lg'],
                ['bottom-0 left-0', 'border-b-4 border-l-4 rounded-bl-lg'],
                ['bottom-0 right-0', 'border-b-4 border-r-4 rounded-br-lg']
              ].map(([position, borders], i) => (
                <div key={i} className={`absolute ${position} w-6 h-6 ${borders} border-blue-500`} />
              ))}
            </div>
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
              <p className="text-white text-sm bg-black bg-opacity-50 px-3 py-1 rounded">Position QR code within frame</p>
            </div>
          </div>
        </div>
      )}

      {scanning && (
        <div className="absolute top-2 right-2 flex items-center bg-black bg-opacity-50 text-white px-3 py-1 rounded">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
          <span className="text-sm">Scanning...</span>
        </div>
      )}
    </div>
  );
};

export default QRScanner;
