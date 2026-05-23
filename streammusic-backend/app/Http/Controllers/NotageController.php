<?php

namespace App\Http\Controllers;

use App\Models\Chanson;
use App\Models\Notage;
use Illuminate\Http\Request;

class NotageController extends Controller
{
    /** POST /api/songs/{id}/rate */
    public function rate(Request $request, $songId)
    {
        $v = $request->validate(['note' => 'required|integer|min:0|max:5']);
        Chanson::findOrFail($songId);

        $listener = $request->user()->listenerProfile;
        if (!$listener) return response()->json(['message' => 'Listener profile not found.'], 403);

        Notage::updateOrCreate(
            ['listener_id' => $listener->id, 'chanson_id' => $songId],
            ['note' => $v['note']]
        );

        return response()->json(['message' => 'Rating saved.', 'note' => $v['note']]);
    }

    /** GET /api/songs/{id}/rating */
    public function myRating(Request $request, $songId)
    {
        $listener = $request->user()->listenerProfile;
        $n = $listener
            ? Notage::where('listener_id', $listener->id)->where('chanson_id', $songId)->first()
            : null;
        return response()->json(['note' => $n?->note ?? 0]);
    }
}
