import { useState } from 'react';
import { useRef } from "react";
import { useNavigate } from 'react-router';
import {
  Camera, Save, Mic2, CheckCircle, User, Lock,
  Loader2, Trash2, AlertTriangle,
} from 'lucide-react';
import { useMusicContext } from '../context/MusicContext';
import { artistsApi, api } from '../api/client';

export default function AccountSettingsPage() {
  const { currentUser, logout, updateUser, setArtistProfileId } = useMusicContext();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'artist'>('profile');
  
  const [photoFile, setPhotoFile] = useState<File | null>(null);
const [photoPreview, setPhotoPreview] = useState('');
const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [profile, setProfile] = useState({
    username: currentUser?.username ?? '',
    prenom:   currentUser?.prenom   ?? '',
    nom:      currentUser?.nom      ?? '',
    email:    currentUser?.email    ?? '',
    dateN:    '',
    photo: currentUser?.photo ??'',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved,  setProfileSaved]  = useState(false);
  const [profileError,  setProfileError]  = useState('');

  const [pwForm,   setPwForm]   = useState({ current: '', next: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSaved,  setPwSaved]  = useState(false);
  const [pwError,  setPwError]  = useState('');

  const [artistName,       setArtistName]       = useState('');
  const [showBecomeArtist, setShowBecomeArtist] = useState(false);
  const [artistCreated,    setArtistCreated]    = useState(false);
  const [artistLoading,    setArtistLoading]    = useState(false);
  const [artistError,      setArtistError]      = useState('');

  const [showDelete,    setShowDelete]    = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
   const handlePhotoChange = (
  e: React.ChangeEvent<HTMLInputElement>
) => {

  const file = e.target.files?.[0];

  if (!file) return;

  setPhotoFile(file);

  // temporary local preview
  const previewUrl = URL.createObjectURL(file);

  setPhotoPreview(previewUrl);
};
  const handleSaveProfile = async () => {
  setProfileSaving(true);
  setProfileError('');

  try {

    // ── If there is a photo → use FormData
    if (photoFile) {

      const formData = new FormData();

      formData.append('username', profile.username);
      formData.append('nom', profile.nom);
      formData.append('prenom', profile.prenom);

      if (profile.dateN) {
        formData.append('dateN', profile.dateN);
      }

      formData.append('photo', photoFile);

      // IMPORTANT:
      // Laravel handles multipart/form-data better with POST + _method
      formData.append('_method', 'PUT');

      const updated = await api.post<any>(
        '/user/profile',
        formData
      );

      updateUser({
        ...currentUser!,
        ...updated
      });

    } else {

      // ── Original JSON logic (unchanged)
      const updated = await api.put<any>(
        '/user/profile',
        {
          username: profile.username,
          nom: profile.nom,
          prenom: profile.prenom,
          dateN: profile.dateN || undefined,
        }
      );

      updateUser({
        ...currentUser!,
        ...updated
      });
    }

    setProfileSaved(true);

    setTimeout(() => {
      setProfileSaved(false);
    }, 3000);

  } catch (e: any) {

    setProfileError(
      e.message || 'Failed to save.'
    );

  } finally {

    setProfileSaving(false);
  }
};
  
  const handleChangePassword = async () => {
    if (pwForm.next !== pwForm.confirm) { setPwError('Passwords do not match.'); return; }
    if (pwForm.next.length < 8)         { setPwError('Minimum 8 characters.');   return; }
    setPwSaving(true);
    setPwError('');
    try {
      await api.put('/user/password', {
        current_password:          pwForm.current,
        new_password:              pwForm.next,
        new_password_confirmation: pwForm.confirm,
      });
      setPwForm({ current: '', next: '', confirm: '' });
      setPwSaved(true);
      setTimeout(() => setPwSaved(false), 3000);
    } catch (e: any) {
      setPwError(e.message || 'Failed to update password.');
    } finally {
      setPwSaving(false);
    }
  };

  const handleBecomeArtist = async () => {
    if (!artistName.trim()) return;
    setArtistLoading(true);
    setArtistError('');
    try {
      // Crée le profil artiste en DB et récupère l'ID retourné
      const result = await artistsApi.becomeArtist(artistName.trim()) as any;

      // ── Mettre à jour le contexte avec le nouvel artistProfileId ──────────
      // C'est ce qui débloque l'accès à /artist dans ArtistRoute
      const newId = result?.id ?? result?.data?.id ?? null;
      setArtistProfileId(newId);

      // Mettre à jour le rôle dans le contexte si le backend le change
      if (currentUser) updateUser({ ...currentUser, role: 'artist' });

      setArtistCreated(true);
      // Rediriger vers /artist après 1.5s
      setTimeout(() => navigate('/artist'), 1500);
    } catch (e: any) {
      setArtistError(e.message || 'Failed to create artist profile.');
    } finally {
      setArtistLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      await api.delete('/user');
      logout();
      navigate('/login');
    } catch {
      setDeleteLoading(false);
    }
  };

  const tabs: Array<{
    id: 'profile' | 'security' | 'artist';
    label: string;
    icon: React.ElementType;
  }> = [
    { id: 'profile',  label: 'Profile',  icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    // Onglet "Become Artist" visible seulement si l'user n'est pas encore artiste
    ...(currentUser?.role === 'listener'
      ? [{ id: 'artist' as const, label: 'Become Artist', icon: Mic2 }]
      : []),
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-[#121212] p-8">
      <h1 className="text-2xl font-bold text-white mb-6">Account Settings</h1>

      <div className="flex gap-1 border-b border-[#571066] mb-8">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === id
                ? 'border-[#571066] text-white'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Icon size={15} />{label}
          </button>
        ))}
      </div>

      {/* ── PROFILE ─────────────────────────────────────────────────── */}
      {activeTab === 'profile' && (
        <div className="max-w-xl space-y-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              {photoPreview || currentUser?.photo ? (
  <img
    src={
      photoPreview
        ? photoPreview
        : `http://localhost:8000/storage/${currentUser?.photo}`
    }
    alt="avatar"
    className="w-20 h-20 rounded-full object-cover"
  />
) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl font-bold">
                  {(currentUser?.prenom?.[0] ?? currentUser?.username?.[0] ?? '?').toUpperCase()}
                </div>
              )}
             <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#ac42c2] rounded-full flex items-center justify-center hover:bg-[#35063E]"
                >
                <Camera size={13} className="text-white" />
             </button>
             <input
                 type="file"
                 accept="image/*"
                 ref={fileInputRef}
                 onChange={handlePhotoChange}
                 className="hidden"
                  />
            </div>
            <div>
              <p className="text-white font-semibold">{currentUser?.username}</p>
              <p className="text-gray-400 text-xs mt-0.5 capitalize">{currentUser?.role}</p>
            </div>
          </div>

          {profileError && (
            <p className="text-red-400 text-sm bg-red-400/10 px-4 py-2 rounded-lg">{profileError}</p>
          )}

          <div className="grid grid-cols-2 gap-4">
            <FormField label="First Name" value={profile.prenom}
              onChange={v => setProfile(p => ({ ...p, prenom: v }))} />
            <FormField label="Last Name" value={profile.nom}
              onChange={v => setProfile(p => ({ ...p, nom: v }))} />
          </div>
          <FormField label="Username" value={profile.username}
            onChange={v => setProfile(p => ({ ...p, username: v }))} />
          <FormField label="Email" value={profile.email}
            onChange={v => setProfile(p => ({ ...p, email: v }))} type="email" />
          <FormField label="Date of Birth" value={profile.dateN}
            onChange={v => setProfile(p => ({ ...p, dateN: v }))} type="date" />

          <button onClick={handleSaveProfile} disabled={profileSaving}
            className="flex items-center gap-2 bg-[#35063E] hover:bg-[#ac42c2] disabled:opacity-60 text-white font-bold px-6 py-2.5 rounded-full text-sm">
            {profileSaving ? <><Loader2 size={15} className="animate-spin" /> Saving...</>
             : profileSaved  ? <><CheckCircle size={15} /> Saved!</>
             : <><Save size={15} /> Save Changes</>}
          </button>

          <div className="border border-red-500/20 rounded-xl p-4 mt-8">
            <h3 className="text-red-400 font-semibold text-sm mb-2 flex items-center gap-2">
              <AlertTriangle size={15} /> Danger Zone
            </h3>
            <p className="text-gray-500 text-xs mb-3">Once deleted, your account cannot be recovered.</p>
            {!showDelete ? (
              <button onClick={() => setShowDelete(true)}
                className="flex items-center gap-2 text-red-400 border border-red-500/30 hover:bg-red-500/10 px-4 py-2 rounded-lg text-xs">
                <Trash2 size={13} /> Delete Account
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-red-300 text-xs">Are you absolutely sure?</p>
                <div className="flex gap-2">
                  <button onClick={() => setShowDelete(false)}
                    className="px-4 py-2 bg-[#282828] rounded-lg text-xs font-medium hover:bg-[#333]">
                    Cancel
                  </button>
                  <button onClick={handleDeleteAccount} disabled={deleteLoading}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-xs font-bold flex items-center gap-1.5">
                    {deleteLoading ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                    Confirm Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── SECURITY ────────────────────────────────────────────────── */}
      {activeTab === 'security' && (
        <div className="max-w-xl space-y-5">
          <h2 className="text-lg font-semibold">Change Password</h2>
          {pwError && (
            <p className="text-red-400 text-sm bg-red-400/10 px-4 py-2 rounded-lg">{pwError}</p>
          )}
          <FormField label="Current Password" value={pwForm.current}
            onChange={v => setPwForm(p => ({ ...p, current: v }))} type="password" placeholder="••••••••" />
          <FormField label="New Password" value={pwForm.next}
            onChange={v => setPwForm(p => ({ ...p, next: v }))} type="password" placeholder="Min. 8 characters" />
          <FormField label="Confirm New Password" value={pwForm.confirm}
            onChange={v => setPwForm(p => ({ ...p, confirm: v }))} type="password" placeholder="Repeat new password" />
          <button onClick={handleChangePassword} disabled={pwSaving || !pwForm.current}
            className="bg-[#35063E] disabled:opacity-60 hover:bg-[#ac42c2] text-white font-bold px-6 py-2.5 rounded-full text-sm flex items-center gap-2">
            {pwSaving ? <><Loader2 size={15} className="animate-spin" /> Updating...</>
             : pwSaved  ? <><CheckCircle size={15} /> Updated!</>
             : 'Update Password'}
          </button>
        </div>
      )}

      {/* ── BECOME ARTIST ───────────────────────────────────────────── */}
      {activeTab === 'artist' && (
        <div className="max-w-xl">
          {artistCreated ? (
            <div className="text-center py-12">
              <CheckCircle size={48} className="text-[#1DB954] mx-auto mb-4" />
              <h2 className="text-white text-xl font-bold mb-2">Artist Profile Created!</h2>
              <p className="text-gray-400 text-sm">Redirecting to your artist dashboard...</p>
            </div>
          ) : !showBecomeArtist ? (
            <div className="bg-gradient-to-br from-[#ac42c2]/10 to-[#35063E] rounded-2xl p-8 border border-[#1DB954]/20 text-center">
              <div className="w-16 h-16 bg-[#35063E]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mic2 size={32} className="text-[#ac42c2]" />
              </div>
              <h2 className="text-white text-xl font-bold mb-2">Become an Artist</h2>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                Share your music with the world. Upload songs, create albums, and build your fanbase.
              </p>
              <ul className="text-left space-y-2 mb-8 max-w-xs mx-auto">
                {['Upload unlimited songs', 'Create and manage albums',
                  'View listener stats', 'Build a public artist profile'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-gray-300 text-sm">
                    <CheckCircle size={14} className="text-[#ac42c2] flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <button onClick={() => setShowBecomeArtist(true)}
                className="bg-[#6e1182] hover:bg-[#ac42c2] text-white font-bold px-8 py-3 rounded-full text-sm">
                Get Started
              </button>
            </div>
          ) : (
            <div className="bg-[#1a1a1a] rounded-2xl p-8 border border-[#ac42c2]">
              <h2 className="text-white text-xl font-bold mb-1">Choose your artist name</h2>
              <p className="text-gray-400 text-sm mb-6">This will be your public artist name.</p>
              <div className="space-y-4">
                <input value={artistName} onChange={e => setArtistName(e.target.value)}
                  placeholder="Your artist name" autoFocus
                  onKeyDown={e => e.key === 'Enter' && handleBecomeArtist()}
                  className="w-full bg-[#282828] text-white border border-[#444] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#ac42c2]" />
                {artistError && <p className="text-red-400 text-sm">{artistError}</p>}
                <div className="flex gap-3">
                  <button onClick={() => setShowBecomeArtist(false)}
                    className="flex-1 bg-[#282828] hover:bg-[#333] text-white font-medium py-2.5 rounded-full text-sm">
                    Back
                  </button>
                  <button onClick={handleBecomeArtist}
                    disabled={!artistName.trim() || artistLoading}
                    className="flex-1 bg-[#35063E] hover:bg-[#ac42c2] disabled:opacity-40 text-white font-bold py-2.5 rounded-full text-sm flex items-center justify-center gap-2">
                    {artistLoading
                      ? <><Loader2 size={15} className="animate-spin" /> Creating...</>
                      : 'Create Artist Profile'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FormField({ label, value, onChange, type = 'text', placeholder = '' }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-300 mb-1.5">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#282828] text-white border border-[#444] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1DB954]" />
    </div>
  );
}
