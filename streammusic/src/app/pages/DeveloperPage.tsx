import { useState, useEffect } from 'react';
import { Music, Users, Activity, Search, Trash2, Ban, RefreshCw, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { adminApi } from '../api/client';

export default function DeveloperPage() {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [artists, setArtists] = useState<any[]>([]);
  const [songs, setSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeSection, setActiveSection] = useState<'overview'|'users'|'artists'|'content'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmModal, setConfirmModal] = useState<{title:string;msg:string;action:()=>void}|null>(null);
  const [notification, setNotification] = useState<string|null>(null);
  const [usersPage, setUsersPage] = useState(1);

  const notify = (msg: string) => { setNotification(msg); setTimeout(() => setNotification(null), 3000); };

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, usersRes, artistsRes,songsRes] = await Promise.all([
          adminApi.dashboard(),
          adminApi.users(),
          adminApi.artists(),
          adminApi.songs(),
        ]);
        setStats(statsRes);
        setUsers(usersRes.data ?? []);
        setArtists(artistsRes.data ?? []);
        setSongs(songsRes.data ?? []);
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, []);

  const fmt = (n: number) => n >= 1e6 ? `${(n/1e6).toFixed(1)}M` : n >= 1e3 ? `${(n/1e3).toFixed(0)}K` : String(n ?? 0);

  const handleActivate = async (id: number) => {
    await adminApi.activateUser(id);
    setUsers(u => u.map(x => x.id === id ? { ...x, compteActif: true } : x));
    setConfirmModal(null); notify('Account activated.');
  };

  const handleDeactivate = async (id: number) => {
    await adminApi.deactivateUser(id);
    setUsers(u => u.map(x => x.id === id ? { ...x, compteActif: false } : x));
    setConfirmModal(null); notify('Account deactivated.');
  };

  const handleSuspendArtist = async (id: number) => {
    await adminApi.suspendArtist(id);
    setArtists(a => a.map(x => x.id === id ? { ...x, user: { ...x.user, compteActif: false } } : x));
    setConfirmModal(null); notify('Artist suspended.');
  };

  const handleDeleteSong = async (id: number) => {
    await adminApi.deleteSong(id);
    setSongs(s => s.filter(x => x.id !== id));
    setConfirmModal(null); notify('Song deleted.');
  };

  const filteredUsers = users.filter(u =>
    !searchQuery || u.username?.toLowerCase().includes(searchQuery.toLowerCase()) || u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center h-full bg-[#121212]">
      <Loader2 size={32} className="animate-spin text-[#1DB954]" />
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto bg-[#121212] p-8">
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-[#1DB954] text-black px-5 py-3 rounded-lg text-sm font-medium shadow-xl">
          {notification}
        </div>
      )}

      <h1 className="text-2xl font-black text-white mb-2">Admin Dashboard</h1>
      <p className="text-gray-400 text-sm mb-8">Manage users, artists, and content</p>

      {/* Section tabs */}
      <div className="flex gap-2 mb-8">
        {(['overview','users','artists','content'] as const).map(s => (
          <button key={s} onClick={() => setActiveSection(s)}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold capitalize transition-colors ${
              activeSection === s ? 'bg-[#571066] text-white' : 'bg-[#282828] text-gray-300 hover:bg-[#333]'
            }`}>
            {s}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ───────────────────────────────────────────────── */}
      {activeSection === 'overview' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {[
            { label: 'Total Songs', value: fmt(stats?.total_songs ?? 0), icon: Music, color: 'text-[#1DB954]', bg: 'bg-[#1DB954]/10' },
            { label: 'Total Artists', value: fmt(stats?.total_artists ?? 0), icon: Users, color: 'text-purple-400', bg: 'bg-purple-400/10' },
            { label: 'Total Users', value: fmt(stats?.total_users ?? 0), icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
            { label: 'Total Plays', value: fmt(stats?.total_plays ?? 0), icon: Activity, color: 'text-orange-400', bg: 'bg-orange-400/10' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-[#282828] rounded-2xl p-6">
              <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center mb-4`}>
                <Icon size={22} className={color} />
              </div>
              <p className="text-3xl font-black text-white">{value}</p>
              <p className="text-sm text-gray-400 mt-1">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── USERS ──────────────────────────────────────────────────── */}
      {activeSection === 'users' && (
        <div>
          <div className="flex items-center gap-4 mb-5">
            <div className="relative flex-1 max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search users..."
                className="w-full bg-[#282828] text-white rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#1DB954]" />
            </div>
            <span className="text-gray-400 text-sm">{filteredUsers.length} users</span>
          </div>
          <div className="bg-[#282828] rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700 text-gray-400 text-xs uppercase tracking-wider">
                  <th className="text-left py-3 px-4">User</th>
                  <th className="text-left py-3 px-4">Email</th>
                  <th className="text-left py-3 px-4">Role</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-right py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u.id} className="border-b border-gray-800 hover:bg-[#333] transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {u.photo ? (
  <img
    src={`http://localhost:8000/storage/${u.photo}`}
    alt={u.username}
    className="w-9 h-9 rounded-full object-cover flex-shrink-0"
  />
) : (
  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
    {u.username?.[0]?.toUpperCase() ?? '?'}
  </div>
)}
                        <span className="font-semibold text-sm">{u.username}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-400 text-sm">{u.email}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        u.role === 'admin' ? 'bg-purple-500/20 text-purple-300' :
                        u.role === 'artist' ? 'bg-[#1DB954]/20 text-[#1DB954]' :
                        'bg-blue-500/20 text-blue-300'
                      }`}>{u.role}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        u.compteActif ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>{u.compteActif ? 'Active' : 'Disabled'}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {u.compteActif ? (
                        <button onClick={() => setConfirmModal({ title:'Deactivate Account', msg:`Deactivate @${u.username}?`, action:()=>handleDeactivate(u.id) })}
                          className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1 ml-auto">
                          <Ban size={13} /> Deactivate
                        </button>
                      ) : (
                        <button onClick={() => setConfirmModal({ title:'Activate Account', msg:`Activate @${u.username}?`, action:()=>handleActivate(u.id) })}
                          className="text-green-400 hover:text-green-300 text-xs flex items-center gap-1 ml-auto">
                          <RefreshCw size={13} /> Activate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr><td colSpan={5} className="text-center text-gray-500 py-10 text-sm">No users found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── ARTISTS ────────────────────────────────────────────────── */}
      {activeSection === 'artists' && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {artists.map(a => (
            <div key={a.id} className="bg-[#282828] rounded-xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold overflow-hidden">
                  {a.photo ? <img src={`http://localhost:8000/storage/${a.photo}`} alt="" className="w-full h-full object-cover" />
                    : a.nomArtiste?.[0] ?? '?'}
                </div>
                <div>
                  <p className="font-semibold">{a.nomArtiste}</p>
                  <p className="text-xs text-gray-400">{a.user?.email}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 line-clamp-2 mb-4">{a.bio ?? '—'}</p>
              <div className="flex items-center justify-between">
                <span className={`text-xs px-2.5 py-0.5 rounded-full ${
                  a.user?.compteActif ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>{a.user?.compteActif ? 'Active' : 'Suspended'}</span>
                {a.user?.compteActif && (
                  <button onClick={() => setConfirmModal({ title:'Suspend Artist', msg:`Suspend ${a.nomArtiste}?`, action:()=>handleSuspendArtist(a.id) })}
                    className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1">
                    <Ban size={12} /> Suspend
                  </button>
                )}
              </div>
            </div>
          ))}
          {artists.length === 0 && <p className="text-gray-500 text-sm col-span-3 py-12 text-center">No artists yet.</p>}
        </div>
      )}

      {/* ── CONTENT ────────────────────────────────────────────────── */}
      {activeSection === 'content' && (
        <div>
          <p className="text-gray-400 text-sm mb-5">Manage all platform content</p>
          {songs.length === 0 ? (
            <div className="text-center py-20 text-gray-600">
              <Music size={40} className="mx-auto mb-3 opacity-30" />
              <p>No songs to moderate at this time.</p>
            </div>
          ) : (
            <div className="bg-[#282828] rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700 text-xs uppercase tracking-wider text-gray-400">
                    <th className="text-left py-3 px-4">Song</th>
                    <th className="text-left py-3 px-4">Artist</th>
                    <th className="text-left py-3 px-4">Album</th>
                    <th className="text-left py-3 px-4">Plays</th>
                    <th className="text-right py-3 px-4">Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {songs.map(s => (
                    <tr key={s.id} className="border-b border-gray-800 hover:bg-[#333] group">
                      <td className="py-3 px-4 font-semibold text-sm">{s.titre}</td>
                      <td className="py-3 px-4 text-gray-400 text-sm">{s.artist?.nomArtiste ?? '—'}</td>
                      <td className="py-3 px-4 text-gray-400 text-sm">{s.album?.titre ?? '—'}</td>
                      <td className="py-3 px-4 text-gray-500 text-sm">{fmt(s.nombreEcoutes)}</td>
                      <td className="py-3 px-4 text-right">
                        <button onClick={() => setConfirmModal({ title:'Delete Song', msg:`Delete "${s.titre}"?`, action:()=>handleDeleteSong(s.id) })}
                          className="text-red-500 hover:text-red-400 opacity-0 group-hover:opacity-100">
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Confirm Modal */}
      {confirmModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#282828] rounded-2xl p-7 max-w-sm w-full">
            <h3 className="text-lg font-bold mb-2">{confirmModal.title}</h3>
            <p className="text-gray-400 text-sm mb-6">{confirmModal.msg}</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmModal(null)}
                className="flex-1 bg-[#333] hover:bg-[#444] py-2.5 rounded-full text-sm font-medium">Cancel</button>
              <button onClick={confirmModal.action}
                className="flex-1 bg-red-600 hover:bg-red-500 py-2.5 rounded-full text-sm font-bold">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}