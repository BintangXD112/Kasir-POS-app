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
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use App\Models\UserLog;
use App\Models\Transaksi;
use App\Models\PembelianStok;
use App\Models\Supplier;


class AdminController extends Controller
{
    public function index()
    {
        $users = User::orderBy('created_at', 'desc')->get();
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
        $tabungan = Tabungan::with('member', 'detail')->get();
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

        $totalBulanIniStok = \App\Models\PembelianStok::whereBetween('created_at', [
            now()->startOfMonth(), now()->endOfMonth()
        ])->sum('total_harga');

        return Inertia::render('Admin', [
            'users' => $users,
            'members' => $members,
            'produks' => $produks,
            'pemasukan_bulan_ini' => $pemasukanBulanIni,
            'transaksi' => $transaksi,
            'tabungan' => $tabungan,
            'jenis_produk' => $jenis_produk,
            'rekap_hutang' => $rekapHutang,
            'pembelian_stok' => $pembelianStok,
            'produk_list' => $produkList,
            'total_bulan_ini_stok' => $totalBulanIniStok,
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