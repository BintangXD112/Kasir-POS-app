import React, { useState, useMemo, useEffect } from 'react';
import { router } from '@inertiajs/react';
import Swal from 'sweetalert2';

declare const route: (name: string, params?: any) => string;

interface Transaksi {
    id: number;
    kode_transaksi: string;
    total: number;
    metode_pembayaran: string;
    status: 'pending' | 'paid';
    created_at: string | null;
}

interface RekapMember {
    member_id: number;
    nama: string;
    telepon: string;
    jumlah_transaksi: number;
    total_hutang: number;
    transaksi: Transaksi[];
}

interface Props {
    rekap: RekapMember[];
    currentTheme: 'auto' | 'Light' | 'Dark';
}

const formatCurrency = (n: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

const HutangMemberComponent: React.FC<Props> = ({ rekap, currentTheme }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedIds, setExpandedIds] = useState(new Set<number>());
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState<number>(10);

    useEffect(() => { setCurrentPage(1); }, [searchTerm, pageSize]);

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

    const rowHover =
        currentTheme === 'auto' ? 'hover:bg-slate-50 dark:hover:bg-zinc-800/60'
            : currentTheme === 'Dark' ? 'hover:bg-zinc-800/60'
                : 'hover:bg-slate-50';

    const borderSoft = currentTheme === 'Dark' ? 'border-zinc-800' : 'border-slate-200';

    const softBg =
        currentTheme === 'auto' ? 'bg-slate-50 dark:bg-zinc-800/60'
            : currentTheme === 'Dark' ? 'bg-zinc-800/60'
                : 'bg-slate-50';

    const inputCls =
        currentTheme === 'auto' ? 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
            : currentTheme === 'Dark' ? 'border-zinc-700 bg-zinc-800 text-zinc-100'
                : 'border-slate-300 bg-white text-zinc-900';

    // ===== FILTER & PAGINATION =====
    const filtered = useMemo(() =>
        rekap.filter(m =>
            m.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.telepon.includes(searchTerm)
        ), [rekap, searchTerm]
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

    const toggleExpand = (id: number) => {
        setExpandedIds(prev => {
            const s = new Set(prev);
            if (s.has(id)) s.delete(id); else s.add(id);
            return s;
        });
    };

    const totalHutang = rekap.reduce((s, m) => s + m.total_hutang, 0);
    const totalTrx = rekap.reduce((s, m) => s + m.jumlah_transaksi, 0);

    // Lunasi satu transaksi — tampilkan input nominal
    const handleLunas = (transaksiId: number, namaMember: string, totalTrx: number) => {
        Swal.fire({
            title: 'Lunasi Hutang',
            html: `
        <p class="text-sm mb-3">Hutang <b>${namaMember}</b></p>
        <p class="text-sm mb-2">Total tagihan: <b>${formatCurrency(totalTrx)}</b></p>
        <label class="block text-sm text-left mb-1 font-medium">Nominal Pembayaran (Rp)</label>
        <input id="swal-nominal" type="number" min="0" value="${totalTrx}"
          class="swal2-input" placeholder="Masukkan nominal pembayaran" style="width:90%"/>
        <p id="swal-kembalian" class="text-sm mt-2 text-emerald-600 font-medium"></p>
      `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#059669',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Lunasi',
            cancelButtonText: 'Batal',
            didOpen: () => {
                const input = document.getElementById('swal-nominal') as HTMLInputElement;
                const kembalian = document.getElementById('swal-kembalian')!;
                input?.addEventListener('input', () => {
                    const val = Number(input.value);
                    const selisih = val - totalTrx;
                    if (val >= totalTrx) {
                        kembalian.textContent = `Kembalian: ${formatCurrency(selisih)}`;
                        kembalian.className = 'text-sm mt-2 text-emerald-600 font-medium';
                    } else if (val > 0) {
                        kembalian.textContent = `Kurang: ${formatCurrency(-selisih)}`;
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
        }).then(result => {
            if (result.isConfirmed) {
                router.post(route('hutang.lunas', transaksiId), { nominal_bayar: result.value }, {
                    preserveScroll: true,
                    onSuccess: () => Swal.fire({
                        icon: 'success', title: 'Berhasil!',
                        html: `Hutang dilunasi.<br/>Nominal: <b>${formatCurrency(result.value)}</b>`,
                        timer: 2000, showConfirmButton: false,
                    }),
                    onError: () => Swal.fire({ icon: 'error', title: 'Gagal!', text: 'Terjadi kesalahan.' }),
                });
            }
        });
    };

    // Lunasi SEMUA hutang satu member — satu request ke backend
    const handleLunasSemuaMember = (member: RekapMember) => {
        Swal.fire({
            title: 'Lunasi Semua Hutang',
            html: `
        <p class="text-sm mb-2">Member: <b>${member.nama}</b></p>
        <p class="text-sm mb-2">${member.jumlah_transaksi} transaksi · Total: <b>${formatCurrency(member.total_hutang)}</b></p>
        <label class="block text-sm text-left mb-1 font-medium">Nominal Pembayaran (Rp)</label>
        <input id="swal-nominal-semua" type="number" min="0" value="${member.total_hutang}"
          class="swal2-input" placeholder="Masukkan nominal pembayaran" style="width:90%"/>
        <p id="swal-kembalian-semua" class="text-sm mt-2 text-emerald-600 font-medium"></p>
      `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#059669',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Lunasi Semua',
            cancelButtonText: 'Batal',
            didOpen: () => {
                const input = document.getElementById('swal-nominal-semua') as HTMLInputElement;
                const kembalian = document.getElementById('swal-kembalian-semua')!;
                input?.addEventListener('input', () => {
                    const val = Number(input.value);
                    const selisih = val - member.total_hutang;
                    if (val >= member.total_hutang) {
                        kembalian.textContent = `Kembalian: ${formatCurrency(selisih)}`;
                        kembalian.className = 'text-sm mt-2 text-emerald-600 font-medium';
                    } else if (val > 0) {
                        kembalian.textContent = `Kurang: ${formatCurrency(-selisih)}`;
                        kembalian.className = 'text-sm mt-2 text-red-500 font-medium';
                    } else {
                        kembalian.textContent = '';
                    }
                });
            },
            preConfirm: () => {
                const val = Number((document.getElementById('swal-nominal-semua') as HTMLInputElement)?.value);
                if (!val || val < 0) {
                    Swal.showValidationMessage('Masukkan nominal yang valid');
                    return false;
                }
                return val;
            },
        }).then(result => {
            if (result.isConfirmed) {
                router.post(route('hutang.lunas-semua', member.member_id), { nominal_bayar: result.value }, {
                    preserveScroll: true,
                    onSuccess: () => Swal.fire({
                        icon: 'success', title: 'Semua hutang dilunasi!',
                        html: `Nominal dibayar: <b>${formatCurrency(result.value)}</b>`,
                        timer: 2000, showConfirmButton: false,
                    }),
                    onError: () => Swal.fire({ icon: 'error', title: 'Gagal!', text: 'Terjadi kesalahan.' }),
                });
            }
        });
    };

    return (
        <div>
            {/* Header */}
            <div className="pl-6 pt-6 flex items-center">
                <h2 className={`text-xl font-semibold ${text}`}>Rekap Hutang Member</h2>
            </div>

            <div className="flex-1 pb-6 pt-4 px-6">
                {/* Filter & Summary */}
                <div className={`${card} ${text} rounded-xl shadow-sm p-6 mb-6`}>
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        {/* Summary mini */}
                        <div className="flex gap-4 flex-wrap">
                            <div className={`${softBg} rounded-lg px-4 py-3 text-center`}>
                                <p className={`text-xs ${subText} mb-1`}>Total Hutang</p>
                                <p className="font-bold text-red-500">{formatCurrency(totalHutang)}</p>
                            </div>
                            <div className={`${softBg} rounded-lg px-4 py-3 text-center`}>
                                <p className={`text-xs ${subText} mb-1`}>Member Berhutang</p>
                                <p className="font-bold text-amber-500">{rekap.length}</p>
                            </div>
                            <div className={`${softBg} rounded-lg px-4 py-3 text-center`}>
                                <p className={`text-xs ${subText} mb-1`}>Transaksi Pending</p>
                                <p className={`font-bold ${text}`}>{totalTrx}</p>
                            </div>
                        </div>

                        {/* Search */}
                        <div className="relative flex-1 max-w-md">
                            <svg className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${subText}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Cari nama atau telepon member..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all ${inputCls}`}
                            />
                            {searchTerm && (
                                <button onClick={() => setSearchTerm('')} className={`absolute right-3 top-1/2 -translate-y-1/2 ${subText} hover:opacity-80`}>×</button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Member List */}
                <div className={`${card} relative pb-20 rounded-xl shadow-sm overflow-hidden`}>
                    <div className="p-6 space-y-4">
                        {filtered.length === 0 ? (
                            <div className="text-center py-12">
                                <svg className={`mx-auto h-12 w-12 ${subText}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <h3 className={`mt-2 text-sm font-medium ${text}`}>Tidak ada hutang!</h3>
                                <p className={`mt-1 text-sm ${subText}`}>Semua member sudah melunasi hutangnya.</p>
                            </div>
                        ) : (
                            paged.map(member => {
                                const isExpanded = expandedIds.has(member.member_id);
                                return (
                                    <div key={member.member_id} className={`${card} rounded-xl overflow-hidden shadow-sm`}>
                                        {/* Member Row */}
                                        <div
                                            className={`flex items-center cursor-pointer select-none p-4 ${rowHover} transition-colors`}
                                            onClick={() => toggleExpand(member.member_id)}
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') toggleExpand(member.member_id); }}
                                        >
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-400 to-orange-500 flex items-center justify-center text-white font-bold text-base shadow mr-4 shrink-0">
                                                {member.nama.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`font-semibold ${text}`}>{member.nama}</p>
                                                <p className={`text-sm ${subText}`}>{member.telepon} · {member.jumlah_transaksi} transaksi pending</p>
                                            </div>
                                            <div className="text-right mr-4">
                                                <p className={`text-xs ${subText}`}>Total Hutang</p>
                                                <p className="font-bold text-red-500">{formatCurrency(member.total_hutang)}</p>
                                            </div>
                                            <button
                                                onClick={e => { e.stopPropagation(); handleLunasSemuaMember(member); }}
                                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition-colors mr-3 shrink-0"
                                            >
                                                Lunasi Semua
                                            </button>
                                            <svg className={`w-5 h-5 ${subText} transition-transform shrink-0 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>

                                        {/* Expanded Detail */}
                                        {isExpanded && (
                                            <div className={`border-t ${borderSoft}`}>
                                                <div className={`${softBg} px-5 py-2`}>
                                                    <p className={`text-xs font-semibold uppercase tracking-wider ${subText}`}>Detail Transaksi Hutang</p>
                                                </div>
                                                <div className="overflow-x-auto">
                                                    <table className="min-w-full">
                                                        <thead className={softBg}>
                                                            <tr className={`border-b ${borderSoft}`}>
                                                                {['Kode Transaksi', 'Total', 'Metode', 'Status', 'Tanggal', 'Aksi'].map(h => (
                                                                    <th key={h} className={`px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider ${subText}`}>{h}</th>
                                                                ))}
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {member.transaksi.map(trx => (
                                                                <tr key={trx.id} className={`border-b ${borderSoft} ${rowHover} transition-colors`}>
                                                                    <td className="px-5 py-3">
                                                                        <span className={`font-mono text-sm font-medium ${text}`}>{trx.kode_transaksi}</span>
                                                                    </td>
                                                                    <td className="px-5 py-3">
                                                                        <span className={`font-bold ${trx.status === 'paid' ? 'text-emerald-500' : 'text-red-500'}`}>{formatCurrency(trx.total)}</span>
                                                                    </td>
                                                                    <td className="px-5 py-3">
                                                                        <span className={`text-sm capitalize ${text}`}>{trx.metode_pembayaran}</span>
                                                                    </td>
                                                                    <td className="px-5 py-3">
                                                                        <span className={`px-2 py-1 rounded text-xs font-bold ${trx.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                                            {trx.status === 'paid' ? 'LUNAS' : 'PENDING'}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-5 py-3">
                                                                        <span className={`text-sm ${subText}`}>{formatDate(trx.created_at)}</span>
                                                                    </td>
                                                                    <td className="px-5 py-3">
                                                                        {trx.status === 'pending' && (
                                                                            <button
                                                                                onClick={() => handleLunas(trx.id, member.nama, trx.total)}
                                                                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition-colors"
                                                                            >
                                                                                Lunasi
                                                                            </button>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Pagination */}
                    {filtered.length > 0 && (
                        <div className={`flex flex-col sm:flex-row absolute bottom-0 left-0 right-0 items-center justify-between px-6 py-4 border-t ${borderSoft} gap-3`}>
                            <div className={`text-sm ${subText}`}>
                                Menampilkan <span className="font-semibold">{startIndex + 1}</span>–
                                <span className="font-semibold">{endIndex}</span> dari
                                <span className="font-semibold"> {totalItems}</span> member
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
        </div>
    );
};

export default HutangMemberComponent;
