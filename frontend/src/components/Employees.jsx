import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaChevronRight, FaUsers } from 'react-icons/fa';
import { useAuth } from './AuthContext';

const Employees = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/employees');
      setEmployees(response.data.data || response.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f2fbf6] p-4">
        <div className="rounded-lg border border-sky-100 bg-white p-6 text-center shadow-sm">
          <h2 className="text-2xl font-black text-slate-900">Akses Ditolak</h2>
          <p className="mt-2 text-sm font-semibold text-slate-500">Hanya admin yang dapat mengakses halaman ini.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f2fbf6] px-4 py-5">
      <div className="mx-auto max-w-md space-y-4">
        <section className="rounded-lg border border-blue-800 bg-blue-700 p-5 text-white shadow-md ">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-sky-100">Admin</p>
              <h1 className="mt-1 text-2xl font-black">Karyawan</h1>
              <p className="mt-1 text-sm font-medium text-sky-50">{employees.length} data terdaftar</p>
            </div>
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full border-2 border-white/35 bg-white/20 ring-4 ring-white/12">
              <FaUsers size={25} />
            </span>
          </div>
        </section>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-sky-100 border-b-blue-700" />
          </div>
        ) : error ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="font-black text-amber-900">Gagal memuat data</p>
            <p className="mt-1 text-sm font-semibold text-amber-800">{error}</p>
            <button
              type="button"
              onClick={fetchEmployees}
              className="mt-4 h-11 rounded-lg bg-blue-700 px-5 font-extrabold text-white"
            >
              Coba Lagi
            </button>
          </div>
        ) : employees.length === 0 ? (
          <div className="rounded-lg border border-sky-100 bg-white p-8 text-center shadow-sm">
            <p className="font-black text-slate-900">Tidak ada data karyawan</p>
          </div>
        ) : (
          <div className="space-y-3">
            {employees.map((employee) => (
              <button
                key={employee.id}
                type="button"
                onClick={() => navigate(`/employees/${employee.id}`)}
                className="flex w-full items-center gap-3 rounded-lg border border-sky-100 bg-white p-4 text-left shadow-sm transition active:scale-[0.99]"
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-blue-700 text-lg font-black text-white">
                  {(employee.name || 'K').slice(0, 1).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-base font-black text-slate-900">{employee.name || '-'}</span>
                  <span className="block truncate text-sm font-semibold text-slate-500">NIK {employee.nik || '-'}</span>
                </span>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-sky-50 text-blue-700">
                  <FaChevronRight size={14} />
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Employees;
