<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\MemberLevel;
use App\Models\Voucher;
use Illuminate\Support\Carbon;

class MemberLevelSeeder extends Seeder
{
    public function run(): void
    {
        // List level dan voucher-nya
        $levels = [
            [
                'nama' => 'Langganan Toko',
                'minimal_belanja' => 25,
                'minimal_barang' => 0,
                'prioritas' => 1,
                'voucher' => [
                    'persentase' => 2.5,
                    'masa_aktif_hari' => 1,
                    'sekali_pakai' => true,
                ],
            ],
            [
                'nama' => 'Penjajal Toko',
                'minimal_belanja' => 50,
                'minimal_barang' => 0,
                'prioritas' => 2,
                'voucher' => [
                    'persentase' => 5,
                    'masa_aktif_hari' => 7,
                    'sekali_pakai' => true,
                ],
            ],
            [
                'nama' => 'Sobat Toko',
                'minimal_belanja' => 100,
                'minimal_barang' => 0,
                'prioritas' => 3,
                'voucher' => [
                    'persentase' => 10,
                    'masa_aktif_hari' => 30,
                    'sekali_pakai' => true,
                ],
            ],
            [
                'nama' => 'Donatur Toko',
                'minimal_belanja' => 0,
                'minimal_barang' => 1000,
                'prioritas' => 4,
                'voucher' => [
                    'persentase' => 50,
                    'masa_aktif_hari' => 1,
                    'sekali_pakai' => true,
                ],
            ],
            [
                'nama' => 'Sepuh Toko',
                'minimal_belanja' => 0,
                'minimal_barang' => 10000,
                'prioritas' => 5,
                'voucher' => [
                    'persentase' => 10,
                    'masa_aktif_hari' => 99999, // seumur hidup
                    'sekali_pakai' => false,
                    'eksklusif' => true,
                ],
            ],
        ];

        foreach ($levels as $lvl) {
            $level = MemberLevel::create([
                'nama' => $lvl['nama'],
                'minimal_belanja' => $lvl['minimal_belanja'],
                'minimal_barang' => $lvl['minimal_barang'],
                'prioritas' => $lvl['prioritas'],
            ]);

            Voucher::create([
                'member_level_id' => $level->id,
                'nama' => 'Voucher ' . $lvl['voucher']['persentase'] . '% ' . $lvl['nama'],
                'persentase' => $lvl['voucher']['persentase'],
                'masa_aktif_hari' => $lvl['voucher']['masa_aktif_hari'],
                'sekali_pakai' => $lvl['voucher']['sekali_pakai'] ?? true,
                'eksklusif' => $lvl['voucher']['eksklusif'] ?? false,
            ]);
        }
    }
}

