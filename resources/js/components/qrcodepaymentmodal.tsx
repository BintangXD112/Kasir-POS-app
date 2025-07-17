import React from "react";
import QRCode from 'react-qr-code';

interface QRCodePembayaranProps {
  value: string;
}

export default function QRCodePembayaran({ value }: QRCodePembayaranProps) {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <QRCode value={value} size={200} />
      <p className="mt-2 text-sm text-gray-600">Scan untuk bayar</p>
    </div>
  );
}
