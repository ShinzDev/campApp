import { useState } from 'react';
import CamperForm from '../components/CamperForm';
import CamperQRCode from '../components/CamperQRCode';
import QRScanner from '../components/QRScanner';
import CamperList from '../components/CamperList';

export default function Dashboard() {
  const [newCamper, setNewCamper] = useState(null);
  const [refreshList, setRefreshList] = useState(0);

  const handleScanned = () => {
    setRefreshList((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-6">Camp QR Dashboard</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <CamperForm onRegistered={setNewCamper} />
        {newCamper && <CamperQRCode camper={newCamper} />}
      </div>

      <QRScanner onScanned={handleScanned} />
      <CamperList refreshTrigger={refreshList} />
    </div>
  );
}
