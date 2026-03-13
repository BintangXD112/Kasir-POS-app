import MenuBar from '@/components/menu-bar';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { Button } from '@/components/ui/button';
import { Link, router } from '@inertiajs/react';
import { LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

declare const route: (name: string, params?: any) => string;

interface Supplier {
    id: number;
    nama_supplier: string;
}
interface Produk {
    id: number;
    nama: string;
}
interface User {
    id: number;
    nama_user: string;
}

type Status = 'lunas' | 'pending';

interface Pembelian {
    id: number;
    supplier: Supplier | null;
    produk: Produk | null;
    user: User | null;
    jumlah: number;
    harga_beli: number;
    total_harga: number;
    nominal_bayar: number;
    keterangan: string | null;
    status: string;
    created_at: string;
}

interface RekapSupplier {
    supplier_id: number;
    nama_supplier: string;
    jumlah_order: number;
    total_harga: number;
}

interface Props {
    pembelian: Pembelian[];
    suppliers: Supplier[];
    total_pengeluaran: number;
    rekap_per_supplier: RekapSupplier[];
    filters: { status?: Status; date_from?: string; date_to?: string; supplier_id?: string };
}

const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

const fmtDate = (d: string) => new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

export default function LaporanKeuanganSupplier({
    pembelian = [],
    suppliers = [],
    total_pengeluaran = 0,
    rekap_per_supplier = [],
    filters = {},
}: Props) {
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [supplierId, setSupplierId] = useState(filters.supplier_id || '');
    const [status, setStatus] = useState(filters.status || '');
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

    const handleLunas = (id: number, supplier: string, totalTrx: number) => {
        Swal.fire({
            title: 'Bayar Hutang',
            html: `
            <p class="text-sm mb-3">Hutang <b>${supplier}</b></p>
            <p class="text-sm mb-2">Total tagihan: <b>${fmt(totalTrx)}</b></p>
            <label class="block text-sm text-left mb-1 font-medium">Nominal Pembayaran (Rp)</label>
            <input id="swal-nominal" type="number" min="0"
              class="swal2-input" placeholder="Masukkan nominal pembayaran" style="width:90%"/>
            <p id="swal-kembalian" class="text-sm mt-2 text-emerald-600 font-medium"></p>
          `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#059669',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Bayar',
            cancelButtonText: 'Batal',
            didOpen: () => {
                const input = document.getElementById('swal-nominal') as HTMLInputElement;
                const kembalian = document.getElementById('swal-kembalian')!;
                input?.addEventListener('input', () => {
                    const val = Number(input.value);
                    const selisih = val - totalTrx;
                    if (val >= totalTrx) {
                        kembalian.textContent = `Kembalian: ${fmt(selisih)}`;
                        kembalian.className = 'text-sm mt-2 text-emerald-600 font-medium';
                    } else if (val > 0) {
                        kembalian.textContent = `Kurang: ${fmt(-selisih)}`;
                        kembalian.className = 'text-sm mt-2 text-red-500 font-medium';
                    } else {
                        kembalian.textContent = '';
                    }
                });
            },
            preConfirm: () => {
                const val = Number((document.getElementById('swal-nominal') as HTMLInputElement)?.value);
                if (!val || val < 0) {
                    Swal.showValidationMessage('Masukkan nominal yang valid');
                    return false;
                }
                return val;
            },
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(
                    route('hutang.supplier', id),
                    { nominal_bayar: result.value },
                    {
                        preserveScroll: true,
                        onSuccess: () =>
                            Swal.fire({
                                icon: 'success',
                                title: 'Berhasil!',
                                html: `Hutang dibayar.<br/>Nominal: <b>${fmt(result.value)}</b>`,
                                timer: 2000,
                                showConfirmButton: false,
                            }),
                        onError: () => Swal.fire({ icon: 'error', title: 'Gagal!', text: 'Terjadi kesalahan.' }),
                    },
                );
            }
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
    const totalItems = pembelian.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const currentSafe = Math.min(Math.max(currentPage, 1), totalPages);
    const startIndex = (currentSafe - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);
    const pagedPembelian = pembelian.slice(startIndex, endIndex);

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

    const getStatusBadge = (status: string) => {
        const base = 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border';
        const theme = currentTheme;
        const map: Record<string, string> = {
            lunas: `${base} ${theme === 'auto' ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800' : theme === 'Light' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-emerald-900/30 text-emerald-300 border-emerald-800'}`,
            pending: `${base} ${theme === 'auto' ? 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800' : theme === 'Light' ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-amber-900/30 text-amber-300 border-amber-800'}`,
            cancelled: `${base} ${theme === 'auto' ? 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800' : theme === 'Light' ? 'bg-red-100 text-red-800 border-red-200' : 'bg-red-900/30 text-red-300 border-red-800'}`,
        };
        return map[status] || `${base} bg-gray-100 text-gray-800 border-gray-200 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700`;
    };

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

    const inputTheme =
        currentTheme === 'auto'
            ? 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
            : currentTheme === 'Dark'
              ? 'border-zinc-700 bg-zinc-800 text-zinc-100'
              : 'border-slate-300 bg-white text-zinc-900';
    const contentText = currentTheme === 'auto' ? 'text-zinc-900 dark:text-zinc-100' : currentTheme === 'Light' ? 'text-zinc-900' : 'text-zinc-100';
    const card = currentTheme === 'Dark' ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-zinc-200';
    const text = currentTheme === 'Dark' ? 'text-zinc-100' : 'text-zinc-900';
    const subText = currentTheme === 'Dark' ? 'text-zinc-400' : 'text-zinc-500';
    const softBg = currentTheme === 'Dark' ? 'bg-zinc-800/60' : 'bg-slate-50';
    const rowHover = currentTheme === 'Dark' ? 'hover:bg-zinc-800/60' : 'hover:bg-slate-50';
    const borderSoft = currentTheme === 'Dark' ? 'border-zinc-800' : 'border-slate-200';
    const inputCls = currentTheme === 'Dark' ? 'border-zinc-700 bg-zinc-800 text-zinc-100' : 'border-zinc-300 bg-white text-zinc-900';

    const applyFilter = () => {
        router.get(
            route('admin.dashboard'),
            { date_from: dateFrom, date_to: dateTo, supplier_id: supplierId, status: status },
            { preserveScroll: true },
        );
    };

    const resetFilter = () => {
        setDateFrom('');
        setDateTo('');
        setSupplierId('');
        setStatus('');
        router.get(route('admin.dashboard'), {}, { preserveScroll: true });
    };
    return (
        <>
            {/* Page header */}
            <div className="no-print flex items-center justify-between pt-6 pr-6 pl-6">
                <div>
                    <h2 className={`text-xl font-semibold ${text}`}>Laporan Keuangan Supplier</h2>
                    <p className={`text-sm ${subText} mt-0.5`}>Rekap pembelian stok per supplier</p>
                </div>
            </div>
            <div className="space-y-4 p-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className={`${card} rounded-xl p-5`}>
                        <p className={`text-sm ${subText} mb-1`}>Total Pengeluaran</p>
                        <p className="text-2xl font-bold text-red-500">{fmt(total_pengeluaran)}</p>
                    </div>
                    <div className={`${card} rounded-xl p-5`}>
                        <p className={`text-sm ${subText} mb-1`}>Jumlah Transaksi</p>
                        <p className="text-2xl font-bold text-blue-500">{pembelian.length}</p>
                    </div>
                    <div className={`${card} rounded-xl p-5`}>
                        <p className={`text-sm ${subText} mb-1`}>Jumlah Supplier</p>
                        <p className="text-2xl font-bold text-purple-500">{rekap_per_supplier.length}</p>
                    </div>
                </div>
                {/* Rekap per Supplier */}
                {rekap_per_supplier.length > 0 && (
                    <div className={`${card} overflow-hidden rounded-xl shadow-sm`}>
                        <div className={`border-b px-5 py-4 ${borderSoft}`}>
                            <h3 className={`font-semibold ${text}`}>Rekap per Supplier</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className={softBg}>
                                    <tr className={`border-b ${borderSoft}`}>
                                        {['Supplier', 'Jumlah Order', 'Total Pengeluaran'].map((h) => (
                                            <th key={h} className={`px-5 py-3 text-left text-xs font-semibold tracking-wider uppercase ${subText}`}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {rekap_per_supplier.map((rs) => (
                                        <tr key={rs.supplier_id} className={`border-b ${borderSoft} ${rowHover} transition-colors`}>
                                            <td className={`px-5 py-3 font-medium ${text}`}>{rs.nama_supplier}</td>
                                            <td className="px-5 py-3">
                                                <span className="inline-flex rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                                                    {rs.jumlah_order}x
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-sm font-bold text-red-500">{fmt(rs.total_harga)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                {/* Filter */}
                <div className={`${card} no-print rounded-xl p-4`}>
                    <p className={`mb-3 text-sm font-semibold ${text}`}>Filter Detail Transaksi</p>
                    <div className="flex flex-wrap items-end gap-3">
                        <div>
                            <label className={`mb-1 block text-xs font-medium ${subText}`}>Dari Tanggal</label>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className={`rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 ${inputCls}`}
                            />
                        </div>
                        <div>
                            <label className={`mb-1 block text-xs font-medium ${subText}`}>Sampai Tanggal</label>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className={`rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 ${inputCls}`}
                            />
                        </div>
                        <div>
                            <label className={`mb-1 block text-xs font-medium ${subText}`}>Supplier</label>
                            <select
                                value={supplierId}
                                onChange={(e) => setSupplierId(e.target.value)}
                                className={`rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 ${inputCls}`}
                            >
                                <option value="">-- Semua Supplier --</option>
                                {suppliers.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.nama_supplier}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className={`mb-1 block text-xs font-medium ${subText}`}>Status</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className={`rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 ${inputCls}`}
                            >
                                <option value="">-- Semua Status --</option>
                                <option value={'lunas'}>Lunas</option>
                                <option value={'pending'}>Belum Lunas</option>
                            </select>
                        </div>
                        <button
                            onClick={applyFilter}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                        >
                            Filter
                        </button>
                        <button
                            onClick={resetFilter}
                            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${currentTheme === 'Dark' ? 'bg-zinc-700 text-zinc-100 hover:bg-zinc-600' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                        >
                            Reset
                        </button>
                        <button
                            onClick={() =>
                                window.open(
                                    route('laporan.supplier.export', {
                                        date_from: dateFrom,
                                        date_to: dateTo,
                                        supplier_id: supplierId,
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
                            Export XLS
                        </button>
                    </div>
                </div>
                {/* Detail Table */}
                <div className={`${card} relative overflow-hidden rounded-xl pb-20 shadow-sm`}>
                    <div className={`border-b px-5 py-4 ${borderSoft}`}>
                        <h3 className={`font-semibold ${text}`}>Detail Transaksi</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className={softBg}>
                                <tr className={`border-b ${borderSoft}`}>
                                    {['Tanggal', 'Supplier', 'Produk', 'Jumlah', 'Harga Beli/Unit', 'Total', 'Status', 'Aksi'].map((h) => (
                                        <th key={h} className={`px-5 py-3 text-xs font-semibold tracking-wider uppercase ${subText} ${h === 'Aksi' ? 'text-center' : 'text-left'}`}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {pembelian.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className={`py-10 text-center ${subText}`}>
                                            Tidak ada data pembelian dari supplier.
                                        </td>
                                    </tr>
                                ) : (
                                    pagedPembelian.map((p) => (
                                        <tr key={p.id} className={`border-b ${borderSoft} ${rowHover} transition-colors`}>
                                            <td className={`px-5 py-3 text-sm ${subText}`}>{fmtDate(p.created_at)}</td>
                                            <td className={`px-5 py-3 font-medium ${text}`}>{p.supplier?.nama_supplier ?? '-'}</td>
                                            <td className={`px-5 py-3 text-sm ${text}`}>{p.produk?.nama ?? '-'}</td>
                                            <td className="px-5 py-3">
                                                <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700">
                                                    {p.jumlah} unit
                                                </span>
                                            </td>
                                            <td className={`px-5 py-3 text-sm ${text}`}>{fmt(p.harga_beli)}</td>
                                            <td className="px-5 py-3 text-sm font-bold text-red-500">{fmt(p.total_harga)}</td>
                                            <td className="px-5 py-3">
                                                <span className={getStatusBadge(p.status)}>{p.status === 'pending' ? 'Belum Lunas' : 'Lunas'}</span>
                                            </td>
                                            <td className="px-5 py-3 flex justify-center">
                                                {p.status === 'pending' ? (
                                                    <Button
                                                        onClick={() =>
                                                            handleLunas(
                                                                p.id,
                                                                p.supplier?.nama_supplier ?? '-',
                                                                p.total_harga - (p.nominal_bayar ?? 0),
                                                            )
                                                        }
                                                        className="bg-orange-500 text-white hover:bg-orange-600"
                                                        variant={`default`}
                                                    >
                                                        Bayar
                                                    </Button>
                                                ): '-'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* ====== ⬇️ KONTROL PAGINATION  ⬇️ ====== */}
                    {pembelian.length > 0 && (
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
        </>
    );
}
