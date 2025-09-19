@echo off
echo ========================================
echo   Rozliczenie B2B - Docker Build Script
echo ========================================
echo.

REM Sprawdź czy Docker jest zainstalowany
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo BŁĄD: Docker nie jest zainstalowany!
    echo Proszę zainstalować Docker Desktop zgodnie z instrukcjami w DOCKER_INSTRUKCJE.md
    echo.
    pause
    exit /b 1
)

echo Docker jest zainstalowany. Kontynuuję...
echo.

REM Zatrzymaj i usuń istniejący kontener jeśli istnieje
echo Zatrzymywanie istniejącego kontenera...
docker stop rozliczenie-b2b-app >nul 2>&1
docker rm rozliczenie-b2b-app >nul 2>&1

REM Usuń stary obraz jeśli istnieje
echo Usuwanie starego obrazu...
docker rmi rozliczenie-b2b >nul 2>&1

echo.
echo ========================================
echo   Budowanie obrazu Docker...
echo ========================================
echo To może potrwać 2-5 minut...
echo.

REM Zbuduj nowy obraz
docker build -t rozliczenie-b2b .
if %errorlevel% neq 0 (
    echo.
    echo BŁĄD: Budowanie obrazu nie powiodło się!
    echo Sprawdź logi powyżej i spróbuj ponownie.
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Uruchamianie kontenera...
echo ========================================
echo.

REM Uruchom kontener
docker run -d -p 8080:80 --name rozliczenie-b2b-app rozliczenie-b2b
if %errorlevel% neq 0 (
    echo.
    echo BŁĄD: Uruchomienie kontenera nie powiodło się!
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   SUKCES!
echo ========================================
echo.
echo Aplikacja została uruchomiona pomyślnie!
echo.
echo Dostęp do aplikacji:
echo   http://localhost:8080
echo.
echo Przydatne komendy:
echo   docker ps                           - sprawdź status kontenera
echo   docker logs rozliczenie-b2b-app     - wyświetl logi
echo   docker stop rozliczenie-b2b-app     - zatrzymaj kontener
echo   docker start rozliczenie-b2b-app    - uruchom zatrzymany kontener
echo.
echo Naciśnij dowolny klawisz aby otworzyć aplikację w przeglądarce...
pause >nul

REM Otwórz aplikację w domyślnej przeglądarce
start http://localhost:8080

echo.
echo Aplikacja została otwarta w przeglądarce.
echo Naciśnij dowolny klawisz aby zakończyć...
pause >nul
