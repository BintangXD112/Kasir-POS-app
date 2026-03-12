<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Member extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'nama',
        'alamat',
        'telepon',
        'level',
        'total_transaksi',
        'tanggal_daftar',
    ];

    protected $dates = [
        'tanggal_daftar',
    ];

    // Relasi ke tabungan
    public function tabungan()
    {
        return $this->hasOne(Tabungan::class, 'member_id');
    }

    // Relasi ke transaksi
    public function transaksi()
    {
        return $this->hasMany(Transaksi::class, 'member_id');
    }
}
