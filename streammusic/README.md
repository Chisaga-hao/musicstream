<div align="center">

# 🎵 StreamMusic

**Plateforme de streaming musical fullstack — React + Laravel**

![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Laravel](https://img.shields.io/badge/Laravel-10-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Sanctum](https://img.shields.io/badge/Sanctum-Auth-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-HTTP-5A29E4?style=for-the-badge&logo=axios&logoColor=white)

</div>

---

## 📋 Table des matières

1. [Présentation](#-présentation)
2. [Architecture globale](#-architecture-globale)
3. [Fonctionnalités](#-fonctionnalités)
4. [Prérequis](#-prérequis)
5. [Installation complète](#-installation-complète)
6. [Configuration](#-configuration)
7. [Lancement](#-lancement)
8. [Structure du projet](#-structure-du-projet)
9. [Base de données](#-base-de-données)
10. [Backend — Détail complet](#-backend--détail-complet)
    - [Authentification & Sécurité](#-authentification--sécurité)
    - [Middlewares](#-middlewares)
    - [Modèles & Relations](#-modèles--relations)
    - [Contrôleurs](#-contrôleurs)
    - [Routes API](#-routes-api-complètes)
    - [Stockage fichiers](#-stockage-des-fichiers)
11. [Frontend — Détail complet](#-frontend--détail-complet)
    - [API Client](#-api-client--srcappapiclientts)
    - [MusicContext](#-musiccontext--srcappcontextmusiccontexttsx)
    - [Système Audio](#-système-audio-audio-engine)
    - [Routing](#-routing--srcapproutestsx)
    - [Layout & Composants UI](#-layout--composants-ui)
    - [Pages](#-pages--détail-complet)
12. [Workflows utilisateurs](#-workflows-utilisateurs)
13. [Gestion des rôles](#-gestion-des-rôles)
14. [Choix techniques](#-choix-techniques)
15. [Technologies utilisées](#-technologies-utilisées)
16. [Difficultés rencontrées](#-difficultés-rencontrées)
17. [Captures d'écran recommandées](#-captures-décran-recommandées)
18. [Améliorations futures](#-améliorations-futures)

---

## 🎧 Présentation

**StreamMusic** est une application web complète de streaming musical permettant aux utilisateurs d'écouter, d'uploader et de gérer de la musique en ligne.

Le projet repose sur une architecture **frontend/backend séparée** (découplée) :

| Couche | Technologie | Port |
|--------|-------------|------|
| Frontend SPA | React + TypeScript + Vite + TailwindCSS | `5173` |
| Backend API REST | Laravel 10 + Sanctum | `8000` |
| Base de données | MySQL 8 | `3306` |
| Authentification | Laravel Sanctum (tokens) | — |
| Stockage médias | Laravel Storage (`storage/app/public`) | — |

---

## 🏗️ Architecture globale

### Structure des dossiers

```
stream-final/
│
├── streammusic/               → Frontend React (SPA)
│
└── streammusic-backend/       → Backend Laravel (API REST)
```

### Flux de communication complet

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND React                        │
│                                                              │
│  Pages  →  Context API  →  Axios (client.ts)                │
└──────────────────────┬──────────────────────────────────────┘
                       │  HTTP Requests
                       │  Authorization: Bearer TOKEN
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                       BACKEND Laravel                        │
│                                                              │
│  Routes (api.php)                                           │
│       ↓                                                      │
│  Middlewares (auth:sanctum, admin, artist)                  │
│       ↓                                                      │
│  Controllers (AuthController, SongController...)            │
│       ↓                                                      │
│  Models Eloquent (User, Chanson, Album...)                  │
│       ↓                                                      │
│  MySQL Database                                              │
│       ↓                                                      │
│  Storage (fichiers audio + images)                          │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Fonctionnalités

### 👤 Listener (utilisateur standard)
- Inscription et connexion sécurisée
- Écoute de musique avec lecteur audio complet (play, pause, next, previous)
- File d'attente musicale (queue)
- Repeat mode (`none` / `one` / `all`)
- Shuffle
- Barre de progression avec seek
- Contrôle du volume
- Création et gestion de playlists personnelles
- Ajout / retrait de chansons dans les playlists
- Notation des chansons (système d'étoiles)
- Recherche de chansons, artistes et albums
- Consultation des profils artistes
- Consultation des albums

### 🎤 Artiste
- Upload de fichiers audio (MP3, WAV)
- Upload de covers (image pochette)
- Création et gestion d'albums
- Ajout / retrait de chansons dans les albums
- Gestion du profil artiste (photo, biographie, nom d'artiste)
- Suppression et modification de ses chansons
- Consultation des statistiques d'écoute

### 🛡️ Admin
- Tableau de bord d'administration
- Gestion complète des utilisateurs
- Activation / désactivation de comptes
- Suspension d'artistes
- Suppression de chansons et albums
- Supervision des artistes inscrits

---

## 📦 Prérequis

Avant de commencer, assure-toi d'avoir installé :

| Outil | Version minimale | Vérification |
|-------|-----------------|--------------|
| PHP | >= 8.1 | `php -v` |
| Composer | >= 2.x | `composer -V` |
| Node.js | >= 18.x | `node -v` |
| npm | >= 9.x | `npm -v` |
| MySQL | >= 8.x | Via WAMP/XAMPP |
| Git | Toute version | `git --version` |

> 💡 Recommandé : utiliser **WAMP** (Windows) ou **XAMPP** pour MySQL + Apache.

---

## 🚀 Installation complète

### Étape 1 — Cloner le projet

```bash
git clone https://github.com/ton-user/stream-final.git
cd stream-final
```

### Étape 2 — Backend Laravel

```bash
cd streammusic-backend

# 1. Installer les dépendances PHP
composer install

# 2. Copier le fichier d'environnement
cp .env.example .env

# 3. Générer la clé applicative Laravel
php artisan key:generate

# 4. Créer la base de données MySQL
# (dans phpMyAdmin ou ligne de commande)
mysql -u root -e "CREATE DATABASE streammusic;"

# 5. Lancer les migrations
php artisan migrate

# 6. Créer le lien symbolique du storage
php artisan storage:link
```

### Étape 3 — Frontend React

```bash
cd ../streammusic

# Installer les dépendances Node
npm install
```

---

## ⚙️ Configuration

### Backend — `streammusic-backend/.env`

```env
APP_NAME=StreamMusic
APP_ENV=local
APP_KEY=                          # Généré par php artisan key:generate
APP_DEBUG=true
APP_URL=http://127.0.0.1:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=streammusic
DB_USERNAME=root
DB_PASSWORD=

FILESYSTEM_DISK=public
```

### Frontend — `streammusic/src/app/api/client.ts`

L'URL du backend est configurée directement dans le client Axios :

```ts
baseURL: 'http://127.0.0.1:8000/api'
```

> Si tu changes le port du backend, modifie cette valeur.

### CORS Laravel — `config/cors.php`

Le frontend tourne sur `http://localhost:5173`.
Assure-toi que ce domaine est autorisé :

```php
'allowed_origins' => ['http://localhost:5173'],
'supports_credentials' => true,
```

---

## ▶️ Lancement

### Backend

```bash
cd streammusic-backend
php artisan serve
```

> ✅ API disponible sur : **http://127.0.0.1:8000**

### Frontend

```bash
cd streammusic
npm run dev
```

> ✅ Application disponible sur : **http://localhost:5173**

### Commandes utiles Laravel

| Commande | Description |
|----------|-------------|
| `php artisan serve` | Lancer le serveur de développement |
| `php artisan migrate` | Lancer les migrations |
| `php artisan migrate:fresh` | Réinitialiser toutes les tables |
| `php artisan migrate:fresh --seed` | Réinitialiser + données de test |
| `php artisan storage:link` | Créer le lien symbolique storage |
| `php artisan make:controller X` | Créer un contrôleur |
| `php artisan make:model X -m` | Créer un modèle + migration |
| `php artisan make:middleware X` | Créer un middleware |
| `php artisan route:list` | Lister toutes les routes API |
| `php artisan cache:clear` | Vider le cache |

---

## 📁 Structure du projet

### Backend — `streammusic-backend/`

```
streammusic-backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── AuthController.php         → register, login, logout
│   │   │   ├── SongController.php         → CRUD + upload + search + play count
│   │   │   ├── AlbumController.php        → CRUD + addSong + removeSong
│   │   │   ├── PlaylistController.php     → CRUD + addSong + removeSong
│   │   │   ├── ArtistController.php       → profil + becomeArtist
│   │   │   ├── UserController.php         → profil + password + delete
│   │   │   ├── NotageController.php       → rate + myRating
│   │   │   └── AdminController.php        → dashboard + gestion users + contenus
│   │   └── Middleware/
│   │       ├── AdminMiddleware.php        → accès admin uniquement
│   │       └── ArtistMiddleware.php       → accès artiste uniquement
│   └── Models/
│       ├── User.php
│       ├── Chanson.php
│       ├── Album.php
│       ├── Playlist.php
│       ├── ArtistProfile.php
│       ├── ListenerProfile.php
│       └── Notage.php
├── database/
│   └── migrations/
│       ├── create_users_table.php
│       ├── create_artist_profiles_table.php
│       ├── create_listener_profiles_table.php
│       ├── create_albums_table.php
│       ├── create_chansons_table.php
│       ├── create_playlists_table.php
│       ├── create_chanson_playlist_table.php
│       └── create_notages_table.php
├── routes/
│   └── api.php                            → toutes les routes API
├── storage/
│   └── app/public/                        → fichiers audio + images uploadés
└── .env                                   → configuration environnement
```

### Frontend — `streammusic/`

```
streammusic/
├── index.html                             → Point d'entrée HTML
├── vite.config.ts                         → Config Vite
├── tailwind.config.js                     → Config TailwindCSS
├── tsconfig.json                          → Config TypeScript
├── package.json                           → Dépendances npm
└── src/
    ├── main.tsx                           → Montage React + Router
    ├── app/
    │   ├── api/
    │   │   └── client.ts                  → Axios + toutes les APIs
    │   ├── components/
    │   │   ├── Layout.tsx                 → Shell : sidebar + navbar + lecteur
    │   │   ├── Sidebar.tsx                → Navigation principale
    │   │   ├── MusicPlayer.tsx            → Lecteur audio global
    │   │   ├── ProgressBar.tsx            → Barre de progression audio
    │   │   ├── AudioControls.tsx          → Boutons play/pause/next/prev/volume
    │   │   └── Modals/                    → Fenêtres popup (playlists, upload, édition)
    │   ├── context/
    │   │   └── MusicContext.tsx           → État global lecteur audio (Context API)
    │   ├── pages/
    │   │   ├── LoginPage.tsx              → Connexion
    │   │   ├── RegisterPage.tsx           → Inscription + choix rôle
    │   │   ├── ListenerPage.tsx           → Page principale listener
    │   │   ├── ArtistPage.tsx             → Dashboard artiste
    │   │   ├── AlbumProfilePage.tsx       → Détail d'un album
    │   │   ├── ArtistProfilePage.tsx      → Profil public artiste
    │   │   ├── AccountSettingsPage.tsx    → Paramètres du compte
    │   │   ├── SearchPage.tsx             → Recherche globale
    │   │   └── DeveloperPage.tsx          → Page debug/développement
    │   └── routes.tsx                     → Définition routes React Router
    └── styles/
        └── index.css                      → Styles globaux + directives Tailwind
```

---

## 🗄️ Base de données

### Diagramme relationnel

```
User
 ├── hasOne  → ArtistProfile (nomArtiste, bio, photo)
 ├── hasOne  → ListenerProfile (photo, bio)
 ├── hasMany → Playlists
 ├── hasMany → Chansons (si artiste)
 └── hasMany → Notages

ArtistProfile
 └── belongsTo → User
      └── hasMany → Albums
           └── hasMany → Chansons

Chanson
 ├── belongsTo  → Album
 ├── belongsTo  → Artist (User)
 ├── belongsToMany → Playlists (via chanson_playlist)
 └── hasMany    → Notages

Playlist
 ├── belongsTo     → User
 └── belongsToMany → Chansons (via chanson_playlist)

Notage
 ├── belongsTo → User
 └── belongsTo → Chanson
```

### Tables détaillées

#### `users`
| Champ | Type | Description |
|-------|------|-------------|
| id | bigint PK | Identifiant |
| username | string | Nom d'utilisateur |
| email | string unique | Email |
| password | string | Mot de passe hashé |
| role | enum | `admin` / `artist` / `listener` |
| active | boolean | Compte actif ou suspendu |
| created_at | timestamp | Date création |

#### `artist_profiles`
| Champ | Type | Description |
|-------|------|-------------|
| id | bigint PK | Identifiant |
| user_id | FK → users | Référence utilisateur |
| nomArtiste | string | Nom d'artiste public |
| bio | text | Biographie |
| photo | string | Chemin photo profil |

#### `listener_profiles`
| Champ | Type | Description |
|-------|------|-------------|
| id | bigint PK | Identifiant |
| user_id | FK → users | Référence utilisateur |
| photo | string | Photo profil |
| bio | text | Description |

#### `albums`
| Champ | Type | Description |
|-------|------|-------------|
| id | bigint PK | Identifiant |
| titre | string | Titre de l'album |
| dateSortie | date | Date de sortie |
| artist_id | FK → users | Artiste propriétaire |
| cover | string | Chemin image cover |

#### `chansons`
| Champ | Type | Description |
|-------|------|-------------|
| id | bigint PK | Identifiant |
| titre | string | Titre de la chanson |
| duree | integer | Durée en secondes |
| fichier | string | Chemin fichier audio |
| cover | string | Chemin image pochette |
| nombreEcoutes | integer | Compteur d'écoutes |
| artist_id | FK → users | Artiste |
| album_id | FK → albums nullable | Album (optionnel) |

#### `playlists`
| Champ | Type | Description |
|-------|------|-------------|
| id | bigint PK | Identifiant |
| titre | string | Nom de la playlist |
| user_id | FK → users | Propriétaire |
| dateCreation | timestamp | Date de création |

#### `chanson_playlist` (pivot many-to-many)
| Champ | Type | Description |
|-------|------|-------------|
| chanson_id | FK → chansons | Chanson |
| playlist_id | FK → playlists | Playlist |

#### `notages`
| Champ | Type | Description |
|-------|------|-------------|
| id | bigint PK | Identifiant |
| user_id | FK → users | Utilisateur |
| chanson_id | FK → chansons | Chanson notée |
| note | integer | Note (1 à 5) |

---

## 🔧 Backend — Détail complet

### 🔐 Authentification & Sécurité

Le projet utilise **Laravel Sanctum** pour sécuriser toutes les communications API.

#### Fonctionnement du système de tokens

```
1. L'utilisateur soumet email + password
2. Laravel vérifie les identifiants en base
3. Sanctum génère un token unique sécurisé
4. Le token est retourné au frontend (JSON)
5. React stocke le token dans localStorage
6. Axios injecte automatiquement le token :
        Authorization: Bearer <TOKEN>
7. Toutes les routes protégées vérifient ce token
```

#### Gestion de la session côté frontend

```ts
// Stockage après login
localStorage.setItem('token', response.data.token);
localStorage.setItem('user', JSON.stringify(response.data.user));

// Lecture à chaque requête (interceptor Axios)
const token = localStorage.getItem('token');
config.headers.Authorization = `Bearer ${token}`;

// Suppression au logout
localStorage.removeItem('token');
localStorage.removeItem('user');
```

---

### 🛡️ Middlewares

#### `auth:sanctum`

Middleware principal de Laravel Sanctum. Protège toutes les routes privées.

```php
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('playlists', PlaylistController::class);
    Route::apiResource('albums', AlbumController::class);
    Route::post('/songs/{id}/rate', [NotageController::class, 'rate']);
});
```

Responsabilités :
- Vérification que l'utilisateur est connecté
- Validation du token Bearer
- Rejection avec `401 Unauthorized` si invalide

#### `AdminMiddleware`

Restreint l'accès aux seuls administrateurs.

```php
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('/admin/dashboard', [AdminController::class, 'dashboard']);
    Route::get('/admin/users', [AdminController::class, 'users']);
    Route::post('/admin/users/{id}/activate', [AdminController::class, 'activateUser']);
    Route::post('/admin/users/{id}/deactivate', [AdminController::class, 'deactivateUser']);
    Route::delete('/admin/songs/{id}', [AdminController::class, 'deleteSong']);
    Route::delete('/admin/albums/{id}', [AdminController::class, 'deleteAlbum']);
});
```

#### `ArtistMiddleware`

Restreint l'accès aux seuls artistes.

```php
Route::middleware(['auth:sanctum', 'artist'])->group(function () {
    Route::post('/songs', [SongController::class, 'store']);
    Route::put('/songs/{id}', [SongController::class, 'update']);
    Route::delete('/songs/{id}', [SongController::class, 'destroy']);
    Route::post('/albums', [AlbumController::class, 'store']);
});
```

#### Tableau de protection des routes

| Route | Middleware requis |
|-------|------------------|
| `POST /login` | Public |
| `POST /register` | Public |
| `GET /songs` | Public |
| `GET /albums` | Public |
| `GET /artists` | Public |
| `POST /songs` | `auth:sanctum` + `artist` |
| `PUT /songs/{id}` | `auth:sanctum` + `artist` |
| `DELETE /songs/{id}` | `auth:sanctum` + `artist` |
| `POST /albums` | `auth:sanctum` + `artist` |
| `GET /playlists` | `auth:sanctum` |
| `POST /playlists` | `auth:sanctum` |
| `POST /songs/{id}/rate` | `auth:sanctum` |
| `GET /admin/*` | `auth:sanctum` + `admin` |

---

### 📐 Modèles & Relations

#### `User.php`

```php
// Relations
public function artistProfile() { return $this->hasOne(ArtistProfile::class); }
public function listenerProfile() { return $this->hasOne(ListenerProfile::class); }
public function playlists() { return $this->hasMany(Playlist::class); }
public function chansons() { return $this->hasMany(Chanson::class, 'artist_id'); }
public function notages() { return $this->hasMany(Notage::class); }
```

#### `Chanson.php`

```php
// Relations
public function album() { return $this->belongsTo(Album::class); }
public function artist() { return $this->belongsTo(User::class, 'artist_id'); }
public function playlists() { return $this->belongsToMany(Playlist::class, 'chanson_playlist'); }
public function notages() { return $this->hasMany(Notage::class); }
```

#### `Album.php`

```php
public function artist() { return $this->belongsTo(User::class, 'artist_id'); }
public function chansons() { return $this->hasMany(Chanson::class); }
```

#### `Playlist.php`

```php
public function user() { return $this->belongsTo(User::class); }
public function chansons() { return $this->belongsToMany(Chanson::class, 'chanson_playlist'); }
```

---

### 🎮 Contrôleurs

#### `AuthController`

| Méthode | Route | Description |
|---------|-------|-------------|
| `register()` | `POST /api/register` | Créer un compte + générer token |
| `login()` | `POST /api/login` | Vérifier identifiants + retourner token |
| `logout()` | `POST /api/logout` | Révoquer le token actuel |

#### `SongController`

| Méthode | Route | Description |
|---------|-------|-------------|
| `index()` | `GET /api/songs` | Lister toutes les chansons |
| `show()` | `GET /api/songs/{id}` | Détail d'une chanson |
| `search()` | `GET /api/songs?search=x` | Recherche par titre |
| `store()` | `POST /api/songs` | Upload nouvelle chanson |
| `update()` | `PUT /api/songs/{id}` | Modifier une chanson |
| `destroy()` | `DELETE /api/songs/{id}` | Supprimer une chanson |
| `incrementPlay()` | `POST /api/songs/{id}/play` | Incrémenter compteur écoutes |

#### `AlbumController`

| Méthode | Route | Description |
|---------|-------|-------------|
| `index()` | `GET /api/albums` | Lister tous les albums |
| `show()` | `GET /api/albums/{id}` | Détail d'un album |
| `store()` | `POST /api/albums` | Créer un album |
| `update()` | `PUT /api/albums/{id}` | Modifier un album |
| `destroy()` | `DELETE /api/albums/{id}` | Supprimer un album |
| `addSong()` | `POST /api/albums/{id}/songs` | Ajouter chanson à l'album |
| `removeSong()` | `DELETE /api/albums/{id}/songs/{songId}` | Retirer chanson de l'album |

#### `PlaylistController`

| Méthode | Route | Description |
|---------|-------|-------------|
| `listener()` | `GET /api/playlists/listener` | Playlists du listener connecté |
| `index()` | `GET /api/playlists` | Toutes les playlists |
| `store()` | `POST /api/playlists` | Créer une playlist |
| `show()` | `GET /api/playlists/{id}` | Détail d'une playlist |
| `update()` | `PUT /api/playlists/{id}` | Modifier une playlist |
| `destroy()` | `DELETE /api/playlists/{id}` | Supprimer une playlist |
| `addSong()` | `POST /api/playlists/{id}/songs` | Ajouter chanson |
| `removeSong()` | `DELETE /api/playlists/{id}/songs/{songId}` | Retirer chanson |

#### `ArtistController`

| Méthode | Route | Description |
|---------|-------|-------------|
| `index()` | `GET /api/artists` | Lister tous les artistes |
| `show()` | `GET /api/artists/{id}` | Profil d'un artiste |
| `becomeArtist()` | `POST /api/become-artist` | Passer en mode artiste |
| `updateProfile()` | `PUT /api/artists/{id}` | Modifier profil artiste |

#### `UserController`

| Méthode | Route | Description |
|---------|-------|-------------|
| `me()` | `GET /api/me` | Profil de l'utilisateur connecté |
| `update()` | `PUT /api/users/{id}` | Modifier profil |
| `updatePassword()` | `PUT /api/users/{id}/password` | Changer mot de passe |
| `destroy()` | `DELETE /api/users/{id}` | Supprimer le compte |

#### `NotageController`

| Méthode | Route | Description |
|---------|-------|-------------|
| `rate()` | `POST /api/songs/{id}/rate` | Noter une chanson |
| `myRating()` | `GET /api/songs/{id}/my-rating` | Récupérer sa note |

#### `AdminController`

| Méthode | Route | Description |
|---------|-------|-------------|
| `dashboard()` | `GET /api/admin/dashboard` | Statistiques globales |
| `users()` | `GET /api/admin/users` | Liste tous les utilisateurs |
| `activateUser()` | `POST /api/admin/users/{id}/activate` | Activer un compte |
| `deactivateUser()` | `POST /api/admin/users/{id}/deactivate` | Désactiver un compte |
| `artists()` | `GET /api/admin/artists` | Liste des artistes |
| `suspendArtist()` | `POST /api/admin/artists/{id}/suspend` | Suspendre un artiste |
| `deleteSong()` | `DELETE /api/admin/songs/{id}` | Supprimer une chanson |
| `deleteAlbum()` | `DELETE /api/admin/albums/{id}` | Supprimer un album |

---

### 🔌 Routes API complètes

Fichier : `routes/api.php`

```php
// ─── PUBLIC ─────────────────────────────────────────
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);
Route::get('/songs',     [SongController::class, 'index']);
Route::get('/songs/{id}',[SongController::class, 'show']);
Route::get('/albums',    [AlbumController::class, 'index']);
Route::get('/albums/{id}',[AlbumController::class, 'show']);
Route::get('/artists',   [ArtistController::class, 'index']);
Route::get('/artists/{id}',[ArtistController::class, 'show']);

// ─── CONNECTÉ ────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [UserController::class, 'me']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::put('/users/{id}/password', [UserController::class, 'updatePassword']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);

    Route::post('/songs/{id}/play', [SongController::class, 'incrementPlay']);
    Route::post('/songs/{id}/rate', [NotageController::class, 'rate']);
    Route::get('/songs/{id}/my-rating', [NotageController::class, 'myRating']);

    Route::apiResource('playlists', PlaylistController::class);
    Route::post('/playlists/{id}/songs', [PlaylistController::class, 'addSong']);
    Route::delete('/playlists/{id}/songs/{songId}', [PlaylistController::class, 'removeSong']);

    // ─── ARTISTE ─────────────────────────────────────
    Route::middleware('artist')->group(function () {
        Route::post('/songs', [SongController::class, 'store']);
        Route::put('/songs/{id}', [SongController::class, 'update']);
        Route::delete('/songs/{id}', [SongController::class, 'destroy']);
        Route::post('/albums', [AlbumController::class, 'store']);
        Route::put('/albums/{id}', [AlbumController::class, 'update']);
        Route::delete('/albums/{id}', [AlbumController::class, 'destroy']);
        Route::post('/albums/{id}/songs', [AlbumController::class, 'addSong']);
        Route::delete('/albums/{id}/songs/{songId}', [AlbumController::class, 'removeSong']);
        Route::put('/artists/{id}', [ArtistController::class, 'updateProfile']);
    });

    // ─── ADMIN ───────────────────────────────────────
    Route::middleware('admin')->group(function () {
        Route::get('/admin/dashboard', [AdminController::class, 'dashboard']);
        Route::get('/admin/users', [AdminController::class, 'users']);
        Route::post('/admin/users/{id}/activate', [AdminController::class, 'activateUser']);
        Route::post('/admin/users/{id}/deactivate', [AdminController::class, 'deactivateUser']);
        Route::get('/admin/artists', [AdminController::class, 'artists']);
        Route::post('/admin/artists/{id}/suspend', [AdminController::class, 'suspendArtist']);
        Route::delete('/admin/songs/{id}', [AdminController::class, 'deleteSong']);
        Route::delete('/admin/albums/{id}', [AdminController::class, 'deleteAlbum']);
    });
});
```

---

### 📂 Stockage des fichiers

Les fichiers audio et les images sont stockés dans :

```
/public/storage/
├── songs/         → fichiers MP3/WAV uploadés
└── covers/        → images pochettes/profils
```

Commande obligatoire (crée le lien symbolique) :

```bash
php artisan storage:link
```

Cela crée : `public/storage` → `storage/app/public`

URL publique d'accès :

```
http://localhost:8000/storage/songs/nom_fichier.mp3
http://localhost:8000/storage/covers/nom_image.jpg
```

#### Validation des fichiers uploadés

```php
$request->validate([
    'fichier' => 'required|mimes:mp3,wav|max:20480',   // max 20MB
    'cover'   => 'nullable|image|mimes:jpg,png,jpeg|max:2048',
    'titre'   => 'required|string|max:255',
]);
```

#### Gestion des erreurs backend

Réponses JSON normalisées retournées par Laravel :

```json
// Succès
{ "message": "Chanson uploadée avec succès", "data": { ... } }

// Erreur d'authentification
{ "message": "Unauthenticated" }

// Erreur de validation
{ "errors": { "fichier": ["Le fichier est obligatoire"] } }

// Accès refusé
{ "message": "Unauthorized" }
```

---

## ⚛️ Frontend — Détail complet

### Installation & scripts disponibles

```bash
cd streammusic

npm install          # Installer les dépendances
npm run dev          # Démarrer en développement → http://localhost:5173
npm run build        # Build de production → /dist
npm run preview      # Prévisualiser le build de production
npm run lint         # Linter TypeScript
```

---

### 🔗 API Client — `src/app/api/client.ts`

Fichier central qui configure **Axios** et expose toutes les fonctions de communication avec le backend Laravel.

#### Configuration Axios

```ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: { 'Content-Type': 'application/json' }
});

// Interceptor : injection automatique du token à chaque requête
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor : gestion globale des erreurs
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

#### APIs exposées

| Objet API | Méthodes principales |
|-----------|---------------------|
| `authApi` | `login(data)`, `register(data)`, `logout()` |
| `songsApi` | `getAll()`, `getOne(id)`, `upload(formData)`, `update(id, data)`, `delete(id)`, `incrementPlay(id)`, `search(query)` |
| `albumsApi` | `getAll()`, `getOne(id)`, `create(data)`, `update(id, data)`, `delete(id)`, `addSong(albumId, songId)`, `removeSong(albumId, songId)` |
| `playlistsApi` | `getMyPlaylists()`, `getOne(id)`, `create(data)`, `update(id, data)`, `delete(id)`, `addSong(playlistId, songId)`, `removeSong(playlistId, songId)` |
| `artistsApi` | `getAll()`, `getOne(id)`, `becomeArtist()`, `updateProfile(id, data)` |
| `usersApi` | `me()`, `update(id, data)`, `updatePassword(id, data)`, `delete(id)` |
| `notageApi` | `rate(songId, note)`, `myRating(songId)` |

---

### 🎵 MusicContext — `src/app/context/MusicContext.tsx`

Composant **central** du lecteur audio. Il gère l'état global de la lecture via la **Context API** de React, sans librairie externe. Accessible depuis n'importe quel composant via `useMusicContext()`.

#### État global complet

```ts
interface MusicContextType {
  // Chanson actuelle
  currentSong: Song | null;

  // File d'attente
  queue: Song[];

  // État lecture
  isPlaying: boolean;

  // Paramètres audio
  volume: number;          // 0.0 à 1.0
  progress: number;        // 0 à 100 (pourcentage)
  duration: number;        // durée totale en secondes
  currentTime: number;     // position actuelle en secondes

  // Modes
  repeatMode: 'none' | 'one' | 'all';
  isShuffle: boolean;
}
```

#### Fonctions exposées

| Fonction | Paramètre | Description |
|----------|-----------|-------------|
| `playSong(song)` | `Song` | Lance la lecture d'une chanson spécifique |
| `pause()` | — | Met en pause la lecture |
| `resume()` | — | Reprend la lecture |
| `nextSong()` | — | Passe à la chanson suivante (shuffle si actif) |
| `previousSong()` | — | Revient à la chanson précédente |
| `setQueue(songs)` | `Song[]` | Définit la file d'attente et lance la première |
| `setVolume(v)` | `number (0-1)` | Modifie le volume |
| `setProgress(p)` | `number (0-100)` | Seek dans la chanson (barre de progression) |
| `toggleRepeat()` | — | Cycle : `none → one → all → none` |
| `toggleShuffle()` | — | Active / désactive le mode aléatoire |

#### Architecture interne

```
MusicContext Provider
    │
    ├── useRef → <audio> HTMLAudioElement (natif HTML5)
    │
    ├── currentSong → audio.src = URL du fichier
    │
    ├── Events écoutés :
    │   ├── onTimeUpdate  → mise à jour progress + currentTime
    │   ├── onLoadedMetadata → récupération duration
    │   ├── onEnded → nextSong() automatique selon repeatMode
    │   └── onVolumeChange → sync volume
    │
    └── Exposed via React Context → accessible partout
```

#### Utilisation dans un composant

```tsx
const { currentSong, isPlaying, playSong, pause, nextSong } = useMusicContext();

// Lancer une chanson
<button onClick={() => playSong(song)}>▶</button>

// Lancer tout un album comme queue
<button onClick={() => setQueue(album.chansons)}>Lecture album</button>
```

---

### 🎧 Système Audio (Audio Engine)

Le lecteur audio est basé sur l'**HTMLAudioElement** natif du navigateur.

Fonctionnalités implémentées :

| Fonctionnalité | Implémentation |
|----------------|---------------|
| Lecture / Pause | `audio.play()` / `audio.pause()` |
| Volume | `audio.volume = 0.0 à 1.0` |
| Seek | `audio.currentTime = valeur` |
| Durée totale | `audio.duration` |
| Progression | `audio.currentTime / audio.duration * 100` |
| Auto next | Event `ended` → `nextSong()` |
| Repeat one | Event `ended` → `audio.currentTime = 0; audio.play()` |
| Shuffle | `queue[Math.random() * queue.length]` |
| Compteur écoutes | Appel `songsApi.incrementPlay(id)` à chaque lecture |

---

### 🗺️ Routing — `src/app/routes.tsx`

Gestion de la navigation avec **React Router v6**.

```tsx
<BrowserRouter>
  <Routes>
    <Route path="/" element={<Navigate to="/login" />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />

    {/* Routes protégées */}
    <Route element={<Layout />}>
      <Route path="/listener" element={<ListenerPage />} />
      <Route path="/artist" element={<ArtistPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/album/:id" element={<AlbumProfilePage />} />
      <Route path="/artist/:id" element={<ArtistProfilePage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/settings" element={<AccountSettingsPage />} />
    </Route>
  </Routes>
</BrowserRouter>
```

| Route | Composant | Accès |
|-------|-----------|-------|
| `/` | Redirect `/login` | Public |
| `/login` | `LoginPage` | Public |
| `/register` | `RegisterPage` | Public |
| `/listener` | `ListenerPage` | Listener |
| `/artist` | `ArtistPage` | Artiste |
| `/admin` | `AdminPage` | Admin |
| `/album/:id` | `AlbumProfilePage` | Connecté |
| `/artist/:id` | `ArtistProfilePage` | Connecté |
| `/search` | `SearchPage` | Connecté |
| `/settings` | `AccountSettingsPage` | Connecté |

---

### 🧩 Layout & Composants UI

#### `Layout.tsx` — Shell principal

```
┌──────────────────────────────────────────────────────────┐
│  SIDEBAR                │                                │
│  ─ Logo                 │  ─ Barre de recherche          │
│  ─ Navigation           │                                │
│    • Accueil            │                                │
│    • Recherche          ├────────────────────────────────┤
│                         │                                │
│                         │                                │
│                         │                                │
│ ─ Avatar utilisateur    │                                │
├─────────────────────────┴────────────────────────────────┤
│  MUSIC PLAYER (toujours visible)                         │
│  ─ Cover + Titre + Artiste                               │
│  ─ Boutons : ⏮ ⏪ ▶/⏸ ⏩ ⏭  🔀 🔁                     │
│  ─ Barre de progression (seek)                           │
│  ─ Volume                                                │
└──────────────────────────────────────────────────────────┘
```



#### Modals

Fenêtres popup gérées par état React :

| Modal | Déclencheur |
|-------|-------------|
| Créer playlist | Bouton "+" playlists |
| Ajouter chanson à playlist | Bouton "+" sur une chanson |
| Upload chanson | Bouton upload artiste |
| Éditer chanson | Bouton édition artiste |
| Créer album | Bouton nouvel album artiste |

---

### 📄 Pages — 

#### `LoginPage.tsx`

- Formulaire email + mot de passe
- Validation des champs côté client
- Appel `authApi.login()`
- Sauvegarde token + user dans `localStorage`
- Redirection automatique selon le rôle :
  - `listener` → `/listener`
  - `artist` → `/artist`
  - `admin` → `/admin`

#### `RegisterPage.tsx`

- Formulaire username + email + password + confirmation
- Sélection du rôle initial (`listener` ou `artist`)
- Validation côté client
- Appel `authApi.register()`
- Connexion automatique + redirection

#### `ListenerPage.tsx`

Page principale du listener — la plus complète du frontend.

| Section | Fonctionnalité |
|---------|---------------|
| Catalogue | Grille de toutes les chansons disponibles |
| Lecture | Clic sur une chanson → `playSong()` dans MusicContext |
| Queue | Bouton "Tout lire" → `setQueue(allSongs)` |
| Playlists | Sidebar ou section dédiée aux playlists |
| Ajout playlist | Modal pour ajouter chanson à une playlist |
| Albums | Accès aux albums, navigation vers `AlbumProfilePage` |
| Notation | Étoiles cliquables par chanson → `notageApi.rate()` |
| Recherche | Barre de recherche rapide intégrée |

#### `ArtistPage.tsx`

Dashboard complet pour les artistes.

| Section | Fonctionnalité |
|---------|---------------|
| Mes chansons | Liste de toutes ses chansons + stats écoutes |
| Upload | Formulaire : titre + fichier MP3/WAV + cover + album |
| Mes albums | Liste des albums créés |
| Créer album | Formulaire : titre + date + cover |
| Gérer album | Ajouter/retirer chansons d'un album |
| Profil artiste | Modifier bio + photo + nom d'artiste |
| Suppression | Supprimer chanson ou album |

#### `AlbumProfilePage.tsx`

- Récupération album via `albumsApi.getOne(id)` (params URL)
- Affichage cover + titre + date + artiste
- Liste de toutes les chansons de l'album
- Bouton "Lire l'album" → `setQueue(album.chansons)`
- Clic sur chanson individuelle → `playSong(song)`

#### `ArtistProfilePage.tsx`

- Page publique d'un artiste (accessible par tous)
- Photo + nomArtiste + biographie
- Liste de ses chansons → lecture directe
- Liste de ses albums → navigation vers `AlbumProfilePage`

#### `AccountSettingsPage.tsx`

- Formulaire modification pseudo / email
- Formulaire changement mot de passe (ancien + nouveau + confirmation)
- Bouton suppression du compte (confirmation requise)
- Appels `usersApi.update()`, `usersApi.updatePassword()`, `usersApi.delete()`

#### `SearchPage.tsx`

- Barre de recherche principale
- Recherche **unifiée** sur : chansons + artistes + albums
- Résultats affichés en sections séparées
- Lecture directe depuis les résultats (`playSong()`)
- Navigation vers profil artiste / album depuis les résultats

#### `DeveloperPage.tsx`

- Page utilisée pendant le développement
- Tests d'endpoints API
- Debug des états React

---

## Workflows utilisateurs

### Workflow Listener

```
1. Accéder à /register → créer compte (rôle: listener)
2. Connexion → token stocké → redirection /listener
3. Parcourir le catalogue de chansons
4. Cliquer sur une chanson → lecture via MusicContext
5. Mettre chanson dans une playlist
6. Créer nouvelle playlist si nécessaire
7. Noter une chanson (1 à 5 étoiles)
8. Rechercher artiste/album/chanson via SearchPage
9. Consulter profil artiste → lire ses chansons
10. Modifier paramètres du compte via /settings
```

### Workflow Artiste

```
1. Inscription avec rôle artiste (ou becomeArtist() depuis listener)
2. Connexion → redirection /artist
3. Compléter profil (photo, bio, nom d'artiste)
4. Uploader une chanson (fichier MP3 + cover + titre)
5. Créer un album (titre + date + cover)
6. Associer chansons à l'album
7. Consulter les stats d'écoutes
8. Modifier ou supprimer ses chansons
```

### Workflow Admin

```
1. Connexion avec compte admin → redirection /admin
2. Consulter le dashboard (stats générales)
3. Gérer les utilisateurs (liste complète)
4. Activer ou désactiver des comptes
5. Superviser les artistes
6. Suspendre un artiste si nécessaire
7. Supprimer contenus inappropriés (chansons/albums)
```

---

## Gestion des rôles

| Rôle | Permissions |
|------|-------------|
| `listener` | Écouter, noter, créer playlists, rechercher |
| `artist` | Tout listener + uploader, créer albums, gérer son contenu |
| `admin` | Tout artiste + gérer utilisateurs, suspendre, supprimer |

La gestion des rôles est double :
- **Backend** : middlewares Laravel vérifient `user->role`
- **Frontend** : React Router redirige selon le rôle stocké

---


## 👨‍💻 Auteurs & Contexte

Projet réalisé dans le cadre du cursus **2ITE — ENSA El Jadida**  
Université Chouaib Doukkali
