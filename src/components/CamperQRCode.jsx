import React, { useState, useEffect, useRef } from 'react';

// Helper function to dynamically load a script
const loadScript = (src, id) => {
  return new Promise((resolve, reject) => {
    // Check if the script is already on the page
    if (document.getElementById(id)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.id = id;
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
};

export default function CamperQRCode({ camper }) {
  const qrRef = useRef();
  const [libsLoaded, setLibsLoaded] = useState(false);
  const [error, setError] = useState(null);

  // Effect to load external libraries
  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates if the component unmounts

    Promise.all([
      // Load jspdf library
      loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js', 'jspdf-script'),
      // Load qrcode.react library (using a version with a reliable UMD build)
      loadScript('https://cdnjs.cloudflare.com/ajax/libs/qrcode.react/1.0.1/qrcode.react.min.js', 'qrcode-react-script')
    ])
    .then(() => {
      if (isMounted) {
        setLibsLoaded(true);
      }
    })
    .catch((err) => {
      console.error("Failed to load libraries", err);
      if (isMounted) {
        setError("Failed to load required libraries for QR Code generation.");
      }
    });

    // Cleanup function to run when the component unmounts
    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  const handleExport = () => {
    if (!libsLoaded) {
        console.error("Libraries not loaded yet.");
        return;
    }
    const canvas = qrRef.current.querySelector('canvas');
    if (canvas) {
      const imgData = canvas.toDataURL('image/png');
      // jsPDF is loaded onto the window object by the script
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF();
      pdf.text(`Camper: ${camper.name}`, 10, 10);
      pdf.addImage(imgData, 'PNG', 10, 20, 80, 80);
      pdf.save(`${camper.name}_QRCode.pdf`);
    } else {
      console.error("Could not find the QR code canvas element.");
    }
  };

  // Display an error message if scripts fail to load
  if (error) {
    return <div className="mt-4 p-4 border rounded shadow bg-red-100 text-red-700">{error}</div>;
  }

  // Display a loading message while scripts are loading
  if (!libsLoaded) {
    return <div className="mt-4 p-4">Loading QR Code generator...</div>;
  }

  // The UMD build of qrcode.react@1.0.1 exposes the component directly on window.QRCode
  const QRCodeComponent = window.QRCode;

  return (
    <div className="mt-4 p-4 border rounded shadow bg-white">
      <h3 className="text-lg font-semibold">QR Code for {camper.name}</h3>
      <div ref={qrRef} className="my-4 inline-block">
        {/* Use React.createElement because JSX <QRCodeComponent.../> might be transpiled
          before QRCodeComponent is defined from the window object. This is a safer way
          to render a dynamically loaded component.
        */}
        {React.createElement(QRCodeComponent, { value: camper.id.toString(), size: 200 })}
      </div>
      <div>
        <button
          onClick={handleExport}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Export QR as PDF
        </button>
      </div>
    </div>
  );
}
