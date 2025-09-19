# Instrukcje wysłania projektu na GitHub/GitLab

## Status aktualny:
✅ Repozytorium Git zostało zainicjalizowane  
✅ Wszystkie pliki zostały dodane i zatwierdzone (commit)  
✅ Projekt jest gotowy do wysłania na platformę Git  

## Opcja A: GitHub (zalecane)

### Krok 1: Utwórz repozytorium na GitHub
1. Przejdź na https://github.com
2. Zaloguj się do swojego konta
3. Kliknij przycisk **"New"** lub **"+"** → **"New repository"**
4. Wypełnij dane:
   - **Repository name:** `rozliczenie-b2b`
   - **Description:** `Aplikacja React do rozliczeń pracy B2B z obsługą Docker`
   - **Visibility:** Public lub Private (według preferencji)
   - **NIE zaznaczaj:** "Add a README file", "Add .gitignore", "Choose a license"
5. Kliknij **"Create repository"**

### Krok 2: Połącz lokalne repozytorium z GitHub
W terminalu wykonaj następujące komendy:

```bash
# Dodaj remote origin (zastąp YOUR_USERNAME swoją nazwą użytkownika GitHub)
git remote add origin https://github.com/YOUR_USERNAME/rozliczenie-b2b.git

# Wyślij kod na GitHub
git push -u origin master
```

**Przykład:**
```bash
git remote add origin https://github.com/pkrolicki/rozliczenie-b2b.git
git push -u origin master
```

### Krok 3: Weryfikacja
- Odśwież stronę repozytorium na GitHub
- Powinieneś zobaczyć wszystkie pliki projektu
- README.md będzie wyświetlany jako opis projektu

---

## Opcja B: GitLab

### Krok 1: Utwórz repozytorium na GitLab
1. Przejdź na https://gitlab.com
2. Zaloguj się do swojego konta
3. Kliknij **"New project"** → **"Create blank project"**
4. Wypełnij dane:
   - **Project name:** `rozliczenie-b2b`
   - **Project description:** `Aplikacja React do rozliczeń pracy B2B z obsługą Docker`
   - **Visibility Level:** Public, Internal lub Private
   - **NIE zaznaczaj:** "Initialize repository with a README"
5. Kliknij **"Create project"**

### Krok 2: Połącz lokalne repozytorium z GitLab
```bash
# Dodaj remote origin (zastąp YOUR_USERNAME swoją nazwą użytkownika GitLab)
git remote add origin https://gitlab.com/YOUR_USERNAME/rozliczenie-b2b.git

# Wyślij kod na GitLab
git push -u origin master
```

---

## Przydatne komendy Git na przyszłość:

### Sprawdzenie statusu
```bash
git status
```

### Dodanie nowych zmian
```bash
git add .
git commit -m "Opis zmian"
git push
```

### Sprawdzenie historii commitów
```bash
git log --oneline
```

### Sprawdzenie remote repositories
```bash
git remote -v
```

### Pobranie najnowszych zmian (jeśli pracujesz z zespołem)
```bash
git pull
```

---

## Rozwiązywanie problemów:

### Problem: "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/rozliczenie-b2b.git
```

### Problem: Błąd autoryzacji
- Sprawdź czy jesteś zalogowany na GitHub/GitLab
- Możesz potrzebować Personal Access Token zamiast hasła
- GitHub: Settings → Developer settings → Personal access tokens
- GitLab: User Settings → Access Tokens

### Problem: "failed to push some refs"
```bash
git pull origin master --allow-unrelated-histories
git push -u origin master
```

---

## Następne kroki po wysłaniu:

1. **Dodaj opis projektu** - edytuj README.md na platformie
2. **Ustaw GitHub Pages** (opcjonalnie) - dla hostingu aplikacji
3. **Dodaj collaborators** - jeśli pracujesz z zespołem
4. **Ustaw GitHub Actions/GitLab CI** - dla automatycznego deploymentu

---

## Informacje o projekcie:

**Commit hash:** bc5bf28  
**Branch:** master  
**Plików:** 45  
**Dodanych linii:** 5161  

Projekt zawiera kompletną aplikację React z konfiguracją Docker i dokumentacją.
