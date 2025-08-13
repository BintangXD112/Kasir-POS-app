import React, { useState } from "react";
import { Kategori as KategoriType } from "@/types/type";
import Swal from 'sweetalert2';
import { router } from '@inertiajs/react';

export default function Kategori({ kategori }: { kategori: KategoriType[] }) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState<KategoriType | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addData, setAddData] = useState({ nama_kategori: '' });


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

  return (
    <div className="p-6 max-w-full mx-auto bg-gray-100 rounded-xl shadow text-black">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Data kategori produk</h2>
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
            {kategori.map((item) => (
              <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                <td className="py-3 px-6">{item.nama_kategori}</td>
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
