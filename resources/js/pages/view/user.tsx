import { useState, useMemo, useEffect } from 'react';
import { router } from '@inertiajs/react';
import Swal from 'sweetalert2';

export default function User({ users, currentTheme }) {
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [form, setForm] = useState({
        nama_user: '',
        tipe_user: 'kasir',
        kode_user: '',
        account: 'active',
    });
    const [editId, setEditId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [showEditModal, setShowEditModal] = useState(false);

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
                setForm({ nama_user: '', tipe_user: 'kasir', kode_user: '', account: 'active' });
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
            account: user.account,
        });
        setShowEditModal(true);
    };

    const filteredUser = useMemo(()=>{
        let out = users;
        if(searchTerm !== ""){
            const q = searchTerm.toLowerCase()
            out = out.filter(item=>
                item.nama_user.toLowerCase().includes(q)
                )
        }
        if(statusFilter !== ""){
            out = out.filter(item=>
                item.tipe_user.toLowerCase() === statusFilter.toLowerCase()
                )
        }
        return out;
    }, [users, searchTerm, statusFilter])

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
    // ====== ⬇️ DERIVED PAGINATION  ⬇️ ======
      const totalItems = filteredUser.length;
      const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
      const currentSafe = Math.min(Math.max(currentPage, 1), totalPages);
      const startIndex = (currentSafe - 1) * pageSize;
      const endIndex = Math.min(startIndex + pageSize, totalItems);
      const pagedUser = filteredUser.slice(startIndex, endIndex);

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
                <h2 className="text-xl font-bold">Kelola User</h2>
            </div>
            <div className={`flex justify-between items-center mb-6 ${card} shadow rounded-xl p-6`}>
                <div className="flex w-5/6 gap-8">
                    <input type="text" value={searchTerm} onChange={(e)=>{setSearchTerm(e.target.value)}} className={`w-1/2 mx-4 border shadow ${inputTheme} rounded-xl p-4`} placeholder="Cari nama user" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className={`px-4 py-2 shadow border ${inputTheme} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                      >
                        <option value="">Semua tipe user</option>
                        <option value="admin">Admin</option>
                        <option value="kasir">Kasir</option>
                    </select>
                </div>
                <button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow transition">Tambah User</button>
            </div>
            <div className={`overflow-x-auto pb-20 min-h-[40vh] ${card} relative bg-white rounded-xl shadow`}>
                <table className="min-w-full bg-transparent rounded shadow text-sm">
                    <thead className={`${currentTheme === 'auto'? 'bg-slate-50 dark:bg-zinc-800' : currentTheme === 'Dark' ? 'bg-zinc-800' : 'bg-slate-50'}`}>
                        <tr className="border-b border-gray-200">
                            <th className="py-3 px-6 text-left font-bold">Nama</th>
                            <th className="py-3 px-6 text-left font-bold">Tipe</th>
                            <th className="py-3 px-6 text-center font-bold">Status Akun</th>
                            <th className="py-3 px-6 text-center font-bold">Status</th>
                            <th className="py-3 px-6 text-center font-bold">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUser.length > 0 && pagedUser.map(user => (
                            <tr key={user.id} className={`${rowHover} ${borderSoft} transition`}>
                                <td className="py-3 px-6 font-medium">{user.nama_user}</td>
                                <td className="py-3 px-6 font-medium">{user.tipe_user}</td>
                                <td className="py-3 px-6 text-center">
                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${user.account === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{user.account === 'active' ? 'Aktif' : 'Non-Aktif'}</span>
                                </td>
                                <td className="py-3 px-6 text-center">
                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${user.status === 'Online' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{user.status}</span>
                                </td>
                                <td className="py-3 px-6 flex gap-2 justify-center">
                                    <button onClick={() => handleDelete(user.id)} className="bg-red-500 cursor-pointer text-white w-16 mr-4 py-2 rounded-md">Hapus</button>
                                    <button onClick={() => handleEdit(user)} className="bg-yellow-500 cursor-pointer text-white w-16 mr-4 py-2 rounded-md">Edit</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredUser.length === 0 && (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-slate-900">Tidak ada Data</h3>
                    <p className="mt-1 text-sm text-slate-500">Tidak ada Data yang sesuai dengan filter yang dipilih.</p>
                  </div>
                )}
            {/* ====== ⬇️ KONTROL PAGINATION  ⬇️ ====== */}
                {filteredUser.length > 0 && (
                  <div className={`flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t ${borderSoft} absolute bottom-0 left-0 right-0 gap-3`}>
                    <div className={`text-sm ${subText}`}>
                      Menampilkan <span className="font-semibold">{startIndex + 1}</span>–
                      <span className="font-semibold">{endIndex}</span> dari
                      <span className="font-semibold"> {totalItems}</span> User
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
            </div>
            {/* Modal Tambah User */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
                    <div className={`${card} ${text} rounded-lg shadow-lg w-full max-w-md`}>
                        <div className="flex items-center justify-between p-4 border-b rounded-t border-gray-200">
                            <h3 className="text-lg font-bold">Tambah User</h3>
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
                                <label className="block mb-1 font-semibold">Nama User</label>
                                <input name="nama_user" value={form.nama_user} onChange={handleChange} placeholder="Nama User" className={`w-full p-2 mb-2 ${inputTheme} border rounded`} required />
                            </div>
                            <div>
                                <label className="block mb-1 font-semibold">Tipe User</label>
                                <select name="tipe_user" value={form.tipe_user} onChange={handleChange} className={`w-full p-2 mb-2 ${inputTheme} border rounded`}>
                                    <option value="admin">Admin</option>
                                    <option value="kasir">Kasir</option>
                                </select>
                            </div>
                            <div>
                                <label className="block mb-1 font-semibold">Kode User</label>
                                <input name="kode_user" value={form.kode_user} onChange={handleChange} placeholder="Kode User" className={`w-full p-2 mb-2 ${inputTheme} border rounded`} required />
                            </div>
                            <div>
                                <label className="block mb-1 font-semibold">Status Akun</label>
                                <select name="account" value={form.account} onChange={handleChange} className={`w-full p-2 mb-2 ${inputTheme} border rounded`}>
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
                    <div className={`${card} ${text} rounded-lg shadow-lg w-full max-w-md`}>
                        <div className="flex items-center justify-between p-4 border-b rounded-t border-gray-200">
                            <h3 className="text-lg font-bold">Edit User</h3>
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
                                <label className="block mb-1 font-semibold">Nama User</label>
                                <input name="nama_user" value={editForm.nama_user || ''} onChange={handleEditChange} placeholder="Nama User" className={`w-full p-2 mb-2 ${inputTheme} border rounded`} required />
                            </div>
                            <div>
                                <label className="block mb-1 font-semibold">Tipe User</label>
                                <select name="tipe_user" value={editForm.tipe_user || ''} onChange={handleEditChange} className={`w-full p-2 mb-2 ${inputTheme} border rounded`}>
                                    <option value="admin">Admin</option>
                                    <option value="kasir">Kasir</option>
                                </select>
                            </div>
                            <div>
                                <label className="block mb-1 font-semibold">Kode User</label>
                                <input name="kode_user" value={editForm.kode_user || ''} onChange={handleEditChange} placeholder="Kode User" className={`w-full p-2 mb-2 ${inputTheme} border rounded`} required />
                            </div>
                            <div>
                                <label className="block mb-1 font-semibold">Status Akun</label>
                                <select name="account" value={editForm.account || ''} onChange={handleEditChange} className={`w-full p-2 mb-2 ${inputTheme} border rounded`}>
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