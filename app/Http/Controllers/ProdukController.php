<?php

namespace App\Http\Controllers;

use App\Models\Produk;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProdukController extends Controller
{

    public function store(Request $request)
    {
        $request->validate([
            'nama' => 'required|string',
            'harga' => 'required|numeric',
            'stok' => 'required|numeric',
            'id_kategori' => 'required|exists:kategori,id', // validasi kategori
            'gambar' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        $data = $request->only(['nama', 'harga', 'stok', 'id_kategori']);

        if ($request->hasFile('gambar')) {
            $gambar = $request->file('gambar');
            $filename = time() . '.' . $gambar->getClientOriginalExtension();
            $gambar->move(public_path('logo'), $filename);
            $data['gambar'] = $filename;
        } else {
            $data['gambar'] = file_get_contents(public_path('logo/default.png'));
        }

        Produk::create($data);
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
        try {
            $rules = [
                'nama' => 'required|string',
                'harga' => 'required|numeric',
                'stok' => 'required|numeric',
                'id_kategori' => 'required|exists:kategori,id', // validasi kategori
            ];

            if ($request->hasFile('gambar')) {
                $rules['gambar'] = 'image|mimes:jpeg,png,jpg|max:2048';
            }

            $request->validate($rules);

            $produk = Produk::findOrFail($id);

            if ($request->hasFile('gambar')) {
                $gambar = $request->file('gambar');
                $filename = time() . '.' . $gambar->getClientOriginalExtension();
                $gambar->move(public_path('logo'), $filename);
                $produk->gambar = $filename;
            }

            $produk->nama = $request->input('nama');
            $produk->harga = $request->input('harga');
            $produk->stok = $request->input('stok');
            $produk->id_kategori = $request->input('id_kategori');
            $produk->save();

            return redirect()->back()->with('message', 'Produk berhasil diperbarui.');
        } catch (\Throwable $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    // edit, update, destroy dst...
}
