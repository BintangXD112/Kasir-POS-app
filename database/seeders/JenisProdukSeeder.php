<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class JenisProdukSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('jenis_produk')->insert([
            ['nama' => 'Makanan', 'created_at' => now(), 'updated_at' => now()],
            ['nama' => 'Minuman', 'created_at' => now(), 'updated_at' => now()],
            ['nama' => 'Bumbu',   'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
