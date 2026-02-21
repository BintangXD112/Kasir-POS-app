<?php

namespace App\Http\Controllers;

use App\Models\Produk;
use App\Models\Transaksi;
use App\Models\Kategori;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KasirController extends Controller
{
    public function beli()
    {
        // Ambil semua kategori, tapi hanya id dan nama saja
        $kategori = Kategori::all()->map(function($item) {
            return [
                'id' => $item->id,
                'nama_kategori' => $item->nama_kategori, // sesuaikan nama kolom
            ];
        });

        return Inertia::render('kasir', [
            'produk' => Produk::with('kategori')->get(),
            'transaksi' => Transaksi::all(),
            'kategori' => $kategori,
        ]);
    }

    public function index()
    {
        return Inertia::render('kasir-dashboard');
    }
}
