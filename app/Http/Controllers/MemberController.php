<?php

namespace App\Http\Controllers;


use Illuminate\Http\Request;
use App\Models\Member;
use Illuminate\Validation\Rule;


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
        $members = Member::with('tabungan')
            ->withCount('transaksi')
            ->where('nama', 'like', '%' . $query . '%')
            ->get()
            ->map(function ($member) {
                return [
                    'id' => $member->id,
                    'nama' => $member->nama,
                    'level' => $member->level,
                    'saldo' => $member->tabungan->saldo ?? null,
                    'total_transaksi' => $member->transaksi_count ?? 0,
                ];
            });

        return response()->json($members);
    }

    public function updateLevel(Request $request, $id)
    {
        try{
            $member = Member::findOrFail($id);
            $request->validate([
                'level' => 'nullable|string',
            ]);
            $member->update(['level' => $request->level]);
            return response()->json(['success' => true]);
        }catch (err){
            return response()->json(['status' => 'error', 'message' => err]);
        }
    }

    public function indexJson()
    {
        return response()->json(\App\Models\Member::get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => [
                'required',
                'string',
                'max:255',
                Rule::unique('members')->where(function ($query) use ($request) {
                    return $query->where('alamat', $request->alamat);
                }),
            ],
            'alamat' => 'required|string',
            'telepon' => 'required|string|max:20',
        ], [
            'nama.unique' => "Nama dengan alamat yang sama sudah terdaftar",
        ]);

        $validated['tanggal_daftar'] = now();

        try {
            // Simpan member
            $member = Member::create($validated);

            // Buat tabungan default
            $member->tabungan()->create([
                'uang_tunai' => 0,
                // tambahkan field lain jika perlu
            ]);

            return back()->with('success', 'Member berhasil ditambahkan');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Error: ' . $e->getMessage()]);
        }
    }

    public function destroy($id)
    {
        $member = Member::findOrFail($id);
        $member->delete();

        return redirect()->back()->with('message', 'Member berhasil dihapus.');
    }
    public function update(Request $request, $id)
    {
        $rules = [
            'nama' => 'required|string',
            'telepon' => 'required|string|max:20',
            'alamat' => 'required|string',
        ];

        $validated = $request->validate($rules);

        $member = Member::findOrFail($id);
        $member->nama = $validated['nama'];
        $member->telepon = $validated['telepon'];
        $member->alamat = $validated['alamat'];
        $member->save();

        return redirect()->back()->with('success', 'Member berhasil diperbarui.');
    }
    public function list()
    {
        return response()->json(Member::with(['tabungan', 'transaksi'])->get());
    }
    public function show($id)
    {
        $member = Member::with(['diskon', 'tabungan', 'transaksi'])->findOrFail($id);
        return response()->json([
            'id' => $member->id,
            'nama' => $member->nama,
            'diskon' => $member->diskon->jumlah_diskon ?? 0,
            'kode_voucher' => $member->diskon->kode_voucher ?? null,
            'saldo' => $member->tabungan->saldo ?? 0,
            'total_transaksi' => $member->transaksi->count() ?? 0,
            'telepon' => $member->telepon,
            'alamat' => $member->alamat,
        ]);
    }
}
