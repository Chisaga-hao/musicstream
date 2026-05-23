import { createBrowserRouter, Navigate, Outlet } from "react-router";
import { useMusicContext } from "./context/MusicContext";
import Layout from "./components/Layout";

import ListenerPage from "./pages/ListenerPage";
import ArtistPage from "./pages/ArtistPage";
import DeveloperPage from "./pages/DeveloperPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import SearchPage from "./pages/SearchPage";
import AccountSettingsPage from "./pages/AccountSettingsPage";
import ArtistProfilePage from "./pages/ArtistProfilePage";
import AlbumProfilePage from './pages/AlbumProfilePage';
function LoadingScreen() {
  return (
    <div className="flex items-center justify-center h-screen w-screen bg-[#121212]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-[#1DB954] border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    </div>
  );
}

// Bloque toutes les pages protégées tant que le bootstrap n'est pas terminé
function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useMusicContext();
  if (isLoading)        return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
}

// ── LA VRAIE CONDITION pour /artist ──────────────────────────────────────────
// On ne vérifie PAS currentUser.role === 'artist'
// On vérifie artistProfileId !== null
// = l'utilisateur a une ligne dans la table artist_profile
// C'est la seule condition qui compte.
function ArtistRoute() {
  const { currentUser, artistProfileId } = useMusicContext();

  if (!currentUser) return <Navigate to="/login" replace />;

  // Admin peut toujours accéder
  if (currentUser.role === 'admin') return <Outlet />;

  // Tout le monde : vérifie l'existence du profil artiste en DB
  if (artistProfileId === null) {
    // Pas de profil → retour listener avec message
    return <Navigate to="/listener?no-artist-profile=1" replace />;
  }

  return <Outlet />;
}

// Bloque /developer aux non-admins
function AdminRoute() {
  const { currentUser } = useMusicContext();
  if (!currentUser)                   return <Navigate to="/login"    replace />;
  if (currentUser.role !== 'admin')   return <Navigate to="/listener" replace />;
  return <Outlet />;
}

// Redirige / vers la bonne page selon le profil réel
function RootRedirect() {
  const { currentUser, artistProfileId } = useMusicContext();
  if (!currentUser) return <Navigate to="/listener" replace />;
  if (currentUser.role === 'admin')  return <Navigate to="/developer" replace />;
  if (artistProfileId !== null)      return <Navigate to="/artist"    replace />;
  return <Navigate to="/listener" replace />;
}

export const router = createBrowserRouter([
  // ── Public ───────────────────────────────────────────────────────────────
  { path: "/login",    Component: LoginPage    },
  { path: "/register", Component: RegisterPage },

  // ── Protégé ───────────────────────────────────────────────────────────────
  {
    path: "/",
    Component: ProtectedRoute,
    children: [
      {
        Component: Layout,
        children: [
          { index: true,                Component: RootRedirect        },
          { path: "listener",           Component: ListenerPage        },
          { path: "search",             Component: SearchPage          },
          { path: "settings",           Component: AccountSettingsPage },
          { path: "artist-profile/:id", Component: ArtistProfilePage   },
         { path: "album/:id",          Component: AlbumProfilePage    },
          // /artist — conditionné par l'existence du profil en DB
          {
            Component: ArtistRoute,
            children: [
              { path: "artist", Component: ArtistPage },
            ],
          },
        ],
      },

      // /developer — admin seulement
      {
        Component: AdminRoute,
        children: [
          {
            path: "developer",
            Component: Layout,
            children: [{ index: true, Component: DeveloperPage }],
          },
        ],
      },
    ],
  },

  { path: "*", element: <Navigate to="/" replace /> },
]);
