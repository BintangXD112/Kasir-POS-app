import React, { useState, useEffect, useMemo } from "react";
import { Kategori as KategoriType } from "@/types/type";
import Swal from 'sweetalert2';
import { router } from '@inertiajs/react';

export default function Kategori({ kategori, currentTheme }: { kategori: KategoriType[] }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState<KategoriType | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addData, setAddData] = useState({ nama_kategori: '' });

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
  const inputTheme = currentTheme === 'auto' ? 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : currentTheme === 'Dark' ? 'border-zinc-700 bg-zinc-800 text-zinc-100' : 'border-slate-300 bg-white text-zinc-900';

  // ====== ⬇️ STATE & LOGIC PAGINATION  ⬇️ ======
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);
  // Reset ke halaman 1 kalau filter/sort/pageSize berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, pageSize]);
  // ====== ⬆️ STATE & LOGIC PAGINATION  ⬆️ ======


  const openEditModal = (kategori: KategoriType) => {
    setEditData({
      id: kategori.id,
      nama_kategori: kategori.nama_kategori ?? '',
      created_at: kategori.created_at ?? null,
      updated_at: kategori.updated_at ?? null,
    });
    setShowEditModal(true);
  };

  const closeModal = () => {
    setShowEditModal(false);
    setEditData(null);
  };

  const filteredKategori = useMemo(()=>{
    if(!searchTerm) return kategori;
    return kategori.filter(item=>
      item.nama_kategori.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const handleDelete = (id: number) => {
    Swal.fire({
      title: 'Yakin ingin menghapus?',
      text: 'Data kategori akan dihapus secara permanen!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal',
    }).then((result) => {
      if (result.isConfirmed) {
        router.delete(route('kategori.destroy', id), {
          onSuccess: () => {
            Swal.fire('Terhapus!', 'kategori berhasil dihapus.', 'success');
          },
          onError: () => {
            Swal.fire('Gagal!', 'Gagal menghapus kategori.', 'error');
          },
        });
      }
    });
  };

  // ====== ⬇️ DERIVED PAGINATION  ⬇️ ======
  const totalItems = filteredKategori.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentSafe = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (currentSafe - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const pagedKategori = filteredKategori.slice(startIndex, endIndex);

  // Buat list nomor halaman (dengan "..." bila banyak)
  const getPageNumbers = (current: number, total: number): (number | '...')[] => {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    if (current <= 4) return [1, 2, 3, 4, 5, '...', total];
    if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];

    return [1, '...', current - 1, current, current + 1, '...', total];
  };
  const pageNumbers = getPageNumbers(currentSafe, totalPages);
  // ====== ⬆️ DERIVED PAGINATION  ⬆️ ======

  return (
    <div className={`p-6 max-w-full mx-auto min-h-[75vh] ${appBg} ${text} rounded-xl shadow text-black`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Data kategori produk</h2>
      </div>
      <div className={`flex justify-between items-center mb-6 ${card} shadow rounded-xl p-6`}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); }}
          className={`w-1/2 shadow mx-4 rounded-xl p-3 border ${inputTheme}`}
          placeholder="Cari kategori..."
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
          onClick={() => setShowAddModal(true)}
        >
          Tambah kategori produk
        </button>
      </div>
      <div className={`overflow-x-auto min-h-[40vh] ${card} relative pb-20 rounded-xl shadow`}>
        <table className="min-w-full text-sm text-left">
          <thead className={`${currentTheme === 'auto'? 'bg-slate-50 dark:bg-zinc-800' : currentTheme === 'Dark' ? 'bg-zinc-800' : 'bg-slate-50'}`}>
            <tr className="border-b border-gray-200">
              <th className="py-3 px-6">Nama Kategori</th>
              <th className="py-3 px-6 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredKategori.length > 0 && pagedKategori.map((item) => (
              <tr key={item.id} className={`border-b transition ${borderSoft} ${rowHover}`}>
                <td className="py-3 px-6">{item.nama_kategori}</td>
                <td className="py-3 px-6 flex justify-center">
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="bg-red-500 text-white w-16 mr-4 py-2 rounded-md cursor-pointer"
                  >
                    Hapus
                  </button>
                  <button
                    onClick={() => openEditModal(item)}
                    className="bg-yellow-500 text-white w-16 py-2 rounded-md cursor-pointer"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredKategori.length === 0 && (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-slate-900">Tidak ada Data</h3>
                <p className="mt-1 text-sm text-slate-500">Tidak ada Data yang sesuai dengan filter yang dipilih.</p>
              </div>
            )}
        {/* pagination */}
        {filteredKategori.length > 0 && (
          <div className={`flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t ${borderSoft} absolute bottom-0 left-0 right-0 gap-3`}>
            <div className={`text-sm ${subText}`}>
              Menampilkan <span className="font-semibold">{startIndex + 1}</span>–
              <span className="font-semibold">{endIndex}</span> dari
              <span className="font-semibold"> {totalItems}</span> Kategori
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
            {/* ====== ⬆️ KONTROL PAGINATION ⬆️ ====== */}
        {/* Modal */}
        {showEditModal && editData && (
          <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50v backdrop-blur-sm">
            <div className={`${card} ${text} p-6 rounded-lg w-full max-w-md`}>
              <h2 className="text-xl font-semibold mb-4">Edit kategori</h2>
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  console.log('editData', editData);
                  const formData = new FormData();
                  formData.append("nama_kategori", editData.nama_kategori);
                  formData.append('_method', 'PUT');

                  router.post(`/kategori/${editData.id}`, formData, {
                    forceFormData: true,
                    onSuccess: () => {
                      closeModal();
                      Swal.fire("Berhasil", "kategori berhasil diupdate", "success");
                    },
                    onError: (errors) => {
                      Swal.fire("Gagal", errors.error || "Terjadi kesalahan", "error");
                    },
                  });
                }}
              >
                <h1>Nama</h1>
                <input
                  type="text"
                  value={editData?.nama_kategori ?? ""}
                  onChange={(e) => setEditData({ ...editData, nama_kategori: e.target.value })}
                  className="w-full border p-2 mb-2 border border-gray-400 rounded"
                  placeholder="Nama kategori"
                />
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-500 text-white rounded">
                    Batal
                  </button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
                    Simpan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      {/* Modal Tambah kategori */}
      {showAddModal && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50v backdrop-blur-sm">
          <div className={`${card} ${text} p-6 rounded-lg w-full max-w-md`}>
            <h2 className="text-xl font-semibold mb-4">Tambah kategori</h2>
            <form
              onSubmit={e => {
                e.preventDefault();
                const formData = new FormData();
                formData.append('nama_kategori', addData.nama_kategori);
                router.post('/kategori', formData, {
                  forceFormData: true,
                  onSuccess: () => {
                    setShowAddModal(false);
                    setAddData({ nama_kategori: '' });
                    Swal.fire('Berhasil', 'kategori berhasil ditambahkan', 'success');
                  },
                  onError: () => {
                    Swal.fire('Gagal', 'Terjadi kesalahan', 'error');
                  },
                });
              }}
            >
              <h1>Nama</h1>
              <input
                type="text"
                value={addData.nama_kategori}
                onChange={e => setAddData({ ...addData, nama_kategori: e.target.value })}
                className="w-full border p-2 mb-2 border border-gray-400 rounded"
                placeholder="Nama kategori"
                required
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 bg-gray-500 text-white rounded">
                  Batal
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
                  Tambah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
