import React, { useState, useMemo } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '@/components/admin-sidebar';

declare const route: (name: string, params?: any) => string;

interface Member { id: number; nama: string; telepon?: string; }
interface Produk { id: number; nama: string; harga: number; }
interface Detail { id: number; produk: Produk; jumlah: number; subtotal: number; }
interface Transaksi {
    id: number;
    member: Member | null;
    detail: Detail[];
    total: number;
    status: string;
    created_at: string;
}

interface Props {
    transaksi: Transaksi[];
    members: { id: number; nama: string }[];
    total_pemasukan: number;
    total_transaksi: number;
    filters: { date_from?: string; date_to?: string; member_id?: string };
    currentTheme?: 'auto' | 'Light' | 'Dark';
}

const fmt = (n: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function LaporanTransaksiMember({
    transaksi = [], members = [], total_pemasukan = 0, total_transaksi = 0,
    filters = {}, currentTheme = 'Light'
}: Props) {
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [memberId, setMemberId] = useState(filters.member_id || '');

    const card = currentTheme === 'Dark' ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-zinc-200';
    const text = currentTheme === 'Dark' ? 'text-zinc-100' : 'text-zinc-900';
    const subText = currentTheme === 'Dark' ? 'text-zinc-400' : 'text-zinc-500';
    const softBg = currentTheme === 'Dark' ? 'bg-zinc-800/60' : 'bg-slate-50';
    const rowHover = currentTheme === 'Dark' ? 'hover:bg-zinc-800/60' : 'hover:bg-slate-50';
    const borderSoft = currentTheme === 'Dark' ? 'border-zinc-800' : 'border-slate-200';
    const inputCls = currentTheme === 'Dark' ? 'border-zinc-700 bg-zinc-800 text-zinc-100' : 'border-zinc-300 bg-white text-zinc-900';

    const applyFilter = () => {
        router.get(route('admin.laporan.member'), { date_from: dateFrom, date_to: dateTo, member_id: memberId }, { preserveScroll: true });
    };

    const resetFilter = () => {
        setDateFrom(''); setDateTo(''); setMemberId('');
        router.get(route('admin.laporan.member'), {}, { preserveScroll: true });
    };

    return (
        <AdminLayout currentTheme={currentTheme} activeKey="laporan-member">
            <style>{`@media print { .no-print { display: none !important; } body { background: white !important; } }`}</style>

            {/* Page header */}
            <div className="pl-6 pt-6 flex items-center justify-between pr-6 no-print">
                <div>
                    <h2 className={`text-xl font-semibold ${text}`}>Laporan Transaksi Member</h2>
                    <p className={`text-sm ${subText} mt-0.5`}>Riwayat transaksi per member</p>
                </div>
                <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-sm transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                    Export PDF
                </button>
            </div>

            <div className="p-6 space-y-4">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className={`${card} rounded-xl p-5`}>
                        <p className={`text-sm ${subText} mb-1`}>Total Transaksi</p>
                        <p className="text-2xl font-bold text-blue-500">{total_transaksi}</p>
                    </div>
                    <div className={`${card} rounded-xl p-5`}>
                        <p className={`text-sm ${subText} mb-1`}>Pemasukan (Lunas)</p>
                        <p className="text-2xl font-bold text-emerald-500">{fmt(total_pemasukan)}</p>
                    </div>
                    <div className={`${card} rounded-xl p-5`}>
                        <p className={`text-sm ${subText} mb-1`}>Jumlah Member</p>
                        <p className="text-2xl font-bold text-purple-500">{members.length}</p>
                    </div>
                </div>

                {/* Filter */}
                <div className={`${card} no-print rounded-xl p-4`}>
                    <div className="flex flex-wrap gap-3 items-end">
                        <div>
                            <label className={`block text-xs font-medium mb-1 ${subText}`}>Dari Tanggal</label>
                            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className={`px-3 py-2 rounded-lg border text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${inputCls}`} />
                        </div>
                        <div>
                            <label className={`block text-xs font-medium mb-1 ${subText}`}>Sampai Tanggal</label>
                            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className={`px-3 py-2 rounded-lg border text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${inputCls}`} />
                        </div>
                        <div>
                            <label className={`block text-xs font-medium mb-1 ${subText}`}>Member</label>
                            <select value={memberId} onChange={e => setMemberId(e.target.value)} className={`px-3 py-2 rounded-lg border text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${inputCls}`}>
                                <option value="">-- Semua Member --</option>
                                {members.map(m => <option key={m.id} value={m.id}>{m.nama}</option>)}
                            </select>
                        </div>
                        <button onClick={applyFilter} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors">Filter</button>
                        <button onClick={resetFilter} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${currentTheme === 'Dark' ? 'bg-zinc-700 hover:bg-zinc-600 text-zinc-100' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'}`}>Reset</button>
                    </div>
                </div>

                {/* Table */}
                <div className={`${card} rounded-xl overflow-hidden shadow-sm`}>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className={softBg}>
                                <tr className={`border-b ${borderSoft}`}>
                                    {['Tanggal', 'Member', 'Produk', 'Total', 'Status'].map(h => (
                                        <th key={h} className={`px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider ${subText}`}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {transaksi.length === 0 ? (
                                    <tr><td colSpan={5} className={`text-center py-12 ${subText}`}>Tidak ada data transaksi member.</td></tr>
                                ) : transaksi.map(t => (
                                    <tr key={t.id} className={`border-b ${borderSoft} ${rowHover} transition-colors`}>
                                        <td className={`px-5 py-4 text-sm ${subText}`}>{fmtDate(t.created_at)}</td>
                                        <td className={`px-5 py-4 font-medium ${text}`}>{t.member?.nama ?? '-'}</td>
                                        <td className={`px-5 py-4 text-sm ${subText}`}>
                                            {t.detail?.map(d => `${d.produk?.nama} (${d.jumlah}x)`).join(', ') || '-'}
                                        </td>
                                        <td className="px-5 py-4"><span className="text-sm font-bold text-blue-500">{fmt(t.total)}</span></td>
                                        <td className="px-5 py-4">
                                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${t.status === 'lunas' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {t.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
