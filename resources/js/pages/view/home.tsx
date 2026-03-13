import CountUp from '@/components/count-up';
import LiveClock from '@/components/live-clock';
import { useEffect, useMemo, useState } from 'react';
import { type PageProps } from '../types/index';

type StatusPersentase = 'naik' | 'turun' | 'tetap';

interface Member {
    id: number;
    nama: string;
}

interface Supplier {
    id: number;
    nama: string;
}

interface DetailTransaksi {
    id: number;
    produk: Produk;
    qty: number;
    harga: number;
}

type Jenis = 'masuk' | 'keluar';

interface Transaksi {
    id: number;
    kode_transaksi: string;
    jenis: Jenis;
    member: Member | null;
    supplier: Supplier | null;
    total: number;
    metode_pembayaran: string;
    status: string;
    created_at: string | null;
    waktu_bayar: string | null;
    detail: DetailTransaksi[];
}

interface DashboardProps extends PageProps {
    total_pemasukan_bulan_ini: number;
    persentasePemasukan: number;
    statusPemasukan: StatusPersentase;
    total_pengeluaran_bulan_ini: number;
    persentasePengeluaran: number;
    statusPengeluaran: StatusPersentase;
    total_bayar_supp_bulan_ini: number;
    persentaseBayarSupp: number;
    statusBayarSupp: number;
    penjualanKedelai: number;
    penjualanGaram: number;
    penjualanKunyit: number;
    stockKedelai: number;
    stockGaram: number;
    stockKunyit: number;
    transaksi: Transaksi[];
}

export default function Home({
    total_pemasukan_bulan_ini,
    persentasePemasukan,
    statusPemasukan,
    total_pengeluaran_bulan_ini,
    persentasePengeluaran,
    statusPengeluaran,
    total_bayar_supp_bulan_ini,
    persentaseBayarSupp,
    statusBayarSupp,
    penjualanKedelai,
    penjualanGaram,
    penjualanKunyit,
    stockKedelai,
    stockGaram,
    stockKunyit,
    transaksi,
}: DashboardProps) {
    // ===== helper kelas tema (selaras dengan Login) =====
    const [currentTheme, setCurrentTheme] = useState(localStorage.getItem('theme') || 'auto');
    const [theme, setTheme] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [jenisFilter, setJenisFilter] = useState('masuk');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // ====== ⬇️ STATE & LOGIC PAGINATION  ⬇️ ======
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState<number>(10);
    // Reset ke halaman 1 kalau filter/sort/pageSize berubah
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, sortBy, sortOrder, pageSize]);
    // ====== ⬆️ STATE & LOGIC PAGINATION  ⬆️ ======

    const filteredTransaksi = useMemo(() => {
        const filtered = transaksi.filter((trx) => {
            const matchesSearch =
                searchTerm === '' ||
                [trx.kode_transaksi, trx.member?.nama, trx.supplier?.nama]
                    .filter(Boolean)
                    .some((value) => value!.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesStatus = statusFilter === 'all' || trx.status === statusFilter;
            const matchesJenis = trx.jenis === jenisFilter;
            return matchesSearch && matchesStatus && matchesJenis;
        });

        const sorted = filtered.sort((a, b) => {
            let aValue: any = a[sortBy as keyof Transaksi];
            let bValue: any = b[sortBy as keyof Transaksi];

            if (sortBy === 'total') {
                aValue = a.total;
                bValue = b.total;
            } else if (sortBy === 'created_at') {
                aValue = new Date(a.created_at || '').getTime();
                bValue = new Date(b.created_at || '').getTime();
            }

            if (sortOrder === 'asc') return aValue > bValue ? 1 : -1;
            return aValue < bValue ? 1 : -1;
        });

        return sorted;
    }, [transaksi, searchTerm, statusFilter, jenisFilter, sortBy, sortOrder]);

    const formatCurrency = (amount: number): string =>
        new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);

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

    const sectionTitle = currentTheme === 'auto' ? 'text-zinc-900 dark:text-zinc-100' : currentTheme === 'Light' ? 'text-zinc-900' : 'text-zinc-100';

    const cardBase = 'p-6 rounded-lg shadow transition-colors';

    const tableWrap =
        currentTheme === 'auto'
            ? 'p-6 max-w-full mx-auto min-h-[45vh] rounded-xl shadow border border-zinc-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100'
            : currentTheme === 'Light'
              ? 'p-6 max-w-full mx-auto min-h-[45vh] rounded-xl shadow border border-zinc-200 bg-gray-50 text-zinc-900'
              : 'p-6 max-w-full mx-auto min-h-[45vh] rounded-xl shadow border border-zinc-800 bg-zinc-900 text-zinc-100';

    const bodyText = currentTheme === 'auto' ? 'text-zinc-900 dark:text-zinc-100' : currentTheme === 'Light' ? 'text-zinc-900' : 'text-zinc-100';

    const tableHead = currentTheme === 'auto' ? 'bg-gray-100 dark:bg-zinc-800' : currentTheme === 'Light' ? 'bg-gray-100' : 'bg-zinc-800';

    const bgApp = currentTheme === 'auto' ? 'bg-gray-50 dark:bg-zinc-950' : currentTheme === 'Light' ? 'bg-gray-50' : 'bg-zinc-950';

    const headerBg =
        currentTheme === 'auto'
            ? 'bg-gray-800 dark:bg-zinc-900/80'
            : currentTheme === 'Light'
              ? 'bg-gray-800' // header tetap gelap biar kontras
              : 'bg-zinc-900/80';

    const headerText = 'text-white';

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
    const rowHover =
        currentTheme === 'auto'
            ? 'hover:bg-slate-50 dark:hover:bg-zinc-800/60'
            : currentTheme === 'Dark'
              ? 'hover:bg-zinc-800/60'
              : 'hover:bg-slate-50';
    const borderSoft = currentTheme === 'Dark' ? 'border-zinc-800' : 'border-slate-200';
    const subText = currentTheme === 'auto' ? 'text-zinc-500 dark:text-zinc-400' : currentTheme === 'Dark' ? 'text-zinc-400' : 'text-zinc-500';
    const contentText = currentTheme === 'auto' ? 'text-zinc-900 dark:text-zinc-100' : currentTheme === 'Light' ? 'text-zinc-900' : 'text-zinc-100';

    // ====== ⬇️ DERIVED PAGINATION  ⬇️ ======
    const totalItems = filteredTransaksi.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const currentSafe = Math.min(Math.max(currentPage, 1), totalPages);
    const startIndex = (currentSafe - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);
    const pagedTransaksi = filteredTransaksi.slice(startIndex, endIndex);

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
        <>
            <div className={`flex min-h-full w-full p-4`}>
                <div className={`h-fit w-full relative rounded-lg`}>
                    <div className="flex flex-col justify-center">
                        <h1 className={`mb-4 text-2xl font-bold ${sectionTitle}`}>Dashboard</h1>
                        <h1 className={`mb-4 text-xl font-bold ${sectionTitle}`}>CBT - 18</h1>
                        <h1 className={`mb-4 text-xl font-bold ${sectionTitle}`}>
                            <LiveClock />
                        </h1>
                    </div>
                    {/* Kartu ringkas (tetap berwarna agar kontras di semua tema) */}
                    <div className="flex flex-col gap-6">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            <div className={`${cardBase} border-b-4 border-b-blue-500 bg-secondary text-primary`}>
                                <h3 className="mb-2 text-lg font-semibold">Total Pemasukan</h3>
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center justify-between">
                                        <p className="text-3xl font-bold">
                                            Rp.&nbsp;
                                            <CountUp
                                                from={0}
                                                to={total_pemasukan_bulan_ini}
                                                separator="."
                                                direction="up"
                                                duration={0.3}
                                                className="count-up-text"
                                            />
                                        </p>
                                        <p
                                            className={`items-center rounded-full p-1 text-lg ${
                                                statusPemasukan === 'naik'
                                                    ? 'bg-green-500/35 text-green-800 dark:text-green-200'
                                                    : statusPemasukan === 'turun'
                                                      ? 'bg-red-500/35 text-red-800 dark:text-red-200'
                                                      : 'bg-yellow-500/35 text-yellow-800 dark:text-yellow-200'
                                            }`}
                                        >
                                            {statusPemasukan === 'naik' ? '+' : statusPemasukan === 'turun' ? '-' : '±'}
                                            {persentasePemasukan}%
                                        </p>
                                    </div>
                                    <p className="text-muted-foreground">Dari bulan lalu</p>
                                </div>
                            </div>
                            <div className={`${cardBase} border-b-4 border-b-red-500 bg-secondary text-primary`}>
                                <h3 className="mb-2 text-lg font-semibold">Total Pengeluaran</h3>
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center justify-between">
                                        <p className="text-3xl font-bold">
                                            Rp.&nbsp;
                                            <CountUp
                                                from={0}
                                                to={total_pengeluaran_bulan_ini}
                                                separator="."
                                                direction="up"
                                                duration={0.3}
                                                className="count-up-text"
                                            />
                                        </p>
                                        <p
                                            className={`items-center rounded-full p-1 text-lg ${
                                                statusPengeluaran === 'turun'
                                                    ? 'bg-green-500/35 text-green-800 dark:text-green-200'
                                                    : statusPengeluaran === 'naik'
                                                      ? 'bg-red-500/35 text-red-800 dark:text-red-200'
                                                      : 'bg-yellow-500/35 text-yellow-800 dark:text-yellow-200'
                                            }`}
                                        >
                                            {statusPengeluaran === 'naik' ? '+' : statusPengeluaran === 'turun' ? '-' : '±'}
                                            {persentasePengeluaran}%
                                        </p>
                                    </div>
                                    <p className="text-muted-foreground">Dari bulan lalu</p>
                                </div>
                            </div>
                            <div className={`${cardBase} border-b-4 border-b-orange-500 bg-secondary text-primary`}>
                                <h3 className="mb-2 text-lg font-semibold">Pembayaran Supplier</h3>
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center justify-between">
                                        <p className="text-3xl font-bold">
                                            Rp.&nbsp;
                                            <CountUp
                                                from={0}
                                                to={total_bayar_supp_bulan_ini}
                                                separator="."
                                                direction="up"
                                                duration={0.3}
                                                className="count-up-text"
                                            />
                                        </p>
                                        <p
                                            className={`items-center rounded-full p-1 text-lg ${
                                                statusBayarSupp === 'turun'
                                                    ? 'bg-green-500/35 text-green-800 dark:text-green-200'
                                                    : statusBayarSupp === 'naik'
                                                      ? 'bg-red-500/35 text-red-800 dark:text-red-200'
                                                      : 'bg-yellow-500/35 text-yellow-800 dark:text-yellow-200'
                                            }`}
                                        >
                                            {statusBayarSupp === 'naik' ? '+' : statusBayarSupp === 'turun' ? '-' : '±'}
                                            {persentaseBayarSupp}%
                                        </p>
                                    </div>
                                    <p className="text-muted-foreground">Dari bulan lalu</p>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
                            <div className={`${cardBase} border-b-4 border-b-green-500 bg-secondary text-primary`}>
                                <div className="flex items-center justify-between">
                                    <h3 className="mb-2 text-lg font-semibold">Total Penjualan</h3>
                                    <h3 className="mb-2 rounded-full bg-primary-foreground p-2 text-base font-semibold">
                                        Total: {Number(penjualanGaram) + Number(penjualanKunyit) + Number(penjualanKedelai)} Kg
                                    </h3>
                                </div>
                                <div className="flex justify-center gap-4 p-2 text-primary">
                                    <div>
                                        <p className="text-lg font-bold">
                                            <CountUp
                                                from={0}
                                                to={penjualanKedelai}
                                                separator="."
                                                direction="up"
                                                duration={0.3}
                                                className="count-up-text"
                                            />
                                            &nbsp;Kg&nbsp;Kedelai
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold">
                                            <CountUp
                                                from={0}
                                                to={penjualanGaram}
                                                separator="."
                                                direction="up"
                                                duration={0.3}
                                                className="count-up-text"
                                            />
                                            &nbsp;Kg&nbsp;Garam
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold">
                                            <CountUp
                                                from={0}
                                                to={penjualanKunyit}
                                                separator="."
                                                direction="up"
                                                duration={0.3}
                                                className="count-up-text"
                                            />
                                            &nbsp;Kg&nbsp;Kunyit
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className={`${cardBase} border-b-4 border-b-emerald-500 bg-secondary text-primary`}>
                                <div className="flex items-center justify-between">
                                    <h3 className="mb-2 text-lg font-semibold">Stock</h3>
                                    <h3 className="mb-2 rounded-full bg-primary-foreground p-2 text-base font-semibold">
                                        Total: {Number(stockGaram) + Number(stockKunyit) + Number(stockKedelai)} Kg
                                    </h3>
                                </div>
                                <div className="flex justify-center gap-4 p-2 text-primary">
                                    <div>
                                        <p className="text-lg font-bold">
                                            <CountUp
                                                from={0}
                                                to={stockKedelai}
                                                separator="."
                                                direction="up"
                                                duration={0.3}
                                                className="count-up-text"
                                            />
                                            &nbsp;Kg&nbsp;Kedelai
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold">
                                            <CountUp from={0} to={stockGaram} separator="." direction="up" duration={0.3} className="count-up-text" />
                                            &nbsp;Kg&nbsp;Garam
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold">
                                            <CountUp
                                                from={0}
                                                to={stockKunyit}
                                                separator="."
                                                direction="up"
                                                duration={0.3}
                                                className="count-up-text"
                                            />
                                            &nbsp;Kg&nbsp;Kunyit
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabel Users (sinkron tema) */}
                    <div className={`${tableWrap} mt-5`}>
                        <h2 className="mb-4 text-xl font-semibold">Riwayat Transaksi</h2>
                        <div className={`mb-6 rounded-xl bg-secondary p-6 text-primary shadow`}>
                            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                                <div className="flex flex-1 flex-col gap-3 sm:flex-row">
                                    <div className="relative max-w-md flex-1">
                                        <svg
                                            className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-slate-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                            />
                                        </svg>
                                        <input
                                            type="text"
                                            placeholder="Cari kode transaksi atau member..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className={`w-full border py-2 pr-4 pl-10 ${inputTheme} rounded-lg transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500`}
                                        />
                                    </div>

                                    <select
                                        value={jenisFilter}
                                        onChange={(e) => setJenisFilter(e.target.value)}
                                        className={`border px-4 py-2 ${inputTheme} rounded-lg transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500`}
                                    >
                                        <option value="masuk">Masuk</option>
                                        <option value="keluar">Keluar</option>
                                    </select>

                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className={`border px-4 py-2 ${inputTheme} rounded-lg transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500`}
                                    >
                                        <option value="all">Semua Status</option>
                                        <option value="lunas">Lunas</option>
                                        <option value="pending">Belum Lunas</option>
                                    </select>
                                </div>

                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-medium">Urutkan:</label>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className={`border px-3 py-2 ${inputTheme} rounded-lg text-sm transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500`}
                                    >
                                        <option value="created_at">Tanggal</option>
                                        <option value="total">Total</option>
                                        {statusFilter === 'masuk' && <option value="kode_transaksi">Kode</option>}
                                    </select>
                                    <button
                                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                        className={`border p-2 ${inputTheme} rounded-lg transition-colors`}
                                        aria-label="Toggle sort order"
                                        title="Toggle sort order"
                                    >
                                        {sortOrder === 'asc' ? '↑' : '↓'}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="relative overflow-x-auto rounded-xl pb-20">
                            <table className="min-w-full text-left text-sm">
                                <thead className={`${tableHead} uppercase`}>
                                    <tr className="border-b border-zinc-200 dark:border-zinc-800">
                                        {jenisFilter === 'masuk'
                                            ? ['Tanggal', 'Kode Transaksi', 'Jumlah (Kg)', 'Total (Rp)', 'Member', 'Status Transaksi'].map((h) => (
                                                  <th key={h} className={`px-6 py-3`}>
                                                      {h}
                                                  </th>
                                              ))
                                            : ['Tanggal', 'Jumlah (Kg)', 'Total (Rp)', 'Supplier', 'Status Transaksi'].map((h) => (
                                                  <th key={h} className={`px-6 py-3`}>
                                                      {h}
                                                  </th>
                                              ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {pagedTransaksi.map((trx) => (
                                        <tr
                                            key={trx.id}
                                            className={`${rowHover} border-b transition-colors duration-150 ${currentTheme === 'Dark' ? 'border-zinc-800' : 'border-slate-100'}`}
                                        >
                                            <td className="px-6 py-3">{trx.created_at}</td>
                                            {trx.kode_transaksi !== null && <td className="px-6 py-3">{trx.kode_transaksi}</td>}
                                            <td className="px-6 py-3">{trx.detail.reduce((sum, d) => sum + d.qty, 0)}</td>
                                            <td className="px-6 py-3">{formatCurrency(trx.total)}</td>
                                            <td className="px-6 py-3">{trx.member?.nama || trx.supplier?.nama_supplier || '-'}</td>
                                            <td className="px-6 py-3">
                                                <span className={getStatusBadge(trx.status)}>
                                                    {trx.status === 'pending' ? 'Belum Lunas' : 'Lunas'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {/* Kosong */}
                            {filteredTransaksi.length === 0 && (
                                <div className="py-12 text-center">
                                    <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                        />
                                    </svg>
                                    <h3 className="mt-2 text-sm font-medium text-slate-900">Tidak ada transaksi</h3>
                                    <p className="mt-1 text-sm text-slate-500">Tidak ada transaksi yang sesuai dengan filter yang dipilih.</p>
                                </div>
                            )}

                            {/* ====== ⬇️ KONTROL PAGINATION  ⬇️ ====== */}
                            {filteredTransaksi.length > 0 && (
                                <div
                                    className={`absolute right-0 bottom-0 left-0 flex flex-col items-center justify-between border-t px-6 py-4 sm:flex-row ${borderSoft} gap-3`}
                                >
                                    <div className={`text-sm ${subText}`}>
                                        Menampilkan <span className="font-semibold">{startIndex + 1}</span>–
                                        <span className="font-semibold">{endIndex}</span> dari
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
                </div>
            </div>
        </>
    );
}
