# 🚨 Rozwiązywanie problemu: Biała strona w przeglądarce

## Problem: Kontener działa, ale aplikacja pokazuje białą stronę

### 🔍 KROK 1: Sprawdź logi kontenera

Na serwerze wykonaj:
```bash
# Sprawdź logi aplikacji
docker logs rozliczenie-b2b-app

# Sprawdź logi na żywo
docker logs -f rozliczenie-b2b-app
```

**Szukaj błędów typu:**
- `404 Not Found`
- `Failed to load resource`
- `Cannot GET /`

---

### 🔍 KROK 2: Sprawdź czy pliki są w kontenerze

```bash
# Wejdź do kontenera
docker exec -it rozliczenie-b2b-app sh

# Sprawdź czy pliki aplikacji są na miejscu
ls -la /usr/share/nginx/html/

# Sprawdź zawartość index.html
cat /usr/share/nginx/html/index.html

# Wyjdź z kontenera
exit
```

**Co powinieneś zobaczyć:**
```
index.html
assets/
  index-[hash].js
  index-[hash].css
```

---

### 🔍 KROK 3: Sprawdź konfigurację nginx

```bash
# Sprawdź konfigurację nginx w kontenerze
docker exec rozliczenie-b2b-app cat /etc/nginx/nginx.conf
```

**Poprawna konfiguracja powinna zawierać:**
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

---

### 🛠️ ROZWIĄZANIE A: Popraw nginx.conf (najczęstszy problem)

Jeśli konfiguracja nginx jest niepoprawna, zaktualizuj plik `nginx.conf`:

```nginx
events {}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    server {
        listen 80;
        server_name _;
        
        root /usr/share/nginx/html;
        index index.html;

        # Obsługa SPA - przekieruj wszystko na index.html
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Obsługa plików statycznych
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

**Następnie przebuduj kontener:**
```bash
# Zatrzymaj stary kontener
docker stop rozliczenie-b2b-app
docker rm rozliczenie-b2b-app

# Pobierz najnowsze zmiany
git pull origin master

# Zbuduj nowy obraz
docker build -t rozliczenie-b2b .

# Uruchom nowy kontener
docker run -d -p 8080:80 --restart=unless-stopped --name rozliczenie-b2b-app rozliczenie-b2b
```

---

### 🛠️ ROZWIĄZANIE B: Sprawdź ścieżki w Vite

Problem może być z konfiguracją base path w Vite. Sprawdź `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/', // Upewnij się że to jest '/'
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
```

---

### 🛠️ ROZWIĄZANIE C: Test lokalny w kontenerze

```bash
# Test czy nginx odpowiada
docker exec rozliczenie-b2b-app curl http://localhost

# Test czy pliki statyczne są dostępne
docker exec rozliczenie-b2b-app ls -la /usr/share/nginx/html/assets/
```

---

### 🛠️ ROZWIĄZANIE D: Sprawdź w przeglądarce

1. **Otwórz Developer Tools** (F12)
2. **Sprawdź zakładkę Console** - szukaj błędów JavaScript
3. **Sprawdź zakładkę Network** - czy pliki CSS/JS się ładują
4. **Sprawdź zakładkę Sources** - czy pliki aplikacji są dostępne

**Typowe błędy:**
- `Failed to load resource: the server responded with a status of 404`
- `Uncaught SyntaxError: Unexpected token '<'`
- `Loading chunk failed`

---

### 🛠️ ROZWIĄZANIE E: Przebuduj z czystym cache

```bash
# Usuń wszystko
docker stop rozliczenie-b2b-app
docker rm rozliczenie-b2b-app
docker rmi rozliczenie-b2b

# Wyczyść cache Docker
docker system prune -f

# Zbuduj od nowa
docker build --no-cache -t rozliczenie-b2b .

# Uruchom kontener
docker run -d -p 8080:80 --restart=unless-stopped --name rozliczenie-b2b-app rozliczenie-b2b
```

---

### 🛠️ ROZWIĄZANIE F: Test z prostym HTML

Jeśli nic nie działa, przetestuj z prostym plikiem HTML:

```bash
# Utwórz prosty test
docker run -d -p 8081:80 --name test-nginx nginx:alpine

# Skopiuj prosty HTML
echo "<h1>Test działa!</h1>" | docker exec -i test-nginx tee /usr/share/nginx/html/index.html

# Testuj: http://SERVER-IP:8081
```

Jeśli prosty HTML działa, problem jest z aplikacją React.

---

## 🎯 Najczęstsze przyczyny białej strony:

1. **Błędna konfiguracja nginx** - brak `try_files $uri $uri/ /index.html;`
2. **Błędne ścieżki do plików** - problem z base path w Vite
3. **Błędy JavaScript** - sprawdź console w przeglądarce
4. **Brak plików w kontenerze** - problem z budowaniem
5. **Błędne MIME types** - nginx nie rozpoznaje plików JS/CSS

## 🚀 Szybka diagnoza:

```bash
# Wykonaj te komendy po kolei:
docker logs rozliczenie-b2b-app
docker exec rozliczenie-b2b-app ls -la /usr/share/nginx/html/
docker exec rozliczenie-b2b-app curl -I http://localhost
```

**Wyślij mi wyniki tych komend, a pomogę zdiagnozować problem!**
