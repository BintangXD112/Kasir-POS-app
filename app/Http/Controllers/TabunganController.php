<?php

namespace App\Http\Controllers;

use App\Models\Member;
use App\Models\Tabungan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class TabunganController extends Controller
{
    public function index()
    {
        //
    }
    public function store(Request $request)
    {
        $request->validate([
            'member_id' => 'required|exists:members,id',
            'deposit' => 'nullable|numeric|min:0',
            'tarik' => 'nullable|numeric|min:0',
        ]);

        if ($request->deposit > 0) {
            Tabungan::create([
                'member_id' => $request->member_id,
                'jenis' => 'deposit',
                'jumlah' => $request->deposit,
            ]);
        }

        if ($request->tarik > 0) {
            Tabungan::create([
                'member_id' => $request->member_id,
                'jenis' => 'tarik',
                'jumlah' => $request->tarik,
            ]);
        }

        return redirect()->back()->with('success', 'Tabungan berhasil ditambahkan');
    }

}
