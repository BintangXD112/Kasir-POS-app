<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tabungan extends Model
{
    protected $table = 'tabungan';
    protected $fillable = ['member_id', 'saldo'];


    public function member()
    {
        return $this->belongsTo(Member::class, 'member_id');
    }

    public function detail()
    {
        return $this->hasMany(DetailTabungan::class);
    }
}
