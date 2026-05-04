import { useAuth } from './AuthContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-green-100 mb-6">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center text-4xl shadow-lg">
              👤
            </div>
            <h1 className="text-3xl font-bold text-emerald-800 mb-2">Selamat Datang</h1>
            <p className="text-xl font-semibold text-emerald-700 mb-1">{user.name}</p>
            <p className="text-emerald-600 text-sm bg-green-100 inline-block px-3 py-1 rounded-full">{user.nik}</p>
            {user.role && (
              <p className="text-emerald-600 text-sm mt-2 capitalize font-medium">Role: <span className="font-bold">{user.role}</span></p>
            )}
          </div>

          <div className="space-y-3 mb-6">
            <Link
              to="/attendance"
              className="block w-full p-4 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 text-center"
            >
              Mulai Absensi
            </Link>
            <Link
              to="/history"
              className="block w-full p-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 text-center"
            >
              Riwayat Absensi
            </Link>
          </div>

          <button
            onClick={logout}
            className="w-full p-3 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-xl transition-colors border border-red-300"
          >
            Logout
          </button>
        </div>

        <div className="bg-gradient-to-r from-green-100 to-emerald-100 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-green-200">
          <p className="text-emerald-800 text-sm text-center">
            <span className="font-semibold">Tips:</span> Pastikan GPS dan kamera diizinkan untuk pengalaman terbaik
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

