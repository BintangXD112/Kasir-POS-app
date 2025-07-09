<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProdukSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('produk')->insert([
            [
                'nama' => 'Kacang Kedelai Bola',
                'harga' => 9700,
                'gambar' => 'kedelai.jpg',
            ],
            [
                'nama' => 'Kunyit',
                'harga' => 7000,
                'gambar' => 'kunyit.jpg',
            ],
            [
                'nama' => 'Garam (per kg)',
                'harga' => 3000,
                'gambar' => 'garam.jpg',
            ],
            [
                'nama' => 'Garam (karung 50kg)',
                'harga' => 105000,
                'gambar' => 'garam-karung.jpg',
            ],
            [
                'nama' => 'Cioko',
                'harga' => 15000,
                'gambar' => 'cioko.jpg',
            ],
        ]);
    }
}
