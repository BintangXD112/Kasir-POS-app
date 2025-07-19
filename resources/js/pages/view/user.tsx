import { useState } from 'react';
import { router } from '@inertiajs/react';
import Swal from 'sweetalert2';

export default function User({ users }) {
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({
        nama_user: '',
        tipe_user: 'kasir',
        kode_user: '',
        status: 'active',
    });
    const [editId, setEditId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [showEditModal, setShowEditModal] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };
    const handleEditChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        router.post('/admin/users', form, {
            onSuccess: () => {
                setShowModal(false);
                setForm({ nama_user: '', tipe_user: 'kasir', kode_user: '', status: 'active' });
                Swal.fire({ icon: 'success', title: 'Berhasil', text: 'User berhasil ditambahkan', timer: 1500, showConfirmButton: false });
            },
            onError: () => {
                Swal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal menambah user', timer: 1500, showConfirmButton: false });
            }
        });
    };
    const handleEdit = (user) => {
        setEditId(user.id);
        setEditForm({
            nama_user: user.nama_user,
            tipe_user: user.tipe_user,
            kode_user: user.kode_user,
            status: user.status,
        });
        setShowEditModal(true);
    };
    const handleEditSubmit = (e) => {
        e.preventDefault();
        router.put(`/admin/users/${editId}`, editForm, {
            onSuccess: () => {
                setEditId(null);
                setShowEditModal(false);
                Swal.fire({ icon: 'success', title: 'Berhasil', text: 'User berhasil diupdate', timer: 1500, showConfirmButton: false });
            },
            onError: () => {
                Swal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal update user', timer: 1500, showConfirmButton: false });
            }
        });
    };
    const handleDelete = (id) => {
        Swal.fire({
            title: 'Yakin hapus user?',
            text: 'User akan dihapus permanen!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/admin/users/${id}`, {
                    onSuccess: () => {
                        Swal.fire('Terhapus!', 'User berhasil dihapus.', 'success');
                    },
                    onError: () => {
                        Swal.fire('Gagal!', 'Gagal menghapus user.', 'error');
                    }
                });
            }
        });
    };
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Kelola User</h2>
                <button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow transition">Tambah User</button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded shadow text-sm">
                    <thead className="bg-gray-100 uppercase">
                        <tr className="border-b border-gray-200">
                            <th className="py-3 px-6 text-left font-bold text-gray-800">Nama</th>
                            <th className="py-3 px-6 text-left font-bold text-gray-800">Tipe</th>
                            <th className="py-3 px-6 text-left font-bold text-gray-800">Status</th>
                            <th className="py-3 px-6 text-center font-bold text-gray-800">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                                <td className="py-3 px-6 text-gray-900 font-medium">{user.nama_user}</td>
                                <td className="py-3 px-6 text-gray-900 font-medium">{user.tipe_user}</td>
                                <td className="py-3 px-6">
                                    {editId === user.id ? (
                                        <select name="status" value={editForm.status} onChange={handleEditChange} className="border rounded px-2 py-1 text-gray-900 font-medium">
                                            <option value="active">Aktif</option>
                                            <option value="non-active">Non Aktif</option>
                                        </select>
                                    ) : (
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{user.status === 'active' ? 'Aktif' : 'Non Aktif'}</span>
                                    )}
                                </td>
                                <td className="py-3 px-6 flex gap-2 justify-center">
                                    <button onClick={() => handleEdit(user)} className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded shadow transition font-semibold">Edit</button>
                                    <button onClick={() => handleDelete(user.id)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded shadow transition font-semibold">Hapus</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* Modal Tambah User */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
                        <div className="flex items-center justify-between p-4 border-b rounded-t border-gray-200">
                            <h3 className="text-lg font-bold text-black">Tambah User</h3>
                            <button
                                type="button"
                                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm h-8 w-8 flex justify-center items-center"
                                onClick={() => setShowModal(false)}
                            >
                                <svg className="w-3 h-3" aria-hidden="true" fill="none" viewBox="0 0 14 14">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                </svg>
                                <span className="sr-only">Close modal</span>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block mb-1 font-semibold text-gray-800">Nama User</label>
                                <input name="nama_user" value={form.nama_user} onChange={handleChange} placeholder="Nama User" className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400 font-medium" required />
                            </div>
                            <div>
                                <label className="block mb-1 font-semibold text-gray-800">Tipe User</label>
                                <select name="tipe_user" value={form.tipe_user} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium">
                                    <option value="admin">Admin</option>
                                    <option value="kasir">Kasir</option>
                                </select>
                            </div>
                            <div>
                                <label className="block mb-1 font-semibold text-gray-800">Kode User</label>
                                <input name="kode_user" value={form.kode_user} onChange={handleChange} placeholder="Kode User" className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400 font-medium" required />
                            </div>
                            <div>
                                <label className="block mb-1 font-semibold text-gray-800">Status</label>
                                <select name="status" value={form.status} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium">
                                    <option value="active">Aktif</option>
                                    <option value="non-active">Non Aktif</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 font-semibold">Batal</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold">Tambah</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Modal Edit User */}
            {showEditModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
                        <div className="flex items-center justify-between p-4 border-b rounded-t border-gray-200">
                            <h3 className="text-lg font-bold text-black">Edit User</h3>
                            <button
                                type="button"
                                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm h-8 w-8 flex justify-center items-center"
                                onClick={() => setShowEditModal(false)}
                            >
                                <svg className="w-3 h-3" aria-hidden="true" fill="none" viewBox="0 0 14 14">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                </svg>
                                <span className="sr-only">Close modal</span>
                            </button>
                        </div>
                        <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block mb-1 font-semibold text-gray-800">Nama User</label>
                                <input name="nama_user" value={editForm.nama_user || ''} onChange={handleEditChange} placeholder="Nama User" className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400 font-medium" required />
                            </div>
                            <div>
                                <label className="block mb-1 font-semibold text-gray-800">Tipe User</label>
                                <select name="tipe_user" value={editForm.tipe_user || ''} onChange={handleEditChange} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium">
                                    <option value="admin">Admin</option>
                                    <option value="kasir">Kasir</option>
                                </select>
                            </div>
                            <div>
                                <label className="block mb-1 font-semibold text-gray-800">Kode User</label>
                                <input name="kode_user" value={editForm.kode_user || ''} onChange={handleEditChange} placeholder="Kode User" className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400 font-medium" required />
                            </div>
                            <div>
                                <label className="block mb-1 font-semibold text-gray-800">Status</label>
                                <select name="status" value={editForm.status || ''} onChange={handleEditChange} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium">
                                    <option value="active">Aktif</option>
                                    <option value="non-active">Non Aktif</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 font-semibold">Batal</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold">Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
} 