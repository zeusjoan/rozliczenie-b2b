# Instrukcje uruchomienia aplikacji Rozliczenie B2B w kontenerze Docker

## Wymagania wstępne

### 1. Instalacja Docker Desktop (WYMAGANE)

**UWAGA: Docker nie jest obecnie zainstalowany na tym systemie!**

#### Instalacja Docker Desktop na Windows:

1. **Pobierz Docker Desktop:**
   - Przejdź do: https://www.docker.com/products/docker-desktop
   - Kliknij "Download for Windows"
   - Pobierz plik `Docker Desktop Installer.exe`

2. **Zainstaluj Docker Desktop:**
   - Uruchom pobrany plik jako administrator
   - Postępuj zgodnie z instrukcjami instalatora
   - Podczas instalacji zaznacz opcję "Use WSL 2 instead of Hyper-V" (zalecane)
   - Po instalacji uruchom ponownie komputer

3. **Uruchom Docker Desktop:**
   - Znajdź Docker Desktop w menu Start i uruchom
   - Poczekaj aż Docker się uruchomi (ikona w systemie tray powinna być zielona)
   - Zaakceptuj warunki użytkowania jeśli pojawią się

4. **Sprawdź instalację:**
   - Otwórz PowerShell lub Command Prompt
   - Wpisz: `docker --version`
   - Powinieneś zobaczyć wersję Docker (np. "Docker version 24.0.6")

#### Wymagania systemowe:
- Windows 10 64-bit: Pro, Enterprise, lub Education (Build 16299 lub nowszy)
- Windows 11 64-bit: Home lub Pro version 21H2 lub nowszy
- Włączony Hyper-V i Containers Windows features
- BIOS-level hardware virtualization support musi być włączone

### 2. Git (opcjonalnie)
- Potrzebny tylko jeśli klonujesz repozytorium z Git

## Krok po kroku - Uruchomienie kontenera

### OPCJA A: Automatyczne uruchomienie (ZALECANE)

**Najłatwiejszy sposób - użyj gotowego skryptu:**

1. **Przejdź do katalogu z projektem:**
   ```bash
   cd "c:\Users\pkrolicki\Downloads\rozliczenie-b2b (3)"
   ```

2. **Uruchom skrypt automatyczny:**
   - Kliknij dwukrotnie na plik `build-and-run.bat`
   - LUB w PowerShell/CMD wpisz: `.\build-and-run.bat`

3. **Skrypt automatycznie:**
   - Sprawdzi czy Docker jest zainstalowany
   - Zbuduje obraz aplikacji
   - Uruchomi kontener
   - Otworzy aplikację w przeglądarce

**To wszystko! Aplikacja powinna być dostępna pod adresem http://localhost:8080**

---

### OPCJA B: Ręczne uruchomienie (dla zaawansowanych)

#### Krok 1: Przygotowanie środowiska

Otwórz terminal/PowerShell i przejdź do katalogu z projektem:
```bash
cd "c:\Users\pkrolicki\Downloads\rozliczenie-b2b (3)"
```

#### Krok 2: Budowanie obrazu Docker

Zbuduj obraz Docker z aplikacją:
```bash
docker build -t rozliczenie-b2b .
```

**Co się dzieje:**
- Docker pobiera obraz Node.js 18 Alpine
- Instaluje zależności npm
- Buduje aplikację React (tworzy folder `dist`)
- Kopiuje zbudowaną aplikację do obrazu nginx
- Konfiguruje nginx do serwowania aplikacji

**Czas budowania:** 2-5 minut (w zależności od prędkości internetu)

#### Krok 3: Uruchomienie kontenera

Uruchom kontener z aplikacją:
```bash
docker run -d -p 8080:80 --name rozliczenie-b2b-app rozliczenie-b2b
```

**Parametry:**
- `-d` - uruchomienie w tle (detached mode)
- `-p 8080:80` - mapowanie portu 8080 hosta na port 80 kontenera
- `--name rozliczenie-b2b-app` - nazwa kontenera
- `rozliczenie-b2b` - nazwa obrazu

#### Krok 4: Sprawdzenie czy kontener działa

Sprawdź status kontenera:
```bash
docker ps
```

Powinieneś zobaczyć kontener o nazwie `rozliczenie-b2b-app` ze statusem "Up".

#### Krok 5: Dostęp do aplikacji

Otwórz przeglądarkę i przejdź do:
```
http://localhost:8080
```

Aplikacja powinna być dostępna i w pełni funkcjonalna.

## Przydatne komendy Docker

### Zatrzymanie kontenera
```bash
docker stop rozliczenie-b2b-app
```

### Uruchomienie zatrzymanego kontenera
```bash
docker start rozliczenie-b2b-app
```

### Usunięcie kontenera
```bash
docker rm rozliczenie-b2b-app
```

### Usunięcie obrazu
```bash
docker rmi rozliczenie-b2b
```

### Wyświetlenie logów kontenera
```bash
docker logs rozliczenie-b2b-app
```

### Wejście do wnętrza kontenera (debugging)
```bash
docker exec -it rozliczenie-b2b-app sh
```

## Rozwiązywanie problemów

### Problem: Port 8080 jest zajęty
Użyj innego portu:
```bash
docker run -d -p 3000:80 --name rozliczenie-b2b-app rozliczenie-b2b
```
Następnie otwórz: http://localhost:3000

### Problem: Błąd budowania
1. Sprawdź czy Docker Desktop jest uruchomiony
2. Sprawdź czy masz połączenie z internetem
3. Usuń cache Docker: `docker system prune -a`
4. Spróbuj ponownie zbudować obraz

### Problem: Aplikacja nie ładuje się
1. Sprawdź logi: `docker logs rozliczenie-b2b-app`
2. Sprawdź czy kontener działa: `docker ps`
3. Sprawdź czy port nie jest blokowany przez firewall

## Aktualizacja aplikacji

Po wprowadzeniu zmian w kodzie:

1. Zatrzymaj i usuń stary kontener:
```bash
docker stop rozliczenie-b2b-app
docker rm rozliczenie-b2b-app
```

2. Zbuduj nowy obraz:
```bash
docker build -t rozliczenie-b2b .
```

3. Uruchom nowy kontener:
```bash
docker run -d -p 8080:80 --name rozliczenie-b2b-app rozliczenie-b2b
```

## Informacje techniczne

- **Obraz bazowy:** nginx:alpine (~5MB)
- **Port wewnętrzny:** 80
- **Zalecany port zewnętrzny:** 8080
- **Ścieżka aplikacji w kontenerze:** `/usr/share/nginx/html`
- **Konfiguracja nginx:** `/etc/nginx/nginx.conf`

## Funkcjonalności aplikacji

Po uruchomieniu będziesz mieć dostęp do:
- **Dashboard** - statystyki i wykresy
- **Klienci** - zarządzanie danymi klientów
- **Zamówienia** - zarządzanie zamówieniami i pozycjami prac
- **Rozliczenia** - miesięczne rozliczenia godzin

Dane są przechowywane w localStorage przeglądarki.
