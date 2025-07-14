<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Voucher extends Model
{
    use HasFactory;

    protected $fillable = [
        'kode',
        'member_level_id',
        'diskon',
        'masa_aktif_mulai',
        'masa_aktif_selesai',
        'maksimal_pakai',
    ];

    public function level()
    {
        return $this->belongsTo(MemberLevel::class, 'member_level_id');
    }

    public function members()
    {
        return $this->belongsToMany(Member::class, 'member_voucher')
                    ->withPivot('jumlah_pakai')
                    ->withTimestamps();
    }
}
