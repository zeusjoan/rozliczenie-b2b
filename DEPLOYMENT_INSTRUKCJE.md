# Deployment aplikacji Rozliczenie B2B na innym serwerze

## Opcje deployment na serwer z Docker

### 🚀 Opcja A: Przez Docker Hub (ZALECANE)

#### Krok 1: Wyślij obraz na Docker Hub
Na lokalnej maszynie:
```bash
# Zaloguj się do Docker Hub
docker login

# Oznacz obraz swoją nazwą użytkownika
docker tag rozliczenie-b2b YOUR_USERNAME/rozliczenie-b2b:latest

# Wyślij na Docker Hub
docker push YOUR_USERNAME/rozliczenie-b2b:latest
```

#### Krok 2: Uruchom na serwerze
Na serwerze docelowym:
```bash
# Pobierz i uruchom obraz
docker run -d -p 8080:80 --name rozliczenie-b2b-app YOUR_USERNAME/rozliczenie-b2b:latest

# Sprawdź status
docker ps
```

**Dostęp:** http://IP_SERWERA:8080

---

### 📦 Opcja B: Eksport/Import obrazu Docker

#### Krok 1: Eksportuj obraz na lokalnej maszynie
```bash
# Zapisz obraz do pliku tar
docker save rozliczenie-b2b:latest > rozliczenie-b2b.tar

# Skompresuj dla szybszego transferu
gzip rozliczenie-b2b.tar
```

#### Krok 2: Przenieś na serwer
```bash
# Skopiuj plik na serwer (przykład z scp)
scp rozliczenie-b2b.tar.gz user@server_ip:/home/user/

# Lub użyj FTP, rsync, itp.
```

#### Krok 3: Załaduj i uruchom na serwerze
```bash
# Zaloguj się na serwer
ssh user@server_ip

# Rozpakuj i załaduj obraz
gunzip rozliczenie-b2b.tar.gz
docker load < rozliczenie-b2b.tar

# Uruchom kontener
docker run -d -p 8080:80 --name rozliczenie-b2b-app rozliczenie-b2b:latest
```

---

### 🔧 Opcja C: Zbuduj na serwerze (z Git)

#### Krok 1: Sklonuj repozytorium na serwerze
```bash
# Zaloguj się na serwer
ssh user@server_ip

# Sklonuj projekt
git clone https://github.com/zeusjoan/rozliczenie-b2b.git
cd rozliczenie-b2b
```

#### Krok 2: Zbuduj i uruchom
```bash
# Zbuduj obraz
docker build -t rozliczenie-b2b .

# Uruchom kontener
docker run -d -p 8080:80 --name rozliczenie-b2b-app rozliczenie-b2b
```

---

### 🌐 Opcja D: Docker Compose (dla produkcji)

#### Krok 1: Utwórz docker-compose.yml
```yaml
version: '3.8'

services:
  rozliczenie-b2b:
    image: YOUR_USERNAME/rozliczenie-b2b:latest
    # lub build: . jeśli budujesz lokalnie
    container_name: rozliczenie-b2b-app
    ports:
      - "8080:80"
    restart: unless-stopped
    environment:
      - NODE_ENV=production
    
  # Opcjonalnie: nginx jako reverse proxy
  nginx:
    image: nginx:alpine
    container_name: nginx-proxy
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - rozliczenie-b2b
    restart: unless-stopped
```

#### Krok 2: Uruchom z Docker Compose
```bash
# Uruchom wszystkie serwisy
docker-compose up -d

# Sprawdź status
docker-compose ps

# Zatrzymaj
docker-compose down
```

---

## 🔒 Konfiguracja produkcyjna

### Firewall i bezpieczeństwo
```bash
# Ubuntu/Debian - otwórz port 8080
sudo ufw allow 8080

# CentOS/RHEL - otwórz port 8080
sudo firewall-cmd --permanent --add-port=8080/tcp
sudo firewall-cmd --reload
```

### SSL/HTTPS z Let's Encrypt
```bash
# Zainstaluj certbot
sudo apt install certbot

# Uzyskaj certyfikat
sudo certbot certonly --standalone -d yourdomain.com

# Skonfiguruj nginx z SSL
```

### Automatyczne uruchamianie
```bash
# Ustaw restart policy
docker update --restart=unless-stopped rozliczenie-b2b-app

# Lub przy tworzeniu kontenera
docker run -d -p 8080:80 --restart=unless-stopped --name rozliczenie-b2b-app rozliczenie-b2b
```

---

## 📋 Checklist deployment

### Przed deployment:
- [ ] Serwer ma zainstalowany Docker
- [ ] Porty 8080 (lub inne) są otwarte w firewall
- [ ] Masz dostęp SSH do serwera
- [ ] (Opcjonalnie) Konto na Docker Hub

### Po deployment:
- [ ] Kontener działa: `docker ps`
- [ ] Aplikacja odpowiada: `curl http://localhost:8080`
- [ ] Logi są OK: `docker logs rozliczenie-b2b-app`
- [ ] Firewall przepuszcza ruch na porcie 8080

---

## 🚨 Rozwiązywanie problemów

### Kontener nie startuje
```bash
# Sprawdź logi
docker logs rozliczenie-b2b-app

# Sprawdź czy port jest zajęty
netstat -tulpn | grep 8080

# Uruchom na innym porcie
docker run -d -p 3000:80 --name rozliczenie-b2b-app rozliczenie-b2b
```

### Brak dostępu z zewnątrz
```bash
# Sprawdź czy kontener nasłuchuje na wszystkich interfejsach
docker port rozliczenie-b2b-app

# Sprawdź firewall
sudo ufw status
sudo iptables -L
```

### Aktualizacja aplikacji
```bash
# Zatrzymaj stary kontener
docker stop rozliczenie-b2b-app
docker rm rozliczenie-b2b-app

# Pobierz nową wersję
docker pull YOUR_USERNAME/rozliczenie-b2b:latest

# Uruchom nowy kontener
docker run -d -p 8080:80 --name rozliczenie-b2b-app YOUR_USERNAME/rozliczenie-b2b:latest
```

---

## 💡 Wskazówki

1. **Użyj Docker Hub** - najłatwiejszy sposób na deployment
2. **Ustaw restart policy** - kontener uruchomi się automatycznie po restarcie serwera
3. **Monitoruj logi** - `docker logs -f rozliczenie-b2b-app`
4. **Backup danych** - jeśli dodasz bazę danych, rób regularne backupy
5. **Użyj reverse proxy** - nginx dla SSL i load balancing

**Rekomendacja:** Zacznij od Opcji A (Docker Hub) - to najszybszy i najniezawodniejszy sposób!
