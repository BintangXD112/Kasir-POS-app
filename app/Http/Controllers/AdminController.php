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


class AdminController extends Controller
{
    public function index()
    {
        $users = User::orderBy('created_at', 'desc')
            ->get();
        $members = Member::all();
        $produks = Produk::all();

        return Inertia::render('Admin', [
            'users' => $users,
            'members' => $members,
            'produks' => $produks,
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
}