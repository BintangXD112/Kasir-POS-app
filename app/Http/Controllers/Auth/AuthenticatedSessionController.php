<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\User;
use App\Models\UserLog;

class AuthenticatedSessionController extends Controller
{
    private function setUserStatus(User $user, string $status): void
    {
        $user->status = $status;
        $user->save();
    }

    public function create(Request $request): Response
    {
        $users = User::select('id', 'nama_user', 'tipe_user')->get();

        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
            'users' => $users,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama_user' => 'required|string',
            'kode_user' => 'required|string',
        ]);

        $user = \App\Models\User::where('nama_user', $request->nama_user)
        ->where('kode_user', $request->kode_user)->first();
        if (!$user) {
            return back()->withErrors(['kode_user' => 'Kode user salah.']);
        }
        if ($user->account === 'non-active') {
            return back()->withErrors(['kode_user' => 'Akun nonaktif, hubungi admin.']);
        }

        Auth::login($user);
        $request->session()->regenerate();
        UserLog::create([
            'user_id' => $user->id,
            'action' => 'login',
            'keterangan' => 'Login berhasil',
        ]);
        $redirectRoute = $user->tipe_user === 'admin' ? 'admin.dashboard' : 'kasir.dashboard';
        $user->update(['status' => 'Online']);
        return redirect()->route($redirectRoute)->with('status', 'Login berhasil!');
    }

    public function destroy(Request $request): RedirectResponse
    {
        $user = Auth::user(); // ✅ ambil user SEBELUM logout
        $account = User::where('id', $user->id);
        $account->update(['status' => 'Offline']);
        if ($user) {
            UserLog::create([
                'user_id' => $user->id,
                'action' => 'logout',
                'keterangan' => 'Logout',
            ]);
        }
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect('/login')->with('status', 'Logout berhasil!');
    }
}
