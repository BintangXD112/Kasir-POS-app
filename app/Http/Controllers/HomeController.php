<?php

namespace App\Http\Controllers;

use App\Models\User;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\Member;
use App\Models\Produk;



class HomeController extends Controller
{
    public function index()
    {
        $users = User::orderBy('created_at', 'desc')
            ->get();
        $members = Member::all();
        $produks = Produk::all();

        return Inertia::render('Admin', [
            'users' => $users,
            'members' => $members,
            'produks' => $produks,
        ]);
    }
}