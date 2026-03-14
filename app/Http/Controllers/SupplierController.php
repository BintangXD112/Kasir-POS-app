<?php

namespace App\Http\Controllers;

use App\Models\Supplier;
use App\Models\PembelianStok;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class SupplierController extends Controller
{
    public function index()
    {
        $suppliers = Supplier::withCount('pembelianStok')
            ->withSum('pembelianStok', 'total_harga')
            ->orderBy('nama_supplier')
            ->get()
            ->map(function ($s) {
                return [
                    'id'               => $s->id,
                    'nama_supplier'    => $s->nama_supplier,
                    'no_hp'            => $s->no_hp,
                    'alamat'           => $s->alamat,
                    'jumlah_pembelian' => $s->pembelian_stok_count,
                    'total_pembelian'  => $s->pembelian_stok_sum_total_harga ?? 0,
                    'created_at'       => $s->created_at,
                ];
            });

        $sisaHutang     = PembelianStok::whereNotNull('supplier_id')->where('status', 'pending')->sum('total_harga');
        $totalPembelian = PembelianStok::whereNotNull('supplier_id')->sum('total_harga');

        return Inertia::render('supplier', [
            'suppliers'       => $suppliers,
            'total_pembelian' => $totalPembelian,
            'sisa_hutang'     => $sisaHutang,
            'auth'            => ['user' => Auth::user()],
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nama_supplier' => 'required|string|max:255',
            'no_hp'         => 'nullable|string|max:20',
            'alamat'        => 'nullable|string|max:500',
        ]);

        $supplier = Supplier::create($data);
        return back()->with('message', 'Supplier ' . $supplier->nama_supplier . ' berhasil ditambahkan.');
    }

    public function update(Request $request, $id)
    {
        $supplier = Supplier::findOrFail($id);
        $data = $request->validate([
            'nama_supplier' => 'required|string|max:255',
            'no_hp'         => 'nullable|string|max:20',
            'alamat'        => 'nullable|string|max:500',
        ]);
        $supplier->update($data);
        return back()->with('message', 'Supplier berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $supplier = Supplier::findOrFail($id);
        $supplier->delete();
        return back()->with('message', 'Supplier berhasil dihapus.');
    }
}
