<?php

namespace App\Http\Controllers;

use App\Models\Playlist;
use App\Models\Chanson;
use Illuminate\Http\Request;

class PlaylistController extends Controller
{
    private function listener(Request $request)
    {
        $profile = $request->user()->listenerProfile;
        if (!$profile) abort(403, 'Listener profile not found.');
        return $profile;
    }

    public function index(Request $request)
    {
        return $this->listener($request)->playlists()->with('songs.artist')->get();
    }

    public function store(Request $request)
    {
        $v = $request->validate(['titre' => 'required|string|max:150']);
        $pl = $this->listener($request)->playlists()->create([
            'titre'        => $v['titre'],
            'dateCreation' => now()->toDateString(),
        ]);
        return response()->json($pl, 201);
    }

    public function show(Request $request, $id)
    {
        return $this->listener($request)->playlists()->with('songs.artist')->findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $pl = $this->listener($request)->playlists()->findOrFail($id);
        $pl->update($request->validate(['titre' => 'required|string|max:150']));
        return response()->json($pl);
    }

    public function destroy(Request $request, $id)
    {
        $this->listener($request)->playlists()->findOrFail($id)->delete();
        return response()->json(['message' => 'Playlist deleted.']);
    }

    public function addSong(Request $request, $id)
    {
        $pl = $this->listener($request)->playlists()->findOrFail($id);
        $v  = $request->validate(['song_id' => 'required|exists:chansons,id']);
        $pl->songs()->syncWithoutDetaching([$v['song_id']]);
        return response()->json(['message' => 'Song added to playlist.']);
    }

    public function removeSong(Request $request, $id, $songId)
    {
        $pl = $this->listener($request)->playlists()->findOrFail($id);
        $pl->songs()->detach($songId);
        return response()->json(['message' => 'Song removed from playlist.']);
    }
}
