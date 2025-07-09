<?php

namespace App\Http\Controllers;

use App\Models\Produk;
use Inertia\Inertia;
use Illuminate\Http\Request;

class ProdukController extends Controller
{
    public function index()
    {
        $produk = Produk::all();
        return Inertia::render('dashboard', [
            'produk' => $produk->toArray(),
        ]);
    }
}
