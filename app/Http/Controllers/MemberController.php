<?php

namespace App\Http\Controllers;


use Illuminate\Http\Request;
use App\Models\Member;


class MemberController extends Controller
{
    /**
     * Search nama member berdasarkan query.
     */
    public function search(Request $request)
    {
        $query = $request->query('q');

        // Validasi agar tidak kosong
        if (!$query) {
            return response()->json([]);
        }

        // Ambil nama member yang mirip (max 10)
        $members = Member::with('level')
            ->where('nama', 'like', '%' . $query . '%')
            ->get()
            ->map(function ($member) {
                return [
                    'nama' => $member->nama,
                    'level' => $member->level->nama ?? 'Tidak Ada',
                    'diskon' => $member->level->diskon ?? 0,
                    'total_transaksi_6bulan' => $member->total_transaksi_6bulan,
                ];
            });

        return response()->json($members);
    }
}