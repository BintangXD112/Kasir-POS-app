<?php

namespace App\Http\Controllers;

use App\Models\Produk;
use App\Models\JenisProduk;
use Illuminate\Http\Request;
use Inertia\Inertia;

class JenisProdukController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'nama_jenis_produk' => 'required|string|unique:jenis_produk,nama_jenis_produk',
        ]);

        JenisProduk::create([
            'nama_jenis_produk' => $request->input('nama_jenis_produk'),
        ]);

        return redirect()->back()->with('success', 'Jenis Produk berhasil ditambahkan!');
    }

    public function destroy($id)
    {
        $jenis_produk = JenisProduk::findOrFail($id);
        $jenis_produk->delete();

        return redirect()->back()->with('message', 'Jenis Produk berhasil dihapus.');
    }
    public function update(Request $request, $id)
    {
        $request->validate([
            'nama_jenis_produk' => 'required|string|unique:jenis_produk,nama_jenis_produk,' . $id,
        ]);

        $jenis_produk = JenisProduk::findOrFail($id);
        $jenis_produk->nama_jenis_produk = $request->input('nama_jenis_produk');
        $jenis_produk->save();

        return redirect()->back()->with('message', 'Jenis Produk berhasil diperbarui.');
    }
}
