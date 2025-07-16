<?php

namespace App\Http\Controllers;

use App\Models\Produk;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProdukController extends Controller
{
    public function index()
    {
        $produk = Produk::all();
        return Inertia::render('produk/index', [
            'produk' => $produk,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama' => 'required|string',
            'harga' => 'required|numeric',
        ]);

        Produk::create($request->all());

        return redirect()->back()->with('success', 'Produk berhasil ditambahkan!');
    }
    public function destroy($id)
    {
        $produk = Produk::findOrFail($id);
        $produk->delete();

        return redirect()->back()->with('message', 'Produk berhasil dihapus.');
    }

    public function update(Request $request, $id)
{
    $request->validate([
        'nama' => 'required|string',
        'harga' => 'required|numeric',
        'stok' => 'required|numeric',
        'gambar' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
    ]);

    $produk = Produk::findOrFail($id);

    // Proses upload gambar jika ada
    if ($request->hasFile('gambar')) {
        $gambar = $request->file('gambar');
        $filename = time() . '.' . $gambar->getClientOriginalExtension();
        $gambar->move(public_path('logo'), $filename);
        $produk->gambar = $filename;
    }

    // Update data lainnya
    $produk->nama = $request->nama;
    $produk->harga = $request->harga;
    $produk->stok = $request->stok;
    $produk->save();

    return redirect()->back()->with('message', 'Produk berhasil diperbarui.');
}

    // edit, update, destroy dst...
}
