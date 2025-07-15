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

  // Generate QR code data URL
  const generateQRCode = (data) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const size = 200;
    canvas.width = size;
    canvas.height = size;
    
    // Simple QR code simulation (in real app, use qrcode library)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#000000';
    
    // Create a simple pattern for demo
    const cellSize = size / 20;
    for (let i = 0; i < 20; i++) {
      for (let j = 0; j < 20; j++) {
        if ((i + j + data.length) % 3 === 0) {
          ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
        }
      }
    }
    
    // Add some corner squares
    ctx.fillRect(0, 0, cellSize * 7, cellSize * 7);
    ctx.fillRect(size - cellSize * 7, 0, cellSize * 7, cellSize * 7);
    ctx.fillRect(0, size - cellSize * 7, cellSize * 7, cellSize * 7);
    
    // Add white squares inside corners
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cellSize, cellSize, cellSize * 5, cellSize * 5);
    ctx.fillRect(size - cellSize * 6, cellSize, cellSize * 5, cellSize * 5);
    ctx.fillRect(cellSize, size - cellSize * 6, cellSize * 5, cellSize * 5);
    
    return canvas.toDataURL();
  };

  // Add new camper
  const addCamper = () => {
    if (!newCamper.name || !newCamper.age) {
      alert('Please fill in required fields');
      return;
    }
    
    const camper = {
      id: Date.now().toString(),
      ...newCamper,
      qrCode: generateQRCode(newCamper.name + newCamper.age),
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
      setScanStatus('Camera access denied');
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

  // Simulate QR code scanning
  const startScanLoop = () => {
    scanIntervalRef.current = setInterval(() => {
      if (videoRef.current && canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0);
        
        // Simulate successful scan after 3 seconds
        setTimeout(() => {
          if (scannerActive && campers.length > 0) {
            simulateScan();
          }
        }, 3000);
      }
    }, 100);
  };

  // Simulate scanning a camper
  const simulateScan = () => {
    if (campers.length === 0) return;
    
    const randomCamper = campers[Math.floor(Math.random() * campers.length)];
    const alreadyScanned = scannedCampers.find(sc => sc.id === randomCamper.id);
    
    if (!alreadyScanned) {
      const scannedCamper = {
        ...randomCamper,
        scannedAt: new Date().toISOString()
      };
      
      setScannedCampers([...scannedCampers, scannedCamper]);
      setScanResult(`Camper Present: ${randomCamper.name}`);
      setScanStatus('success');
    } else {
      setScanResult(`Already scanned: ${randomCamper.name}`);
      setScanStatus('warning');
    }
    
    setTimeout(() => {
      setScanResult('');
      setScanStatus('');
    }, 3000);
  };

  // Export QR code as PDF (simplified)
  const exportQRCode = (camper) => {
    const link = document.createElement('a');
    link.download = `${camper.name}_QR.png`;
    link.href = camper.qrCode;
    link.click();
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
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="Enter camper name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Age *</label>
                  <input
                    type="number"
                    value={newCamper.age}
                    onChange={(e) => setNewCamper({...newCamper, age: e.target.value})}
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="Enter age"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Group</label>
                  <input
                    type="text"
                    value={newCamper.group}
                    onChange={(e) => setNewCamper({...newCamper, group: e.target.value})}
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="Enter group name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Emergency Contact</label>
                  <input
                    type="text"
                    value={newCamper.emergency_contact}
                    onChange={(e) => setNewCamper({...newCamper, emergency_contact: e.target.value})}
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="Enter emergency contact"
                  />
                </div>
                
                <button
                  onClick={addCamper}
                  className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
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
                  <div key={camper.id} className="border rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{camper.name}</h3>
                      <p className="text-sm text-gray-600">Age: {camper.age} | Group: {camper.group || 'None'}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => exportQRCode(camper)}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 flex items-center gap-1"
                      >
                        <Download className="h-4 w-4" />
                        Export QR
                      </button>
                    </div>
                  </div>
                ))}
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
                  
                  {!scannerActive && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                      <button
                        onClick={startScanner}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                      >
                        <Camera className="h-5 w-5" />
                        Start Scanner
                      </button>
                    </div>
                  )}
                </div>
                
                {scannerActive && (
                  <button
                    onClick={stopScanner}
                    className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700"
                  >
                    Stop Scanner
                  </button>
                )}
                
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
                  <div key={camper.id} className="border rounded-lg p-4 bg-green-50">
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