<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Admin user
        User::create([
            'name' => 'Admin',
            'nik' => 'admin123',
            'email' => 'admin@example.com',
            'password' => Hash::make('adminpass123'),
            'role' => 'admin',
        ]);

        // Regular user
        User::create([
            'name' => 'User Biasa',
            'nik' => 'user456',
            'email' => 'user@example.com',
            'password' => Hash::make('userpass123'),
            'role' => 'user',
        ]);
    }
}

