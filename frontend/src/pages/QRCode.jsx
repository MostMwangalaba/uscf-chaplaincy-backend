import React from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import QRCode from 'react-qr-code';
import { FaDownload, FaPrint, FaShare } from 'react-icons/fa';

const QRCodePage = () => {
  const { user } = useAuth();
  const qrValue = `${window.location.origin}/member/${user?.member_id}`;

  const downloadQR = () => {
    const svg = document.querySelector('svg');
    if (svg) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], {type: 'image/svg+xml'});
      const url = URL.createObjectURL(svgBlob);
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const link = document.createElement('a');
        link.download = `qr-${user?.member_id}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        URL.revokeObjectURL(url);
      };
      img.src = url;
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">My QR Code</h2>
          <p className="text-gray-500 mb-6">Scan this QR code to view your contribution summary</p>
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-white rounded-2xl shadow-lg inline-block">
              <QRCode value={qrValue} size={200} level="H" />
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <button onClick={downloadQR} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"><FaDownload /> Download</button>
            <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"><FaPrint /> Print</button>
            <button onClick={() => { if (navigator.share) { navigator.share({ title: 'USCF Chaplaincy QR Code', text: 'Scan this QR code to view my contribution summary', url: qrValue }); } }} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"><FaShare /> Share</button>
          </div>
          <div className="mt-6 text-sm text-gray-500">
            <p>Member ID: <span className="font-mono font-bold text-gray-700">{user?.member_id}</span></p>
            <p>Scan with any QR code reader to access your public profile</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default QRCodePage;
