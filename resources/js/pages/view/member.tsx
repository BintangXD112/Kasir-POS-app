import React, { useEffect, useState } from "react";
import Swal from 'sweetalert2';

interface Member {
  id: number;
  nama: string;
  diskon_id: number | null;
  total_transaksi: number;
  tanggal_daftar: string;
}

interface Voucher {
  id: number;
  kode_voucher: string;
  deskripsi: string;
  jumlah_diskon: number;
}

function getCsrfToken() {
  return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
}

export default function Member() {
  const [members, setMembers] = useState<Member[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMembers = async () => {
    setLoading(true);
    const res = await fetch('/admin/member');
    const data = await res.json();
    setMembers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchMembers();
    fetch('/admin/voucher-diskon')
      .then(res => res.json())
      .then(setVouchers);
  }, []);

  const handleVoucherChange = async (memberId: number, diskonId: number | null) => {
    setLoading(true);
    const res = await fetch(`/admin/member/${memberId}/voucher`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': getCsrfToken(),
      },
      body: JSON.stringify({ diskon_id: diskonId }),
    });
    if (res.ok) {
      await fetchMembers();
      Swal.fire('Berhasil', 'Voucher diskon berhasil diupdate untuk member', 'success');
    } else {
      Swal.fire('Gagal', 'Gagal update voucher diskon', 'error');
    }
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-full mx-auto bg-gray-100 rounded-xl shadow text-black">
      <h2 className="text-xl font-semibold mb-4">Kelola Member</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 uppercase">
            <tr className="border-b border-gray-200">
              <th className="py-3 px-6">ID</th>
              <th className="py-3 px-6">Nama</th>
              <th className="py-3 px-6">Voucher Diskon</th>
              <th className="py-3 px-6">Total Transaksi</th>
              <th className="py-3 px-6">Tanggal Daftar</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                <td className="py-3 px-6">{member.id}</td>
                <td className="py-3 px-6">{member.nama}</td>
                <td className="py-3 px-6">
                  <select
                    className="border rounded p-2"
                    value={member.diskon_id || ''}
                    onChange={e => handleVoucherChange(member.id, e.target.value ? Number(e.target.value) : null)}
                    disabled={loading}
                  >
                    <option value="">-- Tidak Ada Voucher --</option>
                    {vouchers.map(v => (
                      <option key={v.id} value={v.id}>{v.kode_voucher} - {v.jumlah_diskon}%</option>
                    ))}
                  </select>
                </td>
                <td className="py-3 px-6">{member.total_transaksi}</td>
                <td className="py-3 px-6">{member.tanggal_daftar}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 