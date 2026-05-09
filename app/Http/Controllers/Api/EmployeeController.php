<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class EmployeeController extends Controller
{
    /**
     * Get all employees
     */
    public function index(Request $request)
    {
        // Check if user is admin
        if ($request->user()->role !== 'admin') {
            return response()->json([
                'message' => 'Unauthorized. Only admins can view employees.',
            ], 403);
        }

        // Get all users except the current user, or all employees
        $employees = User::select('id', 'name', 'nik', 'email', 'role')
            ->where('role', '!=', 'admin')
            ->orWhere(function($query) {
                $query->where('role', 'admin');
            })
            ->get();

        return response()->json([
            'data' => $employees,
        ]);
    }

    /**
     * Get a single employee
     */
    public function show(Request $request, $id)
    {
        // Check if user is admin
        if ($request->user()->role !== 'admin') {
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        }

        $employee = User::select('id', 'name', 'nik', 'email', 'role')
            ->findOrFail($id);

        return response()->json([
            'data' => $employee,
        ]);
    }
}
