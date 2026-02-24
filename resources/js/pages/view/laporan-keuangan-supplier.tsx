import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '@/components/admin-sidebar';

declare const route: (name: string, params?: any) => string;

interface Supplier { id: number; nama_supplier: string; }
interface Produk { id: number; nama: string; }
interface User { id: number; nama_user: string; }
interface Pembelian {
    id: number;
    supplier: Supplier | null;
    produk: Produk | null;
    user: User | null;
    jumlah: number;
    harga_beli: number;
    total_harga: number;
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
    filters: { date_from?: string; date_to?: string; supplier_id?: string };
    currentTheme?: 'auto' | 'Light' | 'Dark';
}

const fmt = (n: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

export default function LaporanKeuanganSupplier({
    pembelian = [], suppliers = [], total_pengeluaran = 0, rekap_per_supplier = [],
    filters = {}, currentTheme = 'Light'
}: Props) {
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [supplierId, setSupplierId] = useState(filters.supplier_id || '');

    const card = currentTheme === 'Dark' ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-zinc-200';
    const text = currentTheme === 'Dark' ? 'text-zinc-100' : 'text-zinc-900';
    const subText = currentTheme === 'Dark' ? 'text-zinc-400' : 'text-zinc-500';
    const softBg = currentTheme === 'Dark' ? 'bg-zinc-800/60' : 'bg-slate-50';
    const rowHover = currentTheme === 'Dark' ? 'hover:bg-zinc-800/60' : 'hover:bg-slate-50';
    const borderSoft = currentTheme === 'Dark' ? 'border-zinc-800' : 'border-slate-200';
    const inputCls = currentTheme === 'Dark' ? 'border-zinc-700 bg-zinc-800 text-zinc-100' : 'border-zinc-300 bg-white text-zinc-900';

    const applyFilter = () => {
        router.get(route('admin.laporan.supplier'), { date_from: dateFrom, date_to: dateTo, supplier_id: supplierId }, { preserveScroll: true });
    };

    const resetFilter = () => {
        setDateFrom(''); setDateTo(''); setSupplierId('');
        router.get(route('admin.laporan.supplier'), {}, { preserveScroll: true });
    };

    return (
        <AdminLayout currentTheme={currentTheme} activeKey="laporan-supplier">
            <style>{`@media print { .no-print { display: none !important; } body { background: white !important; } }`}</style>

            {/* Page header */}
            <div className="pl-6 pt-6 flex items-center justify-between pr-6 no-print">
                <div>
                    <h2 className={`text-xl font-semibold ${text}`}>Laporan Keuangan Supplier</h2>
                    <p className={`text-sm ${subText} mt-0.5`}>Rekap pembelian stok per supplier</p>
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
                    <div className={`${card} rounded-xl overflow-hidden shadow-sm`}>
                        <div className={`px-5 py-4 border-b ${borderSoft}`}>
                            <h3 className={`font-semibold ${text}`}>Rekap per Supplier</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className={softBg}>
                                    <tr className={`border-b ${borderSoft}`}>
                                        {['Supplier', 'Jumlah Order', 'Total Pengeluaran'].map(h => (
                                            <th key={h} className={`px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider ${subText}`}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {rekap_per_supplier.map(rs => (
                                        <tr key={rs.supplier_id} className={`border-b ${borderSoft} ${rowHover} transition-colors`}>
                                            <td className={`px-5 py-3 font-medium ${text}`}>{rs.nama_supplier}</td>
                                            <td className="px-5 py-3"><span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">{rs.jumlah_order}x</span></td>
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
                    <p className={`text-sm font-semibold mb-3 ${text}`}>Filter Detail Transaksi</p>
                    <div className="flex flex-wrap gap-3 items-end">
                        <div>
                            <label className={`block text-xs font-medium mb-1 ${subText}`}>Dari Tanggal</label>
                            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className={`px-3 py-2 rounded-lg border text-sm focus:ring-2 focus:ring-blue-500 ${inputCls}`} />
                        </div>
                        <div>
                            <label className={`block text-xs font-medium mb-1 ${subText}`}>Sampai Tanggal</label>
                            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className={`px-3 py-2 rounded-lg border text-sm focus:ring-2 focus:ring-blue-500 ${inputCls}`} />
                        </div>
                        <div>
                            <label className={`block text-xs font-medium mb-1 ${subText}`}>Supplier</label>
                            <select value={supplierId} onChange={e => setSupplierId(e.target.value)} className={`px-3 py-2 rounded-lg border text-sm focus:ring-2 focus:ring-blue-500 ${inputCls}`}>
                                <option value="">-- Semua Supplier --</option>
                                {suppliers.map(s => <option key={s.id} value={s.id}>{s.nama_supplier}</option>)}
                            </select>
                        </div>
                        <button onClick={applyFilter} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors">Filter</button>
                        <button onClick={resetFilter} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${currentTheme === 'Dark' ? 'bg-zinc-700 hover:bg-zinc-600 text-zinc-100' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'}`}>Reset</button>
                    </div>
                </div>

                {/* Detail Table */}
                <div className={`${card} rounded-xl overflow-hidden shadow-sm`}>
                    <div className={`px-5 py-4 border-b ${borderSoft}`}>
                        <h3 className={`font-semibold ${text}`}>Detail Transaksi</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className={softBg}>
                                <tr className={`border-b ${borderSoft}`}>
                                    {['Tanggal', 'Supplier', 'Produk', 'Jumlah', 'Harga Beli/Unit', 'Total'].map(h => (
                                        <th key={h} className={`px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider ${subText}`}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {pembelian.length === 0 ? (
                                    <tr><td colSpan={6} className={`text-center py-10 ${subText}`}>Tidak ada data pembelian dari supplier.</td></tr>
                                ) : pembelian.map(p => (
                                    <tr key={p.id} className={`border-b ${borderSoft} ${rowHover} transition-colors`}>
                                        <td className={`px-5 py-3 text-sm ${subText}`}>{fmtDate(p.created_at)}</td>
                                        <td className={`px-5 py-3 font-medium ${text}`}>{p.supplier?.nama_supplier ?? '-'}</td>
                                        <td className={`px-5 py-3 text-sm ${text}`}>{p.produk?.nama ?? '-'}</td>
                                        <td className="px-5 py-3"><span className="inline-flex px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">{p.jumlah} unit</span></td>
                                        <td className={`px-5 py-3 text-sm ${text}`}>{fmt(p.harga_beli)}</td>
                                        <td className="px-5 py-3 text-sm font-bold text-red-500">{fmt(p.total_harga)}</td>
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
