import React, { useState } from "react";
import { Produk as ProdukType } from "@/types/type";
import Swal from 'sweetalert2';
import { router } from '@inertiajs/react';

export default function Produk({ produks }: { produks: ProdukType[] }) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState<ProdukType | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addData, setAddData] = useState({ nama: '', harga: '', stok: '', gambar: null as File | null });


  const openEditModal = (produk: ProdukType) => {
    setEditData({
      id: produk.id,
      nama: produk.nama ?? '',
      harga: Number(produk.harga) ?? 0,
      stok: Number(produk.stok) ?? 0,
      gambar: produk.gambar ?? '',
      created_at: produk.created_at ?? null,
      updated_at: produk.updated_at ?? null,
    });
    setShowEditModal(true);
  };

  const closeModal = () => {
    setShowEditModal(false);
    setEditData(null);
  };

  const handleDelete = (id: number) => {
    Swal.fire({
      title: 'Yakin ingin menghapus?',
      text: 'Data produk akan dihapus secara permanen!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal',
    }).then((result) => {
      if (result.isConfirmed) {
        router.delete(route('produk.destroy', id), {
          onSuccess: () => {
            Swal.fire('Terhapus!', 'Produk berhasil dihapus.', 'success');
          },
          onError: () => {
            Swal.fire('Gagal!', 'Gagal menghapus produk.', 'error');
          },
        });
      }
    });
  };

  return (
    <div className="p-6 max-w-full mx-auto bg-gray-100 rounded-xl shadow text-black">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Data produk</h2>
        <button className="bg-blue-500 text-white px-4 py-2 rounded-md" onClick={() => setShowAddModal(true)}>Tambah produk</button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 uppercase">
            <tr className="border-b border-gray-200">
              <th className="py-3 px-6">Nama</th>
              <th className="py-3 px-6">Harga</th>
              <th className="py-3 px-6">Stok</th>
              <th className="py-3 px-6">Gambar</th>
              <th className="py-3 px-6 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {produks.map((item) => (
              <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                <td className="py-3 px-6">{item.nama}</td>
                <td className="py-3 px-6">{item.harga}</td>
                <td className="py-3 px-6">{item.stok}</td>
                <td className="py-3 px-6">
                  <img src={`/logo/${item.gambar}`} alt={item.nama} className="w-16 h-16 object-cover" />
                </td>
                <td className="py-3 px-6 flex justify-center">
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="bg-red-500 text-white w-16 mr-4 py-2 rounded-md"
                  >
                    Hapus
                  </button>
                  <button
                    onClick={() => openEditModal(item)}
                    className="bg-yellow-500 text-white w-16 py-2 rounded-md"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Modal */}
        {showEditModal && editData && (
          <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50v backdrop-blur-sm">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Edit Produk</h2>
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  console.log('editData', editData);
                  const formData = new FormData();
                  formData.append("nama", editData.nama);
                  formData.append("harga", editData.harga.toString());
                  formData.append("stok", editData.stok.toString());
                  if (editData.gambar && editData.gambar instanceof File) {
                    formData.append("gambar", editData.gambar);
                  }
                  formData.append('_method', 'PUT');

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
                  className="w-full border p-2 mb-2 border border-gray-400 rounded"
                  placeholder="Nama produk"
                />
                <h1>Harga</h1>
                <input
                  type="number"
                  value={editData?.harga ?? 0}
                  onChange={(e) => setEditData({ ...editData, harga: Number(e.target.value) })}
                  className="w-full border p-2 mb-2 border border-gray-400 rounded"
                  placeholder="Harga"
                />
                <h1>Stok</h1>
                <input
                  type="number"
                  value={editData?.stok ?? 0}
                  onChange={(e) => setEditData({ ...editData, stok: Number(e.target.value) })}
                  className="w-full border p-2 mb-2 border border-gray-400 rounded"
                  placeholder="Stok"
                />
                <h1>Gambar</h1>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setEditData({ ...editData, gambar: e.target.files?.[0] || editData.gambar })
                  }
                  className="w-full border p-2 mb-4 border border-gray-400 rounded"
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
      {/* Modal Tambah Produk */}
      {showAddModal && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50v backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Tambah Produk</h2>
            <form
              onSubmit={e => {
                e.preventDefault();
                const formData = new FormData();
                formData.append('nama', addData.nama);
                formData.append('harga', addData.harga);
                formData.append('stok', addData.stok);
                if (addData.gambar) formData.append('gambar', addData.gambar);
                router.post('/produk', formData, {
                  forceFormData: true,
                  onSuccess: () => {
                    setShowAddModal(false);
                    setAddData({ nama: '', harga: '', stok: '', gambar: null });
                    Swal.fire('Berhasil', 'Produk berhasil ditambahkan', 'success');
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
                value={addData.nama}
                onChange={e => setAddData({ ...addData, nama: e.target.value })}
                className="w-full border p-2 mb-2 border border-gray-400 rounded"
                placeholder="Nama produk"
                required
              />
              <h1>Harga</h1>
              <input
                type="number"
                value={addData.harga}
                onChange={e => setAddData({ ...addData, harga: e.target.value })}
                className="w-full border p-2 mb-2 border border-gray-400 rounded"
                placeholder="Harga"
                required
              />
              <h1>Stok</h1>
              <input
                type="number"
                value={addData.stok}
                onChange={e => setAddData({ ...addData, stok: e.target.value })}
                className="w-full border p-2 mb-2 border border-gray-400 rounded"
                placeholder="Stok"
                required
              />
              <h1>Gambar</h1>
              <input
                type="file"
                accept="image/*"
                onChange={e => setAddData({ ...addData, gambar: e.target.files?.[0] || null })}
                className="w-full border p-2 mb-4 border border-gray-400 rounded"
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
