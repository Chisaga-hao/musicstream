import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Play, Eye, EyeOff, Music } from 'lucide-react';
import { authApi } from '../api/client';
import { useMusicContext } from '../context/MusicContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useMusicContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authApi.login({ email, password });

      login(
        {
          id: response.user.id,
          username: response.user.username,
          nom: response.user.nom ?? '',
          prenom: response.user.prenom ?? '',
          email: response.user.email,
          photo: response.user.photo ?? '',
          role: response.user.role,
          compteActif: response.user.compteActif,
        },
        response.token,
      );

      if (response.user.role === 'admin') {
        navigate('/developer');
      } else if (response.user.role === 'artist') {
        navigate('/artist');
      } else {
        navigate('/listener');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid email or password.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-[#590d69] rounded-full flex items-center justify-center">
            <Play size={22} fill="white" stroke="white" />
          </div>
          <span className="text-2xl font-bold text-white">StreamMusic</span>
        </div>

        {/* Card */}
        <div className="bg-[#282828] rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-white text-center mb-2">Welcome back</h1>
          <p className="text-gray-400 text-center mb-6 text-sm">Sign in to continue listening</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg p-3 mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-[#3E3E3E] text-white border border-[#555] rounded-lg px-4 py-3 text-sm placeholder-gray-500 focus:outline-none focus:border-[#590d69] transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#3E3E3E] text-white border border-[#555] rounded-lg px-4 py-3 pr-10 text-sm placeholder-gray-500 focus:outline-none focus:border-[#590d69] transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#590d69] hover:bg-[#7c1191] disabled:opacity-50 text-black font-bold py-3 rounded-full transition-colors text-sm"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-[#444]" />
            <span className="text-gray-500 text-xs">or</span>
            <div className="flex-1 h-px bg-[#444]" />
          </div>

          <p className="text-center text-sm text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#7c1191] hover:underline font-medium">
              Sign up for free
            </Link>
          </p>
        </div>

        {/* Music note decoration */}
        <div className="flex justify-center mt-6 gap-2 opacity-20">
          {[...Array(5)].map((_, i) => (
            <Music key={i} size={14} className="text-[#ab14c9]" />
          ))}
        </div>
      </div>
    </div>
  );
}
