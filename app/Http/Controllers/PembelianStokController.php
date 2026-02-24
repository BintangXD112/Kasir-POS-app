<?php

namespace App\Http\Controllers;

use App\Models\PembelianStok;
use App\Models\Produk;
use App\Models\Supplier;
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

        // Summary: total pengeluaran bulan ini
        $startOfMonth = now()->startOfMonth();
        $endOfMonth   = now()->endOfMonth();
        $totalBulanIni = PembelianStok::whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->sum('total_harga');

        return Inertia::render('view/pembelian-stok', [
            'pembelian'       => $pembelian,
            'produk'          => $produk,
            'suppliers'       => $suppliers,
            'total_bulan_ini' => $totalBulanIni,
            'currentTheme'    => 'Light',
            'auth'            => ['user' => Auth::user()],
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'produk_id'   => 'required|exists:produk,id',
            'jumlah'      => 'required|integer|min:1',
            'harga_beli'  => 'required|numeric|min:0',
            'keterangan'  => 'nullable|string|max:255',
            'supplier_id' => 'nullable|exists:supplier,id',
        ]);

        DB::beginTransaction();
        try {
            $produk = Produk::findOrFail($request->produk_id);
            $total  = $request->jumlah * $request->harga_beli;

            PembelianStok::create([
                'produk_id'   => $request->produk_id,
                'user_id'     => Auth::id(),
                'supplier_id' => $request->supplier_id,
                'jumlah'      => $request->jumlah,
                'harga_beli'  => $request->harga_beli,
                'total_harga' => $total,
                'keterangan'  => $request->keterangan,
                'created_at'  => now(),
            ]);

            // Tambah stok produk
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
