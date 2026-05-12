import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaMapMarkerAlt, FaSyncAlt } from 'react-icons/fa';

const Attendance = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [location, setLocation] = useState(null);
  const [placeName, setPlaceName] = useState('');
  const [photo, setPhoto] = useState(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState(null);
  const [photoDataUrl, setPhotoDataUrl] = useState(null);
  const [photoWithOverlayDataUrl, setPhotoWithOverlayDataUrl] = useState(null);
  const [cameraFacing, setCameraFacing] = useState('user');
  const [type, setType] = useState(() => {
    try {
      const settings = JSON.parse(localStorage.getItem('absensi.settings') || '{}');
      return settings.defaultAttendance === 'out' ? 'out' : 'in';
    } catch {
      return 'in';
    }
  });

  const [loading, setLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Check if user is admin
  const isAdmin = user?.role === 'admin';

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
    // Get GPS
    if (navigator.geolocation) {
      setGpsError('');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
        },
        () => {
          setGpsError('GPS tidak tersedia atau dimatikan');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setGpsError('Browser tidak support GPS');
    }


    // Cleanup camera - handled below


    // Camera - only for non-admin users
    if (!isAdmin) {
      const startCamera = async () => {
        try {
          stopCamera();
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: cameraFacing, width: 640, height: 480 }
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
              videoRef.current.play();
            };
          }
        } catch (err) {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
              videoRef.current.onloadedmetadata = () => {
                videoRef.current.play();
              };
            }
          } catch (fallbackErr) {
            setError('Kamera tidak tersedia atau izin ditolak: ' + fallbackErr.message);
          }
        }
      };
      startCamera();
    }

    return () => {
      stopCamera();
    };
  }, [cameraFacing, isAdmin, stopCamera]);

  const switchCamera = () => {
    setCameraFacing((current) => (current === 'user' ? 'environment' : 'user'));
    setPhoto(null);
    setPhotoPreviewUrl(null);
    setPhotoDataUrl(null);
    setPhotoWithOverlayDataUrl(null);
    setError('');
  };

  useEffect(() => {
    return () => {
      if (photoPreviewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(photoPreviewUrl);
      }
    };
  }, [photoPreviewUrl]);

  useEffect(() => {
    const resolvePlace = async () => {
      if (!location) return;

      try {
        // Reverse geocode using OpenStreetMap Nominatim
        // Note: This is client-side and may be limited by Nominatim usage policy.
        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
          location.lat
        )}&lon=${encodeURIComponent(location.lng)}&zoom=18&addressdetails=1`;

        const res = await fetch(url, {
          headers: {
            // Nominatim polite usage header (best effort)
            'Accept-Language': 'id,en;q=0.9'
          }
        });

        if (!res.ok) throw new Error('Reverse geocode failed');
        const data = await res.json();

        const name = data?.name || data?.display_name || '';
        setPlaceName(name);
      } catch (e) {
        // Don't block UI if reverse geocode fails
        setPlaceName('');
      }
    };

    resolvePlace();
  }, [location]);

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

      canvas.toBlob(
        (blob) => {
          if (!blob) return;
          setPhoto(blob);
          setPhotoWithOverlayDataUrl(null);

          const objectUrl = URL.createObjectURL(blob);
          setPhotoPreviewUrl((prev) => {
            if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);
            return objectUrl;
          });

          const reader = new FileReader();
          reader.onloadend = () => {
            // 1) preview asli
            const photoUrl = reader.result;
            setPhotoDataUrl(photoUrl);

            // 2) preview dengan overlay lat/lng + nama tempat
            const img = new Image();
            img.onload = () => {
              try {
                const overlayCanvas = document.createElement('canvas');
                overlayCanvas.width = img.width;
                overlayCanvas.height = img.height;
                const octx = overlayCanvas.getContext('2d');

                // gambar asli
                octx.drawImage(img, 0, 0);

                // overlay ala photomaps: band penuh selebar foto
                const padding = Math.max(16, Math.round(overlayCanvas.width * 0.03));
                const cardW = overlayCanvas.width - padding * 2;
                const cardH = Math.max(120, Math.round(overlayCanvas.height * 0.24));
                const x = padding;
                const y = overlayCanvas.height - cardH - padding;
                const radius = 20;

                const lat = location?.lat?.toFixed?.(6) ?? '';
                const lng = location?.lng?.toFixed?.(6) ?? '';
                const place = placeName || 'Lokasi belum terbaca';
                const now = new Date();
                const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

                const drawRoundedRect = (ctx, rx, ry, rw, rh, rr) => {
                  ctx.beginPath();
                  ctx.moveTo(rx + rr, ry);
                  ctx.arcTo(rx + rw, ry, rx + rw, ry + rh, rr);
                  ctx.arcTo(rx + rw, ry + rh, rx, ry + rh, rr);
                  ctx.arcTo(rx, ry + rh, rx, ry, rr);
                  ctx.arcTo(rx, ry, rx + rw, ry, rr);
                  ctx.closePath();
                };

                const drawChip = (ctx, chipX, chipY, chipW, chipH, label, value, fillColor, fontSize = '12px') => {
                  ctx.save();
                  ctx.fillStyle = fillColor;
                  ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
                  ctx.lineWidth = 1;
                  drawRoundedRect(ctx, chipX, chipY, chipW, chipH, 12);
                  ctx.fill();
                  ctx.stroke();
                  ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
                  ctx.font = `600 9px system-ui, -apple-system, Segoe UI, Roboto, Arial`;
                  ctx.fillText(label, chipX + 12, chipY + 14);
                  ctx.fillStyle = 'white';
                  ctx.font = `700 ${fontSize} system-ui, -apple-system, Segoe UI, Roboto, Arial`;
                  ctx.fillText(value, chipX + 12, chipY + 32);
                  ctx.restore();
                };

                // location card background
                octx.save();
                octx.fillStyle = 'rgba(2, 6, 23, 0.88)';
                octx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
                octx.lineWidth = 2;
                drawRoundedRect(octx, x, y, cardW, cardH, radius);
                octx.fill();
                octx.stroke();

                // accent bar
                octx.fillStyle = 'rgba(7, 155, 76, 0.95)';
                drawRoundedRect(octx, x, y, 10, cardH, radius);
                octx.fill();

                // pin
                const pinX = x + 30;
                const pinY = y + 30;
                octx.fillStyle = 'rgba(7, 155, 76, 0.95)';
                octx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
                octx.lineWidth = 2;
                octx.beginPath();
                octx.arc(pinX, pinY, 12, 0, Math.PI * 2);
                octx.fill();
                octx.stroke();

                octx.fillStyle = 'white';
                octx.font = '700 12px system-ui, -apple-system, Segoe UI, Roboto, Arial';
                octx.fillText('Lokasi Terkini', x + 56, y + 24);
                octx.fillStyle = 'rgba(255, 255, 255, 0.95)';
                octx.font = '700 18px system-ui, -apple-system, Segoe UI, Roboto, Arial';

                const maxTitleWidth = cardW - 120;
                const title = place.length > 70 ? place.slice(0, 70) + '…' : place;
                const titleLines = [];
                let line = '';
                title.split(' ').forEach((word) => {
                  const nextLine = line ? `${line} ${word}` : word;
                  if (octx.measureText(nextLine).width > maxTitleWidth && line) {
                    titleLines.push(line);
                    line = word;
                  } else {
                    line = nextLine;
                  }
                });
                if (line) titleLines.push(line);

                titleLines.slice(0, 2).forEach((text, index) => {
                  octx.fillText(text, x + 56, y + 48 + index * 22);
                });

                const chipTop = y + cardH - 48;
                const chipGap = 10;
                const chipW = (cardW - 56 - chipGap * 2) / 3;
                const chipX1 = x + 28;
                const chipX2 = chipX1 + chipW + chipGap;
                const chipX3 = chipX2 + chipW + chipGap;
                drawChip(octx, chipX1, chipTop, chipW, 38, 'Latitude', lat, 'rgba(15, 23, 42, 0.88)', '12px');
                drawChip(octx, chipX2, chipTop, chipW, 38, 'Longitude', lng, 'rgba(15, 23, 42, 0.88)', '12px');
                drawChip(octx, chipX3, chipTop, chipW, 38, 'Waktu', timeStr, 'rgba(15, 23, 42, 0.88)', '11px');
                octx.restore();

                const overlayUrl = overlayCanvas.toDataURL('image/jpeg', 0.85);
                setPhotoWithOverlayDataUrl(overlayUrl);
                setPhotoPreviewUrl(overlayUrl);
              } catch (e) {
                // kalau overlay gagal, fallback ke photoDataUrl
                setPhotoWithOverlayDataUrl(photoUrl);
                setPhotoPreviewUrl(photoUrl);
              }
            };

            img.src = photoUrl;
          };

          reader.readAsDataURL(blob);
        },
        'image/jpeg',
        0.8
      );
    } catch (err) {

      setError('Gagal capture foto: ' + err.message);
    }
  }, [location, placeName]);

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
        setPhotoPreviewUrl(null);
        setPhotoDataUrl(null);
        setPhotoWithOverlayDataUrl(null);
      }, 5000);

    } catch (err) {
      setError('Gagal submit: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (isAdmin) {
    return (
      <div className="min-h-screen px-3 sm:px-4 py-6" style={{ background: '#f2fbf6' }}>

        <button
          onClick={() => navigate('/dashboard')}
          aria-label="Kembali ke Dashboard"
          className="absolute top-4 left-4 z-50 bg-white/90 hover:bg-white px-3 py-2 rounded-full shadow-md border border-gray-200 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{ color: '#05773a' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
            <div className="w-full max-w-4xl mx-auto bg-white/95 backdrop-blur-lg rounded-lg p-5 sm:p-6 md:p-8 shadow-md" style={{ border: '1px solid rgba(7,155,76,0.20)' }}>
          <h1 className="text-3xl font-extrabold text-[#173224] mb-2 text-center">Akses Terbatas Admin</h1>
          <p className="text-center" style={{ color: 'rgba(0,0,0,0.65)' }}>Admin hanya bisa melihat history absensi, tidak bisa upload</p>
          <div className="text-center">
            <a href="/history" className="inline-block px-6 py-3 font-extrabold rounded-lg shadow-sm transition-transform" style={{ background: '#fce4bd', color: '#05773a' }}>
              Lihat History
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] px-3 sm:px-4 py-6" style={{ background: '#f2fbf6' }}>

      <button
        onClick={() => navigate('/dashboard')}
        aria-label="Kembali ke Dashboard"
        className="absolute top-4 left-4 z-50 bg-white/90 hover:bg-white px-3 py-2 rounded-full shadow-md border border-gray-200 flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{ color: '#05773a' }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <div className="w-full max-w-4xl mx-auto bg-white/95 backdrop-blur-lg rounded-lg p-5 sm:p-6 md:p-8 shadow-md" style={{ border: '1px solid rgba(7,155,76,0.20)' }}>
        <h1 className="text-3xl font-extrabold text-[#173224] mb-2 text-center">
          Absensi Karyawan
        </h1>
        <p className="text-center text-sm sm:text-base" style={{ color: 'rgba(0,0,0,0.65)' }}>
        </p>

        <div className="mb-5 p-4 rounded-lg" style={{ background: 'rgba(7,155,76,0.10)', border: '1px solid rgba(7,155,76,0.24)' }}>
          <p className="font-extrabold" style={{ color: '#173224' }}>
            Karyawan: <span style={{ color: 'rgba(0,0,0,0.65)' }}>{user.name}</span>
            <span style={{ marginLeft: 8, fontWeight: 900, color: 'rgba(0,0,0,0.55)' }}>({user.nik})</span>
          </p>

          <div className="mt-3 flex items-start gap-3">
            <FaMapMarkerAlt aria-hidden="true" style={{ marginTop: 2, color: '#079b4c' }} />
            <div>
              <div className="text-sm font-extrabold" style={{ color: '#173224' }}>
                Lokasi saat ini:
              </div>
              <div className="text-sm font-semibold" style={{ color: 'rgba(0,0,0,0.65)' }}>
                {gpsError
                  ? gpsError
                  : !location
                    ? 'Mengambil koordinat...'
                    : `(${location.lat.toFixed(6)}, ${location.lng.toFixed(6)})`}
              </div>
              <div className="text-xs mt-1" style={{ color: 'rgba(0,0,0,0.45)' }}>
                {placeName ? `Tempat: ${placeName}` : ''}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-5 rounded-lg" style={{ background: 'rgba(246,174,69,0.10)', border: '1px solid rgba(7,155,76,0.20)' }}>
          <div className="p-3 sm:p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-extrabold" style={{ color: '#173224' }}>
                {cameraFacing === 'environment' ? 'Kamera belakang' : 'Kamera depan'}
              </p>
              <button
                type="button"
                onClick={switchCamera}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-extrabold shadow-sm"
                style={{ background: '#ffffff', color: '#079b4c', border: '1px solid rgba(7,155,76,0.32)' }}
              >
                <FaSyncAlt size={13} />
                Switch
              </button>
            </div>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full rounded-lg shadow-sm block aspect-video object-cover"
              style={{ background: '#05773a' }}
            />

            <div className="mt-4 flex items-center justify-center">
              <button
                onClick={capturePhoto}
                className="w-24 h-24 rounded-lg shadow-sm transform transition-transform duration-200 flex items-center justify-center cursor-pointer"
                style={{ background: '#fce4bd', border: '1px solid rgba(7,155,76,0.32)', color: '#05773a' }}
                aria-label="Ambil Foto"
              >
                <img src="/kamera.png" alt="" className="h-12 w-12 object-contain" />
              </button>
            </div>
            <p className="text-center text-sm mt-2 font-semibold" style={{ color: 'rgba(0,0,0,0.60)' }}>
              Klik untuk ambil foto
            </p>
          </div>
        </div>

        <div className="mb-5 rounded-lg p-3 sm:p-4" style={{ background: 'rgba(7,155,76,0.10)', border: '1px solid rgba(7,155,76,0.14)' }}>

          <div className="flex items-center justify-between gap-3 mb-3">
            <p className="text-sm font-extrabold" style={{ color: '#173224' }}>
              Preview Foto
            </p>

            {(photoDataUrl || photoWithOverlayDataUrl) ? (
              <span
                className="text-xs sm:text-sm font-bold px-3 py-1 rounded-full"
                style={{ background: 'rgba(7,155,76,0.20)', border: '1px solid rgba(7,155,76,0.32)', color: '#05773a' }}
              >
                Foto sudah diambil
              </span>
            ) : (
              <span className="text-xs" style={{ color: 'rgba(0,0,0,0.45)' }}>
                Belum ada foto
              </span>
            )}

          </div>


          {photoPreviewUrl || photoDataUrl || photoWithOverlayDataUrl ? (
            <div className="w-full overflow-hidden rounded-lg border-4 border-white bg-white shadow-sm">
              <img
                src={photoWithOverlayDataUrl || photoPreviewUrl || photoDataUrl}
                alt="Selfie"
                className="w-full h-auto max-h-[65vh] object-contain bg-white"
              />
            </div>
          ) : (
            <div className="w-full min-h-40 sm:min-h-52 rounded-lg border-2 border-dashed border-[#d5f8e4] bg-white/70 flex items-center justify-center text-center px-6">
              <p className="font-medium" style={{ color: '#05773a' }}>Hasil selfie akan muncul di sini setelah tombol kamera ditekan.</p>
            </div>
          )}
        </div>


        <div className="mb-6">
          <label className="block text-sm font-extrabold mb-2" style={{ color: '#173224' }}>Tipe Absen</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full p-3 rounded-lg"
            style={{ background: '#f2fbf6', border: '1px solid rgba(0,0,0,0.08)', color: '#173224' }}
          >
            <option value="in">Check In (Absen Masuk)</option>
            <option value="out">Check Out (Absen Keluar)</option>
          </select>
        </div>


        {error && (
          <p
            className="mb-4 text-sm font-semibold rounded-lg px-4 py-3"
            style={{
              background: 'rgba(246,174,69,0.18)',
              border: '1px solid rgba(246,174,69,0.35)',
              color: '#773e1b'
            }}
          >
            {error}
          </p>
        )}

        {success && (
          <div
            className="mb-6 rounded-lg px-4 py-4"
            style={{ background: 'rgba(7,155,76,0.10)', border: '1px solid rgba(7,155,76,0.20)' }}
          >
            <p className="font-extrabold" style={{ color: '#173224' }}>{success}</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-3 w-full py-3 rounded-lg font-extrabold transition-transform"
              style={{ background: '#d5f8e4', color: '#05773a' }}
            >
              Kembali ke Dashboard
            </button>
          </div>
        )}

        <button
          onClick={submitAttendance}
          disabled={loading || !photo || !location}
          className="w-full py-4 rounded-lg font-extrabold text-lg transition-transform"
          style={{
            background: loading || !photo || !location ? 'rgba(7,155,76,0.35)' : '#079b4c',
            color: '#ffffff',
            boxShadow: 'none'
          }}
        >
          {loading ? 'Mengirim...' : type === 'in' ? 'Check In' : 'Check Out'}
        </button>

      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default Attendance;
