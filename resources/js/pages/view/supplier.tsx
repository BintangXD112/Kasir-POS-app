import React, { useState, useMemo } from 'react';
import { router } from '@inertiajs/react';
import Swal from 'sweetalert2';
import AdminLayout from '@/components/admin-sidebar';


declare const route: (name: string, params?: any) => string;

interface Supplier {
    id: number;
    nama_supplier: string;
    no_hp: string | null;
    alamat: string | null;
    jumlah_pembelian: number;
    total_pembelian: number;
    created_at: string | null;
}

interface Props {
    suppliers: Supplier[];
    total_pembelian: number;
    sisa_hutang: number;
    currentTheme?: 'auto' | 'Light' | 'Dark';
}

const fmt = (n: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

const fmtDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

const emptyForm = { nama_supplier: '', no_hp: '', alamat: '' };

export default function SupplierPage({ suppliers = [], total_pembelian = 0, sisa_hutang = 0, currentTheme = 'Light' }: Props) {
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const card = currentTheme === 'Dark' ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-zinc-200';
    const text = currentTheme === 'Dark' ? 'text-zinc-100' : 'text-zinc-900';
    const subText = currentTheme === 'Dark' ? 'text-zinc-400' : 'text-zinc-500';
    const softBg = currentTheme === 'Dark' ? 'bg-zinc-800/60' : 'bg-slate-50';
    const rowHover = currentTheme === 'Dark' ? 'hover:bg-zinc-800/60' : 'hover:bg-slate-50';
    const borderSoft = currentTheme === 'Dark' ? 'border-zinc-800' : 'border-slate-200';
    const inputCls = currentTheme === 'Dark' ? 'border-zinc-700 bg-zinc-800 text-zinc-100' : 'border-zinc-300 bg-white text-zinc-900';
    const headerBg = currentTheme === 'Dark' ? 'bg-zinc-900/80' : 'bg-gray-800';

    const filtered = useMemo(() =>
        suppliers.filter(s =>
            s.nama_supplier.toLowerCase().includes(search.toLowerCase()) ||
            (s.no_hp?.includes(search) ?? false)
        ), [suppliers, search]);

    const openAdd = () => { setForm(emptyForm); setErrors({}); setEditMode(false); setEditId(null); setShowModal(true); };
    const openEdit = (s: Supplier) => { setForm({ nama_supplier: s.nama_supplier, no_hp: s.no_hp || '', alamat: s.alamat || '' }); setErrors({}); setEditMode(true); setEditId(s.id); setShowModal(true); };
    const closeModal = () => { setShowModal(false); setForm(emptyForm); setErrors({}); };

    const validate = () => {
        const e: Record<string, string> = {};
        if (!form.nama_supplier.trim()) e.nama_supplier = 'Nama supplier wajib diisi';
        return e;
    };

    const handleSubmit = (ev: React.FormEvent) => {
        ev.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }

        if (editMode && editId) {
            router.put(route('admin.supplier.update', editId), form, {
                preserveScroll: true,
                onSuccess: () => { Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Data supplier diperbarui.', timer: 1500, showConfirmButton: false }); closeModal(); },
                onError: (e) => setErrors(e as any),
            });
        } else {
            router.post(route('admin.supplier.store'), form, {
                preserveScroll: true,
                onSuccess: () => { Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Supplier baru ditambahkan.', timer: 1500, showConfirmButton: false }); closeModal(); },
                onError: (e) => setErrors(e as any),
            });
        }
    };

    const handleDelete = (id: number, nama: string) => {
        Swal.fire({ title: `Hapus ${nama}?`, text: 'Data supplier akan dihapus permanen.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', cancelButtonColor: '#6b7280', confirmButtonText: 'Ya, hapus', cancelButtonText: 'Batal' })
            .then(r => {
                if (r.isConfirmed) {
                    router.delete(route('admin.supplier.destroy', id), {
                        preserveScroll: true,
                        onSuccess: () => Swal.fire({ icon: 'success', title: 'Terhapus!', text: 'Supplier berhasil dihapus.', timer: 1500, showConfirmButton: false }),
                        onError: () => Swal.fire('Gagal!', 'Supplier tidak bisa dihapus (mungkin ada data terkait).', 'error'),
                    });
                }
            });
    };

    return (
        <AdminLayout currentTheme={currentTheme} activeKey="supplier">

            {/* Page Title */}
            <div className="pl-6 pt-6 flex items-center justify-between pr-6">
                <div>
                    <h2 className={`text-xl font-semibold ${text}`}>Kelola Supplier</h2>
                    <p className={`text-sm ${subText} mt-0.5`}>Manajemen data supplier pembelian stok</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => router.visit('/admin/pembelian-stok')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm border transition-colors ${currentTheme === 'Dark' ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}`}>
                        Pembelian Stok
                    </button>
                    <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Tambah Supplier
                    </button>
                </div>
            </div>

            <div className="p-6 space-y-4">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className={`${card} rounded-xl p-5`}>
                        <p className={`text-sm ${subText} mb-1`}>Total Supplier</p>
                        <p className="text-2xl font-bold text-blue-500">{suppliers.length}</p>
                    </div>
                    <div className={`${card} rounded-xl p-5`}>
                        <p className={`text-sm ${subText} mb-1`}>Total Pembelian ke Supplier</p>
                        <p className="text-2xl font-bold text-emerald-500">{fmt(total_pembelian)}</p>
                    </div>
                    <div className={`${card} rounded-xl p-5`}>
                        <p className={`text-sm ${subText} mb-1`}>Sisa Hutang (Status Pending)</p>
                        <p className="text-2xl font-bold text-red-500">{fmt(sisa_hutang)}</p>
                    </div>
                </div>

                {/* Search */}
                <div className={`${card} rounded-xl p-4`}>
                    <div className="relative max-w-md">
                        <svg className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${subText}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input type="text" placeholder="Cari nama atau no. HP supplier..." value={search} onChange={e => setSearch(e.target.value)} className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${inputCls}`} />
                        {search && <button onClick={() => setSearch('')} className={`absolute right-3 top-1/2 -translate-y-1/2 ${subText} hover:opacity-80`}>×</button>}
                    </div>
                </div>

                {/* Table */}
                <div className={`${card} rounded-xl overflow-hidden shadow-sm`}>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className={softBg}>
                                <tr className={`border-b ${borderSoft}`}>
                                    {['Nama Supplier', 'No. HP', 'Alamat', 'Jml Order', 'Total Pembelian', 'Terdaftar', 'Aksi'].map(h => (
                                        <th key={h} className={`px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider ${subText}`}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr><td colSpan={7} className={`text-center py-12 ${subText}`}>Belum ada data supplier.</td></tr>
                                ) : filtered.map(s => (
                                    <tr key={s.id} className={`border-b ${borderSoft} ${rowHover} transition-colors`}>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                                    {s.nama_supplier.charAt(0).toUpperCase()}
                                                </div>
                                                <p className={`font-medium ${text}`}>{s.nama_supplier}</p>
                                            </div>
                                        </td>
                                        <td className={`px-5 py-4 text-sm ${subText}`}>{s.no_hp || '-'}</td>
                                        <td className={`px-5 py-4 text-sm ${subText} max-w-[180px] truncate`}>{s.alamat || '-'}</td>
                                        <td className="px-5 py-4">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">{s.jumlah_pembelian}x</span>
                                        </td>
                                        <td className="px-5 py-4"><span className="text-sm font-bold text-emerald-500">{fmt(s.total_pembelian)}</span></td>
                                        <td className={`px-5 py-4 text-sm ${subText}`}>{fmtDate(s.created_at)}</td>
                                        <td className="px-5 py-4">
                                            <div className="flex gap-2">
                                                <button onClick={() => openEdit(s)} className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg transition-colors">Edit</button>
                                                <button onClick={() => handleDelete(s.id, s.nama_supplier)} className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-lg transition-colors">Hapus</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal Tambah/Edit */}
            {showModal && (
                <div className="fixed inset-0 backdrop-blur-sm bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className={`${card} ${text} rounded-2xl shadow-2xl w-full max-w-lg`}>
                        <div className={`flex items-center justify-between px-6 py-4 border-b ${borderSoft}`}>
                            <h2 className="text-lg font-bold">{editMode ? 'Edit Supplier' : 'Tambah Supplier Baru'}</h2>
                            <button onClick={closeModal} className={`p-2 rounded-lg ${currentTheme === 'Dark' ? 'hover:bg-zinc-800' : 'hover:bg-slate-100'} transition-colors`}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className={`block text-sm font-medium mb-1 ${text}`}>Nama Supplier <span className="text-red-500">*</span></label>
                                <input type="text" value={form.nama_supplier} onChange={e => setForm(f => ({ ...f, nama_supplier: e.target.value }))} placeholder="Nama lengkap supplier" className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent ${inputCls} ${errors.nama_supplier ? 'border-red-500' : ''}`} />
                                {errors.nama_supplier && <p className="text-red-500 text-xs mt-1">{errors.nama_supplier}</p>}
                            </div>
                            <div>
                                <label className={`block text-sm font-medium mb-1 ${text}`}>No. HP</label>
                                <input type="text" value={form.no_hp} onChange={e => setForm(f => ({ ...f, no_hp: e.target.value }))} placeholder="08xx-xxxx-xxxx" className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent ${inputCls}`} />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium mb-1 ${text}`}>Alamat</label>
                                <textarea value={form.alamat} onChange={e => setForm(f => ({ ...f, alamat: e.target.value }))} placeholder="Alamat lengkap supplier" rows={3} className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${inputCls}`} />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="submit" className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
                                    {editMode ? 'Simpan Perubahan' : 'Tambah Supplier'}
                                </button>
                                <button type="button" onClick={closeModal} className={`flex-1 py-2.5 font-semibold rounded-lg transition-colors ${currentTheme === 'Dark' ? 'bg-zinc-700 hover:bg-zinc-600 text-zinc-100' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'}`}>
                                    Batal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
