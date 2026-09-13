<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Page Not Found | 404 Error</title>

        <!-- Styles -->
        <style>
            html, body {
                background-color: #ffffff;
                color: #000000;
                font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
                font-weight: 400;
                height: 100vh;
                margin: 0;
            }

            .full-height {
                height: 100vh;
            }

            .flex-center {
                align-items: center;
                display: flex;
                justify-content: center;
                flex-direction: column;
            }

            .position-ref {
                position: relative;
            }

            .content {
                text-align: center;
                padding: 2rem;
                max-width: 600px;
            }

            .logo {
                width: 150px;
                margin-bottom: 2rem;
            }

            .title {
                font-size: 2.5rem;
                font-weight: 700;
                margin-bottom: 1rem;
                color: #000000;
            }

            .subtitle {
                font-size: 1.25rem;
                margin-bottom: 2rem;
                color: #000000;
                line-height: 1.5;
            }

            .home-button {
                display: inline-block;
                padding: 0.75rem 1.5rem;
                background-color: #2563eb;
                color: #ffffff;
                text-decoration: none;
                border-radius: 45px;
                font-weight: 500;
                transition: background-color 0.2s;
            }

            .home-button:hover {
                background-color: #065f46;
            }

            .error-code {
                font-size: 6rem;
                font-weight: 700;
                color: #10b981;
                margin-bottom: -1.5rem;
                z-index: -1;
                position: relative;
            }

            @media (max-width: 640px) {
                .title {
                    font-size: 1.75rem;
                }
                .subtitle {
                    font-size: 1rem;
                }
                .error-code {
                    font-size: 4rem;
                }
            }
        </style>
    </head>
    <body>
        <div class="flex-center position-ref full-height">
            <div class="content">
                <!-- Replace with your logo -->
                {{-- <div className="w-fit">
                    <a href="/" className="flex gap-4 items-center">
                        <img src={{ asset('img/logo.png')}} alt="APGAWworldwide class="sm:w-fit h-[80px]"/>
                    </a>
                </div> --}}

                <div class="error-code">@yield('code')</div>
                <h1 class="title">Page Not Found</h1>
                <p class="subtitle">
                    The page you're looking for doesn't exist or has been moved.
                    Please return to the homepage and try again.
                </p>
                <a href="/" class="home-button ">Return to Homepage</a>
            </div>
        </div>
    </body>
</html>
