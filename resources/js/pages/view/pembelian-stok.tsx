import { router } from '@inertiajs/react';
import React, { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';

declare const route: (name: string, params?: any) => string;

type StatusPembelian = 'lunas' | 'pending';

interface Produk {
    id: number;
    nama: string;
    stok: number;
    harga: number;
}
interface User {
    id: number;
    nama_user: string;
}
interface Supplier {
    id: number;
    nama_supplier: string;
}
interface Pembelian {
    id: number;
    produk: Produk;
    user: User;
    supplier?: Supplier | null;
    jumlah: number;
    harga_beli: number;
    ongkir: number;
    total_harga: number;
    nominal_bayar: number;
    status: StatusPembelian;
    keterangan: string | null;
    created_at: string | null;
}

interface Props {
    pembelian: Pembelian[];
    produk: Produk[];
    suppliers: Supplier[];
    total_bulan_ini: number;
}

const formatCurrency = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';

export default function PembelianStokComponent({ pembelian = [], produk = [], suppliers = [], total_bulan_ini = 0 }: Props) {
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ produk_id: '', jumlah: '', harga_beli: '', ongkir: '', nominal_bayar: '', keterangan: '', supplier_id: '' });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState<number>(10);
    const [currentTheme, setCurrentTheme] = useState(localStorage.getItem('theme') || 'auto');
    const [theme, setTheme] = useState(false);

    useEffect(() => {
        const root = document.documentElement;

        if (currentTheme === 'Dark') {
            root.classList.add('dark');
            localStorage.setItem('theme', 'Dark');
        } else if (currentTheme === 'Light') {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'Light');
        } else if (currentTheme === 'auto') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            localStorage.setItem('theme', 'auto');

            if (prefersDark) {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
        }
    }, [currentTheme]);

    useEffect(() => {
        setCurrentPage(1);
    }, [search, pageSize]);

    // ===== THEME HELPERS =====
    const getStatusBadge = (status: string) => {
        const base = 'inline-flex items-center px-3 py-1 rounded-full text-xs text-center font-medium border';
        const theme = currentTheme;
        const map: Record<string, string> = {
            lunas: `${base} ${theme === 'auto' ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800' : theme === 'Light' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-emerald-900/30 text-emerald-300 border-emerald-800'}`,
            pending: `${base} ${theme === 'auto' ? 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800' : theme === 'Light' ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-amber-900/30 text-amber-300 border-amber-800'}`,
            cancelled: `${base} ${theme === 'auto' ? 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800' : theme === 'Light' ? 'bg-red-100 text-red-800 border-red-200' : 'bg-red-900/30 text-red-300 border-red-800'}`,
        };
        return map[status] || `${base} bg-gray-100 text-gray-800 border-gray-200 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700`;
    };

    const bgApp = currentTheme === 'auto' ? 'bg-gray-50 dark:bg-zinc-950' : currentTheme === 'Light' ? 'bg-gray-50' : 'bg-zinc-950';

    const card =
        currentTheme === 'auto'
            ? 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800'
            : currentTheme === 'Dark'
              ? 'bg-zinc-900 border border-zinc-800'
              : 'bg-white border border-zinc-200';

    const text = currentTheme === 'auto' ? 'text-zinc-900 dark:text-zinc-100' : currentTheme === 'Dark' ? 'text-zinc-100' : 'text-zinc-900';

    const subText = currentTheme === 'auto' ? 'text-zinc-500 dark:text-zinc-400' : currentTheme === 'Dark' ? 'text-zinc-400' : 'text-zinc-500';

    const softBg = currentTheme === 'auto' ? 'bg-slate-50 dark:bg-zinc-800/60' : currentTheme === 'Dark' ? 'bg-zinc-800/60' : 'bg-slate-50';

    const rowHover =
        currentTheme === 'auto'
            ? 'hover:bg-slate-50 dark:hover:bg-zinc-800/60'
            : currentTheme === 'Dark'
              ? 'hover:bg-zinc-800/60'
              : 'hover:bg-slate-50';

    const headerBg =
        currentTheme === 'auto'
            ? 'bg-gray-800 dark:bg-zinc-900/80'
            : currentTheme === 'Light'
              ? 'bg-gray-800' // header tetap gelap biar kontras
              : 'bg-zinc-900/80';

    const borderSoft = currentTheme === 'Dark' ? 'border-zinc-800' : 'border-slate-200';

    const inputCls =
        currentTheme === 'auto'
            ? 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
            : currentTheme === 'Dark'
              ? 'border-zinc-700 bg-zinc-800 text-zinc-100'
              : 'border-zinc-300 bg-white text-zinc-900';

    // ===== DATA =====
    const filtered = useMemo(
        () =>
            pembelian.filter(
                (p) =>
                    p.produk.nama.toLowerCase().includes(search.toLowerCase()) ||
                    (p.keterangan?.toLowerCase().includes(search.toLowerCase()) ?? false),
            ),
        [pembelian, search],
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

    const totalPengeluaran = pembelian.reduce((s, p) => s + Number(p.total_harga || 0), 0);
    const totalUnit = pembelian.reduce((s, p) => s + p.jumlah, 0);

    const selectedProduk = produk.find((p) => p.id === Number(form.produk_id));
    const estimasiTotal = Number(form.jumlah) * Number(form.harga_beli) + Number(form.ongkir);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const errors: Record<string, string> = {};
        if (!form.produk_id) errors.produk_id = 'Pilih produk';
        if (!form.jumlah || Number(form.jumlah) < 1) errors.jumlah = 'Jumlah minimal 1';
        if (!form.harga_beli || Number(form.harga_beli) < 0) errors.harga_beli = 'Harga tidak valid';
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        Swal.fire({
            title: 'Konfirmasi Pembelian',
            html: `Beli <b>${form.jumlah} unit</b> ${selectedProduk?.nama}<br/>Total: <b>${formatCurrency(estimasiTotal)}</b>`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#2563eb',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Simpan',
            cancelButtonText: 'Batal',
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(
                    route('stock.store'),
                    {
                        produk_id: Number(form.produk_id),
                        jumlah: Number(form.jumlah),
                        harga_beli: Number(form.harga_beli),
                        ongkir: Number(form.ongkir),
                        nominal_bayar: Number(form.nominal_bayar),
                        keterangan: form.keterangan,
                        supplier_id: form.supplier_id ? Number(form.supplier_id) : null,
                    },
                    {
                        preserveScroll: true,
                        onSuccess: () => {
                            Swal.fire({
                                icon: 'success',
                                title: 'Berhasil!',
                                text: 'Pembelian stok dicatat.',
                                timer: 1500,
                                showConfirmButton: false,
                            });
                            setForm({ produk_id: '', jumlah: '', harga_beli: '', ongkir: '', nominal_bayar: '', keterangan: '', supplier_id: '' });
                            setFormErrors({});
                            setShowForm(false);
                        },
                        onError: (errs) => {
                            console.log(errs);
                            Swal.fire({ icon: 'error', title: 'Gagal!', text: errs.error || 'Terjadi kesalahan.' });
                        },
                    },
                );
            }
        });
    };

    const [bayar, setBayar] = useState<number | ''>('');
    const [bayarDisplay, setBayarDisplay] = useState('');

    const [beli, setBeli] = useState<number | ''>('');
    const [beliDisplay, setBeliDisplay] = useState('');

    const [ongkir, setOngkir] = useState<number | ''>('');
    const [ongkirDisplay, setOngkirDisplay] = useState('');

    const cleanup = useMobileNavigation();
    const handleLogout = () => {
        cleanup();
        router.flushAll();
        localStorage.removeItem('username');
    };
    const [showLogout, setShowLogout] = useState(false);
    const toggleLogout = () => {
        setShowLogout(!showLogout);
    };

    return (
        <>
            <div className="flex items-center pt-6 pr-6 pl-6">
                <h2 className={`text-xl font-semibold ${text}`}>Rekap Stok Pembelian</h2>
            </div>

            <div className="space-y-4 p-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
                        <p className="text-2xl font-bold text-emerald-500">{totalUnit.toLocaleString('id-ID')}</p>
                    </div>
                </div>
                <div className={`${card} flex justify-between rounded-xl p-4`}>
                    <div className="relative max-w-md">
                        <svg
                            className={`absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 ${subText}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Cari produk atau keterangan..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className={`w-full rounded-lg border py-2 pr-4 pl-10 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500 ${inputCls}`}
                        />
                        {search && (
                            <button onClick={() => setSearch('')} className={`absolute top-1/2 right-3 -translate-y-1/2 ${subText} hover:opacity-80`}>
                                ×
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowForm(true)}
                            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Tambah Pembelian
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className={`${card} relative overflow-hidden rounded-xl pb-20 shadow-sm`}>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className={softBg}>
                                <tr className={`border-b ${borderSoft}`}>
                                    {[
                                        'Produk',
                                        'Supplier',
                                        'Jumlah',
                                        'Harga Beli/Unit',
                                        'Ongkir',
                                        'Total Harga',
                                        'Total Bayar',
                                        'Keterangan',
                                        'Nama User',
                                        'Status',
                                        'Tanggal',
                                    ].map((h) => (
                                        <th key={h} className={`px-5 py-4 text-left text-xs font-semibold tracking-wider uppercase ${subText}`}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {paged.length === 0 ? (
                                    <tr>
                                        <td colSpan={11} className="py-12 text-center">
                                            <svg
                                                className={`mx-auto h-12 w-12 ${subText} mb-3`}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={1.5}
                                                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                                />
                                            </svg>
                                            <p className={`text-sm font-medium ${text}`}>Belum ada data pembelian stok</p>
                                            <p className={`text-xs ${subText} mt-1`}>Klik "Tambah Pembelian" untuk mencatat restok produk.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    paged.map((p) => (
                                        <tr key={p.id} className={`border-b ${borderSoft} ${rowHover} transition-colors`}>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
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
                                                <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                                                    +{p.jumlah}&nbsp;unit
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`text-sm font-medium ${text}`}>{formatCurrency(p.harga_beli)}</span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="text-sm font-bold text-blue-500">{formatCurrency(p.ongkir)}</span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="text-sm font-bold text-blue-500">{formatCurrency(p.total_harga)}</span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="text-sm font-bold text-blue-500">{formatCurrency(p.nominal_bayar)}</span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`text-sm ${subText}`}>{p.keterangan || '-'}</span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`text-sm ${text}`}>{p.user?.nama_user || '-'}</span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={getStatusBadge(p.status)}>{p.status === 'pending' ? 'Belum Lunas' : 'Lunas'}</span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`text-sm ${subText}`}>{formatDate(p.created_at)}</span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {filtered.length > 0 && (
                        <div
                            className={`absolute right-0 bottom-0 left-0 flex flex-col items-center justify-between border-t px-6 py-4 sm:flex-row ${borderSoft} gap-3`}
                        >
                            <div className={`text-sm ${subText}`}>
                                Menampilkan <span className="font-semibold">{startIndex + 1}</span>–<span className="font-semibold">{endIndex}</span>{' '}
                                dari
                                <span className="font-semibold"> {totalItems}</span> data
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    className={`cursor-pointer rounded-lg border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50 ${currentTheme === 'Dark' ? 'border-zinc-700 hover:bg-zinc-800' : 'border-slate-300 hover:bg-slate-50'}`}
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentSafe === 1}
                                >
                                    Prev
                                </button>
                                {pageNumbers.map((p, idx) =>
                                    p === '...' ? (
                                        <span key={`dots-${idx}`} className={`px-2 select-none ${subText}`}>
                                            …
                                        </span>
                                    ) : (
                                        <button
                                            key={p}
                                            onClick={() => setCurrentPage(p as number)}
                                            className={`cursor-pointer rounded-lg border px-3 py-2 text-sm transition-all ${currentSafe === p ? 'border-blue-600 bg-blue-600 text-white' : currentTheme === 'Dark' ? 'border-zinc-700 hover:bg-blue-600 hover:text-white' : 'border-slate-300 hover:bg-blue-600 hover:text-white'}`}
                                        >
                                            {p}
                                        </button>
                                    ),
                                )}
                                <button
                                    className={`cursor-pointer rounded-lg border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50 ${currentTheme === 'Dark' ? 'border-zinc-700 hover:bg-zinc-800' : 'border-slate-300 hover:bg-slate-50'}`}
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={currentSafe === totalPages}
                                >
                                    Next
                                </button>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`text-sm ${subText}`}>Per halaman:</span>
                                <select
                                    value={pageSize}
                                    onChange={(e) => setPageSize(Number(e.target.value))}
                                    className={`rounded-lg border px-2 py-2 text-sm ${currentTheme === 'auto' ? 'border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-800' : currentTheme === 'Dark' ? 'border-zinc-700 bg-zinc-800' : 'border-slate-300 bg-white'}`}
                                >
                                    {[10, 25, 50, 100].map((sz) => (
                                        <option key={sz} value={sz}>
                                            {sz}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Form Tambah Pembelian */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
                    <div className={`${card} ${text} h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl shadow-2xl`}>
                        <div className={`flex items-center justify-between border-b px-6 py-4 ${borderSoft}`}>
                            <h2 className="text-lg font-bold">Tambah Pembelian Stok</h2>
                            <button
                                onClick={() => {
                                    setShowForm(false);
                                    setFormErrors({});
                                }}
                                className={`rounded-lg p-2 ${currentTheme === 'Dark' ? 'hover:bg-zinc-800' : 'hover:bg-slate-100'} transition-colors`}
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4 p-6">
                            <div>
                                <label className={`mb-1 block text-sm font-medium ${text}`}>
                                    Produk <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={form.produk_id}
                                    onChange={(e) => setForm((f) => ({ ...f, produk_id: e.target.value }))}
                                    className={`w-full rounded-lg border px-3 py-2 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500 ${inputCls} ${formErrors.produk_id ? 'border-red-500' : ''}`}
                                >
                                    <option value="">-- Pilih Produk --</option>
                                    {produk.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.nama} (Stok: {p.stok})
                                        </option>
                                    ))}
                                </select>
                                {formErrors.produk_id && <p className="mt-1 text-xs text-red-500">{formErrors.produk_id}</p>}
                                {selectedProduk && (
                                    <p className={`text-xs ${subText} mt-1`}>
                                        Harga jual: {formatCurrency(selectedProduk.harga)} · Stok saat ini: {selectedProduk.stok}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={`mb-1 block text-sm font-medium ${text}`}>
                                        Jumlah <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={form.jumlah}
                                        onChange={(e) => setForm((f) => ({ ...f, jumlah: e.target.value }))}
                                        placeholder="0"
                                        className={`w-full rounded-lg border px-3 py-2 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500 ${inputCls} ${formErrors.jumlah ? 'border-red-500' : ''}`}
                                    />
                                    {formErrors.jumlah && <p className="mt-1 text-xs text-red-500">{formErrors.jumlah}</p>}
                                </div>
                                <div>
                                    <label className={`mb-1 block text-sm font-medium ${text}`}>
                                        Harga Beli/Unit <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={beliDisplay}
                                        onChange={(e) => {
                                            const raw = e.target.value.replace(/\D/g, '');

                                            if (raw === '') {
                                                setForm((f) => ({ ...f, harga_beli: '' }));
                                                setBeliDisplay('');
                                            } else {
                                                const numeric = parseInt(raw, 10);
                                                setForm((f) => ({ ...f, harga_beli: numeric.toString() }));
                                                setBeliDisplay(numeric.toLocaleString('id-ID'));
                                            }
                                        }}
                                        placeholder="0"
                                        className={`w-full rounded-lg border px-3 py-2 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500 ${inputCls} ${formErrors.harga_beli ? 'border-red-500' : ''}`}
                                    />
                                    {formErrors.harga_beli && <p className="mt-1 text-xs text-red-500">{formErrors.harga_beli}</p>}
                                </div>
                                <div className={`col-span-2`}>
                                    <label className={`mb-1 block text-sm font-medium ${text}`}>Ongkir</label>
                                    <input
                                        type="text"
                                        value={ongkirDisplay}
                                        onChange={(e) => {
                                            const raw = e.target.value.replace(/\D/g, '');

                                            if (raw === '') {
                                                setForm((f) => ({ ...f, ongkir: '' }));
                                                setOngkirDisplay('');
                                            } else {
                                                const numeric = parseInt(raw, 10);
                                                setForm((f) => ({ ...f, ongkir: numeric.toString() }));
                                                setOngkirDisplay(numeric.toLocaleString('id-ID'));
                                            }
                                        }}
                                        placeholder="0"
                                        className={`w-full rounded-lg border px-3 py-2 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500 ${inputCls} ${formErrors.harga_beli ? 'border-red-500' : ''}`}
                                    />
                                    {formErrors.ongkir && <p className="mt-1 text-xs text-red-500">{formErrors.ongkir}</p>}
                                </div>
                            </div>

                            {estimasiTotal > 0 && (
                                <>
                                    <div className={`${softBg} flex items-center justify-between rounded-lg px-4 py-3`}>
                                        <span className={`text-sm ${subText}`}>Estimasi Total</span>
                                        <span className="text-base font-bold text-blue-500">{formatCurrency(estimasiTotal)}</span>
                                    </div>
                                    <div>
                                        <label className={`mb-1 block text-sm font-medium ${text}`}>Bayar</label>
                                        <input
                                            type="text"
                                            value={bayarDisplay}
                                            onChange={(e) => {
                                                const raw = e.target.value.replace(/\D/g, '');
                                                if (raw === '') {
                                                    setForm((f) => ({ ...f, nominal_bayar: '' }));
                                                    setBayarDisplay('');
                                                } else {
                                                    const numeric = parseInt(raw, 10);
                                                    setForm((f) => ({ ...f, nominal_bayar: numeric.toString() }));
                                                    setBayarDisplay(numeric.toLocaleString('id-ID')); // tampilan dengan titik
                                                }
                                            }}
                                            placeholder="0"
                                            className={`w-full rounded-lg border px-3 py-2 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500 ${inputCls} ${formErrors.harga_beli ? 'border-red-500' : ''}`}
                                        />
                                    </div>
                                </>
                            )}

                            <div>
                                <label className={`mb-1 block text-sm font-medium ${text}`}>Supplier (Opsional)</label>
                                <select
                                    value={form.supplier_id}
                                    onChange={(e) => setForm((f) => ({ ...f, supplier_id: e.target.value }))}
                                    className={`w-full rounded-lg border px-3 py-2 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500 ${inputCls}`}
                                >
                                    <option value="">-- Pilih Supplier (opsional) --</option>
                                    {suppliers.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.nama_supplier}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className={`mb-1 block text-sm font-medium ${text}`}>Keterangan</label>
                                <input
                                    type="text"
                                    value={form.keterangan}
                                    onChange={(e) => setForm((f) => ({ ...f, keterangan: e.target.value }))}
                                    placeholder="Catatan tambahan..."
                                    className={`w-full rounded-lg border px-3 py-2 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500 ${inputCls}`}
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="submit"
                                    className="flex-1 rounded-lg bg-blue-600 py-2.5 font-semibold text-white transition-colors hover:bg-blue-700"
                                >
                                    Simpan Pembelian
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false);
                                        setFormErrors({});
                                    }}
                                    className={`flex-1 rounded-lg py-2.5 font-semibold transition-colors ${currentTheme === 'Dark' ? 'bg-zinc-700 text-zinc-100 hover:bg-zinc-600' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                                >
                                    Batal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
