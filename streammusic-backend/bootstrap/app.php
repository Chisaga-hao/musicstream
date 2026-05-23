<?php

/**
 * ─────────────────────────────────────────────────────────────────
 * bootstrap/app.php — StreamMusic Laravel configuration
 * ─────────────────────────────────────────────────────────────────
 * After running: composer create-project laravel/laravel .
 * REPLACE the entire contents of bootstrap/app.php with this file.
 * ─────────────────────────────────────────────────────────────────
 */

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // ── Sanctum stateful middleware for API ──────────────────────────
        
        // ── Register custom role middleware ──────────────────────────────
        // This fixes the "role:artist" / "role:admin" middleware in api.php
        $middleware->alias([
            'role' => \App\Http\Middleware\CheckRole::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
