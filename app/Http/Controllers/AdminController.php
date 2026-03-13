<?php

namespace App\Http\Controllers;

use App\Models\User;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\Member;
use App\Models\Produk;
use App\Models\Diskon;
use App\Models\Tabungan;
use App\Models\Pengeluaran;
use App\Models\DetailTransaksi;
use App\Models\DetailTabungan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use App\Models\UserLog;
use App\Models\Transaksi;
use App\Models\PembelianStok;
use App\Models\Supplier;


class AdminController extends Controller
{
    public function index(Request $request)
    {
        $produk = Produk::with('jenis_produk')
        ->orderByDesc('created_at')
        ->get();

        $transaksiHome = Transaksi::with([
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
        $members = Member::all();
        $produks = Produk::with('jenis_produk:id,nama_jenis_produk')->get()->map(function ($produk) {
            return [
                'id' => $produk->id,
                'id_jenis_produk' => $produk->id_jenis_produk,
                'nama' => $produk->nama,
                'harga' => $produk->harga,
                'stok' => $produk->stok,
                'gambar' => $produk->gambar,
                'jenis_produk' => [
                    'id' => $produk->jenis_produk->id,
                    'nama_jenis_produk' => $produk->jenis_produk->nama_jenis_produk,
                ],
            ];
        });
        $tabungan = Tabungan::with('member', 'detail_tabungan')->get();
        $jenis_produk = \App\Models\JenisProduk::all();

        // Hitung pemasukan 1 bulan terakhir (reset otomatis tiap bulan)
        $startOfMonth = now()->startOfMonth();
        $endOfMonth = now()->endOfMonth();
        $pemasukanBulanIni = \App\Models\Transaksi::where('status', 'lunas')
            ->whereBetween('waktu_bayar', [$startOfMonth, $endOfMonth])
            ->sum('total');

        // Ambil riwayat transaksi (dengan relasi detail, produk, member)
        $transaksi = \App\Models\Transaksi::with([
            'detail.produk:id,nama,harga,gambar',
            'member:id,nama',
            'supplier:id,nama_supplier'
        ])->orderByDesc('created_at')->get();

        // Rekap hutang member (transaksi pending & lunas dengan member)
        $transaksiHutang = Transaksi::with(['detail.produk:id,nama,harga', 'member:id,nama,telepon'])
            ->whereIn('status', ['pending', 'lunas'])
            ->whereNotNull('member_id')
            ->orderByDesc('created_at')
            ->get();

        $rekapHutang = $transaksiHutang->groupBy('member_id')->map(function ($items) {
            $member = $items->first()->member;
            $itemsPending = $items->where('status', 'pending');
            return [
                'member_id'        => $member?->id,
                'nama'             => $member?->nama ?? '-',
                'telepon'          => $member?->telepon ?? '-',
                'jumlah_transaksi' => $itemsPending->count(),
                'total_hutang'     => $itemsPending->sum('total'),
                'transaksi'        => $items->values(), // Kirim semua (pending & lunas)
            ];
        })->values();

        // Data pembelian stok (untuk halaman inline admin)
        $pembelianStok = \App\Models\PembelianStok::with([
            'produk:id,nama,stok,harga',
            'user:id,nama_user',
        ])->orderByDesc('created_at')->get();

        $produkList = \App\Models\Produk::select('id', 'nama', 'stok', 'harga')->orderBy('nama')->get();

        $suppliers = Supplier::select('id', 'nama_supplier')->orderBy('nama_supplier')->get();

        $totalBulanIniStok = \App\Models\PembelianStok::whereBetween('created_at', [
            now()->startOfMonth(), now()->endOfMonth()
        ])->sum('total_harga');

        $today = now()->toDateString();
        $startOfMonth = $request->date_from ?? now()->startOfMonth()->format('Y-m-d');
        $endOfMonth = $request->date_to ?? now()->endOfMonth()->format('Y-m-d');

        // Pemasukan hari ini (transaksi lunas)
        $pemasukanHariIni = Transaksi::where('status', 'lunas')
            ->where('jenis', 'masuk')
            ->whereDate('waktu_bayar', $today)
            ->sum('total');

        // Pengeluaran hari ini (pembelian stok)
        $pengeluaranHariIni = Pengeluaran::whereDate('created_at', $today)
            ->sum('total');

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

        // Extra: bulan ini
        $pemasukanBulanIni = Transaksi::where('status', 'lunas')
            ->where('jenis', 'masuk')
            ->whereBetween('waktu_bayar', [now()->startOfMonth(), now()->endOfMonth()])
            ->sum('total');

        $pengeluaranBulanIni = Pengeluaran::whereBetween('created_at', [now()->startOfMonth(), now()->endOfMonth()])
            ->sum('total');

        $query = Pengeluaran::whereBetween('created_at', [$startOfMonth, $endOfMonth]);

        if ($request->filled('keyword')) {
            $query->where('keterangan', 'like', '%' . $request->keyword . '%');
        }

        $pengeluaran = $query
            ->latest()
            ->get();

        $query = PembelianStok::with(['supplier:id,nama_supplier', 'produk:id,nama', 'user:id,nama_user'])
            ->whereNotNull('supplier_id')->whereBetween('created_at', [$startOfMonth, $endOfMonth]);

        if ($request->filled('supplier_id')) {
            $query->where('supplier_id', $request->supplier_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $pembelian  = $query->orderByDesc('created_at')->get();

        $rekapPerSupplier = $pembelian->groupBy('supplier_id')->map(function ($items) {
            $supplier = $items->first()->supplier;
            return [
                'supplier_id'   => $supplier?->id,
                'nama_supplier' => $supplier?->nama_supplier ?? '-',
                'jumlah_order'  => $items->count(),
                'total_harga'   => $items->sum('total_harga'),
            ];
        })->values();

        $totalPengeluaran = $pembelian->sum('total_harga');

        $type = $request->get('type', 'transaksi');
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

        return Inertia::render('Admin', [
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
            'transaksiHome' => $transaksiHome,
            'members' => $members,
            'produks' => $produks,
            'pemasukan_bulan_ini' => $pemasukanBulanIni,
            'suppliers' => $suppliers,
            'transaksi' => $transaksi,
            'tabungan' => $tabungan,
            'jenis_produk' => $jenis_produk,
            'rekap_hutang' => $rekapHutang,
            'pembelian_stok' => $pembelianStok,
            'produk_list' => $produkList,
            'total_bulan_ini_stok' => $totalBulanIniStok,
            'pemasukan_hari_ini'    => $pemasukanHariIni,
            'pengeluaran_hari_ini'  => $pengeluaranHariIni,
            'rekap_stok'            => $rekapStok,
            'pengeluaran_bulan_ini' => $pengeluaranBulanIni,
            'tanggal_hari_ini'      => now()->locale('id')->isoFormat('D MMMM YYYY'),
            'auth'                  => ['user' => Auth::user()],
            'pengeluaran' => $pengeluaran,
            'filtersRekap' => [
                'date_from' => $startOfMonth,
                'date_to' => $endOfMonth,
                'keyword' => $request->keyword
            ],
            'pembelian'         => $pembelian,
            'total_pengeluaran' => $totalPengeluaran,
            'rekap_per_supplier'=> $rekapPerSupplier,
            'filtersSupplier'           => [
                'date_from' => $startOfMonth,
                'date_to' => $endOfMonth,
                'supplier_id' => $request->supplier_id,
                'status' => $request->status
                ],
            'data'       => $data,
            'total_transaksi' => $totalTransaksi,
            'filtersTransaksi' => [
                'date_from' => $startOfMonth,
                'date_to'   => $endOfMonth,
                'member_id' => $request->member_id,
                'type'      => $request->type,
            ],
        ]);
    }

    public function userLogs(Request $request)
    {
        $query = UserLog::with(['user', 'targetUser']);
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }
        $logs = $query->orderByDesc('created_at')->get();
        return Inertia::render('view/user-logs', [
            'logs' => $logs,
            'filters' => $request->only(['date_from', 'date_to'])
        ]);
    }

    public function exportUserLogs(Request $request)
    {
        $query = UserLog::with(['user', 'targetUser']);
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }
        $logs = $query->orderByDesc('created_at')->get();
        $csv = "Waktu,User,Aksi,Target User,Keterangan\n";
        foreach ($logs as $log) {
            $csv .= '"' . date('Y-m-d H:i:s', strtotime($log->created_at)) . '","' . ($log->user->nama_user ?? '-') . '","' . $log->action . '","' . ($log->targetUser->nama_user ?? '-') . '","' . ($log->keterangan ?? '-') . '"\n';
        }
        return Response::make($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="user_logs.csv"',
        ]);
    }

    public function transaksiAdmin()
    {
        $transaksi = \App\Models\Transaksi::with([
            'detail.produk:id,nama,harga,gambar',
            'member:id,nama'
        ])->orderByDesc('created_at')->get();
        return Inertia::render('view/transaksi-admin', [
            'transaksi' => $transaksi,
            'auth' => [
                'user' => Auth::user(),
            ],
        ]);
    }
}