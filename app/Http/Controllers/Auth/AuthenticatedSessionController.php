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

    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();
        $request->session()->regenerate();

        $user = Auth::user(); // ✅ fix
        $this->setUserStatus($user, 'active');

        $redirectRoute = $user->tipe_user === 'admin' ? 'admin' : 'kasir';

        return redirect()->route($redirectRoute)->with('status', 'Login berhasil!');
    }

    public function destroy(Request $request): RedirectResponse
    {
        $user = Auth::user(); // ✅ ambil user SEBELUM logout

        if ($user) {
            $this->setUserStatus($user, 'non-active');
        }

        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/login')->with('status', 'Logout berhasil!');
    }
}
