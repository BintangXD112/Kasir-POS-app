import React, { useState, useEffect, useMemo } from "react";
import { Kategori as KategoriType } from "@/types/type";
import Swal from 'sweetalert2';
import { router } from '@inertiajs/react';

export default function Kategori({ kategori }: { kategori: KategoriType[] }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState<KategoriType | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addData, setAddData] = useState({ nama_kategori: '' });

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
    <div className="px-6 pt-6 pb-20 relative max-w-full mx-auto bg-gray-100 rounded-xl shadow text-black">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Data kategori produk</h2>
        <input type="text" value={searchTerm} onChange={(e)=>{setSearchTerm(e.target.value)}} className={`w-1/2 mx-4 border border-slate-300 bg-white rounded-xl p-4`} placeholder="Cari nama kategori" />
        <button className="bg-blue-500 text-white px-4 py-2 rounded-md" onClick={() => setShowAddModal(true)}>Tambah kategori</button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 uppercase">
            <tr className="border-b border-gray-200">
              <th className="py-3 px-6">Nama Kategori</th>
              <th className="py-3 px-6 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredKategori.length > 0 && pagedKategori.map((item) => (
              <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
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
        {/* ====== ⬇️ KONTROL PAGINATION  ⬇️ ====== */}
            {filteredKategori.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t absolute bottom-0 left-0 right-0 border-slate-200 gap-3">
                <div className="text-sm text-slate-600">
                  Menampilkan <span className="font-semibold">{startIndex + 1}</span>–
                  <span className="font-semibold">{endIndex}</span> dari
                  <span className="font-semibold"> {totalItems}</span> kategori
                </div>

                <div className="flex items-center gap-2">
                  <button
                    className="px-3 py-2 border rounded-lg cursor-pointer disabled:cursor-not-allowed text-sm hover:bg-slate-50 disabled:opacity-50"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentSafe === 1}
                    aria-label="Halaman sebelumnya"
                  >
                    Prev
                  </button>

                  {pageNumbers.map((p, idx) =>
                    p === '...' ? (
                      <span key={`dots-${idx}`} className="px-2 text-slate-500 select-none">…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setCurrentPage(p as number)}
                        aria-current={currentSafe === p ? 'page' : undefined}
                        className={`px-3 py-2 border rounded-lg text-sm hover:scale-105 transition-all cursor-pointer ${
                          currentSafe === p ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-600/50' : 'hover:text-white hover:bg-blue-600'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}

                  <button
                    className="px-3 py-2 border rounded-lg text-sm hover:bg-slate-50 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentSafe === totalPages}
                    aria-label="Halaman berikutnya"
                  >
                    Next
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">Per halaman:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    className="px-2 py-2 border rounded-lg text-sm"
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
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
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
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
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
