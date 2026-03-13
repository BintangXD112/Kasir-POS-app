<?php

namespace App\Http\Controllers;

use App\Models\Produk;
use App\Models\DetailTransaksi;
use App\Models\PembelianStok;
use App\Models\Pengeluaran;
use App\Models\Transaksi;
use App\Models\JenisProduk;
use App\Models\Supplier;
use App\Models\DetailTabungan;
use App\Models\Member;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KasirController extends Controller
{
    public function beli()
    {
        // Ambil semua jenis produk, tapi hanya id dan nama saja
        $jenis_produk = JenisProduk::all()->map(function($item) {
            return [
                'id' => $item->id,
                'nama_jenis_produk' => $item->nama_jenis_produk, // sesuaikan nama kolom
            ];
        });

        return Inertia::render('kasir', [
            'produk' => Produk::with('jenis_produk')->get(),
            'transaksi' => Transaksi::all(),
            'jenis_produk' => $jenis_produk,
        ]);
    }

    public function index()
    {
        $produk = Produk::with('jenis_produk')
        ->orderByDesc('created_at')
        ->get();

        $transaksi = Transaksi::with([
            'detail.produk:id,nama,harga,gambar',
            'member:id,nama',
            'supplier:id,nama_supplier'
        ])->latest()->get();

        $startOfMonth = now()->startOfMonth();
        $endOfMonth   = now()->endOfMonth();
        $startOfLastMonth = now()->subMonth()->startOfMonth();
        $endOfLastMonth   = now()->subMonth()->endOfMonth();

        //pemasukan
        $totalPemasukanBulanIni = Transaksi::whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->where('jenis', 'masuk')
            ->sum('total');

        $totalPemasukanBulanLalu = Transaksi::whereBetween('created_at', [$startOfLastMonth, $endOfLastMonth])
            ->where('jenis', 'masuk')
            ->sum('total');

        if ($totalPemasukanBulanLalu > 0) {
            $persentasePemasukan = (
                ($totalPemasukanBulanIni - $totalPemasukanBulanLalu)
                / $totalPemasukanBulanLalu
            ) * 100;
        } else {
            $persentasePemasukan = $totalPemasukanBulanIni > 0 ? 100 : 0;
        }

        $persentasePemasukan = round($persentasePemasukan);

        $statusPemasukan = $persentasePemasukan > 0 ? 'naik' : ($persentasePemasukan < 0 ? 'turun' : 'tetap');

        //pengeluaran
        $totalPengeluaranBulanIni = Pengeluaran::whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->sum('total');
        $totalPengeluaranBulanLalu = Transaksi::whereBetween('created_at', [$startOfLastMonth, $endOfLastMonth])
            ->where('jenis', 'masuk')
            ->sum('total');

        if ($totalPengeluaranBulanLalu > 0) {
            $persentasePengeluaran = (
                ($totalPengeluaranBulanIni - $totalPengeluaranBulanLalu)
                / $totalPengeluaranBulanLalu
            ) * 100;
        } else {
            $persentasePengeluaran = $totalPengeluaranBulanIni > 0 ? 100 : 0;
        }

        $persentasePengeluaran = round($persentasePengeluaran);

        $statusPengeluaran = $persentasePengeluaran > 0 ? 'naik' : ($persentasePengeluaran < 0 ? 'turun' : 'tetap');

        //supp
        $totalBayarSuppBulanIni = Transaksi::whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->where('jenis', 'keluar')
            ->sum('total');
        $totalBayarSuppBulanLalu = Transaksi::whereBetween('created_at', [$startOfLastMonth, $endOfLastMonth])
            ->where('jenis', 'keluar')
            ->sum('total');

        if ($totalBayarSuppBulanLalu > 0) {
            $persentaseBayarSupp = (
                ($totalBayarSuppBulanIni - $totalBayarSuppBulanLalu)
                / $totalBayarSuppBulanLalu
            ) * 100;
        } else {
            $persentaseBayarSupp = $totalBayarSuppBulanIni > 0 ? 100 : 0;
        }

        $persentaseBayarSupp = round($persentaseBayarSupp);

        $statusBayarSupp = $persentaseBayarSupp > 0 ? 'naik' : ($persentaseBayarSupp < 0 ? 'turun' : 'tetap');

        //produk
        $penjualanKedelai = DetailTransaksi::whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->whereHas('produk', function ($q) {
                $q->where('nama', 'Kedelai');
            })
            ->whereHas('transaksi', function ($q) {
                $q->where('jenis', 'masuk');
            })
            ->sum('qty');
        $stockKedelai = $produk->where('nama', 'Kedelai')->value('stok');

        $penjualanGaram = DetailTransaksi::whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->whereHas('produk', function ($q) {
                $q->where('nama', 'Garam');
            })
            ->whereHas('transaksi', function ($q) {
                $q->where('jenis', 'masuk');
            })
            ->sum('qty');
        $stockGaram = $produk->where('nama', 'Garam')->value('stok');

        $penjualanKunyit = DetailTransaksi::whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->whereHas('produk', function ($q) {
                $q->where('nama', 'Kunyit');
            })
            ->whereHas('transaksi', function ($q) {
                $q->where('jenis', 'masuk');
            })
            ->sum('qty');
        $stockKunyit = $produk->where('nama', 'Kunyit')->value('stok');
        
        return Inertia::render('kasir-dashboard', [
            'total_pemasukan_bulan_ini' => $totalPemasukanBulanIni,
            'persentasePemasukan' => $persentasePemasukan,
            'statusPemasukan' => $statusPemasukan,
            'total_pengeluaran_bulan_ini' => $totalPengeluaranBulanIni,
            'persentasePengeluaran' => $persentasePengeluaran,
            'statusPengeluaran' => $statusPengeluaran,
            'total_bayar_supp_bulan_ini' => $totalBayarSuppBulanIni,
            'persentaseBayarSupp' => $persentaseBayarSupp,
            'statusBayarSupp' => $statusBayarSupp,
            'penjualanKedelai' => $penjualanKedelai,
            'penjualanGaram' => $penjualanGaram,
            'penjualanKunyit' => $penjualanKunyit,
            'stockKedelai' => $stockKedelai,
            'stockGaram' => $stockGaram,
            'stockKunyit' => $stockKunyit,
            'transaksi' => $transaksi,
        ]);
    }
    public function laporanKeuanganSupplier(Request $request)
    {
        $startOfMonth = $request->date_from ?? now()->startOfMonth()->format('Y-m-d');
        $endOfMonth = $request->date_to ?? now()->endOfMonth()->format('Y-m-d');
        $query = PembelianStok::with(['supplier:id,nama_supplier', 'produk:id,nama', 'user:id,nama_user'])
            ->whereNotNull('supplier_id')->whereBetween('created_at', [$startOfMonth, $endOfMonth]);

        if ($request->filled('supplier_id')) {
            $query->where('supplier_id', $request->supplier_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $pembelian  = $query->orderByDesc('created_at')->get();
        $suppliers  = Supplier::select('id', 'nama_supplier')->orderBy('nama_supplier')->get();

        $totalPengeluaran = $pembelian->sum('total_harga');

        // Rekap per supplier
        $rekapPerSupplier = $pembelian->groupBy('supplier_id')->map(function ($items) {
            $supplier = $items->first()->supplier;
            return [
                'supplier_id'   => $supplier?->id,
                'nama_supplier' => $supplier?->nama_supplier ?? '-',
                'jumlah_order'  => $items->count(),
                'total_harga'   => $items->sum('total_harga'),
            ];
        })->values();

        return Inertia::render('view/laporan-keuangan-supplier', [
            'suppliers'         => $suppliers,
            'pembelian'         => $pembelian,
            'total_pengeluaran' => $totalPengeluaran,
            'rekap_per_supplier'=> $rekapPerSupplier,
            'filters'           => [
                'date_from' => $startOfMonth,
                'date_to' => $endOfMonth,
                'supplier_id' => $request->supplier_id,
                'status' => $request->status
                ],
            'auth'              => ['user' => Auth::user()],
        ]);
    }
    public function laporanTransaksiMember(Request $request)
    {
        $startOfMonth = $request->date_from ?? now()->startOfMonth()->format('Y-m-d');
        $endOfMonth = $request->date_to ?? now()->endOfMonth()->format('Y-m-d');
        $type = $request->get('type', 'transaksi');

        $members = Member::select('id','nama','telepon')->orderBy('nama')->get();

        if ($type === 'transaksi') {

            $query = Transaksi::with(['detail.produk:id,nama,harga','member:id,nama,telepon'])
                ->where('jenis','masuk')
                ->whereBetween('created_at', [$startOfMonth, $endOfMonth]);

            if ($request->filled('member_id')) {
                $query->where('member_id',$request->member_id);
            }

            $data = $query->orderByDesc('created_at')->get();

        } else {

            $query = DetailTabungan::with([
                'tabungan.member'
            ])->whereBetween('created_at', [$startOfMonth, $endOfMonth]);

            if ($request->filled('member_id')) {
                $query->whereHas('tabungan', function($q) use ($request){
                    $q->where('member_id',$request->member_id);
                });
            }

            $data = $query->orderByDesc('created_at')->get();

            $data = $data->map(function ($item){
                return [
                    'id' => $item->id,
                    'nama_member' => $item->tabungan->member->nama ?? '-',
                    'nominal' => $item->nominal,
                    'keterangan' => $item->keterangan,
                    'tanggal' => $item->created_at,
                ];
            });
        }

        $transaksi = Transaksi::query();
        
        $totalTransaksi = $transaksi->whereBetween('created_at', [$startOfMonth, $endOfMonth])->where('jenis', 'masuk')->count();
        $totalPemasukan = $transaksi->whereBetween('created_at', [$startOfMonth, $endOfMonth])->where('jenis', 'masuk')->where('status', 'lunas')->sum('total');
        

        return Inertia::render('view/laporan-transaksi-member', [
            'data'       => $data,
            'total_pemasukan' => $totalPemasukan,
            'members'    => $members,
            'total_transaksi' => $totalTransaksi,
            'filters' => [
                'date_from' => $startOfMonth,
                'date_to'   => $endOfMonth,
                'member_id' => $request->member_id,
                'type'      => $request->type,
            ],
            'auth' => [
                'user' => Auth::user()
            ]
        ]);
    }
}
