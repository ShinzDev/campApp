import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { supabase } from '../supabase/client';

export default function QRScanner({ onScanned }) {
  const scannerRef = useRef();
  const [message, setMessage] = useState('');

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      },
      false
    );

    scanner.render(
      async (decodedText) => {
        scanner.clear();
        const camperId = decodedText.trim();

        const { data, error } = await supabase
          .from('campers')
          .update({ present: true })
          .eq('id', camperId)
          .select()
          .single();

        if (error || !data) {
          setMessage('❌ Camper not found.');
        } else {
          setMessage(`✅ ${data.name} marked present`);
          onScanned(data);
        }
      },
      (err) => {
        console.warn(err);
        setMessage('Scanning error...');
      }
    );

    return () => {
      scanner.clear().catch(console.error);
    };
  }, [onScanned]);

  return (
    <div className="mt-6 p-4 border rounded shadow bg-white">
      <h3 className="text-lg font-semibold mb-2">Scan Camper QR</h3>
      <div id="qr-reader" ref={scannerRef} />
      {message && <p className="mt-3 text-sm text-blue-700">{message}</p>}
    </div>
  );
}
