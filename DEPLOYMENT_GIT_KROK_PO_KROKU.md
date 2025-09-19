# 🚀 Deployment przez Git - Krok po kroku

## Przygotowanie - sprawdź czy masz:
- ✅ Dostęp SSH do serwera
- ✅ Docker zainstalowany na serwerze
- ✅ Projekt na GitHub: https://github.com/zeusjoan/rozliczenie-b2b.git
- ✅ Dane dostępowe do serwera

---

## 🔥 KROK 1: Połącz się z serwerem

Otwórz terminal/PowerShell i połącz się z serwerem:

```bash
# Zastąp swoimi danymi
ssh username@your-server-ip

# Przykład:
# ssh root@192.168.1.100
# ssh ubuntu@myserver.com
```

**Co robisz:** Łączysz się z serwerem docelowym przez SSH.

---

## 🔥 KROK 2: Sprawdź czy Docker działa

Na serwerze wykonaj:

```bash
# Sprawdź wersję Docker
docker --version

# Sprawdź status Docker
sudo systemctl status docker

# Jeśli Docker nie działa, uruchom go
sudo systemctl start docker
sudo systemctl enable docker
```

**Oczekiwany wynik:** Powinieneś zobaczyć wersję Docker (np. "Docker version 24.0.6")

---

## 🔥 KROK 3: Sklonuj projekt z GitHub

```bash
# Przejdź do katalogu domowego
cd ~

# Sklonuj repozytorium
git clone https://github.com/zeusjoan/rozliczenie-b2b.git

# Przejdź do katalogu projektu
cd rozliczenie-b2b

# Sprawdź czy pliki są na miejscu
ls -la
```

**Co powinieneś zobaczyć:**
```
Dockerfile
docker-compose.yml
package.json
index.html
components/
pages/
... (inne pliki projektu)
```

---

## 🔥 KROK 4: Zbuduj obraz Docker

```bash
# Zbuduj obraz (to może potrwać 2-5 minut)
docker build -t rozliczenie-b2b .
```

**Co się dzieje:**
- Docker pobiera Node.js 18 Alpine
- Instaluje zależności npm
- Buduje aplikację React
- Tworzy obraz z nginx

**Oczekiwany wynik:** Na końcu powinieneś zobaczyć:
```
Successfully built [hash]
Successfully tagged rozliczenie-b2b:latest
```

---

## 🔥 KROK 5: Uruchom kontener

```bash
# Uruchom aplikację na porcie 8080
docker run -d -p 8080:80 --restart=unless-stopped --name rozliczenie-b2b-app rozliczenie-b2b

# Sprawdź czy kontener działa
docker ps
```

**Oczekiwany wynik:**
```
CONTAINER ID   IMAGE             COMMAND                  CREATED         STATUS         PORTS                    NAMES
[hash]         rozliczenie-b2b   "/docker-entrypoint.…"   5 seconds ago   Up 3 seconds   0.0.0.0:8080->80/tcp     rozliczenie-b2b-app
```

---

## 🔥 KROK 6: Sprawdź czy aplikacja działa

```bash
# Test lokalny na serwerze
curl http://localhost:8080

# Sprawdź logi kontenera
docker logs rozliczenie-b2b-app
```

**Oczekiwany wynik curl:** Powinieneś zobaczyć HTML aplikacji React.

---

## 🔥 KROK 7: Otwórz port w firewall

### Ubuntu/Debian:
```bash
# Otwórz port 8080
sudo ufw allow 8080

# Sprawdź status firewall
sudo ufw status
```

### CentOS/RHEL:
```bash
# Otwórz port 8080
sudo firewall-cmd --permanent --add-port=8080/tcp
sudo firewall-cmd --reload

# Sprawdź status
sudo firewall-cmd --list-ports
```

---

## 🔥 KROK 8: Testuj z zewnątrz

Otwórz przeglądarkę i przejdź do:
```
http://YOUR-SERVER-IP:8080
```

**Przykład:**
- http://192.168.1.100:8080
- http://myserver.com:8080

**Co powinieneś zobaczyć:** Aplikację Rozliczenie B2B z Dashboard, Klientami, Zamówieniami i Rozliczeniami.

---

## 🎉 GOTOWE! Aplikacja działa!

### Przydatne komendy do zarządzania:

```bash
# Sprawdź status kontenera
docker ps

# Zatrzymaj aplikację
docker stop rozliczenie-b2b-app

# Uruchom ponownie
docker start rozliczenie-b2b-app

# Sprawdź logi
docker logs -f rozliczenie-b2b-app

# Usuń kontener (jeśli potrzeba)
docker rm rozliczenie-b2b-app

# Usuń obraz (jeśli potrzeba)
docker rmi rozliczenie-b2b
```

---

## 🔄 Aktualizacja aplikacji (gdy wprowadzisz zmiany)

```bash
# 1. Zatrzymaj i usuń stary kontener
docker stop rozliczenie-b2b-app
docker rm rozliczenie-b2b-app

# 2. Pobierz najnowsze zmiany z GitHub
git pull origin master

# 3. Zbuduj nowy obraz
docker build -t rozliczenie-b2b .

# 4. Uruchom nowy kontener
docker run -d -p 8080:80 --restart=unless-stopped --name rozliczenie-b2b-app rozliczenie-b2b
```

---

## 🚨 Rozwiązywanie problemów

### Problem: "Permission denied" przy Docker
```bash
# Dodaj użytkownika do grupy docker
sudo usermod -aG docker $USER

# Wyloguj się i zaloguj ponownie
exit
ssh username@your-server-ip
```

### Problem: Port 8080 zajęty
```bash
# Sprawdź co używa portu
sudo netstat -tulpn | grep 8080

# Użyj innego portu
docker run -d -p 3000:80 --restart=unless-stopped --name rozliczenie-b2b-app rozliczenie-b2b
```

### Problem: Brak dostępu z zewnątrz
```bash
# Sprawdź czy kontener nasłuchuje
docker port rozliczenie-b2b-app

# Sprawdź firewall
sudo ufw status
sudo iptables -L
```

### Problem: Aplikacja nie ładuje się
```bash
# Sprawdź logi kontenera
docker logs rozliczenie-b2b-app

# Sprawdź czy nginx działa w kontenerze
docker exec rozliczenie-b2b-app ps aux
```

---

## 📝 Checklist - sprawdź czy wszystko działa:

- [ ] Połączyłeś się z serwerem przez SSH
- [ ] Docker działa na serwerze
- [ ] Sklonowałeś projekt z GitHub
- [ ] Zbudowałeś obraz Docker
- [ ] Uruchomiłeś kontener
- [ ] Kontener ma status "Up"
- [ ] Otworzyłeś port 8080 w firewall
- [ ] Aplikacja odpowiada na http://SERVER-IP:8080
- [ ] Wszystkie sekcje aplikacji działają (Dashboard, Klienci, Zamówienia, Rozliczenia)

**🎯 Jeśli wszystko jest zaznaczone - GRATULACJE! Aplikacja działa na serwerze!**
