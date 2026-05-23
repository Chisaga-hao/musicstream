<?php

namespace App\Http\Controllers;

use App\Models\Chanson;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SongController extends Controller
{
    /** GET /api/songs */
    public function index()
    {
        return Chanson::with(['artist', 'album'])->latest()->paginate(20);
    }

    /** GET /api/songs/{id} */
    public function show($id)
    {
        return Chanson::with(['artist', 'album', 'notages'])->findOrFail($id);
    }

    /** GET /api/search?q=... */
    public function search(Request $request)
    {
        $q = $request->query('q', '');

        $songs = Chanson::with('artist')
            ->where('titre', 'like', "%$q%")
            ->orWhereHas('artist', fn($a) => $a->where('nomArtiste', 'like', "%$q%"))
            ->limit(10)->get();

        $artists = \App\Models\ArtistProfile::where('nomArtiste', 'like', "%$q%")->limit(5)->get();

        $albums = \App\Models\Album::with('artist')
            ->where('titre', 'like', "%$q%")
            ->limit(5)->get();

        return response()->json(compact('songs', 'artists', 'albums'));
    }

    /** POST /api/songs  [Artist only] */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'titre'    => 'required|string|max:200',
            'album_id' => 'nullable|exists:albums,id',
            'fichier'  => 'required|file|mimes:mp3,wav,ogg',
            'cover'    => 'nullable|image|max:5120',
            'duree'    => 'required|string|max:10',
        ]);

        $path = $request->file('fichier')->store('songs', 'public');
        $cover = $request->hasFile('cover')
            ? $request->file('cover')->store('covers', 'public')
            : null;

        $artist = $request->user()->artistProfile;

        $song = Chanson::create([
            'titre'         => $validated['titre'],
            'album_id'      => $validated['album_id'] ?? null,
            'artist_id'     => $artist->id,
            'fichier'       => $path,
            'cover'         => $cover,
            'duree'         => $validated['duree'],
            'nombreEcoutes' => 0,
        ]);

        return response()->json($song, 201);
    }

    /** PUT /api/songs/{id}  [Artist only — own songs] */
    public function update(Request $request, $id)
    {
        $song = Chanson::where('artist_id', $request->user()->artistProfile->id)
            ->findOrFail($id);

        $validated = $request->validate([
            'titre'    => 'sometimes|string|max:200',
            'album_id' => 'nullable|exists:albums,id',
        ]);

        $song->update($validated);
        return response()->json($song);
    }

    /** DELETE /api/songs/{id}  [Artist only — own songs] */
    public function destroy(Request $request, $id)
    {
        $song = Chanson::where('artist_id', $request->user()->artistProfile->id)
            ->findOrFail($id);

        Storage::disk('public')->delete($song->fichier);
        $song->delete();

        return response()->json(['message' => 'Song deleted.']);
    }

    /** POST /api/songs/{id}/play — increment play count */
    public function incrementPlay($id)
    {
        Chanson::findOrFail($id)->increment('nombreEcoutes');
        return response()->json(['message' => 'Play counted.']);
    }
}
