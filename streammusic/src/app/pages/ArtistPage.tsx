import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Upload, X, Play, Save, CheckCircle, Music, Disc, Loader2, Minus } from 'lucide-react';
import { songsApi, albumsApi, artistsApi } from '../api/client';
import { useMusicContext } from '../context/MusicContext';
import { useNavigate } from "react-router";
const DEFAULT_COVER = 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&h=300&fit=crop';

function notify(msg: string, type: 'success'|'error', setFn: (n:{msg:string;type:string}|null)=>void) {
  setFn({ msg, type });
  setTimeout(() => setFn(null), 3000);
}

export default function ArtistPage() {
  const { currentUser, playSong, setQueue } = useMusicContext();
  const [songs, setSongs] = useState<any[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [artistProfile, setArtistProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{msg:string;type:string}|null>(null);

  // Modals
  const [showUpload, setShowUpload] = useState(false);
  const [showNewAlbum, setShowNewAlbum] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<any>(null);
  const [confirmDelete, setConfirmDelete] = useState<{type:string;id:number}|null>(null);
  const [addingSongId, setAddingSongId] = useState<number | null>(null);
  const [removingSongId, setRemovingSongId] = useState<number | null>(null);
  // Form state
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDuration, setUploadDuration] = useState('');
  const [uploadAlbumId, setUploadAlbumId] = useState('');
  const [uploadFile, setUploadFile] = useState<File|null>(null);
  const [uploadCover, setUploadCover] = useState<File|null>(null);
  const [newAlbumTitle, setNewAlbumTitle] = useState('');
  const [newAlbumDate, setNewAlbumDate] = useState('');
  const [editAlbumTitle, setEditAlbumTitle] = useState('');
  const [editAlbumDate, setEditAlbumDate] = useState('');
  const [artistName, setArtistName] = useState('');
  const [artistBio, setArtistBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const load = async () => {
      try {
        const [songsRes, albumsRes] = await Promise.all([
  songsApi.list(),
  albumsApi.list(),
]);

if (currentUser?.role === 'artist') {

  const artists = await artistsApi.list();

  const me = artists.data?.find(
    (a: any) => a.user_id === currentUser.id
  );

  if (me) {

    setArtistProfile(me);
    setArtistName(me.nomArtiste);
    setArtistBio(me.bio ?? '');

    const artistId = me.id;

    const mySongs = songsRes.data.filter(
      (s: any) => s.artist_id === artistId
    );

    const myAlbums = albumsRes.data.filter(
      (a: any) => a.artist_id === artistId
    );

    setSongs(mySongs);
    setAlbums(myAlbums);
  }
}
        // Load artist profile
        if (currentUser?.role === 'artist') {
          const artists = await artistsApi.list();
          const me = artists.data?.find((a:any) => a.user_id === currentUser.id);
          if (me) { setArtistProfile(me); setArtistName(me.nomArtiste); setArtistBio(me.bio ?? ''); }
        }
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, [currentUser]);

  const handleUpload = async () => {
    if (!uploadTitle || !uploadFile) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append('titre', uploadTitle);
      form.append('duree', uploadDuration || '0:00');
      form.append('fichier', uploadFile);
      if (uploadCover) form.append('cover', uploadCover);
      if (uploadAlbumId) form.append('album_id', uploadAlbumId);
      const newSong = await songsApi.upload(form);
      setSongs(prev => [newSong, ...prev]);
      setShowUpload(false);
      setUploadTitle(''); setUploadDuration(''); setUploadAlbumId('');
      setUploadFile(null); setUploadCover(null);
      notify('Song uploaded successfully!', 'success', setNotification);
    } catch (e: any) {
      notify(e.message || 'Upload failed.', 'error', setNotification);
    } finally { setUploading(false); }
  };

  const handleDeleteSong = async (id: number) => {
    try {
      await songsApi.delete(id);
      setSongs(prev => prev.filter(s => s.id !== id));
      setConfirmDelete(null);
      notify('Song deleted.', 'success', setNotification);
    } catch { notify('Failed to delete.', 'error', setNotification); }
  };

  const handleCreateAlbum = async () => {
    if (!newAlbumTitle || !newAlbumDate) return;
    try {
      const album = await albumsApi.create({ titre: newAlbumTitle, dateSortie: newAlbumDate });
      setAlbums(prev => [album, ...prev]);
      setShowNewAlbum(false); setNewAlbumTitle(''); setNewAlbumDate('');
      notify('Album created!', 'success', setNotification);
    } catch { notify('Failed to create album.', 'error', setNotification); }
  };

  const handleEditAlbum = async () => {
    if (!editingAlbum) return;
    try {
      const updated = await albumsApi.update(editingAlbum.id, { titre: editAlbumTitle, dateSortie: editAlbumDate });
      setAlbums(prev => prev.map(a => a.id === editingAlbum.id ? { ...a, ...updated } : a));
      setEditingAlbum(null);
      notify('Album updated!', 'success', setNotification);
    } catch { notify('Failed to update album.', 'error', setNotification); }
  };

  const handleDeleteAlbum = async (id: number) => {
    try {
      await albumsApi.delete(id);
      setAlbums(prev => prev.filter(a => a.id !== id));
      setConfirmDelete(null);
      notify('Album deleted.', 'success', setNotification);
    } catch { notify('Failed to delete album.', 'error', setNotification); }
  };
   const handleAddSongToAlbum = async (albumId: number, songId: number) => {
  try {
    await albumsApi.addSong(albumId, songId);

    setSongs(prev =>
      prev.map(song =>
        song.id === songId
          ? {
              ...song,
              album: albums.find(a => a.id === albumId)
            }
          : song
      )
    );

    setAddingSongId(null);

    notify('Song added to album!', 'success', setNotification);
  } catch {
    notify('Failed to add song to album.', 'error', setNotification);
  }
};
  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await artistsApi.updateProfile({ nomArtiste: artistName, bio: artistBio });
      setShowEditProfile(false);
      notify('Profile updated!', 'success', setNotification);
    } catch { notify('Failed to save.', 'error', setNotification); }
    finally { setSaving(false); }
  };
const handleRemoveSongFromAlbum = async (
  albumId: number,
  songId: number
) => {
  try {
    await albumsApi.removeSong(albumId, songId);

    setSongs(prev =>
      prev.map(song =>
        song.id === songId
          ? {
              ...song,
              album: null
            }
          : song
      )
    );

    setRemovingSongId(null);

    notify(
      'Song removed from album!',
      'success',
      setNotification
    );
  } catch {
    notify(
      'Failed to remove song.',
      'error',
      setNotification
    );
  }
};
  const fmt = (n: number) => n >= 1e6 ? `${(n/1e6).toFixed(1)}M` : n >= 1e3 ? `${(n/1e3).toFixed(0)}K` : String(n);

  if (loading) return (
    <div className="flex items-center justify-center h-full bg-[#121212]">
      <Loader2 size={32} className="animate-spin text-[#1DB954]" />
    </div>
  );

  return (
    <div className="bg-[#121212] min-h-full p-8">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-lg shadow-xl text-sm font-medium ${
          notification.type === 'success' ? 'bg-[#1DB954] text-black' : 'bg-red-600 text-white'
        }`}>
          {notification.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl font-bold overflow-hidden">
            {artistProfile?.photo
              ? <img src={`http://localhost:8000/storage/${artistProfile.photo}`} alt="artist" className="w-full h-full object-cover" />
              : (artistName[0] || '?')}
          </div>
          <div>
            <h1 className="text-4xl font-black text-white">{artistName || 'My Artist Profile'}</h1>
            <p className="text-gray-400 text-sm mt-1">{songs.length} songs · {albums.length} albums</p>
          </div>
        </div>
        <button onClick={() => setShowEditProfile(true)}
          className="flex items-center gap-2 bg-[#35063E] hover:bg-[#333] text-white px-4 py-2.5 rounded-full text-sm font-semibold transition-colors">
          <Edit size={16} /> Edit Profile
        </button>
      </div>

      {/* Songs section */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <Music size={24} className="text-[#ac42c2]" />
            <h2 className="text-2xl font-bold">My Songs</h2>
            <span className="text-gray-500 text-sm">({songs.length})</span>
          </div>
          <button onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 bg-[#35063E] text-white px-4 py-2 rounded-full text-sm font-bold hover:scale-105 transition-transform">
            <Upload size={16} /> Upload Song
          </button>
        </div>

        {songs.length === 0 ? (
          <div className="bg-[#282828] rounded-xl p-12 text-center">
            <Music size={48} className="text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 mb-4">You haven't uploaded any songs yet.</p>
            <button onClick={() => setShowUpload(true)}
              className="bg-[#35063E] text-white px-6 py-2.5 rounded-full font-bold text-sm hover:scale-105 transition-transform">
              Upload Your First Song
            </button>
          </div>
        ) : (
          <div className="bg-[#282828] rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700 text-gray-400 text-xs uppercase tracking-wider">
                  <th className="text-left py-3 px-4 w-10">#</th>
                  <th className="text-left py-3 px-4">Title</th>
                  <th className="text-left py-3 px-4">Album</th>
                  <th className="text-left py-3 px-4">Duration</th>
                  <th className="text-left py-3 px-4">Plays</th>
                  <th className="text-right py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {songs.map((song, i) => {
                  const s = {
                    id: song.id, title: song.titre,
                    artist: artistName,
                    album: song.album?.titre ?? '',
                    duration: song.duree ?? '', playCount: song.nombreEcoutes ?? 0,
                    rating: 0, cover: song.cover ?? DEFAULT_COVER, fichier: song.fichier,
                  };
                  return (
                    <tr key={song.id} className="hover:bg-[#333] transition-colors group">
                      <td className="py-3 px-4">
                        <button onClick={() => { setQueue(songs.map(x=>({id:x.id,title:x.titre,artist:artistName,album:x.album?.titre??'',duration:x.duree??'',playCount:x.nombreEcoutes??0,rating:0,cover:x.cover??DEFAULT_COVER,fichier:x.fichier}))); playSong(s); }}
                          className="text-gray-400 group-hover:text-white transition-colors">
                          <Play size={14} fill="currentColor" />
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img src={`http://localhost:8000/storage/${song.cover ?? DEFAULT_COVER}`} alt={song.titre}
                            className="w-10 h-10 rounded object-cover" />
                          <span className="font-semibold text-sm">{song.titre}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-400 text-sm">{song.album?.titre ?? '—'}</td>
                      <td className="py-3 px-4 text-gray-400 text-sm">{song.duree ?? '—'}</td>
                      <td className="py-3 px-4 text-gray-500 text-sm">{fmt(song.nombreEcoutes ?? 0)}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">

    {/* ADD TO ALBUM */}
    <div className="relative">
      <button
        onClick={() =>
          setAddingSongId(
            addingSongId === song.id ? null : song.id
          )
        }
        className="text-green-500 hover:text-green-400"
      >
        <Plus size={16} />
      </button>

      {addingSongId === song.id && (
        <div className={`absolute right-0 w-48 bg-[#222] border border-[#444] rounded-lg shadow-xl z-50 p-2 ${
  i >= songs.length - 2
    ? 'bottom-full mb-2'
    : 'top-full mt-2'
}`}>
          <p className="text-xs text-gray-400 mb-2">
            Add to album
          </p>

          {albums.length === 0 ? (
            <p className="text-xs text-gray-500">
              No albums
            </p>
          ) : (
            albums.map(album => (
              <button
                key={album.id}
                onClick={() =>
                  handleAddSongToAlbum(album.id, song.id)
                }
                className="w-full text-left px-3 py-2 rounded hover:bg-[#333] text-sm"
              >
                {album.titre}
              </button>
            ))
          )}
        </div>
      )}
    </div>
     {/*supp de album*/}
     <div className="relative">

  <button
    onClick={() =>
      setRemovingSongId(
        removingSongId === song.id
          ? null
          : song.id
      )
    }
    className="text-yellow-500 hover:text-yellow-400"
  >
    <Minus size={16} />
  </button>

  {removingSongId === song.id && song.album && (
    <div className={`absolute right-0 w-48 bg-[#222] border border-[#444] rounded-lg shadow-xl z-50 p-2 ${
  i >= songs.length - 2
    ? 'bottom-full mb-2'
    : 'top-full mt-2'
}`}>

      <p className="text-xs text-gray-400 mb-2">
        Remove from album
      </p>

      <button
        onClick={() =>
          handleRemoveSongFromAlbum(
            song.album.id,
            song.id
          )
        }
        className="w-full text-left px-3 py-2 rounded hover:bg-[#333] text-sm"
      >
        {song.album.titre}
      </button>

    </div>
  )}
</div>
    {/* DELETE */}
    <button
      onClick={() =>
        setConfirmDelete({
          type: 'song',
          id: song.id
        })
      }
      className="text-red-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
    >
      <Trash2 size={16} />
    </button>
  </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Albums section */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <Disc size={24} className="text-[#ac42c2]" />
            <h2 className="text-2xl font-bold">My Albums</h2>
          </div>
          <button onClick={() => setShowNewAlbum(true)}
            className="flex items-center gap-2 bg-[#282828] hover:bg-[#333] text-white px-4 py-2 rounded-full text-sm font-bold transition-colors">
            <Plus size={16} /> New Album
          </button>
        </div>

        {albums.length === 0 ? (
          <div className="bg-[#282828] rounded-xl p-10 text-center">
            <Disc size={40} className="text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No albums yet. Create your first album!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {albums.map(album => (
              <div key={album.id} className="bg-[#282828] p-4 rounded-xl group relative">
                <button onClick={() => navigate(`/album/${album.id}`)}>
                <img src={album.cover ? `http://localhost:8000/storage/${album.cover}` : DEFAULT_COVER} alt={album.titre}
                  className="w-full aspect-square object-cover rounded-lg mb-3" />
                  </button>
                <h3 className="font-bold text-sm truncate">{album.titre}</h3>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(album.dateSortie).getFullYear()} · {(album.songs?.length ?? 0)} songs
                </p>
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditingAlbum(album); setEditAlbumTitle(album.titre); setEditAlbumDate(album.dateSortie); }}
                    className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center">
                    <Edit size={12} />
                  </button>
                  <button onClick={() => setConfirmDelete({ type: 'album', id: album.id })}
                    className="w-7 h-7 bg-red-600 rounded-full flex items-center justify-center">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── MODALS ────────────────────────────────────────────────────── */}
      {/* Upload Song Modal */}
      {showUpload && (
        <Modal title="Upload Song" onClose={() => setShowUpload(false)}>
          <div className="space-y-4">
            <Input label="Song Title *" value={uploadTitle} onChange={setUploadTitle} placeholder="Enter song title" />
            <Input label="Duration" value={uploadDuration} onChange={setUploadDuration} placeholder="e.g. 3:45" />
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">Album (optional)</label>
              <select value={uploadAlbumId} onChange={e => setUploadAlbumId(e.target.value)}
                className="w-full bg-[#333] text-white border border-[#555] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1DB954]">
                <option value="">— No album —</option>
                {albums.map(a => <option key={a.id} value={a.id}>{a.titre}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">Audio File * (MP3/WAV/OGG)</label>
              <input type="file" accept="audio/*" onChange={e => setUploadFile(e.target.files?.[0] ?? null)}
                className="w-full text-sm text-gray-400 file:mr-3 file:py-2 file:px-4 file:rounded-full file:bg-[#35063E] file:text-white file:font-semibold file:border-0 cursor-pointer" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">Cover Image (optional)</label>
              <input type="file" accept="image/*" onChange={e => setUploadCover(e.target.files?.[0] ?? null)}
                className="w-full text-sm text-gray-400 file:mr-3 file:py-2 file:px-4 file:rounded-full file:bg-[#35063E] file:text-white file:font-semibold file:border-0 cursor-pointer" />
            </div>
            <button onClick={handleUpload} disabled={!uploadTitle || !uploadFile || uploading}
              className="w-full bg-[#35063E] disabled:opacity-40 text-white py-3 rounded-full font-bold text-sm hover:bg-[#35063E] transition-colors flex items-center justify-center gap-2">
              {uploading ? <><Loader2 size={16} className="animate-spin" /> Uploading...</> : <><Upload size={16} /> Upload</>}
            </button>
          </div>
        </Modal>
      )}

      {/* New Album Modal */}
      {showNewAlbum && (
        <Modal title="Create New Album" onClose={() => setShowNewAlbum(false)}>
          <div className="space-y-4">
            <Input label="Album Title *" value={newAlbumTitle} onChange={setNewAlbumTitle} placeholder="Album title" />
            <Input label="Release Date *" value={newAlbumDate} onChange={setNewAlbumDate} type="date" />
            <button onClick={handleCreateAlbum} disabled={!newAlbumTitle || !newAlbumDate}
              className="w-full bg-[#35063E] disabled:opacity-40 text-white py-3 rounded-full font-bold text-sm">
              Create Album
            </button>
          </div>
        </Modal>
      )}

      {/* Edit Album Modal */}
      {editingAlbum && (
        <Modal title="Edit Album" onClose={() => setEditingAlbum(null)}>
          <div className="space-y-4">
            <Input label="Album Title" value={editAlbumTitle} onChange={setEditAlbumTitle} />
            <Input label="Release Date" value={editAlbumDate} onChange={setEditAlbumDate} type="date" />
            <button onClick={handleEditAlbum}
              className="w-full bg-[#35063E] text-white py-3 rounded-full font-bold text-sm">
              Save Changes
            </button>
          </div>
        </Modal>
      )}

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <Modal title="Edit Artist Profile" onClose={() => setShowEditProfile(false)}>
          <div className="space-y-4">
            <Input label="Artist Name" value={artistName} onChange={setArtistName} />
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">Biography</label>
              <textarea value={artistBio} onChange={e => setArtistBio(e.target.value)} rows={4}
                placeholder="Tell the world about your music..."
                className="w-full bg-[#333] text-white border border-[#555] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1DB954] resize-none" />
            </div>
            <button onClick={handleSaveProfile} disabled={saving}
              className="w-full bg-[#35063E] disabled:opacity-40 text-white py-3 rounded-full font-bold text-sm flex items-center justify-center gap-2">
              {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><Save size={16} /> Save Profile</>}
            </button>
          </div>
        </Modal>
      )}

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <Modal title="Confirm Delete" onClose={() => setConfirmDelete(null)}>
          <p className="text-gray-300 text-sm mb-6">Are you sure you want to delete this {confirmDelete.type}? This action cannot be undone.</p>
          <div className="flex gap-3">
            <button onClick={() => setConfirmDelete(null)}
              className="flex-1 bg-[#282828] hover:bg-[#333] text-white py-2.5 rounded-full text-sm font-semibold">
              Cancel
            </button>
            <button onClick={() => confirmDelete.type === 'song' ? handleDeleteSong(confirmDelete.id) : handleDeleteAlbum(confirmDelete.id)}
              className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2.5 rounded-full text-sm font-bold">
              Delete
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Small helper components ───────────────────────────────────────────────────
function Modal({ title, onClose, children }: { title:string; onClose:()=>void; children:React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#282828] rounded-2xl p-7 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={22} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Input({ label, value, onChange, placeholder='', type='text' }: {
  label:string; value:string; onChange:(v:string)=>void; placeholder?:string; type?:string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-300 mb-1.5">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-[#333] text-white border border-[#555] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1DB954]" />
    </div>
  );
}