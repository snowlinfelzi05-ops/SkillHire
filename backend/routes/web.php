<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/up', function () {
    return response()->json(['status' => 'ok']);
});

Route::get('/api/health', function () {
    return response()->json(['status' => 'ok']);
});
