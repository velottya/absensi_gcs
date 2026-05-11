# Setup Koneksi HP ke Backend via Wi-Fi Kantor

## Prasyarat
- HP dan server/backend harus terhubung ke Wi-Fi kantor yang sama
- Backend Laravel harus berjalan dan bisa diakses dari HP

## Langkah-Langkah

### 1. Cari IP Address Komputer Server

**Windows (Command Prompt atau PowerShell):**
```
ipconfig
```

Cari line dengan `IPv4 Address` yang dimulai dengan 192.168.x.x atau 10.x.x.x (jangan gunakan 127.0.0.1 atau localhost).

Contoh:
```
IPv4 Address  . . . . . . . . . : 192.168.1.100
```

### 2. Pastikan Backend Laravel Berjalan

Jalankan server Laravel di terminal komputer:
```bash
php artisan serve
```

Biasanya akan menjalankan server di `http://localhost:8000`. Pastikan tidak ada error saat startup.

### 3. Buka Aplikasi di HP

1. Buka aplikasi absensi di HP (APK yang sudah diinstall)
2. Login dengan akun Anda

### 4. Masuk ke Settings

1. Buka menu Settings (ikon roda gigi atau menu navigasi)
2. Scroll ke bagian **Server API**
3. Di field **URL Backend**, masukkan:
   ```
   http://192.168.1.100:8000/api
   ```
   (Ganti `192.168.1.100` dengan IP address komputer Anda dari step 1)

4. Tekan tombol **Simpan Konfigurasi Server**

### 5. Test Koneksi

- Kembali ke halaman utama aplikasi
- Coba login ulang atau refresh halaman
- Jika berhasil, aplikasi akan terhubung ke backend lokal

## Troubleshooting

### "Tidak bisa terhubung ke server"
- **Periksa IP address**: Pastikan IP yang dimasukkan benar dengan `ipconfig`
- **Backend tidak berjalan**: Pastikan Laravel sudah dijalankan dengan `php artisan serve`
- **Firewall**: Matikan atau izinkan port 8000 di Windows Firewall
- **Wi-Fi yang berbeda**: Pastikan HP dan komputer pada Wi-Fi kantor yang sama, bukan guest network yang terpisah

### "Koneksi timeout"
- Coba tambah slash di akhir URL: `http://192.168.1.100:8000/api/`
- Periksa apakah komputer bisa akses ke HP (opsional: buka browser di HP dan ketik IP komputer)

### Ubah IP Backend
- Buka Settings lagi dan ubah URL di field **Server API**
- Tekan **Simpan Konfigurasi Server** untuk mengubah

## Catatan Teknis

- Konfigurasi IP Backend disimpan di **localStorage** HP
- Setiap kali diubah, aplikasi akan otomatis menggunakan URL yang baru
- APK debug dan release keduanya mendukung fitur ini
- Untuk production/deployment, ubah IP menjadi domain atau IP public yang permanent
