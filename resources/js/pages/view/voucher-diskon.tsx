import React, { useEffect, useState, useMemo } from "react";
import Swal from 'sweetalert2';

interface Voucher {
  id: number;
  kode_voucher: string;
  deskripsi: string;
  jumlah_diskon: number;
}

function getCsrfToken() {
  return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
}

interface VoucherDiskonProps {
  currentTheme: "auto" | "Light" | "Dark";
}

export default function VoucherDiskon({currentTheme} : VoucherDiskonProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState<Partial<Voucher> | null>(null);
  const [loading, setLoading] = useState(false);

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


  const filteredDiskon = useMemo(()=>{
    if(!searchTerm) return vouchers;
    return vouchers.filter(item=>
      item.kode_voucher.toLowerCase().includes(searchTerm.toLowerCase())
      )
  })

  const fetchVouchers = async () => {
    setLoading(true);
    const res = await fetch('/admin/voucher-diskon');
    const data = await res.json();
    setVouchers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const openModal = (voucher?: Voucher) => {
    setEditData(voucher ? { ...voucher } : { kode_voucher: '', deskripsi: '', jumlah_diskon: 0 });
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setEditData(null);
  };
  const handleDelete = async (id: number) => {
    Swal.fire({
      title: 'Yakin ingin menghapus?',
      text: 'Voucher diskon akan dihapus!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal',
    }).then(async (result) => {
      if (result.isConfirmed) {
        await fetch(`/admin/voucher-diskon/${id}`, {
          method: 'DELETE',
          headers: { 'X-CSRF-TOKEN': getCsrfToken() },
        });
        fetchVouchers();
        Swal.fire('Terhapus!', 'Voucher diskon berhasil dihapus.', 'success');
      }
    });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editData) {
      if (editData.id) {
        // Update
        const res = await fetch(`/admin/voucher-diskon/${editData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': getCsrfToken() },
          body: JSON.stringify(editData),
        });
        if (res.ok) {
          fetchVouchers();
          Swal.fire('Berhasil', 'Voucher diskon berhasil diupdate', 'success');
        } else {
          Swal.fire('Gagal', 'Kode voucher sudah digunakan atau data tidak valid', 'error');
        }
      } else {
        // Tambah
        const res = await fetch('/admin/voucher-diskon', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': getCsrfToken() },
          body: JSON.stringify(editData),
        });
        if (res.ok) {
          fetchVouchers();
          Swal.fire('Berhasil', 'Voucher diskon berhasil ditambahkan', 'success');
        } else {
          Swal.fire('Gagal', 'Kode voucher sudah digunakan atau data tidak valid', 'error');
        }
      }
      closeModal();
    }
  };

   // ====== ⬇️ DERIVED PAGINATION  ⬇️ ======
  const totalItems = filteredDiskon.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentSafe = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (currentSafe - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const pagedDiskon = filteredDiskon.slice(startIndex, endIndex);

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
    <div className={`p-6 max-w-full min-h-[75vh] mx-auto ${appBg} ${text} rounded-xl shadow text-black`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Voucher Diskon</h2>
      </div>
      <div className={`flex justify-between items-center mb-6 ${card} shadow rounded-xl p-6`}>
        <input type="text" value={searchTerm} onChange={(e)=>{setSearchTerm(e.target.value)}} className={`w-1/2 mx-4 shadow border ${inputTheme} rounded-xl p-4`} placeholder="Cari kode voucher" />
        <button onClick={() => openModal()} className="bg-blue-500 text-white px-4 py-2 rounded-md">Tambah Voucher</button>
      </div>
      <div className={`overflow-x-auto pb-20 min-h-[40vh] relative ${card} rounded-xl shadow`}>
        {loading ? <div className="text-center py-8">Loading...</div> : (
        <table className="min-w-full text-sm text-left">
          <thead className={`${currentTheme === 'auto'? 'bg-slate-50 dark:bg-zinc-800' : currentTheme === 'Dark' ? 'bg-zinc-800' : 'bg-slate-50'}`}>
            <tr className="border-b border-gray-200">
              <th className="py-3 px-6">ID</th>
              <th className="py-3 px-6">Kode Voucher</th>
              <th className="py-3 px-6">Deskripsi</th>
              <th className="py-3 px-6">Jumlah Diskon (%)</th>
              <th className="py-3 px-6 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredDiskon.length > 0 && pagedDiskon.map((item) => (
              <tr key={item.id} className={`${borderSoft} ${rowHover} transition`}>
                <td className="py-3 px-6">{item.id}</td>
                <td className="py-3 px-6">{item.kode_voucher}</td>
                <td className="py-3 px-6">{item.deskripsi}</td>
                <td className="py-3 px-6">{item.jumlah_diskon}</td>
                <td className="py-3 px-6 flex justify-center">
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="bg-red-500 text-white w-16 mr-4 py-2 rounded-md cursor-pointer"
                  >
                    Hapus
                  </button>
                  <button
                    onClick={() => openModal(item)}
                    className="bg-yellow-500 text-white w-16 py-2 rounded-md cursor-pointer"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
        {filteredDiskon.length === 0 && (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-slate-900">Tidak ada Data</h3>
                <p className="mt-1 text-sm text-slate-500">Tidak ada Data yang sesuai dengan filter yang dipilih.</p>
              </div>
            )}
        {/* ====== ⬇️ KONTROL PAGINATION  ⬇️ ====== */}
            {filteredDiskon.length > 0 && (
              <div className={`flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t ${borderSoft} absolute bottom-0 left-0 right-0 gap-3`}>
                <div className={`text-sm ${subText}`}>
                  Menampilkan <span className="font-semibold">{startIndex + 1}</span>–
                  <span className="font-semibold">{endIndex}</span> dari
                  <span className="font-semibold"> {totalItems}</span> Voucher Diskon
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
        {showModal && editData && (
          <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50v backdrop-blur-sm">
            <div className={`${card} ${text} p-6 rounded-lg w-full max-w-md`}>
              <h2 className="text-xl font-semibold mb-4">{editData.id ? 'Edit Voucher Diskon' : 'Tambah Voucher Diskon'}</h2>
              <form onSubmit={handleSubmit}>
                <h1>Kode Voucher</h1>
                <input
                  type="text"
                  value={editData.kode_voucher || ''}
                  onChange={(e) => setEditData({ ...editData, kode_voucher: e.target.value })}
                  className={`w-full p-2 mb-2 border shadow ${inputTheme} rounded-sm`}
                  placeholder="Masukkan kode voucher"
                  required
                />
                <h1>Deskripsi</h1>
                <input
                  type="text"
                  value={editData.deskripsi || ''}
                  onChange={(e) => setEditData({ ...editData, deskripsi: e.target.value })}
                  className={`w-full p-2 mb-2 border shadow ${inputTheme} rounded-sm`}
                  placeholder="Deskripsi voucher (opsional)"
                />
                <h1>Jumlah Diskon (%)</h1>
                <input
                  type="text"
                  value={editData.jumlah_diskon?.toString().replace('.', ',') || ''}
                  onChange={(e) => {
                    let val = e.target.value.replace(',', '.');
                    // Hanya angka dan satu titik
                    val = val.replace(/[^\d.]/g, '');
                    // Validasi hanya satu titik
                    const parts = val.split('.');
                    if (parts.length > 2) val = parts[0] + '.' + parts.slice(1).join('');
                    let num = parseFloat(val);
                    if (isNaN(num)) num = 0;
                    if (num > 100) num = 100;
                    setEditData({ ...editData, jumlah_diskon: num });
                  }}
                  className={`w-full p-2 mb-2 border shadow ${inputTheme} rounded-sm`}
                  placeholder="Masukkan jumlah diskon (misal: 25 untuk 25%)"
                  min={0}
                  max={100}
                  required
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
      </div>
    </div>
  );
} 