<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaksi extends Model
{
    use HasFactory;

    protected $table = 'transaksi';
    public $timestamps = false;
    protected $guarded = [];

    public function detail()
    {
        return $this->hasMany(DetailTransaksi::class);
    }
    public function member()
    {
        return $this->belongsTo(Member::class);
    }
}
