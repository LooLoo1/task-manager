@echo off
chcp 65001 >nul
title Task Manager - Start Script

echo ╔════════════════════════════════════════╗
echo ║       Task Manager - Start Script      ║
echo ╚════════════════════════════════════════╝
echo.

:: Check Docker
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker nie jest uruchomiony!
    echo Uruchom Docker Desktop i sprobuj ponownie.
    pause
    exit /b 1
)

echo [OK] Docker jest gotowy
echo.

:menu
echo Wybierz opcje:
echo 1) Uruchom aplikacje
echo 2) Uruchom z przebudowa
echo 3) Zatrzymaj aplikacje
echo 4) Zatrzymaj i usun dane
echo 5) Pokaz logi
echo 6) Wyjscie
echo.
set /p choice="Twoj wybor [1-6]: "

if "%choice%"=="1" goto start
if "%choice%"=="2" goto build
if "%choice%"=="3" goto stop
if "%choice%"=="4" goto clean
if "%choice%"=="5" goto logs
if "%choice%"=="6" goto end
goto menu

:start
echo.
echo Uruchamiam aplikacje...
docker compose up -d
echo.
echo [OK] Aplikacja uruchomiona!
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5001/api
echo.
pause
goto menu

:build
echo.
echo Przebudowuje i uruchamiam...
docker compose up --build -d
echo.
echo [OK] Aplikacja uruchomiona!
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5001/api
echo.
pause
goto menu

:stop
echo.
echo Zatrzymuje aplikacje...
docker compose down
echo [OK] Zatrzymano
echo.
pause
goto menu

:clean
echo.
echo Usuwam aplikacje i wszystkie dane...
docker compose down -v
echo [OK] Usunieto
echo.
pause
goto menu

:logs
echo.
echo Logi aplikacji (Ctrl+C aby wyjsc):
docker compose logs -f
goto menu

:end
echo Do widzenia!
exit /b 0
