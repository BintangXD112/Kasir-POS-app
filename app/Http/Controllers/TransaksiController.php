<?php

namespace App\Http\Controllers;

use App\Models\Transaksi;
use Inertia\Inertia;
use App\Models\DetailTransaksi;
use App\Models\Produk;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;



class TransaksiController extends Controller
{
    public function index()
    {
        $transaksi = Transaksi::with([
            'detail.produk:id,nama,harga,gambar'
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
            'detail' => 'required|array|min:1',
            'detail.*.produk_id' => 'required|exists:produk,id',
            'detail.*.jumlah' => 'required|integer|min:1',
            'detail.*.harga' => 'required|numeric|min:0',
        ]);

        DB::beginTransaction();

        try {
            $start = microtime(true);

            // Simpan data transaksi utama
            $transaksi = Transaksi::create([
                'kode_transaksi' => $request->kode_transaksi,
                'total' => $request->total,
                'user_id' => Auth::id(),
                'status' => 'paid', 
            ]);

            // Ambil semua produk yang dibutuhkan
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
                    'produk_id' => $item['produk_id'],
                    'qty' => $item['jumlah'],
                    'harga' => $item['harga'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ];

                // Update stok produk langsung via query
                DB::table('produk')
                    ->where('id', $item['produk_id'])
                    ->decrement('stok', $item['jumlah']);
            }

            // Insert semua detail transaksi sekaligus
            DetailTransaksi::insert($details);

            DB::commit();

            $end = microtime(true);

            return redirect()->route('kasir')->with('message', 'Transaksi berhasil!');
        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }
    
}
