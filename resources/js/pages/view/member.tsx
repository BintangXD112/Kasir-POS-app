import React, { useState, useEffect, useMemo } from 'react';
import { router } from '@inertiajs/react';
import Swal from 'sweetalert2';
import type { Member as MemberType, Voucher } from '@/types/type';

// ===== helpers
function getCsrfToken() {
  return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
}

type ThemeMode = 'auto' | 'Light' | 'Dark';

interface Props {
  currentTheme?: ThemeMode; // optional, kalau belum ada sistem tema
}

export default function Member({ currentTheme = 'Light' }: Props) {
  // ===== theme classes
  const appBg =
    currentTheme === 'auto' ? 'bg-gray-100 dark:bg-zinc-950'
      : currentTheme === 'Dark' ? 'bg-zinc-950'
        : 'bg-gray-100';
  const card =
    currentTheme === 'auto'
      ? 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800'
      : currentTheme === 'Dark'
        ? 'bg-zinc-900 border border-zinc-800'
        : 'bg-white border border-zinc-200';
  const text =
    currentTheme === 'auto' ? 'text-zinc-900 dark:text-zinc-100'
      : currentTheme === 'Dark' ? 'text-zinc-100'
        : 'text-zinc-900';
  const subText =
    currentTheme === 'auto' ? 'text-zinc-500 dark:text-zinc-400'
      : currentTheme === 'Dark' ? 'text-zinc-400'
        : 'text-zinc-500';
  const rowHover =
    currentTheme === 'auto' ? 'hover:bg-slate-50 dark:hover:bg-zinc-800/60'
      : currentTheme === 'Dark' ? 'hover:bg-zinc-800/60'
        : 'hover:bg-slate-50';
  const borderSoft = currentTheme === 'Dark' ? 'border-zinc-800' : 'border-slate-200';

  // ===== state
  const [searchTerm, setSearchTerm] = useState('');
  const [membersList, setMembersList] = useState<MemberType[]>([]); // <- fix: harus array, bukan string
  const [member, setMember] = useState({ nama: '', alamat: '', telepon: '' });

  const [editData, setEditData] = useState<MemberType | null>(null);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModalTambahMember, setShowModalTambahMember] = useState(false);
  const [showModalEditMember, setShowModalEditMember] = useState(false);

  // ===== pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, pageSize]);

  // ===== fetch
  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/member/list');
      if (!res.ok) throw new Error('Gagal mengambil data member');
      const data = await res.json();
      setMembersList(Array.isArray(data) ? data : []);
    } catch (e: any) {
      Swal.fire('Gagal', e?.message || 'Gagal mengambil data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    fetch('/admin/voucher-diskon')
      .then(res => res.ok ? res.json() : [])
      .then(setVouchers)
      .catch(() => setVouchers([]));
  }, []);

  // ===== data view
  const filteredMember = useMemo(() => {
    const list = membersList || [];
    if (!searchTerm) return list;
    const q = searchTerm.toLowerCase();
    return list.filter(item => (item.nama || '').toLowerCase().includes(q));
  }, [membersList, searchTerm]); // <- fix deps

  // ===== derived pagination
  const totalItems = filteredMember.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentSafe = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (currentSafe - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const pagedMember = filteredMember.slice(startIndex, endIndex);

  const getPageNumbers = (current: number, total: number): (number | '...')[] => {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    if (current <= 4) return [1, 2, 3, 4, 5, '...', total];
    if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
    return [1, '...', current - 1, current, current + 1, '...', total];
  };
  const pageNumbers = getPageNumbers(currentSafe, totalPages);

  // ===== handlers
  const handleTambahMember = () => {
    router.post(route('member.store'), member, {
      onSuccess: () => {
        Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Member berhasil ditambahkan.' });
        setMember({ nama: '', alamat: '', telepon: '' });
        setShowModalTambahMember(false);
        fetchMembers();
      },
      onError: (errors: Record<string, string>) => {
        const allErrors = errors ? Object.values(errors).join('\n') : 'Terjadi kesalahan';
        Swal.fire({ icon: 'error', title: 'Gagal!', text: allErrors });
      },
    });
  };

  const handleDelete = (id: number) => {
    Swal.fire({
      title: 'Yakin ingin menghapus?',
      text: 'Data member akan dihapus secara permanen!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal',
    }).then((result) => {
      if (result.isConfirmed) {
        router.delete(route('member.destroy', id), {
          onSuccess: () => {
            Swal.fire('Terhapus!', 'Member berhasil dihapus.', 'success');
            fetchMembers();
          },
          onError: () => {
            Swal.fire('Gagal!', 'Gagal menghapus member.', 'error');
          },
        });
      }
    });
  };

  const openEditModal = (m: MemberType) => {
    setEditData({
      ...m,
      nama: m.nama ?? '',
      alamat: m.alamat ?? '',
      telepon: (m.telepon ?? '').toString() as any, // biar aman di input text
    });
    setShowModalEditMember(true);
  };

  const handleVoucherChange = async (memberId: number, diskonId: number | null) => {
    try {
      setLoading(true);
      const res = await fetch(`/admin/member/${memberId}/voucher`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': getCsrfToken(),
        },
        body: JSON.stringify({ diskon_id: diskonId }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson?.message || 'Gagal update voucher');
      }

      Swal.fire('Berhasil', 'Voucher diskon berhasil diupdate untuk member', 'success');
      fetchMembers();
    } catch (e: any) {
      Swal.fire('Gagal', e?.message || 'Terjadi kesalahan.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ===== render
  return (
    <div className={`p-6 max-w-full min-h-[75vh] mx-auto rounded-xl shadow ${appBg} ${text}`}>
      <div className="flex justify-between mb-4 items-center">
        <h2 className="text-xl font-semibold">Kelola Member</h2>
      </div>

      <div className={`flex justify-between items-center mb-6 rounded-xl p-6 shadow ${card}`}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); }}
          className={`w-1/2 shadow mx-4 rounded-xl p-3 border
            ${currentTheme === 'auto'
              ? 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
              : currentTheme === 'Dark'
                ? 'border-zinc-700 bg-zinc-800 text-zinc-100'
                : 'border-slate-300 bg-white text-zinc-900'}`}
          placeholder="Cari nama member..."
        />
        <button
          onClick={() => { setShowModalTambahMember(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          Tambah Member Baru
        </button>
      </div>

      <div className={`relative pb-20 rounded-xl shadow overflow-x-auto min-h-[40vh] ${card}`}>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className={`${currentTheme === 'auto' ? 'bg-slate-50 dark:bg-zinc-800' : currentTheme === 'Dark' ? 'bg-zinc-800' : 'bg-slate-50'}`}>
              <tr className={`border-b ${borderSoft}`}>
                <th className="py-3 px-6">ID</th>
                <th className="py-3 px-6">Nama</th>
                <th className="py-3 px-6">Alamat</th>
                <th className="py-3 px-6">Nomor&nbsp;Telepon</th>
                <th className="py-3 px-6">Voucher&nbsp;Diskon</th>
                <th className="py-3 px-6">Total&nbsp;Transaksi</th>
                <th className="py-3 px-6">Tanggal&nbsp;Daftar</th>
                <th className="py-3 pr-6 text-center">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan={8} className={`py-8 text-center ${subText}`}>Loading…</td>
                </tr>
              )}

              {!loading && filteredMember.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12">
                    <div className="text-center">
                      <svg className={`mx-auto h-12 w-12 ${subText}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium">Tidak ada Data</h3>
                      <p className={`mt-1 text-sm ${subText}`}>Tidak ada data yang sesuai dengan filter.</p>
                    </div>
                  </td>
                </tr>
              )}

              {!loading && pagedMember.map((m) => (
                <tr key={m.id} className={`border-b ${borderSoft} ${rowHover} transition`}>
                  <td className="py-3 px-6">{m.id}</td>
                  <td className="py-3 px-6">{m.nama}</td>
                  <td className="py-3 px-6">{m.alamat}</td>
                  <td className="py-3 px-6">{m.telepon}</td>
                  <td className="py-3 px-6">
                    <select
                      className={`border rounded p-2
                        ${currentTheme === 'auto'
                          ? 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800'
                          : currentTheme === 'Dark'
                            ? 'border-zinc-700 bg-zinc-800'
                            : 'border-slate-300 bg-white'}`}
                      value={m.diskon_id || ''}
                      onChange={(e) => handleVoucherChange(m.id, e.target.value ? Number(e.target.value) : null)}
                      disabled={loading}
                    >
                      <option value="">-- Tidak Ada Voucher --</option>
                      {vouchers.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.kode_voucher} - {v.jumlah_diskon}%
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 px-6 text-center">{m.total_transaksi}</td>
                  <td className="py-3 px-6">{m.tanggal_daftar}</td>
                  <td className="py-3 pr-6">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleDelete(m.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md"
                      >
                        Hapus
                      </button>
                      <button
                        onClick={() => openEditModal(m)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-md"
                      >
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* pagination */}
        {!loading && filteredMember.length > 0 && (
          <div className={`flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t ${borderSoft} absolute bottom-0 left-0 right-0 gap-3`}>
            <div className={`text-sm ${subText}`}>
              Menampilkan <span className="font-semibold">{startIndex + 1}</span>–
              <span className="font-semibold">{endIndex}</span> dari
              <span className="font-semibold"> {totalItems}</span> Member
            </div>

            <div className="flex items-center gap-2">
              <button
                className={`px-3 py-2 border rounded-lg text-sm cursor-pointer disabled:cursor-not-allowed disabled:opacity-50
                  ${currentTheme === 'Dark' ? 'border-zinc-700 hover:bg-zinc-800' : 'border-slate-300 hover:bg-slate-50'}`}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentSafe === 1}
                aria-label="Halaman sebelumnya"
              >
                Prev
              </button>

              {pageNumbers.map((p, idx) =>
                p === '...' ? (
                  <span key={`dots-${idx}`} className={`px-2 select-none ${subText}`}>…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p as number)}
                    aria-current={currentSafe === p ? 'page' : undefined}
                    className={`px-3 py-2 border rounded-lg text-sm transition-all cursor-pointer
                      ${currentSafe === p
                        ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-600/90'
                        : currentTheme === 'Dark'
                          ? 'border-zinc-700 hover:bg-blue-600 hover:text-white'
                          : 'border-slate-300 hover:bg-blue-600 hover:text-white'}`}
                  >
                    {p}
                  </button>
                )
              )}

              <button
                className={`px-3 py-2 border rounded-lg text-sm cursor-pointer disabled:cursor-not-allowed disabled:opacity-50
                  ${currentTheme === 'Dark' ? 'border-zinc-700 hover:bg-zinc-800' : 'border-slate-300 hover:bg-slate-50'}`}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentSafe === totalPages}
                aria-label="Halaman berikutnya"
              >
                Next
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-sm ${subText}`}>Per halaman:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className={`px-2 py-2 border rounded-lg text-sm
                  ${currentTheme === 'auto'
                    ? 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800'
                    : currentTheme === 'Dark'
                      ? 'border-zinc-700 bg-zinc-800'
                      : 'border-slate-300 bg-white'}`}
              >
                {[10, 25, 50, 100].map(sz => (
                  <option key={sz} value={sz}>{sz}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Modal Tambah */}
      {showModalTambahMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className={`${card} ${text} rounded-lg shadow-lg w-full max-w-md`}>
            <div className="flex items-center justify-between p-4 border-b rounded-t border-gray-200">
              <h3 className="text-lg font-semibold">Tambah Member</h3>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-700 rounded-lg text-sm h-8 w-8 flex justify-center items-center"
                onClick={() => setShowModalTambahMember(false)}
              >
                <svg className="w-3 h-3" aria-hidden="true" fill="none" viewBox="0 0 14 14">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                </svg>
                <span className="sr-only">Close modal</span>
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="flex flex-col">
                <label htmlFor="nama">Nama Member</label>
                <input
                  id="nama"
                  type="text"
                  value={member.nama}
                  onChange={(e) => setMember({ ...member, nama: e.target.value })}
                  className={`focus:outline-0 border border-gray-300 ${currentTheme === 'auto' ? 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : currentTheme === 'Dark' ? 'border-zinc-700 bg-zinc-800 text-zinc-100' : 'border-slate-300 bg-white text-zinc-900'} rounded-md p-2`}
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="alamat">Alamat Member</label>
                <textarea
                  id="alamat"
                  value={member.alamat}
                  onChange={(e) => setMember({ ...member, alamat: e.target.value })}
                  className={`focus:outline-0 border border-gray-300 ${currentTheme === 'auto' ? 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : currentTheme === 'Dark' ? 'border-zinc-700 bg-zinc-800 text-zinc-100' : 'border-slate-300 bg-white text-zinc-900'} rounded-md p-2`}
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="telepon">Nomor Telepon Member</label>
                <input
                  id="telepon"
                  type="text"
                  value={member.telepon}
                  onChange={(e) => setMember({ ...member, telepon: e.target.value })}
                  className={`focus:outline-0 border border-gray-300 ${currentTheme === 'auto' ? 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : currentTheme === 'Dark' ? 'border-zinc-700 bg-zinc-800 text-zinc-100' : 'border-slate-300 bg-white text-zinc-900'} rounded-md p-2`}
                />
              </div>
            </div>

            <div className="p-4">
              <button onClick={handleTambahMember} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md">
                Tambahkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit */}
      {showModalEditMember && editData && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            router.put(
              route('member.update', editData.id),
              { nama: editData.nama, telepon: String(editData.telepon), alamat: editData.alamat },
              {
                onSuccess: () => {
                  setShowModalEditMember(false);
                  setEditData(null);
                  Swal.fire('Berhasil', 'Member berhasil diperbarui', 'success');
                  fetchMembers();
                },
                onError: (errors) => {
                  const allErrors = errors ? Object.values(errors).flat().join('\n') : 'Terjadi kesalahan';
                  Swal.fire('Gagal', allErrors, 'error');
                },
              }
            );
          }}
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
        >
          <div className={`${card} ${text} rounded-lg shadow-lg w-full max-w-md`}>
            <div className="flex items-center justify-between p-4 border-b rounded-t border-gray-200">
              <h3 className="text-lg font-semibold">Edit Member</h3>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-700 rounded-lg text-sm h-8 w-8 flex justify-center items-center"
                onClick={() => {
                  setShowModalEditMember(false);
                  setEditData(null);
                }}
              >
                <svg className="w-3 h-3" aria-hidden="true" fill="none" viewBox="0 0 14 14">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                </svg>
                <span className="sr-only">Close modal</span>
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="flex flex-col">
                <label htmlFor="nama-edit">Nama Member</label>
                <input
                  id="nama-edit"
                  type="text"
                  value={editData.nama}
                  onChange={(e) => setEditData({ ...editData, nama: e.target.value })}
                  className={`focus:outline-0 border border-gray-300 ${currentTheme === 'auto' ? 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : currentTheme === 'Dark' ? 'border-zinc-700 bg-zinc-800 text-zinc-100' : 'border-slate-300 bg-white text-zinc-900'} rounded-md p-2`}
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="alamat-edit">Alamat Member</label>
                <textarea
                  id="alamat-edit"
                  value={editData.alamat || ''}
                  onChange={(e) => setEditData({ ...editData, alamat: e.target.value })}
                  className={`focus:outline-0 border border-gray-300 ${currentTheme === 'auto' ? 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : currentTheme === 'Dark' ? 'border-zinc-700 bg-zinc-800 text-zinc-100' : 'border-slate-300 bg-white text-zinc-900'} rounded-md p-2`}
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="telepon-edit">Nomor Telepon Member</label>
                <input
                  id="telepon-edit"
                  type="text"
                  value={(editData.telepon ?? '').toString()}
                  onChange={(e) => setEditData({ ...editData, telepon: e.target.value as any })}
                  className={`focus:outline-0 border border-gray-300 ${currentTheme === 'auto' ? 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : currentTheme === 'Dark' ? 'border-zinc-700 bg-zinc-800 text-zinc-100' : 'border-slate-300 bg-white text-zinc-900'} rounded-md p-2`}
                />
              </div>
            </div>

            <div className="p-4">
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md">
                Simpan Perubahan
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
