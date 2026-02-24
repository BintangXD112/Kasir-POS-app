<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Supplier extends Model
{
    use HasFactory;

    protected $table = 'supplier';

    protected $fillable = [
        'nama_supplier',
        'no_hp',
        'alamat',
    ];

    /*
    |--------------------------------------------------------------------------
    | RELATIONSHIPS
    |--------------------------------------------------------------------------
    */

    public function transaksi()
    {
        return $this->hasMany(Transaksi::class, 'supplier_id');
    }

    public function pembelianStok()
    {
        return $this->hasMany(PembelianStok::class, 'supplier_id');
    }
}