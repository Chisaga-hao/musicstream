<?php

/**
 * CORS configuration for StreamMusic
 * This file replaces config/cors.php in your Laravel installation.
 * Allows the React frontend (http://localhost:5173) to call the API.
 */

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:5173',   // React dev server (pnpm dev)
        'http://localhost:3000',   // Alternative React port
        'http://127.0.0.1:5173',
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,
];
