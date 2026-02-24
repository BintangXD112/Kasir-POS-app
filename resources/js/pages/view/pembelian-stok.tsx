import React, { useState, useMemo, useEffect } from "react";
import { router } from "@inertiajs/react";
import Swal from "sweetalert2";
import MenuBar from '@/components/menu-bar';
import { Link } from '@inertiajs/react';
import { LogOut } from 'lucide-react';
import { useMobileNavigation } from '../../hooks/use-mobile-navigation';

declare const route: (name: string, params?: any) => string;

interface Produk { id: number; nama: string; stok: number; harga: number; }
interface User { id: number; nama_user: string; }
interface Supplier { id: number; nama_supplier: string; }
interface Pembelian {
    id: number;
    produk: Produk;
    user: User;
    supplier?: Supplier | null;
    jumlah: number;
    harga_beli: number;
    total_harga: number;
    keterangan: string | null;
    created_at: string | null;
}

interface Props {
    pembelian: Pembelian[];
    produk: Produk[];
    suppliers: Supplier[];
    total_bulan_ini: number;
    currentTheme: 'auto' | 'Light' | 'Dark';
}

const formatCurrency = (n: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "-";

export default function PembelianStokComponent({
    pembelian = [],
    produk = [],
    suppliers = [],
    total_bulan_ini = 0,
    currentTheme = 'Light',
}: Props) {
    const [search, setSearch] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ produk_id: "", jumlah: "", harga_beli: "", keterangan: "", supplier_id: "" });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState<number>(10);

    useEffect(() => { setCurrentPage(1); }, [search, pageSize]);

    // ===== THEME HELPERS =====
    const card =
        currentTheme === 'auto' ? 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800'
            : currentTheme === 'Dark' ? 'bg-zinc-900 border border-zinc-800'
                : 'bg-white border border-zinc-200';

    const text =
        currentTheme === 'auto' ? 'text-zinc-900 dark:text-zinc-100'
            : currentTheme === 'Dark' ? 'text-zinc-100'
                : 'text-zinc-900';

    const subText =
        currentTheme === 'auto' ? 'text-zinc-500 dark:text-zinc-400'
            : currentTheme === 'Dark' ? 'text-zinc-400'
                : 'text-zinc-500';

    const softBg =
        currentTheme === 'auto' ? 'bg-slate-50 dark:bg-zinc-800/60'
            : currentTheme === 'Dark' ? 'bg-zinc-800/60'
                : 'bg-slate-50';

    const rowHover =
        currentTheme === 'auto' ? 'hover:bg-slate-50 dark:hover:bg-zinc-800/60'
            : currentTheme === 'Dark' ? 'hover:bg-zinc-800/60'
                : 'hover:bg-slate-50';

    const borderSoft = currentTheme === 'Dark' ? 'border-zinc-800' : 'border-slate-200';

    const inputCls =
        currentTheme === 'auto' ? 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
            : currentTheme === 'Dark' ? 'border-zinc-700 bg-zinc-800 text-zinc-100'
                : 'border-zinc-300 bg-white text-zinc-900';

    // ===== DATA =====
    const filtered = useMemo(() =>
        pembelian.filter(p =>
            p.produk.nama.toLowerCase().includes(search.toLowerCase()) ||
            (p.keterangan?.toLowerCase().includes(search.toLowerCase()) ?? false)
        ), [pembelian, search]
    );

    const totalItems = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const currentSafe = Math.min(Math.max(currentPage, 1), totalPages);
    const startIndex = (currentSafe - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);
    const paged = filtered.slice(startIndex, endIndex);

    const getPageNumbers = (current: number, total: number): (number | '...')[] => {
        if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
        if (current <= 4) return [1, 2, 3, 4, 5, '...', total];
        if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
        return [1, '...', current - 1, current, current + 1, '...', total];
    };
    const pageNumbers = getPageNumbers(currentSafe, totalPages);

    const totalPengeluaran = pembelian.reduce((s, p) => s + p.total_harga, 0);
    const totalUnit = pembelian.reduce((s, p) => s + p.jumlah, 0);

    const selectedProduk = produk.find(p => p.id === Number(form.produk_id));
    const estimasiTotal = Number(form.jumlah) * Number(form.harga_beli);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const errors: Record<string, string> = {};
        if (!form.produk_id) errors.produk_id = "Pilih produk";
        if (!form.jumlah || Number(form.jumlah) < 1) errors.jumlah = "Jumlah minimal 1";
        if (!form.harga_beli || Number(form.harga_beli) < 0) errors.harga_beli = "Harga tidak valid";
        if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }

        Swal.fire({
            title: "Konfirmasi Pembelian",
            html: `Beli <b>${form.jumlah} unit</b> ${selectedProduk?.nama}<br/>Total: <b>${formatCurrency(estimasiTotal)}</b>`,
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#2563eb",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Simpan",
            cancelButtonText: "Batal",
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route("admin.pembelian-stok.store"), {
                    produk_id: Number(form.produk_id),
                    jumlah: Number(form.jumlah),
                    harga_beli: Number(form.harga_beli),
                    keterangan: form.keterangan,
                    supplier_id: form.supplier_id ? Number(form.supplier_id) : null,
                }, {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({ icon: "success", title: "Berhasil!", text: "Pembelian stok dicatat.", timer: 1500, showConfirmButton: false });
                        setForm({ produk_id: "", jumlah: "", harga_beli: "", keterangan: "", supplier_id: "" });
                        setFormErrors({});
                        setShowForm(false);
                    },
                    onError: (errs) => {
                        Swal.fire({ icon: "error", title: "Gagal!", text: errs.error || "Terjadi kesalahan." });
                    },
                });
            }
        });
    };


    const headerBg =
        currentTheme === 'auto'
            ? 'bg-gray-800 dark:bg-zinc-900/80'
            : currentTheme === 'Light'
                ? 'bg-gray-800' // header tetap gelap biar kontras
                : 'bg-zinc-900/80';

    const cleanup = useMobileNavigation();
    const handleLogout = () => {
        cleanup();
        router.flushAll();
        localStorage.removeItem("username");
    };
    const [showLogout, setShowLogout] = useState(false);
    const toggleLogout = () => {
        setShowLogout(!showLogout);
    };

    return (

        <div>
            {/* Header */}
            <div className={`flex flex-col ${headerBg} px-4 py-4`}>
                <div className={`flex justify-between`}>
                    <div className="w-1/6 items-center flex">
                        <h1 className="text-2xl font-bold text-white">Point Of Sale</h1>
                    </div>
                    <div onClick={toggleLogout} className={`text-white flex items-center relative cursor-pointer`}>
                        {localStorage.getItem("username")}
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`size-4 ml-2 ${showLogout ? 'rotate-180' : ''} transition-transform duration-150 ease-in-out`}>
                            <path fillRule="evenodd" d="M12.53 16.28a.75.75 0 0 1-1.06 0l-7.5-7.5a.75.75 0 0 1 1.06-1.06L12 14.69l6.97-6.97a.75.75 0 1 1 1.06 1.06l-7.5 7.5Z" clipRule="evenodd" />
                        </svg>
                        {showLogout && (
                            <div className={`transition-all duration-150 ease-in-out absolute top-8 right-0 bg-red-500 cursor-pointer hover:opacity-50 rounded-md shadow-lg p-0 w-36 z-20 animate-fade-in`}>
                                <ul className="text-white m-0 p-0">
                                    <li className="py-2 px-2 cursor-pointer transition-colors rounded-md">
                                        <Link className="flex w-full" method="post" href={route('logout')} as="button" onClick={handleLogout}>
                                            <LogOut className='mr-2' />
                                            Log out
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
                <MenuBar />
            </div>
            <div className="pl-6 pt-6 flex items-center justify-between pr-6">

                <div className="flex items-center gap-4">
                    <h2 className={`text-xl font-semibold ${text}`}>Rekap Stok Pembelian</h2>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.visit('/admin/supplier')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm border transition-colors ${currentTheme === 'Dark' ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}`}
                    >
                        Kelola Supplier
                    </button>
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Tambah Pembelian
                    </button>
                </div>
            </div>

            <div className="p-6 space-y-4">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className={`${card} rounded-xl p-5`}>
                        <p className={`text-sm ${subText} mb-1`}>Total Pengeluaran</p>
                        <p className="text-2xl font-bold text-blue-500">{formatCurrency(totalPengeluaran)}</p>
                    </div>
                    <div className={`${card} rounded-xl p-5`}>
                        <p className={`text-sm ${subText} mb-1`}>Pengeluaran Bulan Ini</p>
                        <p className="text-2xl font-bold text-purple-500">{formatCurrency(total_bulan_ini)}</p>
                    </div>
                    <div className={`${card} rounded-xl p-5`}>
                        <p className={`text-sm ${subText} mb-1`}>Total Unit Dibeli</p>
                        <p className="text-2xl font-bold text-emerald-500">{totalUnit.toLocaleString("id-ID")}</p>
                    </div>
                </div>

                {/* Search */}
                <div className={`${card} rounded-xl p-4`}>
                    <div className="relative max-w-md">
                        <svg className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${subText}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Cari produk atau keterangan..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${inputCls}`}
                        />
                        {search && (
                            <button onClick={() => setSearch('')} className={`absolute right-3 top-1/2 -translate-y-1/2 ${subText} hover:opacity-80`}>×</button>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div className={`${card} relative pb-20 rounded-xl overflow-hidden shadow-sm`}>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className={softBg}>
                                <tr className={`border-b ${borderSoft}`}>
                                    {["Produk", "Supplier", "Jumlah", "Harga Beli/Unit", "Total Harga", "Keterangan", "Admin", "Tanggal"].map(h => (
                                        <th key={h} className={`px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider ${subText}`}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {paged.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="text-center py-12">
                                            <svg className={`mx-auto h-12 w-12 ${subText} mb-3`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                            </svg>
                                            <p className={`text-sm font-medium ${text}`}>Belum ada data pembelian stok</p>
                                            <p className={`text-xs ${subText} mt-1`}>Klik "Tambah Pembelian" untuk mencatat restok produk.</p>
                                        </td>
                                    </tr>
                                ) : paged.map((p) => (
                                    <tr key={p.id} className={`border-b ${borderSoft} ${rowHover} transition-colors`}>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                                    {p.produk.nama.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className={`font-medium ${text}`}>{p.produk.nama}</p>
                                                    <p className={`text-xs ${subText}`}>Stok sekarang: {p.produk.stok}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`text-sm ${subText}`}>{p.supplier?.nama_supplier ?? '-'}</span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                                                +{p.jumlah} unit
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`text-sm font-medium ${text}`}>{formatCurrency(p.harga_beli)}</span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="text-sm font-bold text-blue-500">{formatCurrency(p.total_harga)}</span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`text-sm ${subText}`}>{p.keterangan || "-"}</span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`text-sm ${text}`}>{p.user?.nama_user || "-"}</span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`text-sm ${subText}`}>{formatDate(p.created_at)}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {filtered.length > 0 && (
                        <div className={`flex flex-col sm:flex-row absolute bottom-0 left-0 right-0 items-center justify-between px-6 py-4 border-t ${borderSoft} gap-3`}>
                            <div className={`text-sm ${subText}`}>
                                Menampilkan <span className="font-semibold">{startIndex + 1}</span>–
                                <span className="font-semibold">{endIndex}</span> dari
                                <span className="font-semibold"> {totalItems}</span> data
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    className={`px-3 py-2 rounded-lg text-sm cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 border ${currentTheme === 'Dark' ? 'border-zinc-700 hover:bg-zinc-800' : 'border-slate-300 hover:bg-slate-50'}`}
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentSafe === 1}
                                >Prev</button>
                                {pageNumbers.map((p, idx) =>
                                    p === '...' ? (
                                        <span key={`dots-${idx}`} className={`px-2 select-none ${subText}`}>…</span>
                                    ) : (
                                        <button
                                            key={p}
                                            onClick={() => setCurrentPage(p as number)}
                                            className={`px-3 py-2 rounded-lg text-sm transition-all cursor-pointer border ${currentSafe === p ? 'bg-blue-600 text-white border-blue-600' : currentTheme === 'Dark' ? 'border-zinc-700 hover:bg-blue-600 hover:text-white' : 'border-slate-300 hover:bg-blue-600 hover:text-white'}`}
                                        >{p}</button>
                                    )
                                )}
                                <button
                                    className={`px-3 py-2 rounded-lg text-sm cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 border ${currentTheme === 'Dark' ? 'border-zinc-700 hover:bg-zinc-800' : 'border-slate-300 hover:bg-slate-50'}`}
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentSafe === totalPages}
                                >Next</button>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`text-sm ${subText}`}>Per halaman:</span>
                                <select
                                    value={pageSize}
                                    onChange={e => setPageSize(Number(e.target.value))}
                                    className={`px-2 py-2 rounded-lg text-sm border ${currentTheme === 'auto' ? 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800' : currentTheme === 'Dark' ? 'border-zinc-700 bg-zinc-800' : 'border-slate-300 bg-white'}`}
                                >
                                    {[10, 25, 50, 100].map(sz => <option key={sz} value={sz}>{sz}</option>)}
                                </select>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Form Tambah Pembelian */}
            {showForm && (
                <div className="fixed inset-0 backdrop-blur-sm bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className={`${card} ${text} rounded-2xl shadow-2xl w-full max-w-lg`}>
                        <div className={`flex items-center justify-between px-6 py-4 border-b ${borderSoft}`}>
                            <h2 className="text-lg font-bold">Tambah Pembelian Stok</h2>
                            <button onClick={() => { setShowForm(false); setFormErrors({}); }} className={`p-2 rounded-lg ${currentTheme === "Dark" ? "hover:bg-zinc-800" : "hover:bg-slate-100"} transition-colors`}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className={`block text-sm font-medium mb-1 ${text}`}>Produk <span className="text-red-500">*</span></label>
                                <select
                                    value={form.produk_id}
                                    onChange={(e) => setForm(f => ({ ...f, produk_id: e.target.value }))}
                                    className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${inputCls} ${formErrors.produk_id ? "border-red-500" : ""}`}
                                >
                                    <option value="">-- Pilih Produk --</option>
                                    {produk.map(p => (
                                        <option key={p.id} value={p.id}>{p.nama} (Stok: {p.stok})</option>
                                    ))}
                                </select>
                                {formErrors.produk_id && <p className="text-red-500 text-xs mt-1">{formErrors.produk_id}</p>}
                                {selectedProduk && (
                                    <p className={`text-xs ${subText} mt-1`}>Harga jual: {formatCurrency(selectedProduk.harga)} · Stok saat ini: {selectedProduk.stok}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={`block text-sm font-medium mb-1 ${text}`}>Jumlah <span className="text-red-500">*</span></label>
                                    <input
                                        type="number" min="1"
                                        value={form.jumlah}
                                        onChange={(e) => setForm(f => ({ ...f, jumlah: e.target.value }))}
                                        placeholder="0"
                                        className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${inputCls} ${formErrors.jumlah ? "border-red-500" : ""}`}
                                    />
                                    {formErrors.jumlah && <p className="text-red-500 text-xs mt-1">{formErrors.jumlah}</p>}
                                </div>
                                <div>
                                    <label className={`block text-sm font-medium mb-1 ${text}`}>Harga Beli/Unit <span className="text-red-500">*</span></label>
                                    <input
                                        type="number" min="0"
                                        value={form.harga_beli}
                                        onChange={(e) => setForm(f => ({ ...f, harga_beli: e.target.value }))}
                                        placeholder="0"
                                        className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${inputCls} ${formErrors.harga_beli ? "border-red-500" : ""}`}
                                    />
                                    {formErrors.harga_beli && <p className="text-red-500 text-xs mt-1">{formErrors.harga_beli}</p>}
                                </div>
                            </div>

                            {estimasiTotal > 0 && (
                                <div className={`${softBg} rounded-lg px-4 py-3 flex items-center justify-between`}>
                                    <span className={`text-sm ${subText}`}>Estimasi Total</span>
                                    <span className="text-base font-bold text-blue-500">{formatCurrency(estimasiTotal)}</span>
                                </div>
                            )}

                            <div>
                                <label className={`block text-sm font-medium mb-1 ${text}`}>Supplier (Opsional)</label>
                                <select
                                    value={form.supplier_id}
                                    onChange={(e) => setForm(f => ({ ...f, supplier_id: e.target.value }))}
                                    className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${inputCls}`}
                                >
                                    <option value="">-- Pilih Supplier (opsional) --</option>
                                    {suppliers.map(s => (
                                        <option key={s.id} value={s.id}>{s.nama_supplier}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className={`block text-sm font-medium mb-1 ${text}`}>Keterangan</label>
                                <input
                                    type="text"
                                    value={form.keterangan}
                                    onChange={(e) => setForm(f => ({ ...f, keterangan: e.target.value }))}
                                    placeholder="Catatan tambahan..."
                                    className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${inputCls}`}
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="submit" className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
                                    Simpan Pembelian
                                </button>
                                <button type="button" onClick={() => { setShowForm(false); setFormErrors({}); }}
                                    className={`flex-1 py-2.5 font-semibold rounded-lg transition-colors ${currentTheme === "Dark" ? "bg-zinc-700 hover:bg-zinc-600 text-zinc-100" : "bg-slate-200 hover:bg-slate-300 text-slate-700"}`}>
                                    Batal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
