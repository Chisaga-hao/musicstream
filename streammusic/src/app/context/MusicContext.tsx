import {
  createContext, useContext, useState, useCallback,
  useEffect, useRef, ReactNode,
} from 'react';
import { tokenStorage, authApi, artistsApi } from '../api/client';

export interface Song {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: string;
  playCount: number;
  rating: number;
  cover: string;
  fichier?: string;
}

export interface Playlist {
  id: number;
  title: string;
  createdDate: string;
  songCount: number;
  cover: string;
  songs: Song[];
}

export interface Album {
  id: number;
  title: string;
  artist: string;
  releaseDate: string;
  cover: string;
  songs: Song[];
}

export interface User {
  id: number;
  username: string;
  nom: string;
  prenom: string;
  email: string;
  photo: string;
  role: 'listener' | 'artist' | 'admin';
  compteActif: boolean;
}

interface MusicContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  shuffle: boolean;
  repeatMode: 'off' | 'all' | 'one';  
  queue: Song[];
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  // ↓ null = pas de profil artiste, number = ID du profil dans artist_profile
  artistProfileId: number | null;
  playlists: Playlist[];
  songs: Song[];
  albums: Album[];
  playSong: (song: Song, newQueue?: Song[]) => void;
  togglePlay: () => void;
  setProgress: (p: number) => void;
  seekTo: (seconds: number) => void;
  setVolume: (v: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  nextSong: () => void;
  prevSong: () => void;
  setQueue: (q: Song[]) => void;
  createPlaylist: (title: string) => void;
  deletePlaylist: (id: number) => void;
  addSongToPlaylist: (playlistId: number, song: Song) => void;
  removeSongFromPlaylist: (playlistId: number, songId: number) => void;
  rateSong: (songId: number, rating: number) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  setArtistProfileId: (id: number | null) => void;
}

const MusicContext = createContext<MusicContextType | null>(null);

export function useMusicContext(): MusicContextType {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error('useMusicContext must be used inside <MusicProvider>');
  return ctx;
}

const API_BASE  = (import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api').replace('/api', '');
const STORAGE_URL = API_BASE + '/storage/';

export function MusicProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ── Player ─────────────────────────────────────────────────────────────────
  const [currentSong,   setCurrentSong]   = useState<Song | null>(null);
  const [isPlaying,     setIsPlaying]     = useState(false);
  const [progress,      setProgressState] = useState(0);
  const [duration,      setDuration]      = useState(0);
  const [volume,        setVolumeState]   = useState(70);
  const [shuffle,       setShuffle]       = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
  const [queue,         setQueueState]    = useState<Song[]>([]);
   const repeatModeRef = useRef<'off' | 'all' | 'one'>('off');
  // ── Auth ───────────────────────────────────────────────────────────────────
  const [currentUser,     setCurrentUser]     = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(() => tokenStorage.get() !== null);
  const [isLoading,       setIsLoading]       = useState(() => tokenStorage.get() !== null);

  // THE KEY FIX:
  // artistProfileId = null  → cet utilisateur n'a PAS de profil artiste
  // artistProfileId = number → il a un profil, et c'est son ID dans la table artist_profile
  // C'est LA condition qui détermine l'accès à /artist
  const [artistProfileId, setArtistProfileId] = useState<number | null>(null);

  const [songs]    = useState<Song[]>([]);
  const [albums]   = useState<Album[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  // ── Bootstrap ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!tokenStorage.get()) {
      setIsLoading(false);
      return;
    }

    const bootstrap = async () => {
      try {
        // 1. Récupérer l'utilisateur connecté
        const u = await authApi.me();
        const user: User = {
          id:          u.id,
          username:    u.username,
          nom:         u.nom    ?? '',
          prenom:      u.prenom ?? '',
          email:       u.email,
          photo:       u.photo  ?? '',
          role:        u.role,
          compteActif: u.compteActif,
        };
        setCurrentUser(user);
        setIsAuthenticated(true);

        // 2. Vérifier si cet utilisateur a un profil dans la table artist_profile
        //    Peu importe son rôle — c'est l'existence du profil qui compte
        try {
          const artists = await artistsApi.list();
          const myProfile = artists.data?.find((a: any) => a.user_id === u.id);
          // Si trouvé → stocker son ID, sinon rester null
          setArtistProfileId(myProfile ? myProfile.id : null);
        } catch {
          // L'endpoint /artists a échoué → pas de profil artiste
          setArtistProfileId(null);
        }
      } catch {
        // Token invalide ou expiré
        tokenStorage.clear();
        setIsAuthenticated(false);
        setArtistProfileId(null);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrap();
  }, []); // eslint-disable-line

  // ── Audio ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const audio = new Audio();
    audio.volume = volume / 100;
    audioRef.current = audio;

    audio.addEventListener('timeupdate', () => {
      if (audio.duration) setProgressState((audio.currentTime / audio.duration) * 100);
    });
    audio.addEventListener('loadedmetadata', () => setDuration(audio.duration));
    audio.addEventListener('ended', () => {
  if (repeatModeRef.current === 'one') {
    audio.currentTime = 0;
    audio.play();
  }
  else if (repeatModeRef.current === 'all') {
    nextSongInternal();
  }
  else {
    nextSongInternal();
  }
});

    return () => { audio.pause(); audio.src = ''; };
  }, []); // eslint-disable-line

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume / 100;
  }, [volume]);

  const nextSongInternal = useCallback(() => {
    setQueueState(q => {
      setCurrentSong(current => {
        if (!current || q.length === 0) return current;
        const idx  = q.findIndex(s => s.id === current.id);
        const next = shuffle
          ? q[Math.floor(Math.random() * q.length)]
          : q[(idx + 1) % q.length];
        if (next && audioRef.current) {
          const src = next.fichier?.startsWith('http') ? next.fichier : STORAGE_URL + next.fichier;
          audioRef.current.src = src;
          audioRef.current.play().catch(() => {});
          setIsPlaying(true);
        }
        return next ?? current;
      });
      return q;
    });
  }, [shuffle]);
    useEffect(() => {
  repeatModeRef.current = repeatMode;
}, [repeatMode]);
  const playSong = useCallback((song: Song, newQueue?: Song[]) => {
    if (newQueue) setQueueState(newQueue);
    setCurrentSong(song);
    setProgressState(0);
    if (audioRef.current && song.fichier) {
      const src = song.fichier.startsWith('http') ? song.fichier : STORAGE_URL + song.fichier;
      audioRef.current.src = src;
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
    else           { audioRef.current.play().catch(() => {}); setIsPlaying(true); }
  }, [isPlaying]);

  const setProgress = useCallback((p: number) => {
    setProgressState(p);
    if (audioRef.current?.duration)
      audioRef.current.currentTime = (p / 100) * audioRef.current.duration;
  }, []);

  const seekTo = useCallback((seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = seconds;
      setProgressState(audioRef.current.duration
        ? (seconds / audioRef.current.duration) * 100 : 0);
    }
  }, []);

  const setVolume     = useCallback((v: number) => setVolumeState(v), []);
  const toggleShuffle = useCallback(() => setShuffle(s => !s), []);
  const toggleRepeat = useCallback(() => {
  setRepeatMode(mode => {
    if (mode === 'off') return 'all';
    if (mode === 'all') return 'one';
    return 'off';
  });
}, []);
  const nextSong      = useCallback(() => nextSongInternal(), [nextSongInternal]);

  const prevSong = useCallback(() => {
    if (!currentSong || queue.length === 0) return;
    const idx  = queue.findIndex(s => s.id === currentSong.id);
    const prev = queue[(idx - 1 + queue.length) % queue.length];
    if (prev) playSong(prev);
  }, [currentSong, queue, playSong]);

  const setQueue = useCallback((q: Song[]) => setQueueState(q), []);

  const createPlaylist = useCallback((title: string) => {
    setPlaylists(p => [...p, {
      id: Date.now(), title,
      createdDate: new Date().toISOString().split('T')[0],
      songCount: 0, cover: '', songs: [],
    }]);
  }, []);

  const deletePlaylist = useCallback(
    (id: number) => setPlaylists(p => p.filter(pl => pl.id !== id)), []);

  const addSongToPlaylist = useCallback((plId: number, song: Song) => {
    setPlaylists(p => p.map(pl =>
      pl.id === plId && !pl.songs.find(s => s.id === song.id)
        ? { ...pl, songs: [...pl.songs, song], songCount: pl.songCount + 1 }
        : pl
    ));
  }, []);

  const removeSongFromPlaylist = useCallback((plId: number, songId: number) => {
    setPlaylists(p => p.map(pl =>
      pl.id === plId
        ? { ...pl, songs: pl.songs.filter(s => s.id !== songId), songCount: pl.songCount - 1 }
        : pl
    ));
  }, []);

  const rateSong = useCallback((_songId: number, _rating: number) => {}, []);

  const login = useCallback(async (user: User, token: string) => {
    tokenStorage.set(token);
    setCurrentUser(user);
    setIsAuthenticated(true);

    // Check artist profile right after login too
    try {
      const artists = await artistsApi.list();
      const myProfile = artists.data?.find((a: any) => a.user_id === user.id);
      setArtistProfileId(myProfile ? myProfile.id : null);
    } catch {
      setArtistProfileId(null);
    }

    setIsLoading(false);
  }, []);

  const logout = useCallback(() => {
    audioRef.current?.pause();
    setCurrentSong(null);
    setIsPlaying(false);
    tokenStorage.clear();
    setCurrentUser(null);
    setIsAuthenticated(false);
    setArtistProfileId(null);
  }, []);

  const updateUser = useCallback((user: User) => setCurrentUser(user), []);

  return (
    <MusicContext.Provider value={{
      currentSong, isPlaying, progress, duration, volume,
       shuffle, repeatMode, queue,
      currentUser, isAuthenticated, isLoading, artistProfileId,
      playlists, songs, albums,
      playSong, togglePlay, setProgress, seekTo, setVolume,
      toggleShuffle, toggleRepeat, nextSong, prevSong, setQueue,
      createPlaylist, deletePlaylist, addSongToPlaylist, removeSongFromPlaylist,
      rateSong, login, logout, updateUser, setArtistProfileId,
    }}>
      {children}
    </MusicContext.Provider>
  );
}
