<?php

namespace App\Http\Controllers;

use App\Models\Transaksi;
use App\Models\PembelianStok;
use App\Models\Produk;
use App\Models\Supplier;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class RekapController extends Controller
{
    public function index()
    {
        $today = now()->toDateString();

        // Pemasukan hari ini (transaksi lunas)
        $pemasukanHariIni = Transaksi::where('status', 'lunas')
            ->whereDate('waktu_bayar', $today)
            ->sum('total');

        // Pengeluaran hari ini (pembelian stok)
        $pengeluaranHariIni = PembelianStok::whereDate('created_at', $today)
            ->sum('total_harga');

        // Rekap stok: semua produk
        $rekapStok = Produk::with('jenis_produk:id,nama_jenis_produk')
            ->select('id', 'nama', 'stok', 'harga', 'id_jenis_produk')
            ->orderBy('nama')
            ->get()
            ->map(function ($p) {
                return [
                    'id'             => $p->id,
                    'nama'           => $p->nama,
                    'stok'           => $p->stok,
                    'harga'          => $p->harga,
                    'nilai_stok'     => $p->stok * $p->harga,
                    'jenis_produk'   => $p->jenis_produk?->nama_jenis_produk ?? '-',
                ];
            });

        // Sisa hutang ke supplier (pembelian status pending)
        $sisaHutangSupplier = PembelianStok::with('supplier:id,nama_supplier')
            ->where('status', 'pending')
            ->whereNotNull('supplier_id')
            ->get()
            ->groupBy('supplier_id')
            ->map(function ($items) {
                $supplier = $items->first()->supplier;
                return [
                    'supplier_id'   => $supplier?->id,
                    'nama_supplier' => $supplier?->nama_supplier ?? '-',
                    'jumlah_order'  => $items->count(),
                    'total_hutang'  => $items->sum('total_harga'),
                ];
            })
            ->values();

        $totalSisaHutang = $sisaHutangSupplier->sum('total_hutang');

        // Extra: bulan ini
        $pemasukanBulanIni = Transaksi::where('status', 'lunas')
            ->whereBetween('waktu_bayar', [now()->startOfMonth(), now()->endOfMonth()])
            ->sum('total');

        $pengeluaranBulanIni = PembelianStok::whereBetween('created_at', [now()->startOfMonth(), now()->endOfMonth()])
            ->sum('total_harga');

        return Inertia::render('view/rekap', [
            'pemasukan_hari_ini'    => $pemasukanHariIni,
            'pengeluaran_hari_ini'  => $pengeluaranHariIni,
            'rekap_stok'            => $rekapStok,
            'sisa_hutang_supplier'  => $sisaHutangSupplier,
            'total_sisa_hutang'     => $totalSisaHutang,
            'pemasukan_bulan_ini'   => $pemasukanBulanIni,
            'pengeluaran_bulan_ini' => $pengeluaranBulanIni,
            'tanggal_hari_ini'      => now()->locale('id')->isoFormat('D MMMM YYYY'),
            'auth'                  => ['user' => Auth::user()],
        ]);
    }
}
