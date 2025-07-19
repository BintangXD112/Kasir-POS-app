<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index()
    {
        $users = User::orderBy('created_at', 'desc')->get();
        return Inertia::render('view/user', [
            'users' => $users,
        ]);
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $data = $request->validate([
            'nama_user' => 'required|string',
            'tipe_user' => 'required|in:admin,kasir',
            'kode_user' => 'required|string|unique:users,kode_user,' . $id,
            'status' => 'required|in:active,non-active',
        ]);
        $user->update($data);
        return redirect()->back()->with('status', 'User updated successfully');
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();
        return redirect()->back()->with('status', 'User deleted successfully');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nama_user' => 'required|string',
            'tipe_user' => 'required|in:admin,kasir',
            'kode_user' => 'required|string|unique:users,kode_user',
            'status' => 'required|in:active,non-active',
        ]);
        User::create($data);
        return redirect()->back()->with('status', 'User created successfully');
    }

    public function edit($id)
    {
        $user = User::findOrFail($id);
        return Inertia::render('view/user-edit', [
            'user' => $user,
        ]);
    }
} 