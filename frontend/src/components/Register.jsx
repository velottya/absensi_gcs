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
    <div className="min-h-screen p-4 flex items-center justify-center" style={{ background: '#F8F9FA' }}>
      <div className="max-w-md w-full">
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-8 shadow-xl" style={{ border: '1px solid rgba(162,210,255,0.25)' }}>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold" style={{ color: '#333333', marginBottom: 8 }}>Daftar Akun</h1>
            <p className="text-sm sm:text-base" style={{ color: 'rgba(0,0,0,0.65)' }}>Buat akun baru untuk mulai absensi</p>
          </div>


          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-extrabold mb-2" style={{ color: '#333333' }}>Nama Lengkap</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full p-3 rounded-2xl"
                style={{ background: '#F8F9FA', border: '1px solid rgba(0,0,0,0.08)', color: '#333333' }}
                placeholder="Nama Lengkap"
                required
              />

            </div>

            <div className="mb-4">
              <label className="block text-sm font-extrabold mb-2" style={{ color: '#333333' }}>NIK</label>
              <input
                type="text"
                value={formData.nik}
                onChange={(e) => setFormData({...formData, nik: e.target.value})}
                className="w-full p-3 rounded-2xl"
                style={{ background: '#F8F9FA', border: '1px solid rgba(0,0,0,0.08)', color: '#333333' }}
                placeholder="Nomor Identitas Karyawan"
                required
              />

            </div>

            <div className="mb-4">
              <label className="block text-sm font-extrabold mb-2" style={{ color: '#333333' }}>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full p-3 rounded-2xl"
                style={{ background: '#F8F9FA', border: '1px solid rgba(0,0,0,0.08)', color: '#333333' }}
                placeholder="Email"
                required
              />

            </div>

            <div className="mb-4">
              <label className="block text-sm font-extrabold mb-2" style={{ color: '#333333' }}>Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full p-3 rounded-2xl"
                style={{ background: '#F8F9FA', border: '1px solid rgba(0,0,0,0.08)', color: '#333333' }}
                placeholder="Password (min 8 karakter)"
                required
              />

            </div>

            <div className="mb-6">
              <label className="block text-sm font-extrabold mb-2" style={{ color: '#333333' }}>Konfirmasi Password</label>
              <input
                type="password"
                value={formData.password_confirmation}
                onChange={(e) => setFormData({...formData, password_confirmation: e.target.value})}
                className="w-full p-3 rounded-2xl"
                style={{ background: '#F8F9FA', border: '1px solid rgba(0,0,0,0.08)', color: '#333333' }}
                placeholder="Konfirmasi Password"
                required
              />

            </div>

            {error && (
              <div
                className="mb-4 p-3 rounded-2xl text-sm font-semibold"
                style={{
                  background: 'rgba(255,183,77,0.18)',
                  border: '1px solid rgba(255,183,77,0.35)',
                  color: '#7a3e00'
                }}
              >
                {typeof error === 'object' ? JSON.stringify(error) : error}
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
              {loading ? 'Loading...' : 'Daftar'}
            </button>

          </form>

          <p className="mt-6 text-center" style={{ color: 'rgba(0,0,0,0.65)' }}>
            Sudah punya akun?{' '}
            <Link to="/" className="font-extrabold" style={{ color: '#0b2a3a', textDecoration: 'underline' }}>
              Masuk di sini
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
};

export default Register;

