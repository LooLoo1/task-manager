# 📋 Task Manager - System zarządzania zadaniami

> 🔗 **Repozytorium:** https://github.com/LooLoo1/task-manager

## Informacje o projekcie

**Przedmiot:** Tworzenie aplikacji dla środowisk chmurowych

**Autor:**
| Imię i Nazwisko | Numer indeksu |
|-----------------|---------------|
| Vitaliy Petriv  | 53550         |

---

## 🚀 Uruchomienie projektu

### Wymagania
- Docker Desktop (https://www.docker.com/products/docker-desktop/)
- Git

### Szybki start (jedna komenda!)

```bash
docker compose up --build
```

Po uruchomieniu aplikacja będzie dostępna pod adresem:
- **Frontend (interfejs użytkownika):** http://localhost:3000
- **Backend API:** http://localhost:5001/api

### Zatrzymanie aplikacji

```bash
docker compose down
```

### Usunięcie wszystkich danych

```bash
docker compose down -v
```

---

## 📦 Funkcjonalności projektu (6+ operacji CRUD + Auth)

| # | Funkcjonalność | Opis | Operacje |
|---|----------------|------|----------|
| 1 | **Authentication (Autoryzacja)** | Rejestracja i logowanie użytkowników | Register, Login |
| 2 | **Workspaces (Przestrzenie robocze)** | Organizacja pracy w wielu zespołach | Dodaj, Edytuj, Usuń, Zapraszanie członków |
| 3 | **Projects (Projekty)** | Organizacja zadań w projekty | Dodaj, Edytuj, Usuń, Przeglądaj |
| 4 | **Tasks (Zadania)** | Zadania z priorytetami i statusami | Dodaj, Edytuj, Usuń, Przeglądaj |
| 5 | **Categories (Kategorie)** | Kolorowe kategorie dla zadań | Dodaj, Edytuj, Usuń, Przeglądaj |
| 6 | **Comments (Komentarze)** | Komentarze do zadań | Dodaj, Edytuj, Usuń, Przeglądaj |
| 7 | **Users (Użytkownicy)** | Przeglądanie użytkowników w systemie | Przeglądaj |

---

## 🔐 System autoryzacji

### Rejestracja i logowanie
- Aplikacja wymaga autoryzacji (JWT)
- Przy pierwszej wizycie należy utworzyć konto
- Automatycznie tworzy się domyślna przestrzeń robocza (Workspace)

### Workspaces (Przestrzenie robocze)
- Każdy użytkownik może tworzyć wiele workspaces
- Workspaces izolują dane (projekty, zadania, kategorie)
- Możliwość zapraszania innych użytkowników do workspace
- Role: OWNER (właściciel), ADMIN, MEMBER

---

## 🏗️ Architektura (3 kontenery)

```
┌────────────────────────────────────────────────────────────────┐
│                     Docker Compose Network                      │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐   │
│   │   FRONTEND   │────▶│   BACKEND    │────▶│   DATABASE   │   │
│   │    (Nginx)   │     │  (Node.js)   │     │ (PostgreSQL) │   │
│   │  Port: 3000  │     │  Port: 5001  │     │  Port: 5432  │   │
│   └──────────────┘     └──────────────┘     └──────────────┘   │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

**Kontenery:**
1. `frontend` - Aplikacja React + Nginx (serwer HTTP)
2. `backend` - API REST w Node.js + Express + JWT Auth
3. `database` - Baza danych PostgreSQL 15

---

## 🛠️ Stos technologiczny

| Warstwa | Technologie |
|---------|-------------|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Radix UI, TanStack Query |
| **Backend** | Node.js 20, Express.js, TypeScript, Prisma ORM, Zod, JWT, bcrypt |
| **Database** | PostgreSQL 15 |
| **DevOps** | Docker, Docker Compose, Nginx |

---

## 📱 Jak korzystać z aplikacji

### 1. Zarejestruj się
- Przy pierwszej wizycie kliknij "Sign up"
- Wprowadź imię, email i hasło (min. 6 znaków)
- Automatycznie zostanie utworzony domyślny workspace

### 2. Utwórz projekt
- Przejdź do zakładki "Projects"
- Kliknij "New Project"
- Wprowadź nazwę i opis

### 3. Utwórz kategorię (opcjonalnie)
- Przejdź do zakładki "Categories"
- Kliknij "New Category"
- Wybierz nazwę i kolor

### 4. Utwórz zadanie
- Przejdź do zakładki "Tasks"
- Kliknij "New Task"
- Wypełnij formularz (tytuł, opis, priorytet, status)

### 5. Dodaj komentarz
- Kliknij na zadanie aby otworzyć szczegóły
- Dodaj komentarz na dole

### 6. Przełączaj się między workspaces
- Kliknij na nazwę workspace w nagłówku
- Wybierz inny workspace lub utwórz nowy

---

## 📚 API Endpoints

### Authentication
```
POST   /api/auth/register  - Rejestracja użytkownika
POST   /api/auth/login     - Logowanie
GET    /api/auth/me        - Pobierz dane zalogowanego użytkownika
```

### Workspaces
```
GET    /api/workspaces           - Lista workspaces użytkownika
POST   /api/workspaces           - Utwórz workspace
GET    /api/workspaces/:id       - Szczegóły workspace
PUT    /api/workspaces/:id       - Edytuj workspace
DELETE /api/workspaces/:id       - Usuń workspace
POST   /api/workspaces/:id/invite - Zaproś użytkownika
```

### Projects (wymaga workspace header)
```
GET    /api/projects      - Lista projektów
GET    /api/projects/:id  - Szczegóły projektu
POST   /api/projects      - Utwórz projekt
PUT    /api/projects/:id  - Edytuj projekt
DELETE /api/projects/:id  - Usuń projekt
```

### Tasks (wymaga workspace header)
```
GET    /api/tasks      - Lista zadań (z filtrami)
GET    /api/tasks/:id  - Szczegóły zadania
POST   /api/tasks      - Utwórz zadanie
PUT    /api/tasks/:id  - Edytuj zadanie
DELETE /api/tasks/:id  - Usuń zadanie
```

### Categories (wymaga workspace header)
```
GET    /api/categories      - Lista kategorii
GET    /api/categories/:id  - Szczegóły kategorii
POST   /api/categories      - Utwórz kategorię
PUT    /api/categories/:id  - Edytuj kategorię
DELETE /api/categories/:id  - Usuń kategorię
```

### Comments (wymaga workspace header)
```
GET    /api/comments      - Lista komentarzy
GET    /api/comments/:id  - Szczegóły komentarza
POST   /api/comments      - Utwórz komentarz
PUT    /api/comments/:id  - Edytuj komentarz
DELETE /api/comments/:id  - Usuń komentarz
```

**Nagłówki wymagane dla chronionych endpointów:**
- `Authorization: Bearer <token>` - token JWT
- `X-Workspace-Id: <id>` - ID aktywnego workspace

---

## 📁 Struktura projektu

```
.
├── docker-compose.yml      # Konfiguracja Docker Compose
├── README.md               # Ten plik
├── start.sh / start.bat    # Skrypty uruchomieniowe
│
├── backend/                # Serwer API
│   ├── Dockerfile
│   ├── package.json
│   ├── prisma/
│   │   ├── schema.prisma   # Schemat bazy danych
│   │   └── migrations/     # Migracje bazy
│   └── src/
│       ├── index.ts        # Punkt wejścia
│       ├── routes/         # Endpointy API (auth, workspaces, projects, tasks, etc.)
│       ├── schemas/        # Walidacja danych (Zod)
│       └── middleware/     # Middleware (auth, error handling)
│
└── frontend/               # Aplikacja React (FSD Architecture)
    ├── Dockerfile
    ├── nginx.conf          # Konfiguracja Nginx
    ├── package.json
    └── src/
        ├── app/            # Inicjalizacja aplikacji, providers
        ├── pages/          # Strony (auth, tasks, projects, etc.)
        ├── widgets/        # Złożone komponenty (dashboard, task-details)
        ├── features/       # Funkcjonalności (formularze, karty)
        ├── entities/       # Typy i API (user, project, task, etc.)
        └── shared/         # Komponenty UI, utilities
```

---

## ⚠️ Rozwiązywanie problemów

### Port 3000 jest zajęty
```bash
# Znajdź proces używający portu
lsof -i :3000
# Lub zmień port w docker-compose.yml
```

### Baza danych nie łączy się
```bash
# Poczekaj 10-15 sekund po uruchomieniu
# Lub uruchom ponownie
docker compose restart backend
```

### Chcesz zacząć od nowa
```bash
docker compose down -v
docker compose up --build
```

### Problemy z autoryzacją
- Wyloguj się i zaloguj ponownie
- Wyczyść localStorage w przeglądarce (F12 → Application → Local Storage)

---

## 📄 Licencja

Projekt utworzony w celach edukacyjnych w ramach przedmiotu "Tworzenie aplikacji dla środowisk chmurowych".
