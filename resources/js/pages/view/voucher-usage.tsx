import React, { useEffect, useState } from "react";

interface Usage {
  member: string;
  kode_voucher: string;
  jumlah_diskon: number;
  tanggal: string;
  total_setelah_diskon: number;
}

export default function VoucherUsage() {
  const [usages, setUsages] = useState<Usage[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch('/admin/voucher-usage')
      .then(res => res.json())
      .then(setUsages)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 max-w-full mx-auto bg-gray-100 rounded-xl shadow text-black">
      <h2 className="text-xl font-semibold mb-4">Penggunaan Voucher</h2>
      <div className="overflow-x-auto">
        {loading ? <div className="text-center py-8">Loading...</div> : (
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 uppercase">
            <tr className="border-b border-gray-200">
              <th className="py-3 px-6">Member</th>
              <th className="py-3 px-6">Kode Voucher</th>
              <th className="py-3 px-6">Diskon (%)</th>
              <th className="py-3 px-6">Tanggal</th>
              <th className="py-3 px-6">Total Setelah Diskon</th>
            </tr>
          </thead>
          <tbody>
            {usages.map((item, i) => (
              <tr key={i} className="border-b border-gray-200 hover:bg-gray-50 transition">
                <td className="py-3 px-6">{item.member}</td>
                <td className="py-3 px-6">{item.kode_voucher}</td>
                <td className="py-3 px-6">{item.jumlah_diskon}</td>
                <td className="py-3 px-6">{new Date(item.tanggal).toLocaleString('id-ID')}</td>
                <td className="py-3 px-6">Rp. {item.total_setelah_diskon.toLocaleString('id-ID')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>
    </div>
  );
} 