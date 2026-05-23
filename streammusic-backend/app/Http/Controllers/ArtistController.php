<?php

namespace App\Http\Controllers;

use App\Models\ArtistProfile;
use Illuminate\Http\Request;

class ArtistController extends Controller
{
    /** GET /api/artists */
    public function index()
    {
        return ArtistProfile::with('user')->paginate(20);
    }

    /** GET /api/artists/{id} */
    public function show($id)
    {
        return ArtistProfile::with(['albums.songs', 'songs'])->findOrFail($id);
    }

    /** POST /api/artist/create */
    public function becomeArtist(Request $request)
    {
        $user = $request->user();

        if ($user->artistProfile) {
            return response()->json(['message' => 'Already an artist.'], 422);
        }

        $v = $request->validate(['nomArtiste' => 'required|string|max:150']);

        $user->artistProfile()->create(['nomArtiste' => $v['nomArtiste']]);
        $user->update(['role' => 'artist']);

        // Also ensure listener profile exists
        if (!$user->listenerProfile) {
            $user->listenerProfile()->create();
        }

        return response()->json([
            'message' => 'Artist profile created successfully.',
            'user'    => $user->fresh(['listenerProfile', 'artistProfile']),
        ], 201);
    }

    /** PUT /api/artist/profile */
    public function updateProfile(Request $request)
    {
        $artist = $request->user()->artistProfile;
        if (!$artist) return response()->json(['message' => 'Artist profile not found.'], 404);

        $v = $request->validate([
            'nomArtiste' => 'sometimes|string|max:150',
            'bio'        => 'sometimes|string|max:2000',
        ]);

        $artist->update($v);
        return response()->json($artist);
    }
}
