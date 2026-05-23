import { useState, useEffect } from 'react';
import { Search, Plus, Star, X, Upload, Play, ChevronLeft, ChevronRight, Trash2, Disc } from 'lucide-react';
import { songsApi, albumsApi, playlistsApi } from '../api/client';
import { useMusicContext } from '../context/MusicContext';
import { useNavigate } from 'react-router';
interface Song {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: string;
  playCount: number;
  rating: number;
  cover: string;
  fichier: string;
}

interface Playlist {
  id: number;
  title: string;
  createdDate: string;
  songCount: number;
  cover: string;
  songs: Song[];
}

interface Album {
  id: number;
  title: string;
  artist: string;
  releaseDate: string;
  cover: string;
  songs: Song[];
}

const DEFAULT_SONG_COVER = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&h=200&fit=crop';
const DEFAULT_ALBUM_COVER = 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&h=300&fit=crop';
const DEFAULT_PLAYLIST_COVER = 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=300&h=300&fit=crop';

export default function ListenerPage() {
  const { currentUser, playSong, setQueue } = useMusicContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilter, setSearchFilter] = useState<'song' | 'artist' | 'album'>('song');
const navigate = useNavigate();
  // ── Real data from API ────────────────────────────────────────────────────
  const [songs, setSongs] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [songToAdd, setSongToAdd] = useState<Song | null>(null);
const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
const [editPlaylistName, setEditPlaylistName] = useState("");
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [showNewPlaylistModal, setShowNewPlaylistModal] = useState(false);
  const [showAddSongModal, setShowAddSongModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [hoveredSong, setHoveredSong] = useState<number | null>(null);

  // ── Fetch all data on mount ───────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [songsRes, albumsRes, playlistsRes] = await Promise.all([
          songsApi.list(),
          albumsApi.list(),
          playlistsApi.list(),
        ]);

        setSongs(songsRes.data.map(s => ({
  id: s.id,
  title: s.titre,
  artist: s.artist?.nomArtiste ?? 'Unknown',
  album: s.album?.titre ?? '',
  duration: s.duree,
  playCount: s.nombreEcoutes,
  rating: 0,

  cover: s.cover
    ? `http://localhost:8000/storage/${s.cover}`
    : DEFAULT_SONG_COVER,

  fichier: `http://localhost:8000/storage/${s.fichier}`,
})));

       setAlbums(
  albumsRes.data
    .sort((a, b) => b.id - a.id) // récents d'abord
    .slice(0, 6)                 // 👈 limite à 6 albums
    .map(a => {

    const songs = (a.songs ?? []).map(s => ({
      id: s.id,
      title: s.titre,
      artist: a.artist?.nomArtiste ?? 'Unknown',
      album: a.titre,
      duration: s.duree,
      playCount: s.nombreEcoutes,
      rating: 0,

      cover: s.cover
        ? `http://localhost:8000/storage/${s.cover}`
        : DEFAULT_SONG_COVER,

      fichier: `http://localhost:8000/storage/${s.fichier}`,
    }));

    return {
      id: a.id,
      title: a.titre,
      artist: a.artist?.nomArtiste ?? 'Unknown',
      releaseDate: a.dateSortie,

      cover:
        a.cover
          ? `http://localhost:8000/storage/${a.cover}`
          : DEFAULT_ALBUM_COVER,

      songs,
    };
  })
);

        setPlaylists(
  playlistsRes.map(p => {

    const songs = (p.songs ?? []).map(s => ({
      id: s.id,
      title: s.titre,
      artist: s.artist?.nomArtiste ?? 'Unknown',
      album: s.album?.titre ?? '',
      duration: s.duree,
      playCount: s.nombreEcoutes,
      rating: 0,

      cover: s.cover
        ? `http://localhost:8000/storage/${s.cover}`
        : DEFAULT_SONG_COVER,

      fichier: `http://localhost:8000/storage/${s.fichier}`,
    }));

    return {
      id: p.id,
      title: p.titre,
      createdDate: p.dateCreation,
      songCount: songs.length,

      cover:
        songs.length > 0
          ? songs[0].cover
          : DEFAULT_PLAYLIST_COVER,

      songs,
    };
  })
);
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
useEffect(() => {
  const loadRatings = async () => {
    try {
      const updatedSongs = await Promise.all(
        songs.map(async song => {
          try {
            const res = await songsApi.myRating(song.id);

            return {
              ...song,
              rating: res.note ?? 0,
            };
          } catch {
            return song;
          }
        })
      );

      setSongs(updatedSongs);
    } catch (err) {
      console.error(err);
    }
  };

  if (songs.length > 0 && currentUser) {
    loadRatings();
  }
}, [songs.length]);
  // ── Search filter ─────────────────────────────────────────────────────────
  const filteredSongs = searchQuery.trim()
    ? songs.filter(song => {
        const query = searchQuery.toLowerCase();
        if (searchFilter === 'song')   return song.title.toLowerCase().includes(query);
        if (searchFilter === 'artist') return song.artist.toLowerCase().includes(query);
        if (searchFilter === 'album')  return song.album.toLowerCase().includes(query);
        return false;
      })
    : [...songs]
    .sort((a, b) => b.id - a.id)
    .slice(0, 10);

  // ── Playlist actions ──────────────────────────────────────────────────────
  const createNewPlaylist = async () => {
    if (!newPlaylistName.trim()) return;
    try {
      const created = await playlistsApi.create(newPlaylistName.trim());
      const newPlaylist: Playlist = {
        id: created.id,
        title: created.titre,
        createdDate: created.dateCreation,
        songCount: 0,
        cover: created.cover ?? DEFAULT_PLAYLIST_COVER,
        songs: [],
      };
      setPlaylists(prev => [...prev, newPlaylist]);
      setNewPlaylistName('');
      setShowNewPlaylistModal(false);
    } catch (err) {
      console.error('Failed to create playlist:', err);
    }
  };

  const deletePlaylist = async (playlistId: number) => {
    try {
      await playlistsApi.delete(playlistId);
      setPlaylists(prev => prev.filter(p => p.id !== playlistId));
      if (selectedPlaylist?.id === playlistId) setSelectedPlaylist(null);
    } catch (err) {
      console.error('Failed to delete playlist:', err);
    }
  };

  const addSongToPlaylist = async (song: Song) => {
    if (!selectedPlaylist) return;
    try {
      await playlistsApi.addSong(selectedPlaylist.id, song.id);
      const updatedPlaylist = {
        ...selectedPlaylist,
        songs: [...selectedPlaylist.songs, song],
        songCount: selectedPlaylist.songs.length + 1,
      };
      setPlaylists(prev => prev.map(p => p.id === selectedPlaylist.id ? updatedPlaylist : p));
      setSelectedPlaylist(updatedPlaylist);
      setShowAddSongModal(false);
    } catch (err) {
      console.error('Failed to add song to playlist:', err);
    }
  };

  const removeSongFromPlaylist = async (songId: number) => {
    if (!selectedPlaylist) return;
    try {
      await playlistsApi.removeSong(selectedPlaylist.id, songId);
      const updatedPlaylist = {
        ...selectedPlaylist,
        songs: selectedPlaylist.songs.filter(s => s.id !== songId),
        songCount: selectedPlaylist.songs.length - 1,
      };
      setPlaylists(prev => prev.map(p => p.id === selectedPlaylist.id ? updatedPlaylist : p));
      setSelectedPlaylist(updatedPlaylist);
    } catch (err) {
      console.error('Failed to remove song from playlist:', err);
    }
  };

  const updateSongRating = async (songId: number, newRating: number) => {
    try {
      await songsApi.rate(songId, newRating);
      if (!selectedPlaylist) return;
      const updatedPlaylist = {
        ...selectedPlaylist,
        songs: selectedPlaylist.songs.map(s =>
          s.id === songId ? { ...s, rating: newRating } : s
        ),
      };
      setPlaylists(prev => prev.map(p => p.id === selectedPlaylist.id ? updatedPlaylist : p));
      setSelectedPlaylist(updatedPlaylist);
    } catch (err) {
      console.error('Failed to rate song:', err);
    }
  };
  const updatePlaylistTitle = async () => {
  if (!editingPlaylist || !editPlaylistName.trim()) return;

  try {
    const updated = await playlistsApi.update(
      editingPlaylist.id,
      editPlaylistName
    );

    setPlaylists(prev =>
      prev.map(p =>
        p.id === editingPlaylist.id
          ? { ...p, title: updated.titre }
          : p
      )
    );

    setEditingPlaylist(null);
    setEditPlaylistName("");
  } catch (err) {
    console.error("Failed to update playlist:", err);
  }
};

  // ── Helpers ───────────────────────────────────────────────────────────────
  const renderInteractiveStars = (rating: number, onRate?: (r: number) => void) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <button key={star} onClick={() => onRate?.(star)} className={onRate ? 'hover:scale-110 transition-transform' : ''}>
          <Star size={14} className={star <= rating ? 'fill-[#ac42c2] text-[#ac42c2]' : 'text-gray-600'} />
        </button>
      ))}
    </div>
  );

 

  const formatPlayCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(0)}K`;
    return count.toString();
  };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#ac42c2] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading your music...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">

      {/* SECTION 1 - Search Bar */}
      <section className="mb-8">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search for songs, artists, or albums..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[#282828] text-white pl-12 pr-4 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-[#1DB954]"
            />
          </div>
          <div className="flex gap-2 bg-[#282828] rounded-full p-1">
            {(['song', 'artist', 'album'] as const).map(f => (
              <button
                key={f}
                onClick={() => setSearchFilter(f)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all capitalize ${
                  searchFilter === f ? 'bg-[#35063E] text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        {searchQuery && (
         <p className="text-sm text-gray-400 mt-3">
  {searchFilter === 'song' && (
    <>
      Found {filteredSongs.length} song(s) matching "{searchQuery}"
    </>
  )}

  {searchFilter === 'artist' && (
    <>
      Found {filteredSongs.length} song(s) for artist matching "{searchQuery}"
    </>
  )}

  {searchFilter === 'album' && (
    <>
      Found {filteredSongs.length} song(s) for album matching "{searchQuery}"
    </>
  )}
</p>
        )}
      </section>

      {/* SECTION 2 - Songs */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{searchQuery ? 'Search Results' : 'Recent Songs'}</h2>
          
        </div>

        {filteredSongs.length === 0 ? (
          <div className="bg-[#282828] rounded-lg p-12 text-center">
            <p className="text-gray-400 text-lg mb-2">No songs yet</p>
            <p className="text-gray-500 text-sm">Songs uploaded by artists will appear here.</p>
          </div>
        ) : (
         <div className="bg-[#282828] rounded-xl overflow-hidden">
  <div className="flex flex-col">
    {filteredSongs.map(song => (
      <div
        key={song.id}
        className="flex items-center justify-between px-4 py-3 hover:bg-[#333] transition-colors group border-b border-[#3a3a3a] last:border-b-0"
      >

        {/* LEFT SIDE */}
        <div className="flex items-center gap-4 min-w-0">

          <div className="relative">
            <img
              src={song.cover}
              alt={song.title}
              className="w-12 h-12 rounded object-cover"
            />

            <button
  onClick={() => {
    setQueue(
  filteredSongs.map(s => ({
    ...s,
  }))
);

    playSong(song);

    songsApi.play(song.id).catch(() => {});
  }}
  className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded"
>
              <Play
                size={16}
                fill="white"
                stroke="white"
              />
            </button>
          </div>

          <div className="min-w-0">
            <h3 className="font-semibold text-sm truncate">
              {song.title}
            </h3>

            <p className="text-xs text-gray-400 truncate">
              {song.artist}
            </p>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-6 ml-4">

          <span className="text-xs text-gray-500 whitespace-nowrap">
            {song.duration}
          </span>

          <span className="text-xs text-gray-500 whitespace-nowrap">
            {formatPlayCount(song.playCount)}
          </span>
<button
  onClick={() => setSongToAdd(song)}
  className="text-gray-400 hover:text-[#ac42c2]"
>
  <Plus size={18} />
</button>
          <div>
            <div>
  {renderInteractiveStars(
    song.rating,
    async (newRating) => {
      try {
        await songsApi.rate(song.id, newRating);

        setSongs(prev =>
          prev.map(s =>
            s.id === song.id
              ? { ...s, rating: newRating }
              : s
          )
        );
      } catch (err) {
        console.error(err);
      }
    }
  )}
  
</div>
          </div>

        </div>
      </div>
    ))}
  </div>
</div>
        )}
      </section>

      {/* SECTION 3 - Albums & Playlists */}
      <div className="grid grid-cols-2 gap-8 mb-12">

        {/* Albums */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Disc size={28} className="text-[#ac42c2]" />
            <h2 className="text-2xl font-bold">Albums</h2>
          </div>
          {albums.length === 0 ? (
            <div className="bg-[#282828] rounded-lg p-8 text-center">
              <p className="text-gray-400 text-sm">No albums yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {albums.map(album => (
                <div
                  key={album.id}
                  onClick={() => navigate(`/album/${album.id}`)}
                  className={`bg-[#282828] p-4 rounded-lg hover:bg-[#3a3a3a] transition-all cursor-pointer ${
                    selectedAlbum?.id === album.id ? 'ring-2 ring-[#1DB954]' : ''
                  }`}
                >
                  <div className="relative mb-3 group">
                    <img src={album.cover} alt={album.title} className="w-full aspect-square object-cover rounded-md" />
                    <button className="absolute bottom-2 right-2 w-10 h-10 bg-[#1DB954] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                      <Play size={16} fill="black" stroke="black" />
                    </button>
                  </div>
                  <h3 className="font-bold text-sm mb-1 truncate">{album.title}</h3>
                  <p className="text-xs text-gray-400 truncate">{album.artist}</p>
                  <p className="text-xs text-gray-500 mt-1">{album.songs.length} songs • {new Date(album.releaseDate).getFullYear()}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Playlists */}
        <section>
          <h2 className="text-2xl font-bold mb-6">My Playlists</h2>
          <div className="grid grid-cols-2 gap-4">
            {playlists.map(playlist => (
              <div key={playlist.id} className="relative group">
                <div
                  onClick={() => setSelectedPlaylist(playlist)}
                  className="bg-[#282828] p-4 rounded-lg hover:bg-[#3a3a3a] transition-all cursor-pointer"
                >
                  <img src={playlist.cover} alt={playlist.title} className="w-full aspect-square object-cover rounded-md mb-3" />
                  <h3 className="font-bold text-sm mb-1 truncate">{playlist.title}</h3>
                  <p className="text-xs text-gray-400">{playlist.songCount} songs</p>
                  <p className="text-xs text-gray-500 mt-1">{new Date(playlist.createdDate).toLocaleDateString()}</p>
                </div>
                
                <button
                  onClick={() => deletePlaylist(playlist.id)}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={14} />
                </button>
                <button
  onClick={() => {
    setEditingPlaylist(playlist);
    setEditPlaylistName(playlist.title);
  }}
  className="absolute top-2 left-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
>
  ✏️
</button>
              </div>
            ))}
            <button
              onClick={() => setShowNewPlaylistModal(true)}
              className="bg-[#282828] p-4 rounded-lg hover:bg-[#3a3a3a] transition-all flex flex-col items-center justify-center aspect-square border-2 border-dashed border-gray-600"
            >
              <Plus size={48} className="text-gray-500 mb-2" />
              <span className="font-semibold text-gray-400 text-sm">New Playlist</span>
            </button>
          </div>
        </section>
      </div>

      

      {/* Playlist Details */}
      {selectedPlaylist && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Playlist: {selectedPlaylist.title}</h2>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddSongModal(true)}
                className="bg-[#35063E] text-white px-4 py-2 rounded-full font-semibold hover:scale-105 transition-transform flex items-center gap-2"
              >
                <Plus size={16} /> Add Song
              </button>
              <button onClick={() => setSelectedPlaylist(null)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
          </div>
          {selectedPlaylist.songs.length === 0 ? (
            <div className="bg-[#282828] rounded-lg p-12 text-center">
              <p className="text-gray-400 mb-4">This playlist is empty</p>
              <button
                onClick={() => setShowAddSongModal(true)}
                className="bg-[#35063E] text-white px-6 py-3 rounded-full font-bold hover:scale-105 transition-transform"
              >
                Add Your First Song
              </button>
            </div>
          ) : (
            <div className="bg-[#282828] rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700 text-gray-400 text-sm">
                    <th className="text-left py-3 px-4 w-12">#</th>
                    <th className="text-left py-3 px-4">Title</th>
                    
                    <th className="text-left py-3 px-4">Duration</th>
                 
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPlaylist.songs.map((song, index) => (
                    <tr
                      key={song.id}
                      onMouseEnter={() => setHoveredSong(song.id)}
                      onMouseLeave={() => setHoveredSong(null)}
                     
                      className="hover:bg-[#3a3a3a] transition-colors"
                    >
                      <td className="py-3 px-4">
                        {hoveredSong === song.id ? (
                          <button  onClick={() => {
    setQueue(selectedPlaylist.songs);
playSong(song);
songsApi.play(song.id).catch(() => {});

    
  }} className="w-6 h-6 flex items-center justify-center">
                            <Play size={16} fill="white" stroke="white" />
                          </button>
                        ) : (
                          <span className="text-gray-400">{index + 1}</span>
                        )}
                        
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img src={song.cover} alt={song.title} className="w-10 h-10 rounded object-cover" />
                          <div>
                            <p className="font-semibold">{song.title}</p>
                            <p className="text-xs text-gray-400">{song.artist}</p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="py-3 px-4 text-gray-400">{song.duration}</td>
                      
                      <td className="py-3 px-4">
                        <button
                          onClick={() => removeSongFromPlaylist(song.id)}
                          className="text-red-500 hover:text-red-400 text-sm flex items-center gap-1"
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* New Playlist Modal */}
      {showNewPlaylistModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-[#282828] rounded-lg p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Create New Playlist</h3>
              <button onClick={() => setShowNewPlaylistModal(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Playlist Name</label>
                <input
                  type="text"
                  value={newPlaylistName}
                  onChange={e => setNewPlaylistName(e.target.value)}
                  placeholder="Enter playlist name..."
                  className="w-full bg-[#121212] text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ac42c2]"
                  onKeyDown={e => e.key === 'Enter' && createNewPlaylist()}
                />
              </div>
              <button
                onClick={createNewPlaylist}
                className="w-full bg-[#35063E] text-white py-3 rounded-full font-bold hover:scale-105 transition-transform"
              >
                Create Playlist
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Song to Playlist Modal */}
      {showAddSongModal && selectedPlaylist && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-[#282828] rounded-lg p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Add Songs to {selectedPlaylist.title}</h3>
              <button onClick={() => setShowAddSongModal(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            {songs.filter(s => !selectedPlaylist.songs.find(ps => ps.id === s.id)).length === 0 ? (
              <p className="text-gray-400 text-center py-8">No more songs to add.</p>
            ) : (
              <div className="space-y-3">
                {songs
                  .filter(song => !selectedPlaylist.songs.find(s => s.id === song.id))
                  .map(song => (
                    <div key={song.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-[#3a3a3a] transition-colors">
                      <img src={song.cover} alt={song.title} className="w-12 h-12 rounded object-cover" />
                      <div className="flex-1">
                        <p className="font-semibold">{song.title}</p>
                        <p className="text-sm text-gray-400">{song.artist} • {song.album}</p>
                      </div>
                      <span className="text-sm text-gray-400">{song.duration}</span>
                      <button
                        onClick={() => addSongToPlaylist(song)}
                        className="bg-[#35063E] text-white px-4 py-2 rounded-full font-semibold hover:scale-105 transition-transform"
                      >
                        Add
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}
      {songToAdd && (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
    <div className="bg-[#282828] rounded-lg p-6 w-[400px]">
      
      <div className="flex justify-between mb-4">
        <h3 className="text-lg font-bold">Add to Playlist</h3>
        <button onClick={() => setSongToAdd(null)}>
          <X />
        </button>
      </div>

      {/* Create new playlist */}
      <button
        onClick={async () => {
          const created = await playlistsApi.create("New Playlist");
          
          await playlistsApi.addSong(created.id, songToAdd.id);

          setPlaylists(prev => [...prev, {
            id: created.id,
            title: created.titre,
            createdDate: created.dateCreation,
            songCount: 1,
            cover: DEFAULT_PLAYLIST_COVER,
            songs: [songToAdd]
          }]);

          setSongToAdd(null);
        }}
        className="w-full mb-3 bg-[#35063E] text-white py-2 rounded hover:bg-[#ac42c2]"
      >
        + Create new playlist & add
      </button>

      {/* Existing playlists */}
      <div className="space-y-2 max-h-[250px] overflow-y-auto">
        {playlists.map(p => (
          <button
            key={p.id}
            onClick={async () => {
              await playlistsApi.addSong(p.id, songToAdd.id);

              setPlaylists(prev =>
                prev.map(pl =>
                  pl.id === p.id
                    ? { ...pl, songs: [...pl.songs, songToAdd], songCount: pl.songCount + 1 }
                    : pl
                )
              );

              setSongToAdd(null);
            }}
            className="w-full text-left p-3 bg-[#333] rounded hover:bg-[#444]"
          >
            {p.title} ({p.songCount})
          </button>
        ))}
      </div>

    </div>
  </div>
)}
{editingPlaylist && (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
    <div className="bg-[#282828] rounded-lg p-8 max-w-md w-full">

      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold">Edit Playlist</h3>
        <button onClick={() => setEditingPlaylist(null)}>
          <X size={24} />
        </button>
      </div>

      <input
        type="text"
        value={editPlaylistName}
        onChange={(e) => setEditPlaylistName(e.target.value)}
        className="w-full bg-[#121212] text-white px-4 py-2 rounded-md "
        onKeyDown={(e) => e.key === "Enter" && updatePlaylistTitle()}
      />

      <button
        onClick={updatePlaylistTitle}
        className="w-full mt-4 bg-[#35063E] text-white py-3 rounded-full font-bold"
      >
        Save changes
      </button>

    </div>
  </div>
)}
    </div>
    
  );
}
