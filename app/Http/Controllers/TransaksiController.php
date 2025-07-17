<?php

namespace App\Http\Controllers;

use App\Models\Transaksi;
use Inertia\Inertia;
use App\Models\DetailTransaksi;
use App\Models\Produk;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Models\Member;



class TransaksiController extends Controller
{
    public function index()
    {
        $transaksi = Transaksi::with([
            'detail.produk:id,nama,harga,gambar',
            'member:id,nama'
        ])->get();

        return Inertia::render('transaksi', [
            'transaksi' => $transaksi,
        ]);
    }
    public function store(Request $request)
    {
        $request->validate([
            'kode_transaksi' => 'required|string|unique:transaksi,kode_transaksi',
            'total' => 'required|numeric',
            'metode' => 'required|in:tunai,non-tunai,qris',
            'status' => 'required|in:paid,pending',
            'member_id' => 'nullable|exists:members,id',
            'detail' => 'required|array|min:1',
            'detail.*.produk_id' => 'required|exists:produk,id',
            'detail.*.jumlah' => 'required|integer|min:1',
            'detail.*.harga' => 'required|numeric|min:0',
            'nama_member' => 'nullable|string',
        ]);

        DB::beginTransaction();

        try {

            $member = null;
            if ($request->filled('nama_member')) {
                $member = Member::where('nama', $request->nama_member)->first();

                if (!$member) {
                    return back()->withErrors(['nama_member' => 'Nama member tidak ditemukan.']);
                }
            }
            $transaksi = Transaksi::create([
                'kode_transaksi'     => $request->kode_transaksi,
                'total'              => $request->total,
                'user_id'            => Auth::id(),
                'member_id'          => $member?->id,
                'diskon_id'          => $member?->diskon_id ?? null,
                'metode_pembayaran'  => $request->metode,
                'status'             => $request->status,
                'created_at'        => $request->status === 'paid' || $request->status === 'pending'? now() : null,
                'waktu_bayar'        => $request->status === 'paid' ? now() : null,
            ]);

            $produkIds = collect($request->detail)->pluck('produk_id');
            $produkList = Produk::whereIn('id', $produkIds)->get()->keyBy('id');

            $details = [];

            foreach ($request->detail as $item) {
                $produk = $produkList[$item['produk_id']];

                if ($produk->stok < $item['jumlah']) {
                    throw new \Exception("Stok tidak cukup untuk produk: {$produk->nama}");
                }

                $details[] = [
                    'transaksi_id' => $transaksi->id,
                    'produk_id'    => $item['produk_id'],
                    'qty'          => $item['jumlah'],
                    'harga'        => $item['harga'],
                    'created_at'   => now(),
                    'waktu_bayar'   => now(),
                ];

                // Kurangi stok
                DB::table('produk')
                    ->where('id', $item['produk_id'])
                    ->decrement('stok', $item['jumlah']);
            }

            DetailTransaksi::insert($details);

            DB::commit();

            return redirect()->route('kasir')->with('message', 'Transaksi berhasil!');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }
    public function lunas($id)
    {
        $trx = Transaksi::findOrFail($id);
        $trx->status = 'paid';
        $trx->waktu_bayar = now();
        $trx->save();

        return back()->with('success', 'Transaksi berhasil ditandai lunas.');
    }
}
