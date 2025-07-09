<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class PasswordController extends Controller
{
    /**
     * Show the user's password settings page.
     */
    public function edit(): Response
    {
        return Inertia::render('settings/password');
    }

    /**
     * Update the user's password.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'current_kode_user' => ['required', 'string'],
            'kode_user' => ['required', 'string', 'confirmed'],
        ]);

        // Pastikan kode_user lama benar
        if ($request->user()->kode_user !== $validated['current_kode_user']) {
            return back()->withErrors(['current_kode_user' => 'Kode user saat ini salah.']);
        }

        $request->user()->update([
            'kode_user' => $validated['kode_user'],
        ]);

        return back()->with('status', 'Kode user berhasil diubah.');
    }
}