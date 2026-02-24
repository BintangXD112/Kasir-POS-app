<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PembelianStok extends Model
{
    use HasFactory;

    protected $table = 'pembelian_stok';
    public $timestamps = false;

    protected $fillable = [
        'produk_id',
        'user_id',
        'supplier_id',
        'jumlah',
        'harga_beli',
        'total_harga',
        'keterangan',
        'status',
        'created_at',
    ];

    public function produk()
    {
        return $this->belongsTo(Produk::class, 'produk_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class, 'supplier_id');
    }
}
