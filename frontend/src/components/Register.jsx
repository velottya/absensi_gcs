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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-green-100">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-emerald-800 mb-2">Daftar Akun</h1>
            <p className="text-emerald-600">Buat akun baru untuk mulai absensi</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-emerald-900 font-semibold mb-2">Nama Lengkap</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full p-3 rounded-xl bg-green-50 border-2 border-emerald-300 text-emerald-900 placeholder-emerald-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                placeholder="Nama Lengkap"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-emerald-900 font-semibold mb-2">NIK</label>
              <input
                type="text"
                value={formData.nik}
                onChange={(e) => setFormData({...formData, nik: e.target.value})}
                className="w-full p-3 rounded-xl bg-green-50 border-2 border-emerald-300 text-emerald-900 placeholder-emerald-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                placeholder="Nomor Identitas Karyawan"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-emerald-900 font-semibold mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full p-3 rounded-xl bg-green-50 border-2 border-emerald-300 text-emerald-900 placeholder-emerald-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                placeholder="Email"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-emerald-900 font-semibold mb-2">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full p-3 rounded-xl bg-green-50 border-2 border-emerald-300 text-emerald-900 placeholder-emerald-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                placeholder="Password (min 8 karakter)"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-emerald-900 font-semibold mb-2">Konfirmasi Password</label>
              <input
                type="password"
                value={formData.password_confirmation}
                onChange={(e) => setFormData({...formData, password_confirmation: e.target.value})}
                className="w-full p-3 rounded-xl bg-green-50 border-2 border-emerald-300 text-emerald-900 placeholder-emerald-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                placeholder="Konfirmasi Password"
                required
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-xl text-sm">
                {typeof error === 'object' ? JSON.stringify(error) : error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full p-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {loading ? 'Loading...' : 'Daftar'}
            </button>
          </form>

          <p className="text-emerald-700 mt-6 text-center">
            Sudah punya akun?{' '}
            <Link to="/" className="text-emerald-700 font-bold hover:text-emerald-800 underline transition-colors">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

