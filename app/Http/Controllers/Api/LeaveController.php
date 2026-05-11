<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Leave;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class LeaveController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Leave::with('user')->orderBy('created_at', 'desc');

        if ($user->role !== 'admin') {
            $query->where('user_id', $user->id);
        }

        $leaves = $query->get()->map(function ($item) {
            if ($item->evidence_path) {
                $item->evidence_url = request()->getSchemeAndHttpHost().Storage::url($item->evidence_path);
            }

            return $item;
        });

        return response()->json($leaves);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'type' => 'required|in:datang-terlambat,sakit,tidak-masuk-kerja,pulang-lebih-awal,meninggalkan-pekerjaan,tidak-clocking-in,tidak-clocking-out',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'reason' => 'nullable|string',
            'evidence' => 'required_if:type,sakit|nullable|file|mimes:jpg,jpeg,png,pdf,doc,docx|max:10240',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        $evidencePath = null;
        if ($request->hasFile('evidence')) {
            $evidencePath = $request->file('evidence')->store('leaves', 'public');
        }

        $leave = Leave::create([
            'user_id' => $request->user()->id,
            'type' => $data['type'],
            'start_date' => $data['start_date'],
            'end_date' => $data['end_date'],
            'reason' => $data['reason'] ?? null,
            'evidence_path' => $evidencePath,
            'status' => 'pending',
        ]);

        if ($leave->evidence_path) {
            $leave->evidence_url = $request->getSchemeAndHttpHost().Storage::url($leave->evidence_path);
        }

        return response()->json($leave, 201);
    }
}
