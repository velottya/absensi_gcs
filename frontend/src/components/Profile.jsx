import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaCog, FaSignOutAlt } from 'react-icons/fa';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const PAGE_BG = '#F8F9FA';
  const TEXT_DARK = '#333333';
  const BORDER = 'rgba(0,0,0,0.06)';
  const CARD = 'rgba(255,255,255,0.95)';

  return (
    <div style={{ background: PAGE_BG }} className="min-h-screen">
      <div className="mx-auto max-w-4xl px-3 sm:px-4 py-6">
        <div className="rounded-2xl" style={{ background: CARD, border: `1px solid ${BORDER}`, boxShadow: '0 10px 30px rgba(0,0,0,0.06)' }}>
          <div className="p-5 sm:p-7">
            <h1 className="text-2xl sm:text-3xl font-extrabold" style={{ color: TEXT_DARK }}>
              Profil
            </h1>
            <p className="mt-1 text-sm" style={{ color: 'rgba(0,0,0,0.55)' }}>
              Informasi karyawan
            </p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoTile label="Nama" value={user?.name || '-'} />
              <InfoTile label="NIK" value={user?.nik || '-'} />
              <InfoTile label="Role" value={user?.role || '-'} />
              <InfoTile label="Email" value={user?.email || '-'} />
            </div>

            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={() => navigate('/setting')}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-blue-700 font-extrabold text-white shadow-lg shadow-blue-100"
              >
                <FaCog />
                Setting Aplikasi
              </button>
              <button
                type="button"
                onClick={logout}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl border border-red-100 bg-white font-extrabold text-red-600 shadow-sm"
              >
                <FaSignOutAlt />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoTile({ label, value }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: 'rgba(162,210,255,0.12)', border: '1px solid rgba(162,210,255,0.25)' }}>
      <div className="text-xs font-semibold" style={{ color: 'rgba(0,0,0,0.55)' }}>
        {label}
      </div>
      <div className="mt-1 font-bold" style={{ color: '#333333' }}>
        {value}
      </div>
    </div>
  );
}
