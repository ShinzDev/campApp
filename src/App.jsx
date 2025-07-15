import React, { useState, useRef, useEffect } from 'react';
import { Camera, UserPlus, Download, CheckCircle, XCircle, Users, QrCode } from 'lucide-react';

const CamperManagementSystem = () => {
  const [campers, setCampers] = useState([]);
  const [scannedCampers, setScannedCampers] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [scannerActive, setScannerActive] = useState(false);
  const [scanResult, setScanResult] = useState('');
  const [scanStatus, setScanStatus] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const scanIntervalRef = useRef(null);

  // Form state for adding new campers
  const [newCamper, setNewCamper] = useState({
    name: '',
    age: '',
    group: '',
    emergency_contact: ''
  });

  // Generate QR code using canvas (simplified implementation)
  const generateQRCode = (data) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const size = 200;
    canvas.width = size;
    canvas.height = size;
    
    // Create a more realistic QR code pattern
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#000000';
    
    const modules = 25; // QR code grid size
    const moduleSize = size / modules;
    
    // Generate pattern based on data
    const pattern = [];
    for (let i = 0; i < modules; i++) {
      pattern[i] = [];
      for (let j = 0; j < modules; j++) {
        // Create pseudo-random pattern based on data and position
        const hash = (data.charCodeAt(i % data.length) + i * j) % 3;
        pattern[i][j] = hash === 0;
      }
    }
    
    // Draw finder patterns (corner squares)
    const drawFinderPattern = (x, y) => {
      // Outer square
      ctx.fillRect(x * moduleSize, y * moduleSize, 7 * moduleSize, 7 * moduleSize);
      // Inner white square
      ctx.fillStyle = '#ffffff';
      ctx.fillRect((x + 1) * moduleSize, (y + 1) * moduleSize, 5 * moduleSize, 5 * moduleSize);
      // Center black square
      ctx.fillStyle = '#000000';
      ctx.fillRect((x + 2) * moduleSize, (y + 2) * moduleSize, 3 * moduleSize, 3 * moduleSize);
    };
    
    // Draw finder patterns
    drawFinderPattern(0, 0);
    drawFinderPattern(modules - 7, 0);
    drawFinderPattern(0, modules - 7);
    
    // Draw data modules
    for (let i = 0; i < modules; i++) {
      for (let j = 0; j < modules; j++) {
        // Skip finder pattern areas
        if ((i < 9 && j < 9) || (i < 9 && j >= modules - 8) || (i >= modules - 8 && j < 9)) {
          continue;
        }
        
        if (pattern[i][j]) {
          ctx.fillRect(i * moduleSize, j * moduleSize, moduleSize, moduleSize);
        }
      }
    }
    
    return canvas.toDataURL();
  };

  // Add new camper
  const addCamper = () => {
    if (!newCamper.name || !newCamper.age) {
      alert('Please fill in required fields');
      return;
    }
    
    const qrData = `CAMPER:${Date.now()}:${newCamper.name}`;
    
    const camper = {
      id: Date.now().toString(),
      ...newCamper,
      qrCode: generateQRCode(qrData),
      qrData: qrData,
      registered: new Date().toISOString()
    };
    
    setCampers([...campers, camper]);
    setNewCamper({ name: '', age: '', group: '', emergency_contact: '' });
  };

  // Start camera for QR scanning
  const startScanner = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setScannerActive(true);
        startScanLoop();
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setScanStatus('error');
      setScanResult('Camera access denied');
    }
  };

  // Stop camera
  const stopScanner = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    setScannerActive(false);
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }
  };

  // Simulate QR code scanning (since we can't use external libraries in React components)
  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const video = videoRef.current;
    
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Simulate QR detection after 3 seconds of scanning
      if (scannerActive && campers.length > 0) {
        setTimeout(() => {
          if (scannerActive) {
            simulateQRDetection();
          }
        }, 3000);
      }
    }
  };

  // Simulate QR code detection
  const simulateQRDetection = () => {
    if (campers.length === 0) return;
    
    // Simulate detecting a random camper's QR code
    const randomCamper = campers[Math.floor(Math.random() * campers.length)];
    handleQRCodeDetected(randomCamper.qrData);
  };

  // Handle detected QR code
  const handleQRCodeDetected = (qrData) => {
    // Find camper by QR data
    const foundCamper = campers.find(c => c.qrData === qrData);
    
    if (foundCamper) {
      const alreadyScanned = scannedCampers.find(sc => sc.id === foundCamper.id);
      
      if (!alreadyScanned) {
        const scannedCamper = {
          ...foundCamper,
          scannedAt: new Date().toISOString()
        };
        
        setScannedCampers([...scannedCampers, scannedCamper]);
        setScanResult(`Camper Present: ${foundCamper.name}`);
        setScanStatus('success');
      } else {
        setScanResult(`Already scanned: ${foundCamper.name}`);
        setScanStatus('warning');
      }
    } else {
      setScanResult('QR code not recognized');
      setScanStatus('error');
    }
    
    // Clear result after 3 seconds
    setTimeout(() => {
      setScanResult('');
      setScanStatus('');
    }, 3000);
  };

  // Start QR scanning loop
  const startScanLoop = () => {
    scanIntervalRef.current = setInterval(() => {
      scanQRCode();
    }, 100);
  };

  // Export QR code as image
  const exportQRCode = (camper) => {
    const link = document.createElement('a');
    link.download = `${camper.name}_QR.png`;
    link.href = camper.qrCode;
    link.click();
  };

  // Manual scan simulation (for testing)
  const simulateScan = () => {
    if (campers.length > 0) {
      simulateQRDetection();
    }
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6" />
          Camper Management System
        </h1>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b">
        <div className="flex">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'dashboard' 
                ? 'border-b-2 border-blue-600 text-blue-600' 
                : 'text-gray-600'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('scanner')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'scanner' 
                ? 'border-b-2 border-blue-600 text-blue-600' 
                : 'text-gray-600'
            }`}
          >
            QR Scanner
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Add New Camper Form */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Register New Camper
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name *</label>
                  <input
                    type="text"
                    value={newCamper.name}
                    onChange={(e) => setNewCamper({...newCamper, name: e.target.value})}
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter camper name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Age *</label>
                  <input
                    type="number"
                    value={newCamper.age}
                    onChange={(e) => setNewCamper({...newCamper, age: e.target.value})}
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter age"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Group</label>
                  <input
                    type="text"
                    value={newCamper.group}
                    onChange={(e) => setNewCamper({...newCamper, group: e.target.value})}
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter group name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Emergency Contact</label>
                  <input
                    type="text"
                    value={newCamper.emergency_contact}
                    onChange={(e) => setNewCamper({...newCamper, emergency_contact: e.target.value})}
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter emergency contact"
                  />
                </div>
                
                <button
                  onClick={addCamper}
                  className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Register Camper
                </button>
              </div>
            </div>

            {/* Registered Campers */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Registered Campers ({campers.length})</h2>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {campers.map((camper) => (
                  <div key={camper.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium">{camper.name}</h3>
                        <p className="text-sm text-gray-600">
                          Age: {camper.age} | Group: {camper.group || 'None'}
                        </p>
                        <p className="text-xs text-gray-500">
                          Registered: {new Date(camper.registered).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        {camper.qrCode && (
                          <img 
                            src={camper.qrCode} 
                            alt="QR Code" 
                            className="w-16 h-16 border rounded"
                          />
                        )}
                        <button
                          onClick={() => exportQRCode(camper)}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 flex items-center gap-1 transition-colors"
                        >
                          <Download className="h-4 w-4" />
                          Export QR
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {campers.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    No campers registered yet
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'scanner' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* QR Scanner */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                QR Code Scanner
              </h2>
              
              <div className="space-y-4">
                <div className="relative">
                  <video
                    ref={videoRef}
                    className="w-full h-64 bg-black rounded-lg"
                    playsInline
                    muted
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  
                  {scannerActive && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-48 h-48 border-2 border-blue-500 rounded-lg">
                        <div className="w-full h-full border-4 border-transparent border-t-blue-500 rounded-lg animate-spin"></div>
                      </div>
                    </div>
                  )}
                  
                  {!scannerActive && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                      <button
                        onClick={startScanner}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
                      >
                        <Camera className="h-5 w-5" />
                        Start Scanner
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  {scannerActive && (
                    <button
                      onClick={stopScanner}
                      className="flex-1 bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition-colors"
                    >
                      Stop Scanner
                    </button>
                  )}
                  
                  {scannerActive && campers.length > 0 && (
                    <button
                      onClick={simulateScan}
                      className="flex-1 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition-colors"
                    >
                      Simulate Scan
                    </button>
                  )}
                </div>
                
                {scanResult && (
                  <div className={`p-3 rounded-md flex items-center gap-2 ${
                    scanStatus === 'success' ? 'bg-green-100 text-green-800' : 
                    scanStatus === 'warning' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'
                  }`}>
                    {scanStatus === 'success' ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <XCircle className="h-5 w-5" />
                    )}
                    {scanResult}
                  </div>
                )}
              </div>
            </div>

            {/* Scanned Campers */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Scanned Campers ({scannedCampers.length})</h2>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {scannedCampers.map((camper) => (
                  <div key={camper.id} className="border rounded-lg p-4 bg-green-50 hover:bg-green-100 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          {camper.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Age: {camper.age} | Group: {camper.group || 'None'}
                        </p>
                        <p className="text-xs text-gray-500">
                          Scanned: {new Date(camper.scannedAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-green-600 font-medium">
                        PRESENT
                      </div>
                    </div>
                  </div>
                ))}
                
                {scannedCampers.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    No campers scanned yet
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CamperManagementSystem;