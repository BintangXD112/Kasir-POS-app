import React from 'react';
import { User, Member, Produk } from '@/types/type'; // ganti path sesuai file kamu

interface PageProps {
  users: User[];
  members: Member[];
  produks: Produk[];
  pemasukan_bulan_ini: number;
  transaksi: any[];
}

export default function Home({ users, members, produks, pemasukan_bulan_ini, transaksi }: PageProps) {
  // Format pemasukan dengan pemisah ribuan dan tanpa desimal jika tidak ada
  const formattedPemasukan = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(pemasukan_bulan_ini);
  return (
    <>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-500 text-white p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Total Pemasukan</h3>
          <p className="text-3xl font-bold">{formattedPemasukan}</p>
        </div>
        <div className="bg-orange-500 text-white p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Jumlah Produk</h3>
          <p className="text-3xl font-bold">{produks.length}</p>
        </div>
        <div className="bg-yellow-500 text-white p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Total Member</h3>
          <p className="text-3xl font-bold">{members.length}</p>
        </div>
        <div className="bg-green-500 text-white p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Total User</h3>
          <p className="text-3xl font-bold">{users.length}</p>
        </div>
      </div>

      <div className="p-6 max-w-full mx-auto bg-gray-100 rounded-xl shadow text-black mt-5">
        <h2 className="text-xl font-semibold mb-4">Data Users</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-100 uppercase">
              <tr className="border-b border-gray-200">
                <th className="py-3 px-6">Nama</th>
                <th className="py-3 px-6">Kode User</th>
                <th className="py-3 px-6">Tipe User</th>
                <th className="py-3 px-6">Dibuat</th>
                <th className="py-3 px-6">Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-gray-200 hover:bg-gray-50 transition"
                >
                  <td className="py-3 px-6">{user.nama_user}</td>
                  <td className="py-3 px-6">{user.kode_user}</td>
                  <td className="py-3 px-6">{user.tipe_user}</td>
                  <td className="py-3 px-6">
                    {user.created_at
                      ? new Date(user.created_at).toLocaleDateString('id-ID')
                      : '-'}
                  </td>
                  <td className="py-3 px-6">
                    <span className={`bg-${user.status === 'active' ? 'green' : 'red'}-500 text-white text-xs font-semibold px-4 py-1 rounded-full shadow-sm`}>
                        {user.status === 'active' ? 'Aktif' : 'Non-Aktif'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
