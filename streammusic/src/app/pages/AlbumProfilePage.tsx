import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Clock3, Play, Music } from 'lucide-react';
import { albumsApi, songsApi } from '../api/client';
import { useMusicContext } from '../context/MusicContext';

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

interface Album {
  id: number;
  title: string;
  artist: string;
  releaseDate: string;
  cover: string;
  songs: Song[];
}

const DEFAULT_SONG_COVER =
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&h=200&fit=crop';

const DEFAULT_ALBUM_COVER =
  'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&h=300&fit=crop';

export default function AlbumProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { playSong, setQueue } = useMusicContext();

  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlbum = async () => {
      try {
        
       const res = await albumsApi.get(Number(id));
         
        const songs = (res.songs ?? []).map((s: any) => ({
          id: s.id,
          title: s.titre,
          artist: s.artist?.nomArtiste ?? res.artist?.nomArtiste ?? 'Unknown',
          album: res.titre,
          duration: s.duree,
          playCount: s.nombreEcoutes,
          rating: 0,

          cover: s.cover
            ? `http://localhost:8000/storage/${s.cover}`
            : DEFAULT_SONG_COVER,

          fichier: `http://localhost:8000/storage/${s.fichier}`,
        }));

        setAlbum({
          id: res.id,
          title: res.titre,
          artist: res.artist?.nomArtiste ?? 'Unknown',
          releaseDate: res.dateSortie,

          cover:
            songs.length > 0
              ? songs[0].cover
              : DEFAULT_ALBUM_COVER,

          songs,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlbum();
  }, [id]);

  const formatPlayCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(0)}K`;
    return count.toString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#1DB954] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading album...</p>
        </div>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-400 text-lg">Album not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2a2a2a] to-[#121212] text-white">

      {/* HEADER */}
      <div className="p-8 pb-10">

        <button
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="flex flex-col md:flex-row gap-8 items-start md:items-end">

          <img
            src={album.cover}
            alt={album.title}
            className="w-64 h-64 rounded-2xl object-cover shadow-2xl"
          />

          <div className="flex-1">

            <p className="uppercase tracking-widest text-sm text-gray-400 mb-2">
              Album
            </p>

            <h1 className="text-5xl md:text-7xl font-black mb-4 leading-none">
              {album.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-gray-300 mb-6">
              <span className="font-semibold text-white">
                {album.artist}
              </span>

              <span>•</span>

              <span>
                {new Date(album.releaseDate).getFullYear()}
              </span>

              <span>•</span>

              <span>
                {album.songs.length} songs
              </span>
            </div>

            <button
              onClick={() => {
                if (album.songs.length === 0) return;

                setQueue(album.songs);

                playSong(album.songs[0]);

                songsApi.play(album.songs[0].id).catch(() => {});
              }}
              className="flex items-center gap-3 bg-[#35063E] hover:scale-105 transition-transform text-grey px-8 py-4 rounded-full font-bold text-lg"
            >
              <Play size={24} fill="white" stroke="white" />
              Play Album
            </button>
          </div>
        </div>
      </div>

      {/* SONGS */}
      <div className="px-8 pb-10">

        <div className="bg-[#181818] rounded-2xl overflow-hidden">

          <div className="grid grid-cols-[60px_1fr_120px_120px] gap-4 px-6 py-4 border-b border-[#2f2f2f] text-gray-400 text-sm uppercase tracking-wider">
            <div>#</div>
            <div>Title</div>
            <div>Plays</div>
            <div>
              <Clock3 size={16} />
            </div>
          </div>

          {album.songs.length === 0 ? (
            <div className="p-12 text-center">
              <Music size={48} className="mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400">
                No songs in this album.
              </p>
            </div>
          ) : (
            album.songs.map((song, index) => (
              <div
                key={song.id}
                onClick={() => {
                  setQueue(album.songs);

                  playSong(song);

                  songsApi.play(song.id).catch(() => {});
                }}
                className="grid grid-cols-[60px_1fr_120px_120px] gap-4 px-6 py-4 hover:bg-[#242424] transition-colors cursor-pointer group items-center"
              >

                <div className="flex items-center justify-center text-gray-400">
                  <span className="group-hover:hidden">
                    {index + 1}
                  </span>

                  <Play
                    size={16}
                    fill="white"
                    stroke="white"
                    className="hidden group-hover:block"
                  />
                </div>

                <div className="flex items-center gap-4 min-w-0">

                  <img
                    src={song.cover}
                    alt={song.title}
                    className="w-12 h-12 rounded object-cover"
                  />

                  <div className="min-w-0">
                    <h3 className="font-semibold truncate">
                      {song.title}
                    </h3>

                    <p className="text-sm text-gray-400 truncate">
                      {song.artist}
                    </p>
                  </div>
                </div>

                <div className="text-sm text-gray-400">
                  {formatPlayCount(song.playCount)}
                </div>

                <div className="text-sm text-gray-400">
                  {song.duration}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
