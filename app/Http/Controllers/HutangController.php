<?php

namespace App\Http\Controllers;

use App\Models\Transaksi;
use App\Models\PembelianStok;
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
                'total_hutang' => $items->sum(function ($item) {
                    return $item->total - $item->nominal_bayar;
                }),
                'transaksi'         => $items->values(),
            ];
        })->values();

        return Inertia::render('kasir-hutang', [
            'rekap'     => $rekapPerMember,
            'auth'      => ['user' => Auth::user()],
        ]);
    }

    /**
     * Lunasi satu transaksi hutang (ubah status pending → lunas)
     * Menerima nominal_bayar opsional (untuk dicatat di waktu_bayar)
     */
    public function lunas(Request $request, $id)
{
    $trx = Transaksi::findOrFail($id);

    $bayar = (int) $request->nominal_bayar;

    if ($bayar <= 0) {
        return back()->withErrors(['msg' => 'Nominal tidak valid']);
    }

    if ($bayar + $trx->nominal_bayar >= $trx->total) {
        $trx->nominal_bayar =  $trx->nominal_bayar + $bayar;
        $trx->status = 'lunas';
    } elseIf ($bayar + $trx->nominal_bayar < $trx->total){
        $trx->nominal_bayar = $bayar + $trx->nominal_bayar;
        $trx->status = 'pending';
    }

    $trx->save();

    return back()->with('success', 'Pembayaran berhasil');
}
    public function supplier(Request $request, $id)
    {
        $trx = PembelianStok::findOrFail($id);

        $bayar = (int) $request->nominal_bayar;

        if ($bayar <= 0) {
            return back()->withErrors(['msg' => 'Nominal tidak valid']);
        }

        if ($bayar + $trx->nominal_bayar >= $trx->total_harga) {
            $trx->nominal_bayar =  $trx->nominal_bayar + $bayar;
            $trx->status = 'lunas';
        } elseIf ($bayar + $trx->nominal_bayar < $trx->total_harga){
            $trx->nominal_bayar = $bayar + $trx->nominal_bayar;
            $trx->status = 'pending';
        }

        $trx->save();

        return back()->with('success', 'Pembayaran berhasil');
    }

    /**
     * Lunasi SEMUA hutang satu member sekaligus
     */
    public function lunasSemuaMember(Request $request, $memberId)
{
    $bayar = (int) $request->nominal_bayar;

    if ($bayar <= 0) {
        return back()->withErrors(['msg' => 'Nominal tidak valid']);
    }

    $transaksi = Transaksi::where('member_id', $memberId)
        ->where('status', 'pending')
        ->orderBy('created_at', 'asc')
        ->get();

    DB::transaction(function () use ($transaksi, &$bayar) {

        foreach ($transaksi as $trx) {
            if ($bayar <= 0) break;

            $sisaHutang = $trx->total - ($trx->nominal_bayar ?? 0);

            if ($bayar >= $sisaHutang) {
                // lunasi transaksi ini
                $trx->nominal_bayar = $trx->total;
                $trx->status = 'lunas';
                $bayar -= $sisaHutang;
            } else {
                // bayar sebagian
                $trx->nominal_bayar += $bayar;
                $trx->status = 'pending';
                $bayar = 0;
            }

            $trx->save();
        }
    });

    return back()->with('success', 'Pembayaran berhasil');
}
}
