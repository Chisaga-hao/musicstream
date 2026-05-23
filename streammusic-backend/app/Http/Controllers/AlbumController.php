<?php

namespace App\Http\Controllers;

use App\Models\Album;
use App\Models\Chanson;
use Illuminate\Http\Request;

class AlbumController extends Controller
{
    /** GET /api/albums */
    public function index()
    {
        return Album::with(['artist', 'songs.artist'])->latest()->paginate(20);
    }

    /** GET /api/albums/{id} */
    public function show($id)
    {
        return Album::with(['artist', 'songs.artist'])->findOrFail($id);
    }

    /** POST /api/albums  [Artist only] */
    public function store(Request $request)
    {
        $v = $request->validate([
            'titre'      => 'required|string|max:200',
            'dateSortie' => 'required|date',
        ]);

        $album = $request->user()->artistProfile->albums()->create($v);
        return response()->json($album, 201);
    }

    /** PUT /api/albums/{id}  [Artist only] */
    public function update(Request $request, $id)
    {
        $album = Album::where('artist_id', $request->user()->artistProfile->id)->findOrFail($id);
        $album->update($request->validate([
            'titre'      => 'sometimes|string|max:200',
            'dateSortie' => 'sometimes|date',
        ]));
        return response()->json($album);
    }

    /** DELETE /api/albums/{id}  [Artist only] */
    public function destroy(Request $request, $id)
    {
        Album::where('artist_id', $request->user()->artistProfile->id)->findOrFail($id)->delete();
        return response()->json(['message' => 'Album deleted.']);
    }

    /** POST /api/albums/{albumId}/songs/{songId}  [Artist only] */
    public function addSong(Request $request, $albumId, $songId)
    {
        $artistId = $request->user()->artistProfile->id;
        $album = Album::where('artist_id', $artistId)->findOrFail($albumId);
        $song = Chanson::where('artist_id', $artistId)
    ->findOrFail($songId);

$song->update([
    'album_id' => $album->id
]);

// Si l'album n'a pas encore de cover
// on prend automatiquement le cover de la première chanson
if (!$album->cover && $song->cover) {
    $album->update([
        'cover' => $song->cover
    ]);
}
        return response()->json(['message' => 'Song added to album.']);
    }

    public function removeSong(Request $request, $albumId, $songId)
{
    $artistId = $request->user()->artistProfile->id;

    $album = Album::where('artist_id', $artistId)
        ->findOrFail($albumId);

    $song = Chanson::where('artist_id', $artistId)
        ->where('album_id', $album->id)
        ->findOrFail($songId);

    $song->update([
        'album_id' => null
    ]);

    return response()->json([
        'message' => 'Song removed from album.'
    ]);
}
}
