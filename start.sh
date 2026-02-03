#!/bin/bash

# ============================================
# Task Manager - Skrypt uruchomieniowy
# ============================================

# Kolory
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔════════════════════════════════════════╗"
echo "║       Task Manager - Start Script      ║"
echo "╚════════════════════════════════════════╝"
echo -e "${NC}"

# Sprawdź czy Docker jest zainstalowany
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}❌ Docker nie jest zainstalowany!${NC}"
    echo "Pobierz Docker Desktop: https://www.docker.com/products/docker-desktop/"
    exit 1
fi

# Sprawdź czy Docker działa
if ! docker info &> /dev/null; then
    echo -e "${YELLOW}❌ Docker nie jest uruchomiony!${NC}"
    echo "Uruchom Docker Desktop i spróbuj ponownie."
    exit 1
fi

echo -e "${GREEN}✅ Docker jest gotowy${NC}"
echo ""

# Menu
echo "Wybierz opcję:"
echo "1) Uruchom aplikację (docker compose up)"
echo "2) Uruchom z przebudową (docker compose up --build)"
echo "3) Zatrzymaj aplikację (docker compose down)"
echo "4) Zatrzymaj i usuń dane (docker compose down -v)"
echo "5) Pokaż logi"
echo "6) Wyjście"
echo ""
read -p "Twój wybór [1-6]: " choice

case $choice in
    1)
        echo -e "${BLUE}🚀 Uruchamiam aplikację...${NC}"
        docker compose up -d
        echo ""
        echo -e "${GREEN}✅ Aplikacja uruchomiona!${NC}"
        echo ""
        echo "🌐 Frontend: http://localhost:3000"
        echo "🔌 Backend:  http://localhost:5001/api"
        echo ""
        echo "Aby zobaczyć logi: docker compose logs -f"
        ;;
    2)
        echo -e "${BLUE}🔨 Przebudowuję i uruchamiam...${NC}"
        docker compose up --build -d
        echo ""
        echo -e "${GREEN}✅ Aplikacja uruchomiona!${NC}"
        echo ""
        echo "🌐 Frontend: http://localhost:3000"
        echo "🔌 Backend:  http://localhost:5001/api"
        ;;
    3)
        echo -e "${YELLOW}⏹️  Zatrzymuję aplikację...${NC}"
        docker compose down
        echo -e "${GREEN}✅ Zatrzymano${NC}"
        ;;
    4)
        echo -e "${YELLOW}⚠️  Usuwam aplikację i wszystkie dane...${NC}"
        docker compose down -v
        echo -e "${GREEN}✅ Usunięto${NC}"
        ;;
    5)
        echo -e "${BLUE}📋 Logi aplikacji (Ctrl+C aby wyjść):${NC}"
        docker compose logs -f
        ;;
    6)
        echo "Do widzenia!"
        exit 0
        ;;
    *)
        echo "Nieprawidłowa opcja"
        exit 1
        ;;
esac
