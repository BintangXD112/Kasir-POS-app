<?php

namespace App\Http\Controllers;

use App\Models\Produk;
use App\Models\Transaksi;
use App\Models\JenisProduk;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KasirController extends Controller
{
    public function beli()
    {
        // Ambil semua jenis produk, tapi hanya id dan nama saja
        $jenis_produk = JenisProduk::all()->map(function($item) {
            return [
                'id' => $item->id,
                'nama_jenis_produk' => $item->nama_jenis_produk, // sesuaikan nama kolom
            ];
        });

        return Inertia::render('kasir', [
            'produk' => Produk::with('jenis_produk')->get(),
            'transaksi' => Transaksi::all(),
            'jenis_produk' => $jenis_produk,
        ]);
    }

    public function index()
    {
        return Inertia::render('kasir-dashboard');
    }
}
