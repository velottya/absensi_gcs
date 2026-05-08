import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Attendance = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [location, setLocation] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [photoDataUrl, setPhotoDataUrl] = useState(null);
  const [type, setType] = useState('in');
  const [loading, setLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Check if user is admin
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    // Get GPS
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
        },
        (err) => {
          setGpsError('GPS tidak tersedia atau dimatikan');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setGpsError('Browser tidak support GPS');
    }

    // Camera - only for non-admin users
    if (!isAdmin) {
      const startCamera = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user', width: 640, height: 480 }
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
              videoRef.current.play();
            };
          }
        } catch (err) {
          setError('Kamera tidak tersedia atau izin ditolak: ' + err.message);
        }
      };
      startCamera();
    }

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, [isAdmin]);

  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) {
      setError('Canvas atau video tidak tersedia');
      return;
    }

    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
      setError('Video belum siap, coba lagi');
      return;
    }

    try {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          setPhoto(blob);
          const reader = new FileReader();
          reader.onloadend = () => {
            setPhotoDataUrl(reader.result);
          };
          reader.readAsDataURL(blob);
        }
      }, 'image/jpeg', 0.8);
    } catch (err) {
      setError('Gagal capture foto: ' + err.message);
    }
  }, []);

  const submitAttendance = async () => {
    if (!photo || !location) {
      setError('Foto dan GPS diperlukan');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const formData = new FormData();
      formData.append('foto', photo, 'selfie.jpg');
      formData.append('lat', location.lat);
      formData.append('lng', location.lng);
      formData.append('type', type);

      await axios.post('/attendance', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccess('Absensi berhasil disimpan!');
      setTimeout(() => {
        setSuccess('');
        setPhoto(null);
        setPhotoDataUrl(null);
      }, 5000);
    } catch (err) {
      setError('Gagal submit: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6">
        <div className="max-w-2xl mx-auto bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-green-100">
          <h1 className="text-3xl font-bold text-emerald-800 mb-2 text-center">Akses Terbatas Admin</h1>
          <p className="text-center text-emerald-600 mb-6">Admin hanya bisa melihat history absensi, tidak bisa upload</p>
          <div className="text-center">
            <a href="/history" className="inline-block px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
              Lihat History
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6">
      <div className="max-w-2xl mx-auto bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-green-100">
        <h1 className="text-3xl font-bold text-emerald-800 mb-2 text-center">📸 Absensi Geo-Selfie</h1>
        <p className="text-center text-emerald-600 mb-6">Ambil foto selfie untuk absensi</p>

        <div className="mb-6 p-4 bg-green-50 rounded-xl border border-green-200">
          <p className="text-emerald-900 font-semibold mb-1">Karyawan: <span className="text-emerald-700">{user.name}</span> (<span className="text-emerald-600">{user.nik}</span>)</p>
          {location && (
            <p className="text-emerald-700 text-sm">📍 Lokasi: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}</p>
          )}
          {gpsError && <p className="text-amber-600 text-sm mt-2">⚠️ {gpsError}</p>}
        </div>

        <div className="mb-6 bg-gradient-to-b from-green-100 to-emerald-100 p-4 rounded-xl border border-green-300">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full max-w-sm mx-auto rounded-xl shadow-lg block"
          />
          <button
            onClick={capturePhoto}
            className="mt-6 w-24 h-24 mx-auto bg-gradient-to-br from-emerald-400 to-green-500 hover:from-emerald-500 hover:to-green-600 rounded-full shadow-xl p-4 text-3xl font-bold transform hover:scale-110 transition-all duration-200 flex items-center justify-center cursor-pointer border-4 border-white"
          >
            📸
          </button>
          <p className="text-center text-emerald-700 text-sm mt-3 font-medium">Klik tombol untuk foto</p>
        </div>

        {photoDataUrl && (
          <div className="mb-6 bg-green-50 p-4 rounded-xl border border-green-200">
            <p className="text-emerald-700 font-semibold mb-3">Preview Foto:</p>
            <img src={photoDataUrl} alt="Selfie" className="w-48 h-64 object-cover rounded-xl shadow-lg mx-auto block border-4 border-white" />
          </div>
        )}

        <div className="mb-6">
          <label className="block text-emerald-900 font-semibold mb-2">Tipe Absen</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full p-3 rounded-xl bg-green-50 border-2 border-emerald-300 text-emerald-900 font-medium focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          >
            <option value="in">Masuk</option>
            <option value="out">Keluar</option>
          </select>
        </div>

        {error && <p className="text-amber-700 mb-4 text-sm bg-amber-100 p-4 rounded-xl border border-amber-300">{error}</p>}
        {success && (
          <div className="mb-6 bg-green-50 p-4 rounded-xl border border-emerald-200">
            <p className="text-emerald-700 font-semibold mb-3">{success}</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              Kembali ke Dashboard
            </button>
          </div>
        )}

        <button
          onClick={submitAttendance}
          disabled={loading || !photo || !location}
          className="w-full p-4 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          {loading ? 'Mengirim...' : 'Kirim Absensi'}
        </button>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default Attendance;
