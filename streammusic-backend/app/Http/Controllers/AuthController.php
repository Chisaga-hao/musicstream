<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * POST /api/register
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'username'  => 'required|string|max:50|unique:users',
            'nom'       => 'nullable|string|max:100',
            'prenom'    => 'nullable|string|max:100',
            'email'     => 'required|email|unique:users',
            'password'  => 'required|string|min:8',
            'dateN'     => 'nullable|date',
        ]);

        $user = User::create([
            'username'      => $validated['username'],
            'nom'           => $validated['nom'] ?? null,
            'prenom'        => $validated['prenom'] ?? null,
            'email'         => $validated['email'],
            'modepass'      => Hash::make($validated['password']),
            'dateN'         => $validated['dateN'] ?? null,
            'role'          => 'listener',
            'compteActif'   => true,
        ]);
         
        \App\Models\ListenerProfile::create([
        'user_id' => $user->id,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user'  => $user,
            'token' => $token,
        ], 201);
    }

    /**
     * POST /api/login
     */
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->modepass)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        if (!$user->compteActif) {
            return response()->json(['message' => 'Your account is disabled.'], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user'  => $user,
            'token' => $token,
        ]);
    }

    /**
     * POST /api/logout
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully.']);
    }
}
