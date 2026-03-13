import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { Link, router } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

declare const route: (name: string, params?: any) => string;

interface Member {
    id: number;
    nama: string;
    telepon: string;
}
interface Produk {
    id: number;
    nama: string;
    harga: number;
}
interface Detail {
    id: number;
    produk: Produk;
    qty: number;
    subtotal: number;
}
interface Transaksi {
    id: number;
    member: Member | null;
    detail: Detail[];
    total: number;
    status: string;
    created_at: string;
}

interface DetailTabungan {
    id: number;
    nama_member: string;
    nominal: number;
    keterangan: string;
    tanggal: string;
}

type DataItem = Transaksi | DetailTabungan;
type Type = 'transaksi' | 'tabungan' 

interface Props {
    data: DataItem[];
    members: {
        telepon: any;
        id: number;
        nama: string;
    }[];
    total_pemasukan: number;
    total_transaksi: number;
    filters: { date_from?: string; date_to?: string; member_id?: string; type?:Type; };
}

const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function LaporanTransaksiMember({ data = [], members = [], total_pemasukan = 0, total_transaksi = 0, filters = {} }: Props) {
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [type, setType] = useState<Type>(filters.type || 'transaksi');
    const [currentTheme, setCurrentTheme] = useState(localStorage.getItem('theme') || 'auto');
    const [theme, setTheme] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMemberId, setSelectedMemberId] = useState(filters.member_id || '');
    const [appliedType, setAppliedType] = useState<Type>(filters.type || 'transaksi');

    // ====== ⬇️ STATE & LOGIC PAGINATION  ⬇️ ======
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState<number>(12);
    // Reset ke halaman 1 kalau filter/sort/pageSize berubah
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, pageSize]);
    // ====== ⬆️ STATE & LOGIC PAGINATION  ⬆️ ======

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
    const contentText = currentTheme === 'auto' ? 'text-zinc-900 dark:text-zinc-100' : currentTheme === 'Light' ? 'text-zinc-900' : 'text-zinc-100';
    const card = currentTheme === 'Dark' ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-zinc-200';
    const text = currentTheme === 'Dark' ? 'text-zinc-100' : 'text-zinc-900';
    const subText = currentTheme === 'Dark' ? 'text-zinc-400' : 'text-zinc-500';
    const softBg = currentTheme === 'Dark' ? 'bg-zinc-800/60' : 'bg-slate-50';
    const rowHover = currentTheme === 'Dark' ? 'hover:bg-zinc-800/60' : 'hover:bg-slate-50';
    const borderSoft = currentTheme === 'Dark' ? 'border-zinc-800' : 'border-slate-200';
    const inputCls = currentTheme === 'Dark' ? 'border-zinc-700 bg-zinc-800 text-zinc-100' : 'border-zinc-300 bg-white text-zinc-900';

    const applyFilter = () => {
        setAppliedType(type);
        router.get(route('admin.dashboard'),{
            date_from: dateFrom,
            date_to: dateTo,
            member_id: selectedMemberId,
            type: type
        })
    }

    const resetFilter = () => {
        setDateFrom('');
        setDateTo('');
        setSelectedMemberId('');
        router.get(route('admin.dashboard'), {}, { preserveScroll: true });
    };

    const filtered = useMemo(() => {
        if (selectedMemberId) {
            return members.filter((m) => m.id === Number(selectedMemberId));
        }

        if (searchTerm) {
            return members.filter(
                (m) => m.nama.toLowerCase().includes(searchTerm.toLowerCase()) || m.telepon.toLowerCase().includes(searchTerm.toLowerCase()),
            );
        }

        return [];
    }, [members, searchTerm, selectedMemberId]);

    // ====== ⬇️ DERIVED PAGINATION  ⬇️ ======
    const totalItems = data.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const currentSafe = Math.min(Math.max(currentPage, 1), totalPages);
    const startIndex = (currentSafe - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);
    const pagedData = data.slice(startIndex, endIndex);

    // Buat list nomor halaman (dengan "..." bila banyak)
    const getPageNumbers = (current: number, total: number): (number | '...')[] => {
        if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

        if (current <= 4) return [1, 2, 3, 4, 5, '...', total];
        if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];

        return [1, '...', current - 1, current, current + 1, '...', total];
    };
    const pageNumbers = getPageNumbers(currentSafe, totalPages);
    // ====== ⬆️ DERIVED PAGINATION  ⬆️ ======
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
            {/* Page header */}
            <div className="no-print flex items-center justify-between pt-6 pr-6 pl-6">
                <div>
                    <h2 className={`text-xl font-semibold ${text}`}>Laporan Transaksi</h2>
                    <p className={`text-sm ${subText} mt-0.5`}>Riwayat transaksi</p>
                </div>
            </div>

            <div className="space-y-4 p-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className={`${card} rounded-xl p-5`}>
                        <p className={`text-sm ${subText} mb-1`}>Total Transaksi</p>
                        <p className="text-2xl font-bold text-blue-500">{total_transaksi}</p>
                    </div>
                    <div className={`${card} rounded-xl p-5`}>
                        <p className={`text-sm ${subText} mb-1`}>Pemasukan Bulan ini (Lunas)</p>
                        <p className="text-2xl font-bold text-emerald-500">{fmt(total_pemasukan)}</p>
                    </div>
                    <div className={`${card} rounded-xl p-5`}>
                        <p className={`text-sm ${subText} mb-1`}>Jumlah Member</p>
                        <p className="text-2xl font-bold text-purple-500">{members.length}</p>
                    </div>
                </div>

                {/* Filter */}
                <div className={`${card} no-print rounded-xl p-4`}>
                    <div className="flex flex-wrap items-end gap-3">
                        <div>
                            <label className={`mb-1 block text-xs font-medium ${subText}`}>Dari Tanggal</label>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className={`rounded-lg border px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 ${inputCls}`}
                            />
                        </div>
                        <div>
                            <label className={`mb-1 block text-xs font-medium ${subText}`}>Sampai Tanggal</label>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className={`rounded-lg border px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 ${inputCls}`}
                            />
                        </div>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Cari nama member..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setSelectedMemberId('');
                                }}
                                className={`w-fit rounded-lg border px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 ${inputCls}`}
                            />

                            {/* CLEAR */}
                            {searchTerm && (
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                        setSelectedMemberId('');
                                    }}
                                    className={`absolute top-1/2 right-3 -translate-y-1/2 ${subText}`}
                                >
                                    ×
                                </button>
                            )}

                            {/* AUTOCOMPLETE */}
                            {searchTerm && !selectedMemberId && (
                                <div className="absolute z-10 mt-1 max-h-60 overflow-auto rounded-lg border bg-white shadow dark:bg-zinc-800">
                                    {filtered.length > 0 ? (
                                        filtered.slice(0, 5).map((m) => (
                                            <div
                                                key={m.id}
                                                onClick={() => {
                                                    setSelectedMemberId(String(m.id));
                                                    setSearchTerm(m.nama);
                                                }}
                                                className="cursor-pointer px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-zinc-700"
                                            >
                                                <p className="font-medium">{m.nama}</p>
                                                <p className="text-xs text-gray-500">{m.telepon}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="px-4 py-2 text-sm text-gray-500">Tidak ada Member</div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div>
                            <label className={`mb-1 block text-xs font-medium ${subText}`}>Jenis Data</label>

                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className={`rounded-lg border px-3 py-2 text-sm ${inputCls}`}
                            >
                                <option value="transaksi">Transaksi</option>
                                <option value="tabungan">Tabungan</option>
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
                                    route('laporan.member.export', {
                                        date_from: dateFrom,
                                        date_to: dateTo,
                                        member_id: selectedMemberId,
                                    }),
                                )
                            }
                            className="flex items-center justify-end gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
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

                {/* Table */}
                <div className={`${card} relative overflow-hidden rounded-xl pb-20 shadow-sm`}>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className={softBg}>
                                <tr className={`border-b ${borderSoft}`}>
                                    {(
                                        appliedType === 'transaksi'
                                            ? ['Tanggal', 'Member', 'Produk', 'Total', 'Status']
                                            : ['Tanggal', 'Member', 'Nominal', 'Keterangan']
                                    ).map((h) => (
                                        <th key={h} className={`px-5 py-4 text-left text-xs font-semibold uppercase ${subText}`}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {data.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className={`py-12 text-center ${subText}`}>
                                            Tidak ada data.
                                        </td>
                                    </tr>
                                ) : (
                                    pagedData.map((item) => (
                                        <tr key={item.id} className={`border-b ${borderSoft} ${rowHover}`}>
                                            
                                            <td className={`px-5 py-4 text-sm ${subText}`}>                                    
                                                {appliedType === 'transaksi'
                                                    ? fmtDate((item as Transaksi).created_at)
                                                    : fmtDate((item as DetailTabungan).tanggal)
                                                }
                                            </td>

                                            <td className={`px-5 py-4 font-medium ${text}`}>
                                                {appliedType === 'transaksi'
                                                    ? (item as Transaksi).member?.nama ?? '-'
                                                    : (item as DetailTabungan).nama_member ?? '-'
                                                }
                                            </td>

                                            {appliedType === 'transaksi' ? (
                                                <>
                                                    <td className={`px-5 py-4 text-sm ${subText}`}>
                                                        {(item as Transaksi).detail
                                                            ?.map((d) => `${d.produk?.nama} (${d.qty}x)`)
                                                            .join(', ') || '-'}
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <span className="text-sm font-bold text-blue-500">
                                                            {fmt((item as Transaksi).total)}
                                                        </span>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <span
                                                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                                (item as Transaksi).status === 'lunas'
                                                                    ? 'bg-emerald-100 text-emerald-700'
                                                                    : 'bg-amber-100 text-amber-700'
                                                            }`}
                                                        >
                                                            {(item as Transaksi).status}
                                                        </span>
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td className="px-5 py-4">
                                                        <span className="text-sm font-bold text-blue-500">
                                                            {fmt(Number((item as DetailTabungan).nominal || 0))}
                                                        </span>
                                                    </td>

                                                    <td className={`px-5 py-4 text-sm ${subText}`}>
                                                        {(item as DetailTabungan).keterangan}
                                                    </td>
                                                </>
                                            )}
                                        </tr>
                                    ))
                                )}
                                </tbody>
                        </table>
                    </div>
                    {/* ====== ⬇️ KONTROL PAGINATION  ⬇️ ====== */}
                    {data.length >= 0 && (
                        <div
                            className={`flex flex-col items-center justify-between border-t px-6 py-4 sm:flex-row ${borderSoft} absolute right-0 bottom-0 left-0 gap-3`}
                        >
                            <div className={`text-sm ${subText}`}>
                                Menampilkan <span className="font-semibold">{startIndex + 1}</span>–<span className="font-semibold">{endIndex}</span>{' '}
                                dari
                                <span className="font-semibold"> {totalItems}</span> Produk
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
                                            ? 'border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-800'
                                            : currentTheme === 'Dark'
                                              ? 'border-zinc-700 bg-zinc-800'
                                              : 'border-slate-300 bg-white'
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
