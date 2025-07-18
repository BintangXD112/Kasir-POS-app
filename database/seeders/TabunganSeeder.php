<?php

namespace Database\Seeders;
use Illuminate\Database\Seeder;
use App\Models\Member;
use App\Models\Tabungan;
use App\Models\DetailTabungan;

class TabunganSeeder extends Seeder
{
    public function run()
    {
        $members = Member::inRandomOrder()->limit(5)->get();

        foreach ($members as $member) {
            $tabungan = Tabungan::create([
                'member_id' => $member->id,
                'saldo' => 50000,
            ]);

            DetailTabungan::create([
                'tabungan_id' => $tabungan->id,
                'tipe' => 'deposit',
                'nominal' => 50000,
                'keterangan' => 'Deposit awal',
            ]);
        }
    }
}
