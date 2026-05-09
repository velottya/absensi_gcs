import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Employees = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/employees');
      setEmployees(response.data.data || response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center" style={{ background: '#F8F9FA' }}>
        <div
          className="bg-white/90 backdrop-blur-lg rounded-2xl p-8 shadow-xl"
          style={{ border: '1px solid rgba(162,210,255,0.25)' }}
        >
          <h2 className="text-2xl font-extrabold" style={{ color: '#0b2a3a' }}>
            Akses Ditolak
          </h2>
          <p className="mt-3" style={{ color: 'rgba(0,0,0,0.65)' }}>
            Hanya admin yang dapat mengakses halaman ini
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center mt-6 px-6 py-2 rounded-2xl font-extrabold transition-transform"
            style={{ background: '#A2D2FF', color: '#0b2a3a', boxShadow: '0 10px 25px rgba(162,210,255,0.35)' }}
          >
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ background: '#F8F9FA' }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-extrabold" style={{ color: '#333333' }}>
            Daftar Karyawan
          </h1>
          <Link
            to="/dashboard"
            className="px-4 py-2 font-extrabold rounded-2xl transition-transform"
            style={{ background: '#BDE0FE', color: '#0b2a3a' }}
          >
            Kembali
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div
              className="animate-spin rounded-full h-12 w-12 border-b-2"
              style={{ borderColor: 'rgba(126,176,232,0.45)', borderBottomColor: '#7EB0E8' }}
            ></div>
          </div>
        ) : error ? (
          <div
            className="px-6 py-4 rounded-2xl mb-6 border"
            style={{ background: 'rgba(205,180,219,0.15)', borderColor: 'rgba(162,210,255,0.35)', color: '#0b2a3a' }}
          >
            <p className="font-bold mb-2">Error</p>
            <p>{error}</p>
            <button
              onClick={fetchEmployees}
              className="mt-4 px-4 py-2 rounded-2xl font-extrabold transition-transform"
              style={{ background: 'rgba(126,176,232,0.25)', color: '#0b2a3a', border: '1px solid rgba(162,210,255,0.35)' }}
            >
              Coba Lagi
            </button>
          </div>
        ) : (
          <div
            className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl"
            style={{ border: '1px solid rgba(162,210,255,0.22)' }}
          >
            {employees.length === 0 ? (
              <div className="p-8 text-center">
                <p style={{ color: '#0b2a3a', fontWeight: 700 }}>Tidak ada data karyawan</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead style={{ background: 'linear-gradient(90deg, #A2D2FF, #BDE0FE)' }}>
                    <tr>
                      <th className="px-6 py-4 text-left text-white font-extrabold">No</th>
                      <th className="px-6 py-4 text-left text-white font-extrabold">Nama</th>
                      <th className="px-6 py-4 text-left text-white font-extrabold">NIK</th>
                      <th className="px-6 py-4 text-left text-white font-extrabold">Email</th>
                      <th className="px-6 py-4 text-left text-white font-extrabold">Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((employee, index) => (
                      <tr
                        key={employee.id}
                        style={{ borderBottom: '1px solid rgba(162,210,255,0.18)' }}
                      >
                        <td className="px-6 py-4 font-semibold" style={{ color: '#0b2a3a' }}>
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 font-semibold" style={{ color: '#0b2a3a' }}>
                          {employee.name}
                        </td>
                        <td className="px-6 py-4" style={{ color: 'rgba(0,0,0,0.65)' }}>
                          {employee.nik}
                        </td>
                        <td className="px-6 py-4" style={{ color: 'rgba(0,0,0,0.65)' }}>
                          {employee.email}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className="px-3 py-1 rounded-full text-sm font-extrabold"
                            style={{
                              background: employee.role === 'admin' ? 'rgba(205,180,219,0.30)' : 'rgba(162,210,255,0.25)',
                              color: employee.role === 'admin' ? '#6b2f5b' : '#0b2a3a',
                              border: '1px solid rgba(162,210,255,0.25)',
                            }}
                          >
                            {employee.role}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Employees;

