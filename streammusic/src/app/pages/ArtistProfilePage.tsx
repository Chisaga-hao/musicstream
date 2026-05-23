import { useState, useEffect } from 'react';
import { Play, Users, Music, Disc, ChevronLeft, Loader2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { artistsApi } from '../api/client';
import { useMusicContext } from '../context/MusicContext';

const DEFAULT_COVER = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=60&h=60&fit=crop';
const DEFAULT_BANNER = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&h=300&fit=crop';

function fmt(n: number) {
  if (n >= 1e6) return `${(n/1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n/1e3).toFixed(0)}K`;
  return n.toString();
}

export default function ArtistProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { playSong, setQueue } = useMusicContext();

  const [artist, setArtist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'songs'|'albums'>('songs');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    artistsApi.get(Number(id))
      .then(data => setArtist(data))
      .catch(() => setError('Artist not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex-1 flex items-center justify-center bg-[#121212] h-full">
      <Loader2 size={32} className="animate-spin text-[#571066]" />
    </div>
  );

  if (error || !artist) return (
    <div className="flex-1 bg-[#121212] p-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-8">
        <ChevronLeft size={20} /> Back
      </button>
      <div className="text-center py-24 text-gray-500">
        <Music size={48} className="mx-auto mb-4 opacity-30" />
        <p>{error || 'Artist not found.'}</p>
      </div>
    </div>
  );

  const songs = (artist.songs ?? []).map((s: any) => ({
    id: s.id, title: s.titre,
    artist: artist.nomArtiste,
    album: s.album?.titre ?? '',
    duration: s.duree ?? '',
    playCount: s.nombreEcoutes ?? 0,
    rating: 0,
    cover: s.cover ?? DEFAULT_COVER,
    fichier: s.fichier,
  }));

  const handlePlayAll = () => {
    if (songs.length > 0) { setQueue(songs); playSong(songs[0], songs); }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#121212]">
      {/* Back */}
      <div className="absolute top-4 left-[250px] z-10">
        <button onClick={() => navigate(-1)}
          className="w-8 h-8 bg-black/70 rounded-full flex items-center justify-center hover:bg-black">
          <ChevronLeft size={18} />
        </button>
      </div>

      {/* Banner */}
      <div className="relative h-52">
        <img src={artist.photo ? `http://localhost:8000/storage/${artist.photo}` : DEFAULT_BANNER}
          alt="banner" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#121212]" />
      </div>

      {/* Info */}
      <div className="px-8 -mt-14 relative">
        <div className="flex items-end gap-5 mb-6">
          <div className="w-28 h-28 rounded-full border-4 border-[#121212] shadow-xl overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-4xl font-bold">
            {artist.photo
              ? <img src={`http://localhost:8000/storage/${artist.photo}`} alt={artist.nomArtiste} className="w-full h-full object-cover" />
              : artist.nomArtiste[0]}
          </div>
          <div className="pb-2">
            <p className="text-gray-400 text-xs uppercase font-bold tracking-widest">Artist</p>
            <h1 className="text-white text-4xl font-black">{artist.nomArtiste}</h1>
            <p className="text-gray-400 text-sm mt-1">
              <Music size={13} className="inline mr-1" />{songs.length} songs
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={handlePlayAll}
            className="w-14 h-14 bg-[#571066] rounded-full flex items-center justify-center hover:scale-105 transition-all shadow-lg">
            <Play size={24} fill="white" stroke="white" />
          </button>
        </div>

        {/* Bio */}
        {artist.bio && (
          <p className="text-gray-300 text-sm max-w-2xl leading-relaxed mb-8">{artist.bio}</p>
        )}

        {/* Tabs */}
        <div className="flex gap-1 border-b border-[#282828] mb-6">
          {(['songs','albums'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 text-sm font-medium capitalize border-b-2 transition-colors ${
                activeTab === tab ? 'border-white text-white' : 'border-transparent text-gray-400 hover:text-white'
              }`}>
              {tab === 'songs' ? `Songs (${songs.length})` : `Albums (${(artist.albums??[]).length})`}
            </button>
          ))}
        </div>

        {/* Songs tab */}
        {activeTab === 'songs' && (
          songs.length === 0
            ? <p className="text-gray-500 text-sm py-8">No songs published yet.</p>
            : <div className="space-y-1 mb-12">
                {songs.map((s: any, i: number) => (
                  <div key={s.id} onClick={() => { setQueue(songs); playSong(s, songs); }}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-[#282828] group cursor-pointer transition-colors">
                    <span className="text-gray-500 w-6 text-sm">{i+1}</span>
                    <div className="relative w-10 h-10 flex-shrink-0">
                      <img src={s.cover ? `http://localhost:8000/storage/${s.cover}` : DEFAULT_BANNER} alt={s.title} className="w-10 h-10 rounded object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded transition-opacity">
                        <Play size={14} fill="white" stroke="white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{s.title}</p>
                      <p className="text-xs text-gray-400 truncate">{s.album || '—'}</p>
                    </div>
                    <span className="text-xs text-gray-500">{s.duration}</span>
                    <span className="text-xs text-gray-600">{fmt(s.playCount)}</span>
                  </div>
                ))}
              </div>
        )}

        {/* Albums tab */}
        {activeTab === 'albums' && (
          (artist.albums ?? []).length === 0
            ? <p className="text-gray-500 text-sm py-8">No albums yet.</p>
            : <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mb-12">
                {(artist.albums ?? []).map((a: any) => (
                  <div key={a.id} className="bg-[#282828] p-4 rounded-xl hover:bg-[#333] transition-colors cursor-pointer">
                    <button onClick={() => navigate(`/album/${a.id}`)}>
                    <img src={a.cover ? `http://localhost:8000/storage/${a.cover}` : DEFAULT_BANNER} alt={a.titre}
                      className="w-full aspect-square object-cover rounded-lg mb-3" />
                      </button>
                    <p className="font-bold text-sm truncate">{a.titre}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {(a.songs ?? []).length} songs · {new Date(a.dateSortie).getFullYear()}
                    </p>
                  </div>
                ))}
              </div>
        )}
      </div>
    </div>
  );
}