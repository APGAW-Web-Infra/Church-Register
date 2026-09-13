<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title inertia>{{ config('app.name', 'APGA Worldwide') }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link rel="icon" href="{{asset('images/favicon.ico')}}" type="image/x-icon" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />
        <meta name="twitter:title" content="APGA Worldwide - Apostolic Power Glorious Assembly" />
        <meta name="twitter:description" content="APGA Worldwide is a faith-based Church dedicated to spiritual growth, fellowship, and making a difference in the world. Join us in growing God's kingdom together in faith." />
        <meta name="twitter:image" content="{{asset('images/logo.png')}}" />
        <meta name="twitter:card" content="summary" />

        <!-- Open Graph Meta Tags -->
        <meta property="og:title" content="APGA Worldwide - Apostolic Power Glorious Assembly" />
        <meta property="og:description" content="APGA Worldwide is a faith-based Church dedicated to spiritual growth, fellowship, and making a difference in the world. Join us in growing God's kingdom together in faith." />
        <meta property="og:image" content="{{asset('images/logo.png')}}" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://apgaworldwide.com.ng" />
        <meta property="og:image:alt" content="APGA Worldwide - Church Management Platform" />
        <meta property="og:image:width" content="400">
        <meta property="og:image:height" content="400">

        <!-- CSRF Token -->
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/Pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
