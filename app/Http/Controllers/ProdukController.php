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
            'stok' => 'required|numeric',
            'gambar' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        $data = $request->only(['nama', 'harga', 'stok']);
        if ($request->hasFile('gambar')) {
            $gambar = $request->file('gambar');
            $filename = time() . '.' . $gambar->getClientOriginalExtension();
            $gambar->move(public_path('logo'), $filename);
            $data['gambar'] = $filename;
        } else {
            $data['gambar'] = null;
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
        // dd($request->all()); // Hapus debug agar proses update berjalan
        \Log::info('Update produk', $request->all());
        try {
            $rules = [
                'nama' => 'required|string',
                'harga' => 'required|numeric',
                'stok' => 'required|numeric',
            ];
            if ($request->hasFile('gambar')) {
                $rules['gambar'] = 'image|mimes:jpeg,png,jpg|max:2048';
            }
            $request->validate($rules);

            $produk = Produk::findOrFail($id);

            // Proses upload gambar jika ada
            if ($request->hasFile('gambar')) {
                $gambar = $request->file('gambar');
                $filename = time() . '.' . $gambar->getClientOriginalExtension();
                $gambar->move(public_path('logo'), $filename);
                $produk->gambar = $filename;
            }

            // Update data lainnya
            $produk->nama = $request->input('nama');
            $produk->harga = $request->input('harga');
            $produk->stok = $request->input('stok');
            $produk->save();

            return redirect()->back()->with('message', 'Produk berhasil diperbarui.');
        } catch (\Throwable $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    // edit, update, destroy dst...
}
