<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /** GET /api/user */
    public function me(Request $request)
    {
        return response()->json(
            $request->user()->load(['listenerProfile', 'artistProfile'])
        );
    }

    /** PUT /api/user/profile */
    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'username' => 'sometimes|string|max:50|unique:users,username,' . $user->id,
            'nom'      => 'nullable|string|max:100',
            'prenom'   => 'nullable|string|max:100',
            'dateN'    => 'nullable|date',
            'photo'    => 'nullable|image|max:5120',
        ]);
         if ($request->hasFile('photo')) {

        $path = $request
            ->file('photo')
            ->store('images', 'public');

        // Example:
        // images/avatar.png

        $validated['photo'] = $path;
    }
        $user->update($validated);
        return response()->json($user);
    }

    /** PUT /api/user/password */
    public function updatePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => 'required|string',
            'new_password'     => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($validated['current_password'], $user->modepass)) {
            return response()->json(['message' => 'Current password is incorrect.'], 422);
        }

        $user->update(['modepass' => Hash::make($validated['new_password'])]);
        return response()->json(['message' => 'Password updated successfully.']);
    }

    /** DELETE /api/user */
    public function destroy(Request $request)
    {
        $request->user()->delete();
        return response()->json(['message' => 'Account deleted.']);
    }
}
