<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProdukSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('produk')->insert([
            [
                'id' => 1,
                'nama' => 'Apple Crumble',
                'harga' => 25000,
                'stok' => '100',
                'gambar' => 'apple-crumble-foto-resep-utama.jpg',
                'created_at' => '2025-07-11 07:41:40',
                'updated_at' => '2025-07-11 07:41:40',
            ],
            [
                'id' => 2,
                'nama' => 'Cioko',
                'harga' => 15000,
                'stok' => '100',
                'gambar' => 'cioko.jpg',
                'created_at' => '2025-07-11 07:41:40',
                'updated_at' => '2025-07-11 07:41:40',
            ],
            [
                'id' => 3,
                'nama' => 'Garam Karung',
                'harga' => 10000,
                'stok' => '100',
                'gambar' => 'garam-karung.jpg',
                'created_at' => '2025-07-11 07:41:40',
                'updated_at' => '2025-07-11 07:41:40',
            ],
            [
                'id' => 4,
                'nama' => 'Garam',
                'harga' => 8000,
                'stok' => '100',
                'gambar' => 'garam.jpg',
                'created_at' => '2025-07-11 07:41:40',
                'updated_at' => '2025-07-11 07:41:40',
            ],
            [
                'id' => 5,
                'nama' => 'Kedelai',
                'harga' => 12000,
                'stok' => '100',
                'gambar' => 'kedelai.jpg',
                'created_at' => '2025-07-11 07:41:40',
                'updated_at' => '2025-07-11 07:41:40',
            ],
            [
                'id' => 6,
                'nama' => 'Kunyit',
                'harga' => 9000,
                'stok' => '100',
                'gambar' => 'kunyit.jpg',
                'created_at' => '2025-07-11 07:41:40',
                'updated_at' => '2025-07-11 07:41:40',
            ],
        ]);
        
    }
}
