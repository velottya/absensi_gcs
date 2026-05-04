<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class FreshUserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Admin',
            'nik' => 'ADMIN001',
            'email' => 'admin@example.com',
            'password' => Hash::make('adminpass123'),
            'role' => 'admin',
        ]);

        User::create([
            'name' => 'User Biasa',
            'nik' => 'USER001',
            'email' => 'user@example.com',
            'password' => Hash::make('userpass123'),
            'role' => 'user',
        ]);
    }
}

