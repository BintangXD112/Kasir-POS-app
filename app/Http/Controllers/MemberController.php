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
        $members = Member::with('diskon')
            ->where('nama', 'like', '%' . $query . '%')
            ->get()
            ->map(function ($member) {
                return [
                    'nama' => $member->nama,
                    'diskon' => $member->diskon->jumlah_diskon ?? 0,
                    'kode_voucher' => $member->diskon->kode_voucher ?? null,
                ];
            });

        return response()->json($members);
    }

    public function updateVoucher(Request $request, $id)
    {
        $member = Member::findOrFail($id);
        $request->validate([
            'diskon_id' => 'nullable|exists:diskons,id',
        ]);
        $member->diskon_id = $request->diskon_id;
        $member->save();
        return response()->json(['success' => true]);
    }

    public function indexJson()
    {
        return response()->json(\App\Models\Member::with('diskon')->get());
    }
}