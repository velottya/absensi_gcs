import { useState } from 'react';
import { useAuth } from './AuthContext';
import { Link } from 'react-router-dom';

const Login = () => {
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(credential, password);
    } catch (err) {
      setError(err.response?.data?.message || 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-green-100 mb-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-emerald-800 mb-2">Absensi</h1>
            <p className="text-emerald-600">Sistem Absensi Geo-Selfie</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-emerald-900 font-semibold mb-2">NIK / Email</label>
              <input
                type="text"
                value={credential}
                onChange={(e) => setCredential(e.target.value)}
                className="w-full p-3 rounded-xl bg-green-50 border-2 border-emerald-300 text-emerald-900 placeholder-emerald-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                placeholder="Masukkan NIK atau Email"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-emerald-900 font-semibold mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 rounded-xl bg-green-50 border-2 border-emerald-300 text-emerald-900 placeholder-emerald-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                placeholder="Password"
                required
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full p-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {loading ? 'Loading...' : 'Masuk'}
            </button>
          </form>

          <p className="text-emerald-700 mt-6 text-center">
            Belum punya akun?{' '}
            <Link to="/register" className="text-emerald-700 font-bold hover:text-emerald-800 underline transition-colors">
              Daftar di sini
            </Link>
          </p>
        </div>

        <div className="bg-gradient-to-r from-green-100 to-emerald-100 backdrop-blur-lg rounded-2xl p-4 shadow-lg border border-green-200">
          <p className="text-emerald-800 text-xs font-semibold mb-2">Demo Credentials:</p>
          <div className="text-xs text-emerald-700 space-y-1 bg-white/50 p-2 rounded">
            <p><span className="font-semibold">Admin:</span> admin@example.com / adminpass123</p>
            <p><span className="font-semibold">User:</span> user@example.com / userpass123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

