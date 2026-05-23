import { useState, useEffect, useCallback } from 'react';
import { Search, Play, Star, Music, Disc, User, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { songsApi } from '../api/client';
import { useMusicContext } from '../context/MusicContext';

interface SongResult { id:number; title:string; artist:string; album:string; duration:string; cover:string|null; fichier:string; artistId?:number; }
interface ArtistResult { id:number; nomArtiste:string; bio:string|null; photo:string|null; }
interface AlbumResult { id:number; titre:string; artist:string|null; dateSortie:string; cover:string|null; }

const DEFAULT_COVER = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=80&h=80&fit=crop';

export default function SearchPage() {
  const navigate = useNavigate();
  const { playSong, setQueue } = useMusicContext();

  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all'|'songs'|'artists'|'albums'>('all');
  const [songs, setSongs] = useState<SongResult[]>([]);
  const [artists, setArtists] = useState<ArtistResult[]>([]);
  const [albums, setAlbums] = useState<AlbumResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Debounced search
  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setSongs([]); setArtists([]); setAlbums([]); setSearched(false); return; }
    setLoading(true);
    try {
      const res = await songsApi.search(q);
      setSongs((res.songs ?? []).map(s => ({
        id: s.id, title: s.titre,
        artist: s.artist?.nomArtiste ?? 'Unknown',
        album: s.album?.titre ?? '',
        duration: s.duree ?? '',
        cover: s.cover
  ? `http://localhost:8000/storage/${s.cover}`
  : DEFAULT_COVER,
        fichier: s.fichier,
        artistId: s.artist?.id,
      })));
      setArtists(
  (res.artists ?? []).map(a => ({
    ...a,
    photo: a.photo
      ? `http://localhost:8000/storage/${a.photo}`
      : null,
  }))
);
      setAlbums((res.albums ?? []).map(a => ({
  id: a.id,
  titre: a.titre,
  artist: a.artist?.nomArtiste ?? null,
  dateSortie: a.dateSortie,

  cover: a.cover
    ? `http://localhost:8000/storage/${a.cover}`
    : DEFAULT_COVER,
})));
      setSearched(true);
    } catch { setSongs([]); setArtists([]); setAlbums([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => doSearch(query), 400);
    return () => clearTimeout(timer);
  }, [query, doSearch]);

  const handlePlaySong = (s: SongResult) => {
    const song = {
      id: s.id, title: s.title, artist: s.artist, album: s.album,
      duration: s.duration, playCount: 0, rating: 0,
      cover: s.cover ?? DEFAULT_COVER, fichier: s.fichier,
    };
    setQueue(songs.map(x => ({
      id: x.id, title: x.title, artist: x.artist, album: x.album,
      duration: x.duration, playCount: 0, rating: 0,
      cover: x.cover ?? DEFAULT_COVER, fichier: x.fichier,
    })));
    playSong(song);
  };

  const totalResults = songs.length + artists.length + albums.length;

  return (
    <div className="flex-1 overflow-y-auto bg-[#121212] p-8">
      {/* Search bar */}
      <div className="mb-8 relative max-w-2xl">
        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text" value={query} onChange={e => setQuery(e.target.value)} autoFocus
          placeholder="Search songs, artists, albums..."
          className="w-full bg-white text-black rounded-full pl-12 pr-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#ac42c2]"
        />
        {loading && <Loader2 size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />}
      </div>

      {!searched && !loading && (
        <div className="text-center py-24 text-gray-600">
          <Search size={64} className="mx-auto mb-4 opacity-30" />
          <p className="text-xl font-semibold mb-2">Search StreamMusic</p>
          <p className="text-sm">Find songs, artists, and albums</p>
        </div>
      )}

      {searched && totalResults === 0 && !loading && (
        <div className="text-center py-24 text-gray-600">
          <Music size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg font-semibold mb-1">No results for "{query}"</p>
          <p className="text-sm">Try searching for something else</p>
        </div>
      )}

      {searched && totalResults > 0 && (
        <>
          {/* Tabs */}
          <div className="flex gap-1 mb-8 border-b border-[#282828]">
            {(['all','songs','artists','albums'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 text-sm font-medium capitalize border-b-2 transition-colors ${
                  activeTab === tab ? 'border-white text-white' : 'border-transparent text-gray-400 hover:text-white'
                }`}>
                {tab} {tab !== 'all' && `(${tab==='songs'?songs.length:tab==='artists'?artists.length:albums.length})`}
              </button>
            ))}
          </div>

          {/* Songs */}
          {(activeTab === 'all' || activeTab === 'songs') && songs.length > 0 && (
            <section className="mb-10">
              {activeTab === 'all' && <h2 className="text-xl font-bold mb-4">Songs</h2>}
              <div className="space-y-1">
                {songs.map((s, i) => (
                  <div key={s.id} onClick={() => handlePlaySong(s)}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-[#282828] group cursor-pointer transition-colors">
                    <span className="text-gray-500 w-6 text-sm">{i+1}</span>
                    <div className="relative w-10 h-10 flex-shrink-0">
                      <img src={s.cover ?? DEFAULT_COVER} alt={s.title} className="w-10 h-10 rounded object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 rounded flex items-center justify-center transition-opacity">
                        <Play size={14} fill="white" stroke="white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{s.title}</p>
                      <p className="text-xs text-gray-400 truncate">
                        <button onClick={e => { e.stopPropagation(); if(s.artistId) navigate(`/artist-profile/${s.artistId}`); }}
                          className="hover:underline hover:text-white">{s.artist}</button>
                        {s.album && <> · {s.album}</>}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">{s.duration}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Artists */}
          {(activeTab === 'all' || activeTab === 'artists') && artists.length > 0 && (
            <section className="mb-10">
              {activeTab === 'all' && <h2 className="text-xl font-bold mb-4">Artists</h2>}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {artists.map(a => (
                  <div key={a.id} onClick={() => navigate(`/artist-profile/${a.id}`)}
                    className="bg-[#282828] p-4 rounded-xl hover:bg-[#333] transition-colors cursor-pointer text-center">
                    <div className="w-20 h-20 rounded-full mx-auto mb-3 bg-gradient-to-br from-purple-500 to-pink-500 overflow-hidden">
                      {a.photo ? <img src={a.photo} alt={a.nomArtiste} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-2xl font-bold">{a.nomArtiste[0]}</div>}
                    </div>
                    <p className="font-semibold text-sm truncate">{a.nomArtiste}</p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <User size={11} className="text-gray-400" />
                      <span className="text-xs text-gray-400">Artist</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Albums */}
          {(activeTab === 'all' || activeTab === 'albums') && albums.length > 0 && (
            <section className="mb-10">
              {activeTab === 'all' && <h2 className="text-xl font-bold mb-4">Albums</h2>}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {albums.map(a => (
                 <div
  key={a.id}
  onClick={() => navigate(`/album/${a.id}`)}
  className="bg-[#282828] p-4 rounded-xl hover:bg-[#333] transition-colors cursor-pointer"
>
                    <img src={a.cover ?? DEFAULT_COVER} alt={a.titre}
                      className="w-full aspect-square object-cover rounded-lg mb-3" />
                    <p className="font-semibold text-sm truncate">{a.titre}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Disc size={11} className="text-gray-400" />
                      <span className="text-xs text-gray-400 truncate">{a.artist ?? 'Unknown'} · {new Date(a.dateSortie).getFullYear()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}