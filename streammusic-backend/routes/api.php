<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\SongController;
use App\Http\Controllers\AlbumController;
use App\Http\Controllers\PlaylistController;
use App\Http\Controllers\ArtistController;
use App\Http\Controllers\NotageController;
use App\Http\Controllers\AdminController;

/*
|--------------------------------------------------------------------------
| API Routes — StreamMusic Platform
|--------------------------------------------------------------------------
| All routes return JSON. Protected routes require Sanctum token.
| Add "Authorization: Bearer {token}" header to authenticated requests.
*/

// ── Public routes ────────────────────────────────────────────────────────────
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// Public search & discovery
Route::get('/search',        [SongController::class, 'search']);
Route::get('/songs',         [SongController::class, 'index']);
Route::get('/songs/{id}',    [SongController::class, 'show']);
Route::get('/albums',        [AlbumController::class, 'index']);
Route::get('/albums/{id}',   [AlbumController::class, 'show']);
Route::get('/artists',       [ArtistController::class, 'index']);
Route::get('/artists/{id}',  [ArtistController::class, 'show']);

// ── Authenticated routes ──────────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);

    // ── User Profile ──────────────────────────────────────────────────────────
    Route::get  ('/user',         [UserController::class, 'me']);
    Route::put  ('/user/profile', [UserController::class, 'update']);
    Route::put  ('/user/password',[UserController::class, 'updatePassword']);
    Route::delete('/user',        [UserController::class, 'destroy']);

    // ── Become Artist ─────────────────────────────────────────────────────────
    Route::post('/artist/create', [ArtistController::class, 'becomeArtist']);

    // ── Playlists (Listener) ──────────────────────────────────────────────────
    Route::apiResource('playlists', PlaylistController::class);
    Route::post  ('/playlists/{id}/songs',       [PlaylistController::class, 'addSong']);
    
    Route::delete('/playlists/{id}/songs/{songId}', [PlaylistController::class, 'removeSong']);

    // ── Song Ratings ──────────────────────────────────────────────────────────
    Route::post('/songs/{id}/rate',  [NotageController::class, 'rate']);
    Route::get ('/songs/{id}/rating',[NotageController::class, 'myRating']);

    // ── Listen tracking ───────────────────────────────────────────────────────
    Route::post('/songs/{id}/play', [SongController::class, 'incrementPlay']);

    // ── Artist-only routes ────────────────────────────────────────────────────
    Route::middleware('role:artist')->group(function () {
        Route::put  ('/artist/profile',       [ArtistController::class, 'updateProfile']);
        Route::post ('/songs',                [SongController::class, 'store']);
        Route::put  ('/songs/{id}',           [SongController::class, 'update']);
        Route::delete('/songs/{id}',          [SongController::class, 'destroy']);
        Route::apiResource('albums', AlbumController::class)->except(['index', 'show']);
        Route::post ('/albums/{id}/songs/{songId}', [AlbumController::class, 'addSong']);
        Route::delete('/albums/{albumId}/songs/{songId}', [AlbumController::class, 'removeSong']);
    });

    // ── Admin-only routes ─────────────────────────────────────────────────────
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get   ('/dashboard',            [AdminController::class, 'dashboard']);
        Route::get   ('/users',                [AdminController::class, 'users']);
        Route::put   ('/users/{id}/activate',  [AdminController::class, 'activateUser']);
        Route::put   ('/users/{id}/deactivate',[AdminController::class, 'deactivateUser']);
        Route::get   ('/artists',              [AdminController::class, 'artists']);
        Route::put   ('/artists/{id}/suspend', [AdminController::class, 'suspendArtist']);
        Route::delete('/songs/{id}',           [AdminController::class, 'deleteSong']);
        Route::delete('/albums/{id}',          [AdminController::class, 'deleteAlbum']);
    });
});
