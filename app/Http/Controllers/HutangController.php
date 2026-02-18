<?php

namespace App\Http\Controllers;

use App\Models\Transaksi;
use App\Models\Member;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class HutangController extends Controller
{
    /**
     * Rekap hutang: semua transaksi pending yang punya member_id,
     * dikelompokkan per member.
     */
    public function index()
    {
        $transaksiHutang = Transaksi::with([
            'detail.produk:id,nama,harga',
            'member:id,nama,telepon',
        ])
            ->where('status', 'pending')
            ->whereNotNull('member_id')
            ->orderByDesc('created_at')
            ->get();

        $rekapPerMember = $transaksiHutang->groupBy('member_id')->map(function ($items) {
            $member = $items->first()->member;
            return [
                'member_id'         => $member?->id,
                'nama'              => $member?->nama ?? '-',
                'telepon'           => $member?->telepon ?? '-',
                'jumlah_transaksi'  => $items->count(),
                'total_hutang'      => $items->sum('total'),
                'transaksi'         => $items->values(),
            ];
        })->values();

        return Inertia::render('kasir-hutang', [
            'rekap'     => $rekapPerMember,
            'auth'      => ['user' => Auth::user()],
        ]);
    }

    /**
     * Lunasi satu transaksi hutang (ubah status pending → paid)
     * Menerima nominal_bayar opsional (untuk dicatat di waktu_bayar)
     */
    public function lunas(Request $request, $id)
    {
        $trx = Transaksi::where('id', $id)
            ->where('status', 'pending')
            ->firstOrFail();

        $trx->status      = 'paid';
        $trx->waktu_bayar = now();
        // Simpan nominal yang dibayar jika dikirim (opsional, untuk info)
        if ($request->has('nominal_bayar')) {
            $trx->nominal_bayar = $request->nominal_bayar;
        }
        $trx->save();

        return back()->with('message', 'Hutang berhasil dilunasi.');
    }

    /**
     * Lunasi SEMUA hutang satu member sekaligus
     */
    public function lunasSemuaMember(Request $request, $memberId)
    {
        $request->validate([
            'nominal_bayar' => 'nullable|numeric|min:0',
        ]);

        DB::beginTransaction();
        try {
            $transaksi = Transaksi::where('member_id', $memberId)
                ->where('status', 'pending')
                ->get();

            foreach ($transaksi as $trx) {
                $trx->status      = 'paid';
                $trx->waktu_bayar = now();
                if ($request->has('nominal_bayar')) {
                    $trx->nominal_bayar = $request->nominal_bayar;
                }
                $trx->save();
            }

            DB::commit();
            return back()->with('message', 'Semua hutang member berhasil dilunasi.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}
