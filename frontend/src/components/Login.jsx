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
    <div className="min-h-screen p-4 flex items-center justify-center" style={{ background: '#f2fbf6' }}>
      <div className="max-w-md w-full">
        <div className="bg-white/90 backdrop-blur-lg rounded-lg p-8 shadow-md mb-6" style={{ border: '1px solid rgba(7,155,76,0.20)' }}>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold" style={{ color: '#173224' }}>Absensi</h1>
            <p className="text-sm sm:text-base" style={{ color: 'rgba(0,0,0,0.65)' }}>Sistem Absensi PT GCS</p>
          </div>


          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-extrabold mb-2" style={{ color: '#173224' }}>NIK / Email</label>
              <input
                type="text"
                value={credential}
                onChange={(e) => setCredential(e.target.value)}
                className="w-full p-3 rounded-lg"
                style={{ background: '#f2fbf6', border: '1px solid rgba(0,0,0,0.08)', color: '#173224' }}
                placeholder="Masukkan NIK atau Email"
                required
              />

            </div>

            <div className="mb-6">
              <label className="block text-sm font-extrabold mb-2" style={{ color: '#173224' }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 rounded-lg"
                style={{ background: '#f2fbf6', border: '1px solid rgba(0,0,0,0.08)', color: '#173224' }}
                placeholder="Password"
                required
              />
            </div>


            {error && (
              <div
                className="mb-4 p-3 rounded-lg text-sm font-semibold"
                style={{ background: 'rgba(246,174,69,0.18)', border: '1px solid rgba(246,174,69,0.35)', color: '#773e1b' }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full p-3 rounded-lg font-extrabold transition-transform"
              style={{
                background: loading ? 'rgba(7,155,76,0.35)' : '#079b4c',
                color: '#ffffff',
                boxShadow: 'none'
              }}
            >
              {loading ? 'Loading...' : 'Masuk'}
            </button>

          </form>

          <p className="mt-6 text-center" style={{ color: 'rgba(0,0,0,0.65)' }}>
            Belum punya akun?{' '}
            <Link to="/register" className="font-extrabold" style={{ color: '#05773a', textDecoration: 'underline' }}>
              Daftar di sini
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
};

export default Login;

