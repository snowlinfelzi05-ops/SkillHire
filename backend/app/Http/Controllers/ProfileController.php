<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        $user = $request->user();
        $profile = $user->profile ?? $user;

        if ($user->profile_photo) {
            $user->profile_photo_url = asset('storage/'.$user->profile_photo);
        }

        return response()->json(['profile' => $profile, 'user' => $user]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'headline' => 'nullable|string|max:255',
            'bio' => 'nullable|string|max:1000',
            'skills' => 'nullable|array',
            'skills.*' => 'string',
            'experience' => 'nullable|string|max:255',
            'portfolio_url' => 'nullable|url|max:255',
        ]);

        $user = $request->user();

        $data = $request->only([
            'headline',
            'bio',
            'skills',
            'experience',
            'portfolio_url',
        ]);

        if (array_key_exists('skills', $data) && $data['skills'] === null) {
            $data['skills'] = [];
        }

        $user->update($data);

        if ($user->profile) {
            $user->profile()->update($data);
        } else {
            $user->profile()->create($data);
        }

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user->fresh(),
        ]);
    }

    public function uploadPhoto(Request $request)
    {
        $request->validate([
            'profile_photo' => 'required|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        $user = $request->user();

        if ($user->profile_photo) {
            Storage::disk('public')->delete($user->profile_photo);
        }

        $path = $request->file('profile_photo')->store('profile-photos', 'public');

        $user->update([
            'profile_photo' => $path,
        ]);

        return response()->json([
            'message' => 'Profile photo updated successfully',
            'profile_photo' => $path,
            'profile_photo_url' => asset('storage/'.$path),
            'user' => $user->fresh(),
        ]);
    }

    public function deletePhoto(Request $request)
    {
        $user = $request->user();

        if ($user->profile_photo) {
            if (Storage::disk('public')->exists($user->profile_photo)) {
                Storage::disk('public')->delete($user->profile_photo);
            }
        }

        $user->update([
            'profile_photo' => null,
        ]);

        return response()->json([
            'message' => 'Profile photo deleted successfully',
            'user' => $user->fresh(),
        ]);
    }
}
