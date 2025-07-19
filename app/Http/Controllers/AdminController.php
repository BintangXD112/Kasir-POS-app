<?php

namespace App\Http\Controllers;

use App\Models\User;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\Member;
use App\Models\Produk;
use App\Models\Diskon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use App\Models\UserLog;


class AdminController extends Controller
{
    public function index()
    {
        $users = User::orderBy('created_at', 'desc')
            ->get();
        $members = Member::all();
        $produks = Produk::all();

        // Hitung pemasukan 1 bulan terakhir (reset otomatis tiap bulan)
        $startOfMonth = now()->startOfMonth();
        $endOfMonth = now()->endOfMonth();
        $pemasukanBulanIni = \App\Models\Transaksi::where('status', 'paid')
            ->whereBetween('waktu_bayar', [$startOfMonth, $endOfMonth])
            ->sum('total');

        // Ambil riwayat transaksi (dengan relasi detail, produk, member)
        $transaksi = \App\Models\Transaksi::with([
            'detail.produk:id,nama,harga,gambar',
            'member:id,nama'
        ])->orderByDesc('created_at')->get();

        return Inertia::render('Admin', [
            'users' => $users,
            'members' => $members,
            'produks' => $produks,
            'pemasukan_bulan_ini' => $pemasukanBulanIni,
            'transaksi' => $transaksi,
        ]);
    }

    // Voucher Diskon API
    public function voucherDiskonIndex()
    {
        return response()->json(Diskon::all());
    }

    public function voucherDiskonStore(Request $request)
    {
        $data = $request->validate([
            'kode_voucher' => 'required|string|unique:diskons,kode_voucher',
            'deskripsi' => 'nullable|string',
            'jumlah_diskon' => 'required|numeric|min:0',
        ]);
        $diskon = Diskon::create($data);
        return response()->json($diskon, 201);
    }

    public function voucherDiskonUpdate(Request $request, $id)
    {
        $diskon = Diskon::findOrFail($id);
        $data = $request->validate([
            'kode_voucher' => 'required|string|unique:diskons,kode_voucher,' . $id,
            'deskripsi' => 'nullable|string',
            'jumlah_diskon' => 'required|numeric|min:0',
        ]);
        $diskon->update($data);
        return response()->json($diskon);
    }

    public function voucherDiskonDestroy($id)
    {
        $diskon = Diskon::findOrFail($id);
        $diskon->delete();
        return response()->json(['success' => true]);
    }

    public function voucherUsage()
    {
        $usages = \App\Models\Transaksi::with(['member', 'diskon'])
            ->whereNotNull('diskon_id')
            ->orderByDesc('created_at')
            ->get()
            ->map(function($trx) {
                return [
                    'member' => $trx->member?->nama,
                    'kode_voucher' => $trx->diskon?->kode_voucher,
                    'jumlah_diskon' => $trx->diskon?->jumlah_diskon,
                    'tanggal' => $trx->created_at,
                    'total_setelah_diskon' => $trx->total,
                ];
            });
        return response()->json($usages);
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
            $csv .= '"'.date('Y-m-d H:i:s', strtotime($log->created_at)).'","'.($log->user->nama_user ?? '-').'","'.$log->action.'","'.($log->targetUser->nama_user ?? '-').'","'.($log->keterangan ?? '-').'"\n';
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