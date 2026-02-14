<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->hasSession()) {
            $request->session()->put('locale', 'en');
        }

        $locale = 'en';

        app()->setLocale($locale);

        return $next($request);
    }
}
