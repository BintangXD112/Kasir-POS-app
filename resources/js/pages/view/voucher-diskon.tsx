import React, { useEffect, useState } from "react";
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

export default function VoucherDiskon() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState<Partial<Voucher> | null>(null);
  const [loading, setLoading] = useState(false);

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
  return (
    <div className="p-6 max-w-full mx-auto bg-gray-100 rounded-xl shadow text-black">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Voucher Diskon</h2>
        <button onClick={() => openModal()} className="bg-blue-500 text-white px-4 py-2 rounded-md">Tambah Voucher</button>
      </div>
      <div className="overflow-x-auto">
        {loading ? <div className="text-center py-8">Loading...</div> : (
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 uppercase">
            <tr className="border-b border-gray-200">
              <th className="py-3 px-6">ID</th>
              <th className="py-3 px-6">Kode Voucher</th>
              <th className="py-3 px-6">Deskripsi</th>
              <th className="py-3 px-6">Jumlah Diskon (%)</th>
              <th className="py-3 px-6 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {vouchers.map((item) => (
              <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                <td className="py-3 px-6">{item.id}</td>
                <td className="py-3 px-6">{item.kode_voucher}</td>
                <td className="py-3 px-6">{item.deskripsi}</td>
                <td className="py-3 px-6">{item.jumlah_diskon}</td>
                <td className="py-3 px-6 flex justify-center">
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="bg-red-500 text-white w-16 mr-4 py-2 rounded-md"
                  >
                    Hapus
                  </button>
                  <button
                    onClick={() => openModal(item)}
                    className="bg-yellow-500 text-white w-16 py-2 rounded-md"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
        {/* Modal */}
        {showModal && editData && (
          <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50v backdrop-blur-sm">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">{editData.id ? 'Edit Voucher Diskon' : 'Tambah Voucher Diskon'}</h2>
              <form onSubmit={handleSubmit}>
                <h1>Kode Voucher</h1>
                <input
                  type="text"
                  value={editData.kode_voucher || ''}
                  onChange={(e) => setEditData({ ...editData, kode_voucher: e.target.value })}
                  className="w-full border p-2 mb-2 border border-gray-400 rounded"
                  placeholder="Masukkan kode voucher"
                  required
                />
                <h1>Deskripsi</h1>
                <input
                  type="text"
                  value={editData.deskripsi || ''}
                  onChange={(e) => setEditData({ ...editData, deskripsi: e.target.value })}
                  className="w-full border p-2 mb-2 border border-gray-400 rounded"
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
                  className="w-full border p-2 mb-2 border border-gray-400 rounded"
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