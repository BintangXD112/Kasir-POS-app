import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

declare const route: (name: string, params?: any) => string;

interface StokProduk {
    id: number;
    nama: string;
    stok: number;
    harga: number;
    nilai_stok: number;
    jenis_produk: string;
}

type Pengeluaran = {
    id: number;
    keterangan: string;
    total: number;
    created_at: string;
};

interface Props {
    pemasukan_hari_ini: number;
    pengeluaran_hari_ini: number;
    rekap_stok: StokProduk[];
    pemasukan_bulan_ini: number;
    pengeluaran_bulan_ini: number;
    tanggal_hari_ini: string;
    filters: {
        date_from?: string;
        date_to?: string;
        keyword?: string;
    };
    pengeluaran: Pengeluaran[];
    total_pengeluaran: number;
}

const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

export default function RekapPage({
    pemasukan_hari_ini = 0,
    pengeluaran_hari_ini = 0,
    rekap_stok = [],
    pemasukan_bulan_ini = 0,
    pengeluaran_bulan_ini = 0,
    tanggal_hari_ini = '',
    filters = {},
    pengeluaran = [],
    total_pengeluaran = 0,
}: Props) {
    const [currentTheme, setCurrentTheme] = useState(localStorage.getItem('theme') || 'auto');
    const [theme, setTheme] = useState(false);
    const bgApp = currentTheme === 'auto' ? 'bg-gray-50 dark:bg-zinc-950' : currentTheme === 'Light' ? 'bg-gray-50' : 'bg-zinc-950';
    const headerBg =
        currentTheme === 'auto'
            ? 'bg-gray-800 dark:bg-zinc-900/80'
            : currentTheme === 'Light'
              ? 'bg-gray-800' // header tetap gelap biar kontras
              : 'bg-zinc-900/80';
    const cardBg =
        currentTheme === 'auto'
            ? 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800'
            : currentTheme === 'Light'
              ? 'bg-white border border-zinc-200'
              : 'bg-zinc-900 border border-zinc-800';
    const inputCls =
        currentTheme === 'auto'
            ? 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
            : currentTheme === 'Dark'
              ? 'border-zinc-700 bg-zinc-800 text-zinc-100'
              : 'border-zinc-300 bg-white text-zinc-900';
    const contentText = currentTheme === 'auto' ? 'text-zinc-900 dark:text-zinc-100' : currentTheme === 'Light' ? 'text-zinc-900' : 'text-zinc-100';
    const card = currentTheme === 'Dark' ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-zinc-200';
    const text = currentTheme === 'Dark' ? 'text-zinc-100' : 'text-zinc-900';
    const subText = currentTheme === 'Dark' ? 'text-zinc-400' : 'text-zinc-500';
    const softBg = currentTheme === 'Dark' ? 'bg-zinc-800/60' : 'bg-slate-50';
    const rowHover = currentTheme === 'Dark' ? 'hover:bg-zinc-800/60' : 'hover:bg-slate-50';
    const borderSoft = currentTheme === 'Dark' ? 'border-zinc-800' : 'border-slate-200';

    const totalNilaiStok = rekap_stok.reduce((s, p) => s + p.nilai_stok, 0);

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

    const fmtDate = (date: string) => {
        return new Date(date).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    };

    const [dateFrom, setDateFrom] = useState(filters?.date_from || '');
    const [dateTo, setDateTo] = useState(filters?.date_to || '');
    const [keyword, setKeyword] = useState(filters?.keyword || '');

    const applyFilter = () => {
        router.get(
            route('admin.dashboard'),
            {
                date_from: dateFrom,
                date_to: dateTo,
                keyword: keyword,
            },
            { preserveState: true },
        );
    };

    const resetFilter = () => {
        setDateFrom('');
        setDateTo('');
        setKeyword('');

        router.get(route('admin.dashboard'));
    };

    const [showForm, setShowForm] = useState(false);

    const [form, setForm] = useState({
        keterangan: '',
        total_bayar: '',
    });

    const [bayarDisplay, setBayarDisplay] = useState('');
    const [formErrors, setFormErrors] = useState<any>({});

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        router.post(route('pengeluaran.store'), form, {
            onError: (errors) => {
                setFormErrors(errors);
            },
            onSuccess: () => {
                setShowForm(false);
                setForm({
                    keterangan: '',
                    total_bayar: '',
                });
                setBayarDisplay('');
                setFormErrors({});
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil',
                    text: 'Pengeluaran Berhasil Dicatat',
                });
            },
        });
    };

    // ====== ⬇️ STATE & LOGIC PAGINATION  ⬇️ ======
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState<number>(10);
    // Reset ke halaman 1 kalau filter/sort/pageSize berubah
    useEffect(() => {
        setCurrentPage(1);
    }, [pageSize]);
    // ====== ⬆️ STATE & LOGIC PAGINATION  ⬆️ ======
    // ====== ⬇️ DERIVED PAGINATION  ⬇️ ======
    const totalItems = pengeluaran.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const currentSafe = Math.min(Math.max(currentPage, 1), totalPages);
    const startIndex = (currentSafe - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);
    const pagedPengeluaran = pengeluaran.slice(startIndex, endIndex);

    // Buat list nomor halaman (dengan "..." bila banyak)
    const getPageNumbers = (current: number, total: number): (number | '...')[] => {
        if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

        if (current <= 4) return [1, 2, 3, 4, 5, '...', total];
        if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];

        return [1, '...', current - 1, current, current + 1, '...', total];
    };
    const pageNumbers = getPageNumbers(currentSafe, totalPages);
    // ====== ⬆️ DERIVED PAGINATION  ⬆️ ======

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
            {/* Page title + actions */}
            <div className="no-print flex items-center justify-between pt-6 pr-6 pl-6">
                <div>
                    <h2 className={`text-xl font-semibold ${text}`}>Rekap</h2>
                    <p className={`text-sm ${subText} mt-0.5`}>{tanggal_hari_ini}</p>
                </div>
            </div>

            {/* Print title */}
            <div className="hidden p-6 pb-0 print:block">
                <h1 className="text-2xl font-bold">Rekap Harian</h1>
                <p className="text-sm text-gray-500">{tanggal_hari_ini}</p>
            </div>

            <div className="space-y-6 p-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    <div className={`${card} rounded-xl p-5`}>
                        <p className={`text-xs ${subText} mb-1`}>Pemasukan Hari Ini</p>
                        <p className="text-xl font-bold text-emerald-500">{fmt(pemasukan_hari_ini)}</p>
                        <p className={`text-xs ${subText} mt-2`}>Bulan ini: {fmt(pemasukan_bulan_ini)}</p>
                    </div>
                    <div className={`${card} rounded-xl p-5`}>
                        <p className={`text-xs ${subText} mb-1`}>Pengeluaran Hari Ini</p>
                        <p className="text-xl font-bold text-red-500">{fmt(pengeluaran_hari_ini)}</p>
                        <p className={`text-xs ${subText} mt-2`}>Bulan ini: {fmt(pengeluaran_bulan_ini)}</p>
                    </div>
                    <div className={`${card} rounded-xl p-5`}>
                        <p className={`text-xs ${subText} mb-1`}>Nilai Stok Produk</p>
                        <p className="text-xl font-bold text-blue-500">{fmt(totalNilaiStok)}</p>
                        <p className={`text-xs ${subText} mt-2`}>{rekap_stok.length} jenis produk</p>
                    </div>
                </div>

                {/* Rekap Stok Produk */}
                <div className={`${card} overflow-hidden rounded-xl shadow-sm`}>
                    <div className={`border-b px-5 py-4 ${borderSoft}`}>
                        <h3 className={`font-semibold ${text}`}>Rekap Stok Produk</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className={softBg}>
                                <tr className={`border-b ${borderSoft}`}>
                                    {['Produk', 'Jenis', 'Stok', 'Harga Jual', 'Nilai Stok'].map((h) => (
                                        <th key={h} className={`px-5 py-3 text-left text-xs font-semibold tracking-wider uppercase ${subText}`}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {rekap_stok.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className={`py-8 text-center ${subText}`}>
                                            Tidak ada data produk.
                                        </td>
                                    </tr>
                                ) : (
                                    rekap_stok.map((p) => (
                                        <tr key={p.id} className={`border-b ${borderSoft} ${rowHover} transition-colors`}>
                                            <td className={`px-5 py-3 font-medium ${text}`}>{p.nama}</td>
                                            <td className={`px-5 py-3 text-sm ${subText}`}>{p.jenis_produk}</td>
                                            <td className="px-5 py-3">
                                                <span
                                                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${p.stok <= 5 ? 'bg-red-100 text-red-700' : p.stok <= 20 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}
                                                >
                                                    {p.stok} unit
                                                </span>
                                            </td>
                                            <td className={`px-5 py-3 text-sm ${text}`}>{fmt(p.harga)}</td>
                                            <td className="px-5 py-3 text-sm font-bold text-blue-500">{fmt(p.nilai_stok)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                            {rekap_stok.length > 0 && (
                                <tfoot className={softBg}>
                                    <tr className={`border-t ${borderSoft}`}>
                                        <td colSpan={4} className={`px-5 py-3 text-sm font-semibold ${text}`}>
                                            Total Nilai Stok
                                        </td>
                                        <td className="px-5 py-3 text-sm font-bold text-blue-500">{fmt(totalNilaiStok)}</td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                </div>
                <div className={`${card} no-print rounded-xl p-4`}>
                    <p className={`mb-3 text-sm font-semibold ${text}`}>Filter Pengeluaran</p>

                    <div className="flex flex-wrap items-end gap-3">
                        <div>
                            <label className={`mb-1 block text-xs font-medium ${subText}`}>Dari Tanggal</label>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className={`rounded-lg border px-3 py-2 text-sm ${inputCls}`}
                            />
                        </div>

                        <div>
                            <label className={`mb-1 block text-xs font-medium ${subText}`}>Sampai Tanggal</label>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className={`rounded-lg border px-3 py-2 text-sm ${inputCls}`}
                            />
                        </div>

                        <div>
                            <label className={`mb-1 block text-xs font-medium ${subText}`}>Cari Keterangan</label>
                            <input
                                type="text"
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                placeholder="Cari..."
                                className={`rounded-lg border px-3 py-2 text-sm ${inputCls}`}
                            />
                        </div>

                        <button onClick={applyFilter} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                            Filter
                        </button>

                        <button
                            onClick={resetFilter}
                            className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                                currentTheme === 'Dark' ? 'bg-zinc-700 text-zinc-100' : 'bg-slate-200 text-slate-700'
                            }`}
                        >
                            Reset
                        </button>
                        <button
                            onClick={() =>
                                window.open(
                                    route('pengeluaran.export', {
                                        date_from: dateFrom,
                                        date_to: dateTo,
                                        keyword: keyword,
                                    }),
                                )
                            }
                            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                                />
                            </svg>
                            Export PDF
                        </button>
                    </div>
                </div>
                <div className={`${card} relative overflow-hidden rounded-xl pb-20 shadow-sm`}>
                    <div className={`flex justify-between border-b px-5 py-4 ${borderSoft}`}>
                        <h3 className={`font-semibold ${text}`}>Rekap Pengeluaran</h3>
                        <button
                            onClick={() => setShowForm(true)}
                            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke-width="1.5"
                                stroke="currentColor"
                                className="size-5"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                                />
                            </svg>
                            Catat Pengeluaran
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className={softBg}>
                                <tr className={`border-b ${borderSoft}`}>
                                    {['Tanggal', 'Keterangan', 'Total Bayar'].map((h) => (
                                        <th key={h} className={`px-5 py-3 text-left text-xs font-semibold uppercase ${subText}`}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {pengeluaran.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className={`py-10 text-center ${subText}`}>
                                            Tidak ada data pengeluaran
                                        </td>
                                    </tr>
                                ) : (
                                    pagedPengeluaran.map((p) => (
                                        <tr key={p.id} className={`border-b ${borderSoft} ${rowHover}`}>
                                            <td className={`px-5 py-3 text-sm ${subText}`}>{fmtDate(p.created_at)}</td>

                                            <td className={`px-5 py-3 ${text}`}>{p.keterangan}</td>

                                            <td className="px-5 py-3 font-bold text-red-500">{fmt(p.total)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* ====== ⬇️ KONTROL PAGINATION  ⬇️ ====== */}
                    {pengeluaran.length > 0 && (
                        <div
                            className={`absolute right-0 bottom-0 left-0 flex flex-col items-center justify-between border-t px-6 py-4 sm:flex-row ${borderSoft} gap-3`}
                        >
                            <div className={`text-sm ${subText}`}>
                                Menampilkan <span className="font-semibold">{startIndex + 1}</span>–<span className="font-semibold">{endIndex}</span>{' '}
                                dari
                                <span className="font-semibold"> {totalItems}</span> transaksi
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    className={`cursor-pointer rounded-lg border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50 ${currentTheme === 'Dark' ? 'border-zinc-700 hover:bg-zinc-800' : 'border-slate-300 hover:bg-slate-50'}`}
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentSafe === 1}
                                    aria-label="Halaman sebelumnya"
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
                                            aria-current={currentSafe === p ? 'page' : undefined}
                                            className={`cursor-pointer rounded-lg border px-3 py-2 text-sm transition-all ${
                                                currentSafe === p
                                                    ? 'border-blue-600 bg-blue-600 text-white hover:bg-blue-600/90'
                                                    : currentTheme === 'Dark'
                                                      ? 'border-zinc-700 hover:bg-blue-600 hover:text-white'
                                                      : 'border-slate-300 hover:bg-blue-600 hover:text-white'
                                            }`}
                                        >
                                            {p}
                                        </button>
                                    ),
                                )}
                                <button
                                    className={`cursor-pointer rounded-lg border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50 ${currentTheme === 'Dark' ? 'border-zinc-700 hover:bg-zinc-800' : 'border-slate-300 hover:bg-slate-50'}`}
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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
                                    className={`rounded-lg border px-2 py-2 text-sm ${
                                        currentTheme === 'auto'
                                            ? 'border-zinc-300 bg-zinc-50 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100'
                                            : currentTheme === 'Light'
                                              ? 'border-zinc-300 bg-zinc-50 text-zinc-900'
                                              : 'border-zinc-700 bg-zinc-800 text-zinc-100'
                                    }`}
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
                    {/* ====== ⬆️ KONTROL PAGINATION ⬆️ ====== */}
                </div>
            </div>
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
                    <div className={`${card} ${text} w-full max-w-md rounded-2xl shadow-2xl`}>
                        <div className={`flex items-center justify-between border-b px-6 py-4 ${borderSoft}`}>
                            <h2 className="text-lg font-bold">Catat Pengeluaran</h2>
                            <button
                                onClick={() => {
                                    setShowForm(false);
                                    setFormErrors({});
                                }}
                                className={`rounded-lg p-2 ${currentTheme === 'Dark' ? 'hover:bg-zinc-800' : 'hover:bg-slate-100'}`}
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4 p-6">
                            <div>
                                <label className={`mb-1 block text-sm font-medium ${text}`}>
                                    Keterangan <span className="text-red-500">*</span>
                                </label>

                                <input
                                    type="text"
                                    value={form.keterangan}
                                    onChange={(e) => setForm((f) => ({ ...f, keterangan: e.target.value }))}
                                    placeholder="Contoh: Beli ATK"
                                    className={`w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500 ${inputCls} ${formErrors.keterangan ? 'border-red-500' : ''}`}
                                />

                                {formErrors.keterangan && <p className="mt-1 text-xs text-red-500">{formErrors.keterangan}</p>}
                            </div>

                            <div>
                                <label className={`mb-1 block text-sm font-medium ${text}`}>
                                    Total Bayar <span className="text-red-500">*</span>
                                </label>

                                <input
                                    type="text"
                                    value={bayarDisplay}
                                    onChange={(e) => {
                                        const raw = e.target.value.replace(/\D/g, '');

                                        if (raw === '') {
                                            setForm((f) => ({ ...f, total_bayar: '' }));
                                            setBayarDisplay('');
                                        } else {
                                            const numeric = parseInt(raw, 10);
                                            setForm((f) => ({ ...f, total_bayar: numeric.toString() }));
                                            setBayarDisplay(numeric.toLocaleString('id-ID'));
                                        }
                                    }}
                                    placeholder="0"
                                    className={`w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500 ${inputCls} ${formErrors.total_bayar ? 'border-red-500' : ''}`}
                                />

                                {formErrors.total_bayar && <p className="mt-1 text-xs text-red-500">{formErrors.total_bayar}</p>}
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="submit" className="flex-1 rounded-lg bg-blue-600 py-2.5 font-semibold text-white hover:bg-blue-700">
                                    Simpan
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false);
                                        setFormErrors({});
                                    }}
                                    className={`flex-1 rounded-lg py-2.5 font-semibold ${
                                        currentTheme === 'Dark'
                                            ? 'bg-zinc-700 text-zinc-100 hover:bg-zinc-600'
                                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                                    }`}
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
