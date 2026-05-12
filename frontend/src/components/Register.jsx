import { useState } from 'react';
import { useAuth } from './AuthContext';
import { Link } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    nik: '',
    email: '',
    password: '',
    password_confirmation: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.password_confirmation) {
      setError('Password tidak cocok');
      return;
    }
    setLoading(true);
    try {
      await register({
        name: formData.name,
        nik: formData.nik,
        email: formData.email,
        password: formData.password
      });
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors || 'Registrasi gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 flex items-center justify-center" style={{ background: '#f2fbf6' }}>
      <div className="max-w-md w-full">
        <div className="bg-white/90 backdrop-blur-lg rounded-lg p-8 shadow-md" style={{ border: '1px solid rgba(7,155,76,0.20)' }}>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold" style={{ color: '#173224', marginBottom: 8 }}>Daftar Akun</h1>
            <p className="text-sm sm:text-base" style={{ color: 'rgba(0,0,0,0.65)' }}>Buat akun baru untuk mulai absensi</p>
          </div>


          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-extrabold mb-2" style={{ color: '#173224' }}>Nama Lengkap</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full p-3 rounded-lg"
                style={{ background: '#f2fbf6', border: '1px solid rgba(0,0,0,0.08)', color: '#173224' }}
                placeholder="Nama Lengkap"
                required
              />

            </div>

            <div className="mb-4">
              <label className="block text-sm font-extrabold mb-2" style={{ color: '#173224' }}>NIK</label>
              <input
                type="text"
                value={formData.nik}
                onChange={(e) => setFormData({...formData, nik: e.target.value})}
                className="w-full p-3 rounded-lg"
                style={{ background: '#f2fbf6', border: '1px solid rgba(0,0,0,0.08)', color: '#173224' }}
                placeholder="Nomor Identitas Karyawan"
                required
              />

            </div>

            <div className="mb-4">
              <label className="block text-sm font-extrabold mb-2" style={{ color: '#173224' }}>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full p-3 rounded-lg"
                style={{ background: '#f2fbf6', border: '1px solid rgba(0,0,0,0.08)', color: '#173224' }}
                placeholder="Email"
                required
              />

            </div>

            <div className="mb-4">
              <label className="block text-sm font-extrabold mb-2" style={{ color: '#173224' }}>Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full p-3 rounded-lg"
                style={{ background: '#f2fbf6', border: '1px solid rgba(0,0,0,0.08)', color: '#173224' }}
                placeholder="Password (min 8 karakter)"
                required
              />

            </div>

            <div className="mb-6">
              <label className="block text-sm font-extrabold mb-2" style={{ color: '#173224' }}>Konfirmasi Password</label>
              <input
                type="password"
                value={formData.password_confirmation}
                onChange={(e) => setFormData({...formData, password_confirmation: e.target.value})}
                className="w-full p-3 rounded-lg"
                style={{ background: '#f2fbf6', border: '1px solid rgba(0,0,0,0.08)', color: '#173224' }}
                placeholder="Konfirmasi Password"
                required
              />

            </div>

            {error && (
              <div
                className="mb-4 p-3 rounded-lg text-sm font-semibold"
                style={{
                  background: 'rgba(246,174,69,0.18)',
                  border: '1px solid rgba(246,174,69,0.35)',
                  color: '#773e1b'
                }}
              >
                {typeof error === 'object' ? JSON.stringify(error) : error}
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
              {loading ? 'Loading...' : 'Daftar'}
            </button>

          </form>

          <p className="mt-6 text-center" style={{ color: 'rgba(0,0,0,0.65)' }}>
            Sudah punya akun?{' '}
            <Link to="/" className="font-extrabold" style={{ color: '#05773a', textDecoration: 'underline' }}>
              Masuk di sini
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
};

export default Register;

