<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;


class MemberLevel extends Model
{
    use HasFactory;

    protected $fillable = [
        'nama',
        'prioritas',
        'target_transaksi_6bulan',
        'diskon',
        'hadiah_fisik',
        'bisa_dipakai_selamanya',
    ];

    public function members()
    {
        return $this->hasMany(Member::class);
    }

    public function vouchers()
    {
        return $this->hasMany(Voucher::class);
    }
}
