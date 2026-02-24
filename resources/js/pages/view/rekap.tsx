import React from 'react';
import AdminLayout from '@/components/admin-sidebar';

declare const route: (name: string, params?: any) => string;

interface StokProduk {
    id: number;
    nama: string;
    stok: number;
    harga: number;
    nilai_stok: number;
    jenis_produk: string;
}

interface HutangSupplier {
    supplier_id: number;
    nama_supplier: string;
    jumlah_order: number;
    total_hutang: number;
}

interface Props {
    pemasukan_hari_ini: number;
    pengeluaran_hari_ini: number;
    rekap_stok: StokProduk[];
    sisa_hutang_supplier: HutangSupplier[];
    total_sisa_hutang: number;
    pemasukan_bulan_ini: number;
    pengeluaran_bulan_ini: number;
    tanggal_hari_ini: string;
    currentTheme?: 'auto' | 'Light' | 'Dark';
}

const fmt = (n: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

export default function RekapPage({
    pemasukan_hari_ini = 0, pengeluaran_hari_ini = 0, rekap_stok = [],
    sisa_hutang_supplier = [], total_sisa_hutang = 0, pemasukan_bulan_ini = 0,
    pengeluaran_bulan_ini = 0, tanggal_hari_ini = '', currentTheme = 'Light'
}: Props) {
    const card = currentTheme === 'Dark' ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-zinc-200';
    const text = currentTheme === 'Dark' ? 'text-zinc-100' : 'text-zinc-900';
    const subText = currentTheme === 'Dark' ? 'text-zinc-400' : 'text-zinc-500';
    const softBg = currentTheme === 'Dark' ? 'bg-zinc-800/60' : 'bg-slate-50';
    const rowHover = currentTheme === 'Dark' ? 'hover:bg-zinc-800/60' : 'hover:bg-slate-50';
    const borderSoft = currentTheme === 'Dark' ? 'border-zinc-800' : 'border-slate-200';

    const totalNilaiStok = rekap_stok.reduce((s, p) => s + p.nilai_stok, 0);
    const handlePrint = () => window.print();

    return (
        <AdminLayout currentTheme={currentTheme} activeKey="rekap">
            <style>{`@media print { .no-print { display: none !important; } body { background: white !important; color: black !important; } }`}</style>

            {/* Page title + actions */}
            <div className="pl-6 pt-6 flex items-center justify-between pr-6 no-print">
                <div>
                    <h2 className={`text-xl font-semibold ${text}`}>Rekap Harian</h2>
                    <p className={`text-sm ${subText} mt-0.5`}>{tanggal_hari_ini}</p>
                </div>
                <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-sm transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                    Export PDF
                </button>
            </div>

            {/* Print title */}
            <div className="hidden print:block p-6 pb-0">
                <h1 className="text-2xl font-bold">Rekap Harian</h1>
                <p className="text-sm text-gray-500">{tanggal_hari_ini}</p>
            </div>

            <div className="p-6 space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
                    <div className={`${card} rounded-xl p-5`}>
                        <p className={`text-xs ${subText} mb-1`}>Sisa Hutang Supplier</p>
                        <p className="text-xl font-bold text-amber-500">{fmt(total_sisa_hutang)}</p>
                        <p className={`text-xs ${subText} mt-2`}>{sisa_hutang_supplier.length} supplier</p>
                    </div>
                </div>

                {/* Rekap Stok Produk */}
                <div className={`${card} rounded-xl overflow-hidden shadow-sm`}>
                    <div className={`px-5 py-4 border-b ${borderSoft}`}>
                        <h3 className={`font-semibold ${text}`}>Rekap Stok Produk</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className={softBg}>
                                <tr className={`border-b ${borderSoft}`}>
                                    {['Produk', 'Jenis', 'Stok', 'Harga Jual', 'Nilai Stok'].map(h => (
                                        <th key={h} className={`px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider ${subText}`}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {rekap_stok.length === 0 ? (
                                    <tr><td colSpan={5} className={`text-center py-8 ${subText}`}>Tidak ada data produk.</td></tr>
                                ) : rekap_stok.map(p => (
                                    <tr key={p.id} className={`border-b ${borderSoft} ${rowHover} transition-colors`}>
                                        <td className={`px-5 py-3 font-medium ${text}`}>{p.nama}</td>
                                        <td className={`px-5 py-3 text-sm ${subText}`}>{p.jenis_produk}</td>
                                        <td className="px-5 py-3">
                                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${p.stok <= 5 ? 'bg-red-100 text-red-700' : p.stok <= 20 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                                {p.stok} unit
                                            </span>
                                        </td>
                                        <td className={`px-5 py-3 text-sm ${text}`}>{fmt(p.harga)}</td>
                                        <td className="px-5 py-3 text-sm font-bold text-blue-500">{fmt(p.nilai_stok)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            {rekap_stok.length > 0 && (
                                <tfoot className={softBg}>
                                    <tr className={`border-t ${borderSoft}`}>
                                        <td colSpan={4} className={`px-5 py-3 text-sm font-semibold ${text}`}>Total Nilai Stok</td>
                                        <td className="px-5 py-3 text-sm font-bold text-blue-500">{fmt(totalNilaiStok)}</td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                </div>

                {/* Hutang Supplier */}
                {sisa_hutang_supplier.length > 0 && (
                    <div className={`${card} rounded-xl overflow-hidden shadow-sm`}>
                        <div className={`px-5 py-4 border-b ${borderSoft}`}>
                            <h3 className={`font-semibold ${text}`}>Sisa Hutang ke Supplier</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className={softBg}>
                                    <tr className={`border-b ${borderSoft}`}>
                                        {['Supplier', 'Jumlah Order Pending', 'Total Hutang'].map(h => (
                                            <th key={h} className={`px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider ${subText}`}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {sisa_hutang_supplier.map(s => (
                                        <tr key={s.supplier_id} className={`border-b ${borderSoft} ${rowHover} transition-colors`}>
                                            <td className={`px-5 py-3 font-medium ${text}`}>{s.nama_supplier}</td>
                                            <td className="px-5 py-3"><span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">{s.jumlah_order}x order</span></td>
                                            <td className="px-5 py-3 text-sm font-bold text-red-500">{fmt(s.total_hutang)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
