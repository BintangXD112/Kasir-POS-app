<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Diskon;

class DiskonSeeder extends Seeder
{
    public function run(): void
    {
        Diskon::insert([
            [
                'kode_voucher' => 'HEMAT25',
                'deskripsi' => 'Diskon 2.5% untuk semua produk',
                'jumlah_diskon' => 2.50,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'kode_voucher' => 'SUPER475',
                'deskripsi' => 'Diskon spesial 4.75% member',
                'jumlah_diskon' => 4.75,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
