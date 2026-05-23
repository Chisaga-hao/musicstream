<?php

namespace App\Http\Controllers;

use App\Models\Album;
use App\Models\ArtistProfile;
use App\Models\Chanson;
use App\Models\User;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    /** GET /api/admin/dashboard */
    public function dashboard()
    {
        return response()->json([
            'total_users'   => User::count(),
            'total_artists' => ArtistProfile::count(),
            'total_songs'   => Chanson::count(),
            'total_albums'  => Album::count(),
            'total_plays'   => Chanson::sum('nombreEcoutes'),
        ]);
    }

    /** GET /api/admin/users */
    public function users()
    {
        return User::with('artistProfile')->latest()->paginate(20);
    }

    /** PUT /api/admin/users/{id}/activate */
    public function activateUser($id)
    {
        User::findOrFail($id)->update(['compteActif' => true]);
        return response()->json(['message' => 'Account activated.']);
    }

    /** PUT /api/admin/users/{id}/deactivate */
    public function deactivateUser($id)
    {
        User::findOrFail($id)->update(['compteActif' => false]);
        return response()->json(['message' => 'Account deactivated.']);
    }

    /** GET /api/admin/artists */
    public function artists()
    {
        return ArtistProfile::with('user')->latest()->paginate(20);
    }

    /** PUT /api/admin/artists/{id}/suspend */
    public function suspendArtist($id)
    {
        $artist = ArtistProfile::findOrFail($id);
        $artist->user()->update(['compteActif' => false]);
        return response()->json(['message' => 'Artist suspended.']);
    }

    /** DELETE /api/admin/songs/{id} */
    public function deleteSong($id)
    {
        Chanson::findOrFail($id)->delete();
        return response()->json(['message' => 'Song deleted by admin.']);
    }

    /** DELETE /api/admin/albums/{id} */
    public function deleteAlbum($id)
    {
        Album::findOrFail($id)->delete();
        return response()->json(['message' => 'Album deleted by admin.']);
    }
}
