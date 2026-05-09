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
    <div className="min-h-screen p-4 flex items-center justify-center" style={{ background: '#F8F9FA' }}>
      <div className="max-w-md w-full">
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-8 shadow-xl mb-6" style={{ border: '1px solid rgba(162,210,255,0.25)' }}>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold" style={{ color: '#333333' }}>Absensi</h1>
            <p className="text-sm sm:text-base" style={{ color: 'rgba(0,0,0,0.65)' }}>Sistem Absensi Geo-Selfie</p>
          </div>


          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-extrabold mb-2" style={{ color: '#333333' }}>NIK / Email</label>
              <input
                type="text"
                value={credential}
                onChange={(e) => setCredential(e.target.value)}
                className="w-full p-3 rounded-2xl"
                style={{ background: '#F8F9FA', border: '1px solid rgba(0,0,0,0.08)', color: '#333333' }}
                placeholder="Masukkan NIK atau Email"
                required
              />

            </div>

            <div className="mb-6">
              <label className="block text-sm font-extrabold mb-2" style={{ color: '#333333' }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 rounded-2xl"
                style={{ background: '#F8F9FA', border: '1px solid rgba(0,0,0,0.08)', color: '#333333' }}
                placeholder="Password"
                required
              />
            </div>


            {error && (
              <div
                className="mb-4 p-3 rounded-2xl text-sm font-semibold"
                style={{ background: 'rgba(255,183,77,0.18)', border: '1px solid rgba(255,183,77,0.35)', color: '#7a3e00' }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full p-3 rounded-2xl font-extrabold transition-transform"
              style={{
                background: loading ? 'rgba(126,176,232,0.35)' : '#7EB0E8',
                color: '#ffffff',
                boxShadow: '0 12px 30px rgba(126,176,232,0.18)'
              }}
            >
              {loading ? 'Loading...' : 'Masuk'}
            </button>

          </form>

          <p className="mt-6 text-center" style={{ color: 'rgba(0,0,0,0.65)' }}>
            Belum punya akun?{' '}
            <Link to="/register" className="font-extrabold" style={{ color: '#0b2a3a', textDecoration: 'underline' }}>
              Daftar di sini
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
};

export default Login;

