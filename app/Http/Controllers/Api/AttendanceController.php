<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use App\Models\Attendance;
use App\Models\Leave;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class AttendanceController extends Controller
{
    /**
     * Get user profile
     */
    public function profile(): JsonResponse
    {
        return response()->json(Auth::user());
    }

    /**
     * Store attendance
     */
    public function store(Request $request): JsonResponse
    {
        // Check if user is admin - admins cannot submit attendance
        if (Auth::user()->role === 'admin') {
            return response()->json(['message' => 'Admin tidak dapat melakukan absensi'], 403);
        }

        $request->validate([
            'foto' => 'required|image|mimes:jpeg,png,jpg|max:2048',
            'lat' => 'required|numeric',
            'lng' => 'required|numeric',
            'type' => 'required|in:in,out',
        ]);

        $fotoPath = $request->file('foto')->store('attendances', 'public');

        Attendance::create([
            'user_id' => Auth::id(),
            'foto' => $fotoPath,
            'lat' => $request->lat,
            'lng' => $request->lng,
            'type' => $request->type,
        ]);

        return response()->json(['message' => 'Absensi berhasil disimpan']);
    }

    /**
     * Get attendance history
     */
    public function history(): JsonResponse
    {
        $user = Auth::user();

        if ($user->role === 'admin') {
            // Admin can see all attendances
            $attendances = Attendance::with('user')->orderBy('created_at', 'desc')->get();
        } else {
            // Regular users can only see their own attendances
            $attendances = Attendance::where('user_id', $user->id)->orderBy('created_at', 'desc')->get();
        }

        $attendances = $attendances->map(function ($attendance) {
            if ($attendance->foto) {
                $exists = Storage::disk('public')->exists($attendance->foto);
                $attendance->foto_exists = $exists;

                if ($exists) {
                    $attendance->foto_url = request()->getSchemeAndHttpHost() . '/storage/' . ltrim($attendance->foto, '/');
                }
            } else {
                $attendance->foto_exists = false;
            }

            return $attendance;
        });

        return response()->json($attendances);
    }

    /**
     * Dashboard statistics for admin
     */
    public function stats(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $today = date('Y-m-d');

        // hadir: distinct users who have an "in" attendance today
        $hadir = Attendance::whereDate('created_at', $today)
            ->where('type', 'in')
            ->distinct()
            ->count('user_id');

        // terlambat: leaves of type datang-terlambat covering today
        $terlambat = Leave::where('type', 'datang-terlambat')
            ->whereDate('start_date', '<=', $today)
            ->whereDate('end_date', '>=', $today)
            ->where('status', '!=', 'rejected')
            ->count();

        // sakit
        $sakit = Leave::where('type', 'sakit')
            ->whereDate('start_date', '<=', $today)
            ->whereDate('end_date', '>=', $today)
            ->where('status', '!=', 'rejected')
            ->count();

        // tidak masuk
        $tidak_masuk = Leave::where('type', 'tidak-masuk-kerja')
            ->whereDate('start_date', '<=', $today)
            ->whereDate('end_date', '>=', $today)
            ->where('status', '!=', 'rejected')
            ->count();

        // izin: other izin-like leave types covering today
        $izin = Leave::whereIn('type', ['pulang-lebih-awal', 'meninggalkan-pekerjaan', 'tidak-clocking-in', 'tidak-clocking-out'])
            ->whereDate('start_date', '<=', $today)
            ->whereDate('end_date', '>=', $today)
            ->where('status', '!=', 'rejected')
            ->count();

        return response()->json([
            'hadir' => $hadir,
            'terlambat' => $terlambat,
            'izin' => $izin,
            'sakit' => $sakit,
            'tidak_masuk' => $tidak_masuk,
        ]);
    }
}

