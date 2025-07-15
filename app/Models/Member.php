<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Member extends Model
{
    use HasFactory;

    protected $fillable = [
        'nama',
        'diskon_id',
        'total_transaksi',
        'tanggal_daftar',
    ];

    protected $dates = [
        'tanggal_daftar',
    ];

    // Relasi ke tabel diskon (dalam hal ini, mungkin ke MemberLevel atau model bernama Diskon)
    public function diskon()
    {
        return $this->belongsTo(Diskon::class, 'diskon_id');
    }
}
