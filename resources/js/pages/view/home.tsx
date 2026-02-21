import React from 'react';
import { User, Member, Produk } from '@/types/type';
import CountUp from '@/components/count-up';

interface PageProps {
  users: User[];
  members: Member[];
  produks: Produk[];
  pemasukan_bulan_ini: number;
  transaksi: any[];
  currentTheme: 'auto' | 'Light' | 'Dark'; // ✅ terima tema dari parent
}

export default function Home({
  users,
  members,
  produks,
  pemasukan_bulan_ini,
  transaksi,
  currentTheme,
}: PageProps) {
  // ===== helper kelas tema (selaras dengan Login) =====
  const sectionTitle =
    currentTheme === 'auto'
      ? 'text-zinc-900 dark:text-zinc-100'
      : currentTheme === 'Light'
      ? 'text-zinc-900'
      : 'text-zinc-100';

  const cardBase = 'p-6 rounded-lg shadow transition-colors';
  const tableWrap =
    currentTheme === 'auto'
      ? 'p-6 max-w-full mx-auto min-h-[45vh] rounded-xl shadow border border-zinc-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100'
      : currentTheme === 'Light'
      ? 'p-6 max-w-full mx-auto min-h-[45vh] rounded-xl shadow border border-zinc-200 bg-gray-50 text-zinc-900'
      : 'p-6 max-w-full mx-auto min-h-[45vh] rounded-xl shadow border border-zinc-800 bg-zinc-900 text-zinc-100';

  const tableHead =
    currentTheme === 'auto'
      ? 'bg-gray-100 dark:bg-zinc-800'
      : currentTheme === 'Light'
      ? 'bg-gray-100'
      : 'bg-zinc-800';

  const rowHover =
    currentTheme === 'auto'
      ? 'hover:bg-gray-50 dark:hover:bg-zinc-800/60'
      : currentTheme === 'Light'
      ? 'hover:bg-gray-50'
      : 'hover:bg-zinc-800/60';

  // ===== badge status (hindari kelas dinamis Tailwind) =====
  const statusBadgeClass = (status?: string) =>
    status === 'Online'
      ? 'bg-green-500 text-white text-xs font-semibold px-4 py-1 rounded-full shadow-sm'
      : 'bg-red-500 text-white text-xs font-semibold px-4 py-1 rounded-full shadow-sm';

  return (
    <>
      <h1 className={`text-2xl font-bold mb-4 ${sectionTitle}`}>Dashboard</h1>

      {/* Kartu ringkas (tetap berwarna agar kontras di semua tema) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`${cardBase} bg-blue-500 text-white`}>
          <h3 className="text-lg font-semibold mb-2">Total Pemasukan</h3>
          <p className="text-3xl font-bold">
            Rp.&nbsp;
            <CountUp
              from={0}
              to={pemasukan_bulan_ini}
              separator="."
              direction="up"
              duration={0.3}
              className="count-up-text"
            />
          </p>
        </div>

        <div className={`${cardBase} bg-orange-500 text-white`}>
          <h3 className="text-lg font-semibold mb-2">Jumlah Produk</h3>
          <p className="text-3xl font-bold">
            <CountUp
              from={0}
              to={produks.length}
              separator=","
              direction="up"
              duration={0.3}
              className="count-up-text"
            />
          </p>
        </div>

        <div className={`${cardBase} bg-yellow-500 text-white`}>
          <h3 className="text-lg font-semibold mb-2">Total Member</h3>
          <p className="text-3xl font-bold">
            <CountUp
              from={0}
              to={members.length}
              separator=","
              direction="up"
              duration={0.3}
              className="count-up-text"
            />
          </p>
        </div>

        <div className={`${cardBase} bg-green-500 text-white`}>
          <h3 className="text-lg font-semibold mb-2">Total User</h3>
          <p className="text-3xl font-bold">
            <CountUp
              from={0}
              to={users.length}
              separator=","
              direction="up"
              duration={0.3}
              className="count-up-text"
            />
          </p>
        </div>
      </div>

      {/* Tabel Users (sinkron tema) */}
      <div className={`${tableWrap} mt-5`}>
        <h2 className="text-xl font-semibold mb-4">Data Users</h2>
        <div className="overflow-x-auto rounded-xl">
          <table className="min-w-full text-sm text-left">
            <thead className={`${tableHead} uppercase`}>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="py-3 px-6">Nama</th>
                <th className="py-3 px-6">Kode User</th>
                <th className="py-3 px-6">Tipe User</th>
                <th className="py-3 px-6">Dibuat</th>
                <th className="py-3 px-6 text-center">Status Akun</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className={`border-b border-zinc-200 dark:border-zinc-800 transition ${rowHover}`}
                >
                  <td className="py-3 px-6">{user.nama_user}</td>
                  <td className="py-3 px-6">{user.kode_user}</td>
                  <td className="py-3 px-6">{user.tipe_user}</td>
                  <td className="py-3 px-6">
                    {user.created_at
                      ? new Date(user.created_at).toLocaleDateString('id-ID')
                      : '-'}
                  </td>
                  <td className="py-3 px-6 text-center">
                    <span className={statusBadgeClass(user.status)}>
                      {user.status ?? '-'}
                    </span>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td className="py-6 px-6 text-center text-zinc-500" colSpan={5}>
                    Belum ada data user.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
