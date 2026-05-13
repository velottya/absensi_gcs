import { useEffect, useState, useCallback } from 'react';
import Geofence from '../config/geofence';

// Haversine distance in meters
function distanceMeters(lat1, lon1, lat2, lon2) {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371000; // metres
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function LocationGate({ children }) {
  const [status, setStatus] = useState('checking'); // checking | allowed | denied | error
  const [message, setMessage] = useState('Mengecek lokasi...');

  const check = useCallback(() => {
    setStatus('checking');
    setMessage('Mengecek lokasi...');

    if (!navigator.geolocation) {
      setStatus('error');
      setMessage('Browser tidak mendukung GPS. Akses diblokir.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const gf = Geofence();
        const d = distanceMeters(lat, lng, gf.HQ_LAT, gf.HQ_LNG);
        if (d <= gf.RADIUS_METERS) {
          setStatus('allowed');
        } else {
          setStatus('denied');
          setMessage(`Anda berada di luar area kantor (jarak ${Math.round(d)}m). Akses diblokir.`);
        }
      },
      (err) => {
        setStatus('error');
        if (err.code === 1) setMessage('Izin lokasi ditolak. Harap izinkan akses lokasi.');
        else if (err.code === 2) setMessage('Tidak dapat memperoleh lokasi perangkat.');
        else setMessage('Gagal mengambil lokasi: ' + err.message);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  const setCurrentAsHQ = () => {
    if (!navigator.geolocation) {
      setMessage('Browser tidak mendukung GPS.');
      return;
    }
    setMessage('Menyimpan lokasi sebagai HQ...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        try {
          const override = { lat: pos.coords.latitude, lng: pos.coords.longitude, radius: Geofence().RADIUS_METERS };
          localStorage.setItem('geofence.override', JSON.stringify(override));
          setMessage('Koordinat HQ disimpan. Memperbarui pengecekan...');
          // re-run check
          setTimeout(() => window.location.reload(), 800);
        } catch (e) {
          setMessage('Gagal menyimpan HQ: ' + e.message);
        }
      },
      (err) => {
        setMessage('Gagal mendapatkan lokasi: ' + err.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  if (status === 'allowed') return children;

  // Blocked UI
  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#f8faf8' }}>
      <div className="max-w-xl w-full bg-white rounded-lg shadow-md p-6 text-center" style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
        <h2 className="text-2xl font-extrabold mb-3" style={{ color: '#173224' }}>Akses Terbatas</h2>
        <p className="mb-4" style={{ color: 'rgba(0,0,0,0.7)' }}>{message}</p>
        <p className="text-sm text-gray-500 mb-4">Aplikasi hanya bisa diakses dari area kantor pusat (radius {Geofence.RADIUS_METERS}m).</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={check}
            className="px-4 py-2 rounded-lg font-semibold"
            style={{ background: '#d5f8e4', color: '#05773a' }}
          >
            Coba Lagi
          </button>
          <button
            onClick={() => location.reload()}
            className="px-4 py-2 rounded-lg font-semibold"
            style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)' }}
          >
            Muat Ulang Halaman
          </button>
          <button
            onClick={setCurrentAsHQ}
            className="px-4 py-2 rounded-lg font-semibold"
            style={{ background: '#05773a', color: '#fff' }}
          >
            Set Lokasi Ini sebagai HQ
          </button>
        </div>
      </div>
    </div>
  );
}
