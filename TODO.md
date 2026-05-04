# TODO: Aplikasi Absensi Mobile Development

## Backend Laravel API (Steps 1-7)
- [x] 1. Install Laravel Sanctum via composer
- [x] 2. Publish Sanctum config and run migrations for personal_access_tokens
- [x] 3. Create migration to add 'nik' to users table (unique)
- [x] 4. Update User model: add 'nik' to fillable, cast if needed
- [x] 5. Create Attendance model and migration (user_id, foto, lat, lng, type, created_at)
- [x] 6. Create AuthController and AttendanceController with methods (register, login, store, profile)
- [x] 7. Create routes/api.php with API routes v1 (protected with auth:sanctum)

## Frontend React Mobile App (Steps 8-15)
- [ ] 8. Create frontend/ directory and init Vite React TS app
- [ ] 9. Install dependencies: Tailwind, Axios, React Router
- [ ] 10. Implement Login/Register components with API calls
- [ ] 11. Implement Dashboard with Attendance button
- [ ] 12. Implement Camera component (front camera, live photo)
- [ ] 13. Implement GPS capture and confirmation screen
- [ ] 14. Implement photo compression and API submit
- [ ] 15. Add responsive mobile UI, auth context, error handling

## Final (Step 16)
- [ ] 16. Test full flow, update TODO.md with completion, run servers

Current: Starting Backend Step 1.
