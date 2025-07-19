<?php

namespace App\Http\Controllers;

use App\Models\Tabungan;
use App\Models\DetailTabungan;
use App\Models\Member;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class TabunganController extends Controller
{
    public function store(Request $request)
    {
        
        $request->validate([
            'member_id' => 'required|exists:members,id',
            'deposit' => 'nullable|numeric|min:0',
            'tarik' => 'nullable|numeric|min:0',
            'keterangan' => 'required|string|max:255',
            'kode_transaksi' => 'required|string|max:100',
        ]);


        $member_id = $request->member_id;
        $deposit = $request->deposit ?? 0;
        $tarik = $request->tarik ?? 0;
        $keterangan = $request->keterangan ?? 0;
        $kode_transaksi = $request->kode_transaksi ?? '-';


        if ($deposit <= 0 && $tarik <= 0) {
            return redirect()->back()->with('error', 'Isi nominal deposit atau tarik!');
        }

        // Ambil atau buat tabungan utama
        $tabungan = Tabungan::firstOrCreate(
            ['member_id' => $member_id],
            ['saldo' => 0]
        );

        // Validasi jika penarikan melebihi saldo
        if ($tarik > 0 && $tarik > $tabungan->saldo) {
            return redirect()->back()->with('error', 'Saldo tidak cukup untuk penarikan!');
        }

        // Proses deposit
        if ($deposit > 0) {
            $tabungan->saldo += $deposit;
            DetailTabungan::create([
                'tabungan_id' => $tabungan->id,
                'nominal' => $deposit,
                'tipe' => 'deposit',
                'keterangan' => $keterangan,
                'kode_transaksi' => $kode_transaksi,
            ]);
        }

        // Proses tarik
        if ($tarik > 0) {
            $tabungan->saldo -= $tarik;
            DetailTabungan::create([
                'tabungan_id' => $tabungan->id,
                'nominal' => $tarik,
                'tipe' => 'penarikan',
                'keterangan' => $keterangan ?? 'Penarikan manual oleh admin',
                'kode_transaksi' => $kode_transaksi ?? '-',
            ]);
        }

        $tabungan->save();

        return redirect()->back()->with('success', 'Tabungan berhasil diperbarui.');
    }
}
