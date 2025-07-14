<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\MemberLevel;

class MemberLevelSeeder extends Seeder
{
    public function run(): void
    {
        MemberLevel::insert([
            [
                'nama' => 'Langganan Toko',
                'prioritas' => 1,
                'target_transaksi_6bulan' => 25,
                'checkpoint_transaksi' => 0,
                'diskon' => 0.00,
                'hadiah_fisik' => true,
                'bisa_dipakai_selamanya' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama' => 'Penjajal Toko',
                'prioritas' => 2,
                'target_transaksi_6bulan' => 50,
                'checkpoint_transaksi' => 25,
                'diskon' => 2.00,
                'hadiah_fisik' => false,
                'bisa_dipakai_selamanya' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama' => 'Sobat Toko',
                'prioritas' => 3,
                'target_transaksi_6bulan' => 100,
                'checkpoint_transaksi' => 50,
                'diskon' => 3.00,
                'hadiah_fisik' => false,
                'bisa_dipakai_selamanya' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama' => 'Donatur Toko',
                'prioritas' => 4,
                'target_transaksi_6bulan' => 1000,
                'checkpoint_transaksi' => 100,
                'diskon' => 4.00,
                'hadiah_fisik' => false,
                'bisa_dipakai_selamanya' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama' => 'Sepuh Toko',
                'prioritas' => 5,
                'target_transaksi_6bulan' => 10000,
                'checkpoint_transaksi' => 0, // tidak berlaku reset
                'diskon' => 5.00,
                'hadiah_fisik' => true,
                'bisa_dipakai_selamanya' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
