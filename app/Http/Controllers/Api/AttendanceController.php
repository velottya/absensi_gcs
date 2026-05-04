<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use App\Models\Attendance;
use Illuminate\Support\Facades\Storage;

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

        return response()->json($attendances);
    }
}

