// import React from 'react'
// import CamperRegistrationApp from './component/CamperRegistrationApp'
// import CampQRSystem from './component/CampQRSystem'
// import ScanCamper from './component/ScanCamper'

// const App = () => {
//   return (
//     <div>
//     <ScanCamper/>

//     <CampQRSystem/>
//       {/* <CamperRegistrationApp/> */}
      
//     </div>
//   )
// }

// export default App

import React, { useState } from "react";
// import { QrReader } from "react-qr-reader";

const QrScanner = () => {
  const [scannedData, setScannedData] = useState(null);
  const [error, setError] = useState(null);

  const handleScan = (result) => {
    if (result?.text && result.text !== scannedData) {
      setScannedData(result.text);
      setError(null);
      console.log("Scanned QR Code:", result.text);
    }
  };

  const handleError = (err) => {
    console.error("QR Scan Error:", err);
    setError("Error accessing camera or scanning QR code.");
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 space-y-4">
      <h2 className="text-xl font-semibold">QR Code Scanner</h2>

      <div className="w-full max-w-sm overflow-hidden rounded-xl border shadow-lg">
        <QrReader
          constraints={{ facingMode: "environment" }}
          onResult={(result, error) => {
            if (result) handleScan(result);
            if (error) handleError(error);
          }}
          className="w-full h-auto"
        />
      </div>

      {scannedData && (
        <div className="bg-green-100 text-green-800 px-4 py-2 rounded shadow">
          ✅ Scanned: {scannedData}
        </div>
      )}

      {error && (
        <div className="bg-red-100 text-red-800 px-4 py-2 rounded shadow">
          ⚠️ {error}
        </div>
      )}
    </div>
  );
};

export default QrScanner;
