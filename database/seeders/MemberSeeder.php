<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MemberSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('members')->insert([
            [
                'nama' => 'Ali Mustofa',
                'alamat' => 'Kampung beh ditu',
                'telepon' => '08512345678',
                'level' => 'merah',
                'total_transaksi' => 0,
                'tanggal_daftar' => now(),
            ],
            [
                'nama' => 'Siti Rahma',
                'alamat' => 'Kampung beh ditu',
                'telepon' => '08512345678',
                'level' => 'kuning',
                'total_transaksi' => 0,
                'tanggal_daftar' => now()->subDays(10),
            ],
            [
                'nama' => 'Budi Santoso',
                'alamat' => 'Kampung beh ditu',
                'telepon' => '08512345678',
                'level' => 'hijau',
                'total_transaksi' => 0,
                'tanggal_daftar' => now()->subMonths(1),
            ],
        ]);
    }
}
