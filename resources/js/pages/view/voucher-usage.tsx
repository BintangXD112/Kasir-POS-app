import React, { useEffect, useState } from "react";

export default function VoucherUsage() {
  const [usages, setUsages] = useState<UsageDiskon[]>([]);
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsage();
  }, []);

  const fetchUsage = async () => {
    const res = await fetch('/admin/voucher-usage');
    if (res.ok) {
      const data = await res.json();
      setUsages(data);
    }
  };

  return (
    <div className="p-6 max-w-full min-h-80vh mx-auto bg-gray-100 rounded-xl shadow text-black">
      <h2 className="text-xl font-semibold mb-4">Penggunaan Voucher</h2>
      <div className="overflow-x-auto">
        {loading ? <div className="text-center py-8">Loading...</div> : (
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 uppercase">
            <tr className="border-b border-gray-200">
              <th className="py-3 px-6">Member</th>
              <th className="py-3 px-6">Kode Voucher</th>
              <th className="py-3 px-6">Kode Transaksi</th>
              <th className="py-3 px-6">Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {usages.map((item, i) => (
              <tr key={i} className="border-b border-gray-200 hover:bg-gray-50 transition">
                <td className="py-3 px-6">{item.member}</td>
                <td className="py-3 px-6">{item.kode_voucher}</td>
                <td className="py-3 px-6">{item.kode_transaksi}</td>
                <td className="py-3 px-6">{new Date(item.waktu_transaksi).toLocaleString('id-ID')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>
    </div>
  );
} 