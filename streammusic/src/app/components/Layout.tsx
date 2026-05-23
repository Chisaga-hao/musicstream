import { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import {
  Home, Search, Library, Play, Pause, SkipBack, SkipForward,
  Volume2, Heart, Music, Disc, Users as UsersIcon,
  LayoutDashboard, Shuffle, Repeat, VolumeX, Mic2,
  LogOut, Settings, User, ChevronDown
} from 'lucide-react';
import { useMusicContext } from '../context/MusicContext';
import { authApi } from '../api/client';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    currentSong, isPlaying, progress, volume, shuffle, repeatMode, duration,
    currentUser, togglePlay, setProgress, setVolume, toggleShuffle,
    toggleRepeat, nextSong, prevSong, logout,
  } = useMusicContext();

  const [liked, setLiked] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  // Close user menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const role = currentUser?.role ?? 'listener';
  const displayName = currentUser
    ? [currentUser.prenom, currentUser.nom].filter(Boolean).join(' ') || currentUser.username
    : '—';
  const initials = displayName.slice(0, 2).toUpperCase();
  const roleBadgeColor =
    role === 'admin' ? 'bg-purple-600' :
    role === 'artist' ? 'bg-[#571066]' : 'bg-blue-600';
  const roleLabel =
    role === 'admin' ? 'Dev/Admin' :
    role === 'artist' ? 'Artist' : 'Listener';

  const handleLogout = async () => {
    try { await authApi.logout(); } catch (_) {}
    logout();
    navigate('/login');
  };

  // Format elapsed time from progress %
  const formatTime = (seconds: number) => {
    if (!isFinite(seconds) || isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };
  const elapsed = duration ? (progress / 100) * duration : 0;
  const totalSec = duration || 0;

  return (
    <div className="h-screen flex flex-col bg-[#121212] text-white" style={{ minWidth: '1100px' }}>
      <div className="flex flex-1 overflow-hidden">
        {/* ── Sidebar ─────────────────────────────────────────────────── */}
        <aside className="w-[240px] bg-black flex flex-col flex-shrink-0">
          {/* Logo */}
          <div className="p-5 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-[#571066] rounded-full flex items-center justify-center">
                <Play size={17} fill="white" stroke="white" />
              </div>
              <span className="text-lg font-bold">StreamMusic</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="px-2 flex-1 overflow-y-auto">
            {(role === 'listener' || role === 'artist') && (
              <>
                <NavBtn icon={<Home size={20} />} label="Home"
                  active={location.pathname === '/listener' || location.pathname === '/'}
                  onClick={() => navigate('/listener')} />
                <NavBtn icon={<Search size={20} />} label="Search"
                  active={location.pathname === '/search'}
                  onClick={() => navigate('/search')} />
                
              </>
            )}

            {role === 'artist' && (
              <>
                <div className="mx-2 my-2 border-t border-gray-800" />
                <p className="px-3 text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Artist</p>
                <NavBtn icon={<Music size={20} />} label="My Music"
                  active={location.pathname === '/artist'}
                  onClick={() => navigate('/artist')} />
                <NavBtn icon={<Disc size={20} />} label="My Albums"
                  active={false} onClick={() => navigate('/artist')} />
              </>
            )}

            {role === 'admin' && (
              <>
                <NavBtn icon={<LayoutDashboard size={20} />} label="Dashboard"
                  active={location.pathname === '/developer'}
                  onClick={() => navigate('/developer')} />
                <NavBtn icon={<Music size={20} />} label="Content"
                  active={false} onClick={() => navigate('/developer')} />
                <NavBtn icon={<Mic2 size={20} />} label="Artists"
                  active={false} onClick={() => navigate('/developer')} />
                <NavBtn icon={<UsersIcon size={20} />} label="Users"
                  active={false} onClick={() => navigate('/developer')} />
              </>
            )}
          </nav>

          {/* ── User section ───────────────────────────────────────────── */}
          <div className="p-3 border-t border-gray-800 relative -top-17" ref={menuRef}>
            <button
              onClick={() => setShowUserMenu(v => !v)}
              className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              {/* Avatar */}
              {currentUser?.photo ? (
                <img src={`http://localhost:8000/storage/${currentUser.photo}`} alt="avatar"
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {initials}
                </div>
              )}
              <div className="flex-1 min-w-0 text-left">
                <p className="font-semibold text-sm truncate">{displayName}</p>
                <span className={`inline-block text-xs px-1.5 py-0.5 rounded-full text-white ${roleBadgeColor}`}>
                  {roleLabel}
                </span>
              </div>
              <ChevronDown size={14} className={`text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown menu */}
            {showUserMenu && (
              <div className="absolute bottom-full left-3 right-3 mb-1 bg-[#282828] rounded-xl shadow-2xl border border-white/10 overflow-hidden z-50">
                <button
                  onClick={() => { navigate('/settings'); setShowUserMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-white/5 transition-colors"
                >
                  <Settings size={16} className="text-gray-400" />
                  <span>Account Settings</span>
                </button>
                {role === 'listener' && (
                  <button
                    onClick={() => { navigate('/settings'); setShowUserMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-white/5 transition-colors"
                  >
                    <Mic2 size={16} className="text-[#ac42c2]" />
                    <span className="text-[#ac42c2]">Become an Artist</span>
                  </button>
                )}
                {role === 'artist' && (
                  <button
                    onClick={() => { navigate('/artist'); setShowUserMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-white/5 transition-colors"
                  >
                    <Music size={16} className="text-[#ac42c2]" />
                    <span>Artist Dashboard</span>
                  </button>
                )}
                <button
                  onClick={() => { navigate('/settings'); setShowUserMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-white/5 transition-colors"
                >
                  <User size={16} className="text-gray-400" />
                  <span>My Profile</span>
                </button>
                <div className="border-t border-white/10" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut size={16} />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* ── Main content ─────────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto pb-24">
          <Outlet />
        </main>
      </div>

      {/* ── Bottom Player Bar ─────────────────────────────────────────── */}
      <footer className="fixed bottom-0 left-0 right-0 h-20 bg-[#181818] border-t border-gray-800 px-4 flex items-center justify-between z-40">
        {/* Left — Song info */}
        <div className="flex items-center gap-3 w-72">
          {currentSong ? (
            <>
             <img
  src={
    currentSong.cover
      ? `http://localhost:8000/storage/${currentSong.cover}`
      : "/music-placeholder.png"
  }
  alt={currentSong.title}
  className="w-[52px] h-[52px] rounded-md object-cover flex-shrink-0"
  
/>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm truncate">{currentSong.title}</p>
                <p className="text-xs text-gray-400 truncate">{currentSong.artist}</p>
              </div>
              <button onClick={() => setLiked(!liked)}
                className={`transition-colors flex-shrink-0 ${liked ? 'text-[#1DB954]' : 'text-gray-400 hover:text-white'}`}>
                <Heart size={18} fill={liked ? '#6f0d82' : 'none'} />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3 text-gray-600">
              <div className="w-[52px] h-[52px] rounded bg-[#282828] flex items-center justify-center flex-shrink-0">
                <Music size={20} className="text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium">No music yet</p>
                <p className="text-xs text-gray-600">Choose a song to play</p>
              </div>
            </div>
          )}
        </div>

        {/* Center — Controls */}
        <div className="flex flex-col items-center gap-1.5 flex-1">
          <div className="flex items-center gap-5">
            <button onClick={toggleShuffle}
              className={`transition-colors ${shuffle ? 'text-[#ac42c2]' : 'text-gray-400 hover:text-white'}`}>
              <Shuffle size={18} />
            </button>
            <button onClick={prevSong} className="text-gray-400 hover:text-white transition-colors">
              <SkipBack size={19} />
            </button>
            <button onClick={togglePlay}
              className="w-9 h-9 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform">
              {isPlaying
                ? <Pause size={18} fill="black" stroke="black" />
                : <Play size={18} fill="black" stroke="black" className="ml-0.5" />}
            </button>
            <button onClick={nextSong} className="text-gray-400 hover:text-white transition-colors">
              <SkipForward size={19} />
            </button>
            <button
  onClick={toggleRepeat}
  className={`relative transition-colors ${
    repeatMode !== 'off'
      ? 'text-[#ac42c2]'
      : 'text-gray-400 hover:text-white'
  }`}
>
  <Repeat size={18} />

  {repeatMode === 'one' && (
    <span className="absolute -top-1 -right-1 text-[10px] font-bold">
      1
    </span>
  )}
</button>
          </div>
          {/* Progress bar */}
          <div className="flex items-center gap-2 w-full max-w-lg">
            <span className="text-xs text-gray-400 w-9 text-right">{formatTime(elapsed)}</span>
            <div className="flex-1 h-1 bg-gray-700 rounded-full group cursor-pointer"
              onClick={e => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pct = ((e.clientX - rect.left) / rect.width) * 100;
                setProgress(Math.max(0, Math.min(100, pct)));
              }}>
              <div className="h-full bg-[#ac42c2] rounded-full relative" style={{ width: `${progress}%` }}>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            <span className="text-xs text-gray-400 w-9">{formatTime(totalSec)}</span>
          </div>
        </div>

        {/* Right — Volume */}
        <div className="flex items-center gap-2.5 w-56 justify-end">
          <button onClick={() => setVolume(volume === 0 ? 70 : 0)}
            className="text-gray-400 hover:text-white transition-colors">
            {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <div className="w-24 h-1 bg-gray-700 rounded-full group cursor-pointer"
            onClick={e => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = ((e.clientX - rect.left) / rect.width) * 100;
              setVolume(Math.max(0, Math.min(100, pct)));
            }}>
            <div className="h-full bg-[#ac42c2] rounded-full relative" style={{ width: `${volume}%` }}>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function NavBtn({ icon, label, active, onClick }: {
  icon: React.ReactNode; label: string; active: boolean; onClick: () => void;
}) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-md mb-0.5 transition-colors ${
        active ? 'bg-[#282828] text-white' : 'text-gray-400 hover:text-white'
      }`}>
      {icon}
      <span className="font-semibold text-sm">{label}</span>
    </button>
  );
}