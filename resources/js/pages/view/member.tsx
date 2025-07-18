import React, { useEffect, useState } from "react";
import Swal from 'sweetalert2';

interface Member {
  id: number;
  nama: string;
  diskon_id: number | null;
  alamat: string;
  telepon: number;
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

  const convertSpacesToNbsp = (text: string) => {
  return text.replace(/ /g, '\u00A0');
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
      <div className="flex justify-between mb-4 items-center">
        <h2 className="text-xl font-semibold">Kelola Member</h2>
        <button className="bg-blue-500 text-white px-4 py-2 rounded-md">Tambah Member Baru</button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 uppercase">
            <tr className="border-b border-gray-200">
              <th className="py-3 px-6">ID</th>
              <th className="py-3 px-6">Nama</th>
              <th className="py-3 px-6">Alamat</th>
              <th className="py-3 px-6">Nomor&nbsp;Telepon</th>
              <th className="py-3 px-6">Voucher&nbsp;Diskon</th>
              <th className="py-3 px-6">Total&nbsp;Transaksi</th>
              <th className="py-3 px-6">Tanggal&nbsp;Daftar</th>
              <th className="py-3 px-6 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                <td className="py-3 px-6">{member.id}</td>
                <td className="py-3 px-6">{convertSpacesToNbsp(member.nama)}</td>
                <td className="py-3 px-6">{member.alamat}</td>
                <td className="py-3 px-6">{member.telepon}</td>
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
                <td className="py-3 px-6 text-center">{member.total_transaksi}</td>
                <td className="py-3 px-6">{member.tanggal_daftar}</td>
                <td className="py-3 px-6 flex justify-center gap-4">
                <button
                    className="bg-red-500 text-white w-16 py-2 rounded-md"
                  >
                    Hapus
                  </button>
                  <button
                    className="bg-yellow-500 text-white w-16 py-2 rounded-md"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 