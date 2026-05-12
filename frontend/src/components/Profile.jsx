import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaCog, FaSignOutAlt } from 'react-icons/fa';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const PAGE_BG = '#f2fbf6';
  const TEXT_DARK = '#173224';
  const BORDER = 'rgba(0,0,0,0.06)';
  const CARD = 'rgba(255,255,255,0.95)';

  return (
    <div style={{ background: PAGE_BG }} className="min-h-screen">
      <div className="mx-auto max-w-4xl px-3 sm:px-4 py-6">
        <div className="rounded-lg" style={{ background: CARD, border: `1px solid ${BORDER}`, boxShadow: 'none' }}>
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
                className="flex h-14 w-full items-center justify-center gap-2 rounded-lg bg-blue-700 font-extrabold text-white shadow-sm "
              >
                <FaCog />
                Setting Aplikasi
              </button>
              <button
                type="button"
                onClick={logout}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-lg border border-red-100 bg-white font-extrabold text-red-600 shadow-sm"
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
    <div className="rounded-lg p-4" style={{ background: 'rgba(7,155,76,0.10)', border: '1px solid rgba(7,155,76,0.20)' }}>
      <div className="text-xs font-semibold" style={{ color: 'rgba(0,0,0,0.55)' }}>
        {label}
      </div>
      <div className="mt-1 font-bold" style={{ color: '#173224' }}>
        {value}
      </div>
    </div>
  );
}
