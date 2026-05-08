import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';

const History = () => {
  const { user } = useAuth();
  const [attendanceList, setAttendanceList] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await axios.get('/attendance/history');
        setAttendanceList(response.data);
      } catch (err) {
        setError('Gagal memuat history: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  const filteredList = filter === 'all'
    ? attendanceList
    : attendanceList.filter(item => item.type === filter);

  // Delete and clear functionality removed as per requirement

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6">
        <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 rounded-2xl p-6">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-green-100 mb-6">
          <h1 className="text-3xl font-bold text-emerald-800 mb-2">Riwayat Absensi</h1>
          <p className="text-emerald-600">Total: <span className="font-bold">{attendanceList.length}</span> records</p>
        </div>

        <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-green-100 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-6 py-2 rounded-xl font-semibold transition-all duration-200 ${
                  filter === 'all'
                    ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg'
                    : 'bg-green-100 text-emerald-700 hover:bg-green-200 border border-emerald-300'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setFilter('in')}
                className={`px-6 py-2 rounded-xl font-semibold transition-all duration-200 ${
                  filter === 'in'
                    ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg'
                    : 'bg-green-100 text-emerald-700 hover:bg-green-200 border border-emerald-300'
                }`}
              >
                Masuk
              </button>
              <button
                onClick={() => setFilter('out')}
                className={`px-6 py-2 rounded-xl font-semibold transition-all duration-200 ${
                  filter === 'out'
                    ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg'
                    : 'bg-green-100 text-emerald-700 hover:bg-green-200 border border-emerald-300'
                }`}
              >
                Keluar
              </button>
            </div>

          </div>

          {filteredList.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-emerald-600 text-lg font-semibold">Belum ada data absensi</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredList.map((record) => (
                <div key={record.id} className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-emerald-200 hover:border-emerald-400 hover:shadow-md transition-all duration-200">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-lg font-bold px-3 py-1 rounded-lg" style={{backgroundColor: record.type === 'in' ? '#dcfce7' : '#fee2e2', color: record.type === 'in' ? '#16a34a' : '#dc2626'}}>
                          {record.type === 'in' ? 'MASUK' : 'KELUAR'}
                        </span>
                        <div>
                          <p className="font-bold text-emerald-900">
                            {record.type === 'in' ? 'Absensi Masuk' : 'Absensi Keluar'}
                          </p>
                          <p className="text-sm text-emerald-700">{record.user.name} ({record.user.nik})</p>
                        </div>
                      </div>
                      <p className="text-sm text-emerald-600 mb-2">
                        Waktu: {formatTime(record.created_at)}
                      </p>
                      <p className="text-xs text-emerald-600">
                        Lokasi: {record.lat}, {record.lng}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {record.foto && (
                        <div className="relative group">
                          <img
                            src={`/storage/${record.foto}`}
                            alt="Absensi"
                            className="w-16 h-20 object-cover rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-all"
                          />
                        </div>
                      )}

                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        {attendanceList.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-green-100">
              <div className="text-center">
                <p className="text-emerald-600 text-sm font-semibold mb-1">Masuk</p>
                <p className="text-3xl font-bold text-emerald-800">
                  {attendanceList.filter(a => a.type === 'in').length}
                </p>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-green-100">
              <div className="text-center">
                <p className="text-emerald-600 text-sm font-semibold mb-1">Keluar</p>
                <p className="text-3xl font-bold text-emerald-800">
                  {attendanceList.filter(a => a.type === 'out').length}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
