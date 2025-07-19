<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserLog extends Model
{
    use HasFactory;
    protected $fillable = [
        'user_id',
        'action',
        'target_user_id',
        'keterangan',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
    public function targetUser()
    {
        return $this->belongsTo(User::class, 'target_user_id');
    }
} 