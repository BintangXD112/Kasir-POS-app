<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Member extends Model
{
    use HasFactory;

    protected $fillable = [
        'nama',
        'member_level_id',
        'total_transaksi',
        'total_transaksi_6bulan',
        'periode_dimulai',
        'terakhir_diskon_level5',
    ];

    protected $dates = [
        'periode_dimulai',
        'terakhir_diskon_level5',
    ];

    public function level()
    {
        return $this->belongsTo(MemberLevel::class, 'member_level_id');
    }

    public function vouchers()
    {
        return $this->belongsToMany(Voucher::class, 'member_voucher')
                    ->withPivot('jumlah_pakai')
                    ->withTimestamps();
    }

    public function memberVouchers()
    {
        return $this->hasMany(MemberVoucher::class);
    }
}
