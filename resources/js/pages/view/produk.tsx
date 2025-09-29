import React, { useState, useEffect, useMemo } from "react";
import { Produk as ProdukType, Kategori as KategoriType } from "@/types/type";
import Swal from "sweetalert2";
import { router } from "@inertiajs/react";

interface ProdukProps {
  produks: ProdukType[];
  kategori: KategoriType[];
  currentTheme: "auto" | "Light" | "Dark";
}

export default function Produk({ produks, kategori, currentTheme }: ProdukProps) {
  const formatIDR = (n: number) => `Rp ${Number(n || 0).toLocaleString('id-ID')}`;
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState<ProdukType | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addData, setAddData] = useState({
    nama: "",
    harga: "",
    stok: "",
    gambar: null as File | null,
    id_kategori: kategori[0]?.id || 0,
  });

  // ====== ⬇️ STATE & LOGIC PAGINATION  ⬇️ ======
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);
  // Reset ke halaman 1 kalau filter/sort/pageSize berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, pageSize]);
  // ====== ⬆️ STATE & LOGIC PAGINATION  ⬆️ ======

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

  const openEditModal = (produk: ProdukType) => {
    setEditData({
      id: produk.id,
      nama: produk.nama ?? "",
      harga: Number(produk.harga) ?? 0,
      stok: Number(produk.stok) ?? 0,
      gambar: produk.gambar ?? "",
      id_kategori: produk.id_kategori,
      kategori: produk.kategori,
    });
    setShowEditModal(true);
  };

  const closeModal = () => {
    setShowEditModal(false);
    setEditData(null);
  };

  const handleDelete = (id: number) => {
    Swal.fire({
      title: "Yakin ingin menghapus?",
      text: "Data produk akan dihapus secara permanen!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        router.delete(route("produk.destroy", id), {
          onSuccess: () => {
            Swal.fire("Terhapus!", "Produk berhasil dihapus.", "success");
          },
          onError: () => {
            Swal.fire("Gagal!", "Gagal menghapus produk.", "error");
          },
        });
      }
    });
  };

  const filteredProduk = useMemo(()=>{
        let out = produks;
        if(searchTerm !== ""){
            const q = searchTerm.toLowerCase()
            out = out.filter(item=>
                item.nama.toLowerCase().includes(q)
                )
        }
        if(statusFilter !== ""){
            out = out.filter(item=>
                item.kategori?.nama_kategori.toLowerCase() === statusFilter.toLowerCase()
                )
        }
        return out;
    }, [produks, searchTerm, statusFilter])

  // ====== ⬇️ DERIVED PAGINATION  ⬇️ ======
  const totalItems = filteredProduk.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentSafe = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (currentSafe - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const pagedProduk = filteredProduk.slice(startIndex, endIndex);

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
    <div className={`p-6 max-w-full mx-auto ${appBg} ${text} rounded-xl shadow text-black`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Data produk</h2>
      </div>
      <div className={`flex justify-between items-center mb-6 ${card} shadow rounded-xl p-6`}>
        <div className="flex w-5/6 gap-8">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); }}
            className={`w-1/2 shadow mx-4 rounded-xl p-3 border ${inputTheme}`}
            placeholder="Cari nama produk..."
          />  
          <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`px-4 py-2 ${inputTheme} border shadow rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
            >
              <option value="">Semua kategori produk</option>
              {kategori.map((item, i)=>
                (
                  <option value={`${item.nama_kategori}`}>{item.nama_kategori}</option>
                  ))}
          </select>
        </div>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
          onClick={() => setShowAddModal(true)}
        >
          Tambah produk
        </button>
      </div>
      <div className={`overflow-x-auto min-h-[40vh] relative pb-20 ${card} rounded-xl shadow`}>
        <table className="min-w-full text-sm text-left">
          <thead className={`${currentTheme === 'auto'? 'bg-slate-50 dark:bg-zinc-800' : currentTheme === 'Dark' ? 'bg-zinc-800' : 'bg-slate-50'}`}>
            <tr className="border-b border-gray-200">
              <th className="py-3 px-6">Nama</th>
              <th className="py-3 px-6">Harga</th>
              <th className="py-3 px-6">Stok</th>
              <th className="py-3 px-6">Kategori</th>
              <th className="py-3 px-6">Gambar</th>
              <th className="py-3 px-6 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredProduk.length > 0 && pagedProduk.map((item) => (
              <tr
                key={item.id}
                className={`${borderSoft} ${rowHover} transition`}
              >
                <td className="py-3 px-6">{item.nama}</td>
                <td className="py-3 px-6">{formatIDR(item.harga)}</td>
                <td className="py-3 px-6">{item.stok}</td>
                <td className="py-3 px-6">{item.kategori?.nama_kategori || "-"}</td>
                <td className="py-3 px-6">
                  <img
                    src={`/logo/${item.gambar || 'default.png'}`}
                    alt={item.nama}
                    className="w-16 h-16 object-cover"
                  />
                </td>
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
          {filteredProduk.length === 0 && (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-slate-900">Tidak ada data</h3>
                <p className="mt-1 text-sm text-slate-500">Tidak ada data yang sesuai dengan filter yang dipilih.</p>
              </div>
            )}
           {filteredProduk.length > 0 && (
              <div className={`flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t ${borderSoft} absolute bottom-0 left-0 right-0 gap-3`}>
                <div className={`text-sm ${subText}`}>
                  Menampilkan <span className="font-semibold">{startIndex + 1}</span>–
                  <span className="font-semibold">{endIndex}</span> dari
                  <span className="font-semibold"> {totalItems}</span> Produk
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
        {/* Edit Modal */}
        {showEditModal && editData && (
          <div className={`fixed inset-0 bg-opacity-50 flex items-center justify-center z-50v backdrop-blur-sm`}>
            <div className={`${card} ${text} p-6 rounded-lg w-full max-w-md`}>
              <h2 className="text-xl font-semibold mb-4">Edit Produk</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData();
                  formData.append("nama", editData.nama);
                  formData.append("harga", editData.harga.toString());
                  formData.append("stok", editData.stok.toString());
                  formData.append("id_kategori", editData.id_kategori.toString());

                  if (editData.gambar && editData.gambar instanceof File) {
                    formData.append("gambar", editData.gambar);
                  }

                  formData.append("_method", "PUT");

                  router.post(`/produk/${editData.id}`, formData, {
                    forceFormData: true,
                    onSuccess: () => {
                      closeModal();
                      Swal.fire("Berhasil", "Produk berhasil diupdate", "success");
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
                  value={editData?.nama ?? ""}
                  onChange={(e) => setEditData({ ...editData, nama: e.target.value })}
                  className={`w-full p-2 mb-2 ${inputTheme} rounded`}
                  placeholder="Nama produk"
                  required
                />
                <h1>Harga</h1>
                <input
                  type="number"
                  value={editData?.harga ?? 0}
                  onChange={(e) =>
                    setEditData({ ...editData, harga: Number(e.target.value) })
                  }
                  className={`w-full p-2 mb-2 ${inputTheme} rounded`}
                  placeholder="Harga"
                  required
                />
                <h1>Stok</h1>
                <input
                  type="number"
                  value={editData?.stok ?? 0}
                  onChange={(e) =>
                    setEditData({ ...editData, stok: Number(e.target.value) })
                  }
                  className={`w-full p-2 mb-2 ${inputTheme} rounded`}
                  placeholder="Stok"
                  required
                />
                <h1>Kategori</h1>
                <select
                  value={editData.id_kategori}
                  onChange={(e) =>
                    setEditData({ ...editData!, id_kategori: Number(e.target.value) })
                  }
                  className={`w-full p-2 mb-2 ${inputTheme} rounded`}
                  required
                >
                  {kategori.map((kat) => (
                    <option key={kat.id} value={kat.id}>
                      {kat.nama_kategori}
                    </option>
                  ))}
                </select>
                <h1>Gambar</h1>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setEditData({ ...editData!, gambar: file });
                    } else if (typeof editData.gambar === "string") {
                      setEditData({ ...editData!, gambar: editData.gambar });
                    } else {
                      setEditData({ ...editData!, gambar: null });
                    }
                  }}
                  className="w-full border p-2 mb-4 border-gray-400 rounded"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 bg-gray-500 text-white rounded"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                  >
                    Simpan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50v backdrop-blur-sm">
            <div className={`${card} ${text} p-6 rounded-lg w-full max-w-md`}>
              <h2 className="text-xl font-semibold mb-4">Tambah Produk</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData();
                  formData.append("nama", addData.nama);
                  formData.append("harga", addData.harga);
                  formData.append("stok", addData.stok);
                  formData.append("id_kategori", addData.id_kategori.toString());
                  if (addData.gambar) formData.append("gambar", addData.gambar);

                  router.post("/produk", formData, {
                    forceFormData: true,
                    onSuccess: () => {
                      setShowAddModal(false);
                      setAddData({
                        nama: "",
                        harga: "",
                        stok: "",
                        gambar: null,
                        id_kategori: kategori[0]?.id || 0,
                      });
                      Swal.fire("Berhasil", "Produk berhasil ditambahkan", "success");
                    },
                    onError: () => {
                      Swal.fire("Gagal", "Terjadi kesalahan", "error");
                    },
                  });
                }}
              >
                <h1>Nama</h1>
                <input
                  type="text"
                  value={addData.nama}
                  onChange={(e) => setAddData({ ...addData, nama: e.target.value })}
                  className={`w-full p-2 mb-2 ${inputTheme} rounded`}
                  placeholder="Nama produk"
                  required
                />
                <h1>Harga</h1>
                <input
                  type="number"
                  value={addData.harga}
                  onChange={(e) => setAddData({ ...addData, harga: e.target.value })}
                  className={`w-full p-2 mb-2 ${inputTheme} rounded`}
                  placeholder="Harga"
                  required
                />
                <h1>Stok</h1>
                <input
                  type="number"
                  value={addData.stok}
                  onChange={(e) => setAddData({ ...addData, stok: e.target.value })}
                  className={`w-full p-2 mb-2 ${inputTheme} rounded`}
                  placeholder="Stok"
                  required
                />
                <h1>Kategori</h1>
                <select
                  value={addData.id_kategori}
                  onChange={(e) =>
                    setAddData({ ...addData, id_kategori: Number(e.target.value) })
                  }
                  className={`w-full p-2 mb-2 ${inputTheme} rounded`}
                  required
                >
                  {kategori.map((kat) => (
                    <option key={kat.id} value={kat.id}>
                      {kat.nama_kategori}
                    </option>
                  ))}
                </select>
                <h1>Gambar</h1>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setAddData({ ...addData, gambar: e.target.files?.[0] || null })
                  }
                  className="w-full border p-2 mb-4 border-gray-400 rounded"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                  >
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
