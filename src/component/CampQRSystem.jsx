import React, { useState, useRef, useEffect } from 'react';
import { Users, QrCode, Scan, Plus, Download, AlertCircle, Check, X, Search, Filter } from 'lucide-react';

const CampQRSystem = () => {
  const [campers, setCampers] = useState([]);
  const [activeTab, setActiveTab] = useState('register');
  const [scannedCampers, setScannedCampers] = useState(new Set());
  const [currentScanSession, setCurrentScanSession] = useState(null);
  const [scanSessions, setScanSessions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCabin, setFilterCabin] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState('');

  // Form state for new camper
  const [newCamper, setNewCamper] = useState({
    name: '',
    cabin: '',
    age: '',
    emergencyContact: '',
    medicalNotes: ''
  });

  // Generate unique camper ID
  const generateCamperId = () => {
    return 'C' + String(campers.length + 1).padStart(3, '0');
  };

  // Add new camper
  const addCamper = () => {
    if (!newCamper.name || !newCamper.cabin || !newCamper.age) {
      alert('Please fill in all required fields');
      return;
    }

    const camper = {
      id: generateCamperId(),
      ...newCamper,
      qrData: `${generateCamperId()}|${newCamper.name}|${newCamper.cabin}|${newCamper.age}|${newCamper.medicalNotes || 'None'}`,
      registeredAt: new Date().toISOString()
    };

    setCampers([...campers, camper]);
    setNewCamper({ name: '', cabin: '', age: '', emergencyContact: '', medicalNotes: '' });
  };

  // Generate QR Code (using a simple text-based representation)
  const generateQRCode = (data) => {
    // In a real implementation, you'd use a QR code library
    // For demo purposes, we'll create a visual representation
    return `data:image/svg+xml,${encodeURIComponent(`
      <svg width="120" height="120" xmlns="http://www.w3.org/2000/svg">
        <rect width="120" height="120" fill="white"/>
        <rect x="10" y="10" width="100" height="100" fill="black"/>
        <rect x="20" y="20" width="80" height="80" fill="white"/>
        <text x="60" y="60" text-anchor="middle" fill="black" font-size="8">QR:${data.split('|')[0]}</text>
      </svg>
    `)}`;
  };

  // Start new scan session
  const startScanSession = () => {
    const session = {
      id: Date.now(),
      startTime: new Date(),
      scannedCampers: [],
      location: 'Main Area',
      counselor: 'Current User'
    };
    setCurrentScanSession(session);
    setScannedCampers(new Set());
    setActiveTab('scan');
  };

  // Simulate QR code scanning (in real implementation, use camera)
  const scanCamper = (camperId) => {
    const camper = campers.find(c => c.id === camperId);
    if (camper && !scannedCampers.has(camperId)) {
      setScannedCampers(new Set([...scannedCampers, camperId]));
      if (currentScanSession) {
        currentScanSession.scannedCampers.push({
          ...camper,
          scannedAt: new Date()
        });
      }
      setScanError('');
    } else if (scannedCampers.has(camperId)) {
      setScanError('Camper already scanned in this session');
    } else {
      setScanError('Camper not found');
    }
  };

  // Complete scan session
  const completeScanSession = () => {
    if (currentScanSession) {
      const completedSession = {
        ...currentScanSession,
        endTime: new Date(),
        totalScanned: scannedCampers.size,
        totalCampers: campers.length,
        missingCampers: campers.filter(c => !scannedCampers.has(c.id))
      };
      setScanSessions([...scanSessions, completedSession]);
      setCurrentScanSession(null);
      setScannedCampers(new Set());
      setActiveTab('dashboard');
    }
  };

  // Filter campers
  const filteredCampers = campers.filter(camper => {
    const matchesSearch = camper.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         camper.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCabin = !filterCabin || camper.cabin === filterCabin;
    return matchesSearch && matchesCabin;
  });

  // Get unique cabins
  const uniqueCabins = [...new Set(campers.map(c => c.cabin))].sort();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Camp QR Management System</h1>
          <p className="text-gray-600">Streamlined head count and camper tracking</p>
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap justify-center mb-8 bg-white rounded-lg shadow-md p-2">
          {[
            { id: 'register', label: 'Register Campers', icon: Plus },
            { id: 'campers', label: 'View Campers', icon: Users },
            { id: 'scan', label: 'Scan QR Codes', icon: Scan },
            { id: 'dashboard', label: 'Dashboard', icon: QrCode }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-2 m-1 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon size={18} className="mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Register Campers Tab */}
          {activeTab === 'register' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Register New Camper</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={newCamper.name}
                      onChange={(e) => setNewCamper({...newCamper, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter camper's full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cabin/Group *
                    </label>
                    <input
                      type="text"
                      value={newCamper.cabin}
                      onChange={(e) => setNewCamper({...newCamper, cabin: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Cabin 7, Blue Group"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Age *
                    </label>
                    <input
                      type="number"
                      value={newCamper.age}
                      onChange={(e) => setNewCamper({...newCamper, age: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Age"
                      min="8"
                      max="18"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Emergency Contact
                    </label>
                    <input
                      type="text"
                      value={newCamper.emergencyContact}
                      onChange={(e) => setNewCamper({...newCamper, emergencyContact: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Parent/Guardian phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Medical Notes
                    </label>
                    <textarea
                      value={newCamper.medicalNotes}
                      onChange={(e) => setNewCamper({...newCamper, medicalNotes: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24"
                      placeholder="Allergies, medications, special needs..."
                    />
                  </div>
                </div>
              </div>
              <button
                onClick={addCamper}
                className="mt-6 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors flex items-center"
              >
                <Plus size={18} className="mr-2" />
                Register Camper
              </button>
            </div>
          )}

          {/* View Campers Tab */}
          {activeTab === 'campers' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Registered Campers ({campers.length})</h2>
                <button
                  onClick={() => {
                    const dataStr = JSON.stringify(campers, null, 2);
                    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                    const exportFileDefaultName = 'campers.json';
                    const linkElement = document.createElement('a');
                    linkElement.setAttribute('href', dataUri);
                    linkElement.setAttribute('download', exportFileDefaultName);
                    linkElement.click();
                  }}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center"
                >
                  <Download size={18} className="mr-2" />
                  Export Data
                </button>
              </div>

              {/* Search and Filter */}
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search size={18} className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by name or ID..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="min-w-48">
                  <select
                    value={filterCabin}
                    onChange={(e) => setFilterCabin(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Cabins</option>
                    {uniqueCabins.map(cabin => (
                      <option key={cabin} value={cabin}>{cabin}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Campers Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCampers.map(camper => (
                  <div key={camper.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-800">{camper.name}</h3>
                        <p className="text-sm text-gray-600">{camper.id} • {camper.cabin}</p>
                        <p className="text-sm text-gray-600">Age: {camper.age}</p>
                      </div>
                      <div className="w-16 h-16 border border-gray-300 rounded flex items-center justify-center">
                        <img
                          src={generateQRCode(camper.qrData)}
                          alt={`QR for ${camper.name}`}
                          className="w-full h-full"
                        />
                      </div>
                    </div>
                    {camper.medicalNotes && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mt-2">
                        <div className="flex items-center">
                          <AlertCircle size={16} className="text-yellow-600 mr-1" />
                          <span className="text-sm text-yellow-800">Medical: {camper.medicalNotes}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {filteredCampers.length === 0 && campers.length > 0 && (
                <div className="text-center py-8 text-gray-500">
                  No campers match your search criteria.
                </div>
              )}

              {campers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No campers registered yet. Add some campers to get started!
                </div>
              )}
            </div>
          )}

          {/* Scan QR Codes Tab */}
          {activeTab === 'scan' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-gray-800">QR Code Scanner</h2>
              
              {!currentScanSession ? (
                <div className="text-center py-12">
                  <Scan size={64} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">Start Head Count</h3>
                  <p className="text-gray-600 mb-6">Begin a new scanning session to track camper attendance</p>
                  <button
                    onClick={startScanSession}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg text-lg"
                  >
                    Start Scanning Session
                  </button>
                </div>
              ) : (
                <div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold text-blue-800 mb-2">Active Scan Session</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-blue-600">Started:</span>
                        <div className="font-medium">{currentScanSession.startTime.toLocaleTimeString()}</div>
                      </div>
                      <div>
                        <span className="text-blue-600">Scanned:</span>
                        <div className="font-medium">{scannedCampers.size} / {campers.length}</div>
                      </div>
                      <div>
                        <span className="text-blue-600">Location:</span>
                        <div className="font-medium">{currentScanSession.location}</div>
                      </div>
                      <div>
                        <span className="text-blue-600">Counselor:</span>
                        <div className="font-medium">{currentScanSession.counselor}</div>
                      </div>
                    </div>
                  </div>

                  {/* Manual Scan Buttons (for demo) */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-700 mb-3">Quick Scan (Demo Mode)</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                      {campers.map(camper => (
                        <button
                          key={camper.id}
                          onClick={() => scanCamper(camper.id)}
                          disabled={scannedCampers.has(camper.id)}
                          className={`p-2 rounded text-sm transition-all ${
                            scannedCampers.has(camper.id)
                              ? 'bg-green-100 text-green-800 cursor-not-allowed'
                              : 'bg-gray-100 hover:bg-blue-100 text-gray-700'
                          }`}
                        >
                          {scannedCampers.has(camper.id) && <Check size={14} className="inline mr-1" />}
                          {camper.id}
                        </button>
                      ))}
                    </div>
                  </div>

                  {scanError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                      <div className="flex items-center text-red-800">
                        <X size={16} className="mr-2" />
                        {scanError}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button
                      onClick={completeScanSession}
                      className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg"
                    >
                      Complete Session
                    </button>
                    <button
                      onClick={() => {
                        setCurrentScanSession(null);
                        setScannedCampers(new Set());
                      }}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg"
                    >
                      Cancel Session
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Dashboard & Reports</h2>
              
              {/* Stats Cards */}
              <div className="grid md:grid-cols-4 gap-4 mb-8">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 text-sm font-medium">Total Campers</p>
                      <p className="text-2xl font-bold text-blue-800">{campers.length}</p>
                    </div>
                    <Users className="text-blue-500" size={32} />
                  </div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-600 text-sm font-medium">Scan Sessions</p>
                      <p className="text-2xl font-bold text-green-800">{scanSessions.length}</p>
                    </div>
                    <QrCode className="text-green-500" size={32} />
                  </div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-600 text-sm font-medium">Cabins</p>
                      <p className="text-2xl font-bold text-purple-800">{uniqueCabins.length}</p>
                    </div>
                    <Filter className="text-purple-500" size={32} />
                  </div>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-600 text-sm font-medium">Last Session</p>
                      <p className="text-sm font-bold text-orange-800">
                        {scanSessions.length > 0 
                          ? scanSessions[scanSessions.length - 1].startTime.toLocaleDateString()
                          : 'None'
                        }
                      </p>
                    </div>
                    <Scan className="text-orange-500" size={32} />
                  </div>
                </div>
              </div>

              {/* Recent Scan Sessions */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Scan Sessions</h3>
                {scanSessions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                    No scan sessions completed yet. Start scanning to see reports here!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {scanSessions.slice(-5).reverse().map(session => (
                      <div key={session.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-800">
                              {session.startTime.toLocaleDateString()} - {session.startTime.toLocaleTimeString()}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {session.location} • {session.counselor}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-600">
                              {session.totalScanned}/{session.totalCampers}
                            </div>
                            <div className="text-sm text-gray-600">
                              {Math.round((session.totalScanned / session.totalCampers) * 100)}% present
                            </div>
                          </div>
                        </div>
                        {session.missingCampers.length > 0 && (
                          <div className="bg-red-50 border border-red-200 rounded p-3 mt-3">
                            <p className="text-red-800 font-medium mb-1">Missing Campers:</p>
                            <div className="text-sm text-red-700">
                              {session.missingCampers.map(camper => 
                                `${camper.name} (${camper.id})`
                              ).join(', ')}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampQRSystem;