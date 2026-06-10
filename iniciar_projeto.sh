#!/bin/bash

# ZelaMapa - Script de Inicialização Elite
# Inicia API (FastAPI) e Frontend (Vite) simultaneamente
# Uso: ./iniciar_projeto.sh [opção]

# Carregar NVM se existir
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
API_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"
INFRA_DIR="$PROJECT_DIR/backend/infra"
SCRIPTS_DIR="$PROJECT_DIR/backend/scripts"
DATA_DIR="$PROJECT_DIR/data"

API_PORT=8000
FRONTEND_PORT=5173

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERRO]${NC} $1"; }

is_port_in_use() {
    lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1
}

kill_port() {
    local pid=$(lsof -t -i:$1 2>/dev/null)
    if [ ! -z "$pid" ]; then
        log_info "Finalizando processo na porta $1 (PID: $pid)..."
        kill -9 $pid 2>/dev/null || true
        sleep 1
    fi
}

start_api() {
    if is_port_in_use $API_PORT; then
        log_warning "API já rodando na porta $API_PORT"
        return
    fi

    log_info "Iniciando API (FastAPI)..."
    cd "$PROJECT_DIR"

    # Garantir Infra (MySQL no Docker)
    if ! docker ps --filter "name=bdzelamapa" --format '{{.Status}}' | grep -q "Up"; then
        log_info "Subindo container MySQL via backend/infra/docker-compose.yml..."
        cd "$INFRA_DIR" && docker compose up -d
        cd "$PROJECT_DIR"
        sleep 5
    fi

    # Sincronização e Seed (Desativado: Banco já populado)
    # log_info "Executando scripts de sincronização..."
    # python3 "$SCRIPTS_DIR/seed_mysql.py" > /dev/null 2>&1 || log_warning "Seed falhou, ignorando..."

    nohup uvicorn backend.main:app --reload --host 0.0.0.0 --port $API_PORT > "$PROJECT_DIR/backend.log" 2>&1 &
    echo $! > "$PROJECT_DIR/.api.pid"
    
    # Aguardar até 10 segundos para a API iniciar
    for i in {1..10}; do
        if is_port_in_use $API_PORT; then
            break
        fi
        sleep 1
    done

    if is_port_in_use $API_PORT; then
        log_success "API: http://localhost:$API_PORT"
    else
        log_error "Falha ao iniciar API. Verifique logs em $PROJECT_DIR/backend.log"
        exit 1
    fi
}

start_frontend() {
    if is_port_in_use $FRONTEND_PORT; then
        log_warning "Frontend já rodando na porta $FRONTEND_PORT"
        return
    fi

    log_info "Iniciando Frontend (Vite)..."
    cd "$FRONTEND_DIR"

    nohup npm run dev -- --host 0.0.0.0 --port $FRONTEND_PORT > "$PROJECT_DIR/frontend.log" 2>&1 &
    echo $! > "$PROJECT_DIR/.frontend.pid"
    sleep 3

    if is_port_in_use $FRONTEND_PORT; then
        log_success "Frontend: http://localhost:$FRONTEND_PORT"
    else
        log_error "Falha ao iniciar Frontend."
        exit 1
    fi
}

stop_all() {
    log_info "Parando serviços..."
    [ -f "$PROJECT_DIR/.api.pid" ] && kill $(cat "$PROJECT_DIR/.api.pid") 2>/dev/null && rm "$PROJECT_DIR/.api.pid"
    [ -f "$PROJECT_DIR/.frontend.pid" ] && kill $(cat "$PROJECT_DIR/.frontend.pid") 2>/dev/null && rm "$PROJECT_DIR/.frontend.pid"
    kill_port $API_PORT
    kill_port $FRONTEND_PORT
    log_success "Serviços parados."
}

# MAIN
case "${1:-}" in
    --stop) stop_all ;;
    --restart) stop_all; sleep 2; start_api; start_frontend ;;
    *) start_api; start_frontend; log_success "🎉 Ambiente ZelaMapa Elite Operacional!"; trap stop_all SIGINT SIGTERM; wait ;;
esac
