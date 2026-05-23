import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Play, Eye, EyeOff } from 'lucide-react';
import { authApi } from '../api/client';
import { useMusicContext } from '../context/MusicContext';

export default function RegisterPage() {
   const navigate = useNavigate();
  const { login } = useMusicContext();
  const [form, setForm] = useState({ username: '', nom: '', prenom: '', email: '', password: '', dateN: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authApi.register({
        username: form.username,
        email: form.email,
        password: form.password,
        nom: form.nom,
        prenom: form.prenom,
        dateN: form.dateN || undefined,
      });

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

      navigate('/listener');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed. Please try again.';
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
          <div className="w-12 h-12 bg-[#550b63] rounded-full flex items-center justify-center">
            <Play size={22} fill="white" stroke="white" />
          </div>
          <span className="text-2xl font-bold text-white">StreamMusic</span>
        </div>

        <div className="bg-[#282828] rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-white text-center mb-2">Create account</h1>
          <p className="text-gray-400 text-center mb-6 text-sm">Start listening for free today</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg p-3 mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">First Name</label>
                <input
                  name="prenom"
                  value={form.prenom}
                  onChange={handleChange}
                  placeholder="John"
                  className="w-full bg-[#3E3E3E] text-white border border-[#555] rounded-lg px-3 py-2.5 text-sm placeholder-gray-500 focus:outline-none focus:border-[#680f7a]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">Last Name</label>
                <input
                  name="nom"
                  value={form.nom}
                  onChange={handleChange}
                  placeholder="Doe"
                  className="w-full bg-[#3E3E3E] text-white border border-[#555] rounded-lg px-3 py-2.5 text-sm placeholder-gray-500 focus:outline-none focus:border-[#680f7a]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">Username *</label>
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="johndoe"
                className="w-full bg-[#3E3E3E] text-white border border-[#555] rounded-lg px-4 py-2.5 text-sm placeholder-gray-500 focus:outline-none focus:border-[#680f7a]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">Email *</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full bg-[#3E3E3E] text-white border border-[#555] rounded-lg px-4 py-2.5 text-sm placeholder-gray-500 focus:outline-none focus:border-[#680f7a]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">Date of Birth</label>
              <input
                type="date"
                name="dateN"
                value={form.dateN}
                onChange={handleChange}
                className="w-full bg-[#3E3E3E] text-white border border-[#555] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#680f7a]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">Password *</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 8 characters"
                  className="w-full bg-[#3E3E3E] text-white border border-[#555] rounded-lg px-4 py-2.5 pr-10 text-sm placeholder-gray-500 focus:outline-none focus:border-[#680f7a]"
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

            <p className="text-gray-500 text-xs">
              By registering, you agree to our{' '}
              <span className="text-[#8a0fa3]">Terms of Service</span> and{' '}
              <span className="text-[#8a0fa3]">Privacy Policy</span>.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#590d69] hover:bg-[#680f7a] disabled:opacity-50 text-white font-bold py-3 rounded-full transition-colors text-sm"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-[#8a0fa3] hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
