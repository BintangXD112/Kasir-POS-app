<?php

namespace App\Http\Controllers;

use App\Models\PembelianStok;
use App\Models\Produk;
use App\Models\Supplier;
use App\Models\Transaksi;
use App\Models\DetailTransaksi;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PembelianStokController extends Controller
{
    public function index()
    {
        $pembelian = PembelianStok::with([
            'produk:id,nama,stok,harga',
            'user:id,nama_user',
            'supplier:id,nama_supplier',
        ])
            ->orderByDesc('created_at')
            ->get();

        $produk    = Produk::select('id', 'nama', 'stok', 'harga')->orderBy('nama')->get();
        $suppliers = Supplier::select('id', 'nama_supplier')->orderBy('nama_supplier')->get();

        $today = now()->toDateString();
        $startOfMonth = now()->startOfMonth();
        $endOfMonth   = now()->endOfMonth();
        $totalBulanIni = PembelianStok::whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->sum('total_harga');
        $totalHariIni = PembelianStok::whereDate('created_at', $today)->sum('total_harga');

        return Inertia::render('kasir-stok', [
            'pembelian'       => $pembelian,
            'produk'          => $produk,
            'suppliers'       => $suppliers,
            'total_hari_ini' => $totalHariIni,
            'total_bulan_ini' => $totalBulanIni,
            'auth'            => ['user' => Auth::user()],
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'produk_id'   => 'required|exists:produk,id',
            'jumlah'      => 'required|integer|min:1',
            'harga_beli'  => 'required|numeric|min:0',
            'ongkir'  => 'nullable|numeric|min:0',
            'nominal_bayar'  => 'nullable|numeric|min:0',
            'keterangan'  => 'nullable|string|max:255',
            'supplier_id' => 'nullable|exists:supplier,id',
        ]);

        DB::beginTransaction();
        try {
            $produk = Produk::findOrFail($request->produk_id);
            $ongkir = $request->ongkir ?? 0;
            $total = ($request->jumlah * $request->harga_beli) + $ongkir;
            $bayar = $request->nominal_bayar >= $total ? $total : $request->nominal_bayar;
            $status = $request->nominal_bayar >= $total ? 'lunas' : 'pending';

            // Simpan pembelian stok
            PembelianStok::create([
                'produk_id'     => $request->produk_id,
                'user_id'       => Auth::id(),
                'supplier_id'   => $request->supplier_id,
                'jumlah'        => $request->jumlah,
                'harga_beli'    => $request->harga_beli,
                'ongkir'        => $ongkir,
                'nominal_bayar' => $bayar,
                'total_harga'   => $total,
                'status'        => $status,
                'keterangan'    => $request->keterangan,
                'created_at'    => now(),
            ]);

            // Catat transaksi pengeluaran
            $transaksi = Transaksi::create([
                'total'             => $total,
                'user_id'           => Auth::id(),
                'supplier_id'       => $request->supplier_id,
                'metode_pembayaran' => 'tunai',
                'status'            => $status,
                'jenis'             => 'keluar',
                'created_at'        => now(),
                'waktu_bayar'       => $bayar > 0 ? now() : null,
            ]);

            DetailTransaksi::create([
                'transaksi_id' => $transaksi->id,
                'produk_id'    => $request->produk_id,
                'qty'          => $request->jumlah,
                'harga'        => $request->harga_beli,
                'created_at'   => now(),
            ]);

            $produk->stok += $request->jumlah; 
            $produk->save();

            DB::commit();
            return back()->with('message', 'Pembelian stok berhasil dicatat. Stok ' . $produk->nama . ' bertambah ' . $request->jumlah . ' unit.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}
