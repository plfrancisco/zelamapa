#!/bin/bash

# ZelaMapa - Script de Inicialização do Projeto
# Inicia backend (FastAPI) e frontend (Vite) simultaneamente
# Uso: ./iniciar_projeto.sh [opção]
# Opções:
#   --backend-only    Apenas inicia o backend
#   --frontend-only   Apenas inicia o frontend
#   --stop            Para todos os processos
#   --restart         Reinicia todos os processos
#   --status          Mostra status dos serviços

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"
BACKEND_PORT=8000
FRONTEND_PORT=5173

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERRO]${NC} $1"; }

is_port_in_use() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

kill_port() {
    local pid=$(lsof -t -i:$1 2>/dev/null)
    if [ ! -z "$pid" ]; then
        log_info "Matando processo na porta $1 (PID: $pid)..."
        kill -9 $pid 2>/dev/null || true
        sleep 1
    fi
}

check_dependencies() {
    if ! command -v python3 &> /dev/null; then
        log_error "Python3 não encontrado. Instale Python 3.9+"
        exit 1
    fi
    if ! command -v npm &> /dev/null; then
        log_error "npm não encontrado. Instale Node.js"
        exit 1
    fi
}

install_backend_deps() {
    if [ ! -d "$BACKEND_DIR/venv" ]; then
        log_info "Instalando dependências do backend..."
        cd "$BACKEND_DIR"
        pip install -r requirements.txt
    fi
}

install_frontend_deps() {
    if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
        log_info "Instalando dependências do frontend..."
        cd "$FRONTEND_DIR"
        npm install
    fi
}

start_backend() {
    if is_port_in_use $BACKEND_PORT; then
        log_warning "Backend já rodando na porta $BACKEND_PORT"
        return
    fi

    log_info "Iniciando FastAPI backend..."
    cd "$BACKEND_DIR"

    # Criar banco se não existir
    if [ ! -f "$BACKEND_DIR/zelamapa.db" ]; then
        log_info "Criando banco de dados..."
        python seed.py
    fi

    nohup uvicorn app.main:app --reload --host 0.0.0.0 --port $BACKEND_PORT > "$BACKEND_DIR/backend.log" 2>&1 &
    echo $! > "$PROJECT_DIR/.backend.pid"
    sleep 2

    if is_port_in_use $BACKEND_PORT; then
        log_success "Backend: http://localhost:$BACKEND_PORT"
        log_info "  API Docs: http://localhost:$BACKEND_PORT/docs"
        log_info "  Log: $BACKEND_DIR/backend.log"
    else
        log_error "Falha ao iniciar backend. Verifique: $BACKEND_DIR/backend.log"
        exit 1
    fi
}

start_frontend() {
    if is_port_in_use $FRONTEND_PORT; then
        log_warning "Frontend já rodando na porta $FRONTEND_PORT"
        return
    fi

    log_info "Iniciando Vite frontend..."
    cd "$FRONTEND_DIR"

    nohup npm run dev -- --host 0.0.0.0 --port $FRONTEND_PORT > "$FRONTEND_DIR/frontend.log" 2>&1 &
    echo $! > "$PROJECT_DIR/.frontend.pid"
    sleep 3

    if is_port_in_use $FRONTEND_PORT; then
        log_success "Frontend: http://localhost:$FRONTEND_PORT"
        log_info "  Log: $FRONTEND_DIR/frontend.log"
    else
        log_error "Falha ao iniciar frontend. Verifique: $FRONTEND_DIR/frontend.log"
        exit 1
    fi
}

stop_all() {
    log_info "Parando serviços..."

    if [ -f "$PROJECT_DIR/.backend.pid" ]; then
        local pid=$(cat "$PROJECT_DIR/.backend.pid")
        if kill -0 $pid 2>/dev/null; then
            log_info "Parando backend (PID: $pid)..."
            kill $pid 2>/dev/null || true
        fi
        rm -f "$PROJECT_DIR/.backend.pid"
    fi

    if [ -f "$PROJECT_DIR/.frontend.pid" ]; then
        local pid=$(cat "$PROJECT_DIR/.frontend.pid")
        if kill -0 $pid 2>/dev/null; then
            log_info "Parando frontend (PID: $pid)..."
            kill $pid 2>/dev/null || true
        fi
        rm -f "$PROJECT_DIR/.frontend.pid"
    fi

    kill_port $BACKEND_PORT
    kill_port $FRONTEND_PORT
    log_success "Serviços parados."
}

show_status() {
    echo ""
    log_info "Status - ZelaMapa:"
    echo "─────────────────────────────────────"

    if is_port_in_use $BACKEND_PORT; then
        local pid=$(lsof -t -i:$BACKEND_PORT)
        log_success "Backend: RODANDO (porta $BACKEND_PORT, PID: $pid)"
        log_info "  URL: http://localhost:$BACKEND_PORT"
        log_info "  Docs: http://localhost:$BACKEND_PORT/docs"
    else
        log_error "Backend: PARADO"
    fi

    if is_port_in_use $FRONTEND_PORT; then
        local pid=$(lsof -t -i:$FRONTEND_PORT)
        log_success "Frontend: RODANDO (porta $FRONTEND_PORT, PID: $pid)"
        log_info "  URL: http://localhost:$FRONTEND_PORT"
    else
        log_error "Frontend: PARADO"
    fi

    echo ""
    log_info "Credenciais de teste:"
    echo "  Motorista: joao.silva@pompeia.sp.gov.br / 123456"
    echo "  Gestor: gestor@pompeia.sp.gov.br / 123456"
    echo ""
}

# ============================================
# MAIN
# ============================================

# Validar diretórios
if [ ! -f "$BACKEND_DIR/app/main.py" ]; then
    log_error "Backend não encontrado em: $BACKEND_DIR"
    exit 1
fi

if [ ! -f "$FRONTEND_DIR/package.json" ]; then
    log_error "Frontend não encontrado em: $FRONTEND_DIR"
    exit 1
fi

# Tratar argumentos
case "${1:-}" in
    --backend-only)
        check_dependencies
        install_backend_deps
        start_backend
        ;;

    --frontend-only)
        check_dependencies
        install_frontend_deps
        start_frontend
        ;;

    --stop)
        stop_all
        ;;

    --restart)
        stop_all
        sleep 2
        check_dependencies
        start_backend
        start_frontend
        ;;

    --status)
        show_status
        ;;

    *)
        # Modo normal: inicia tudo
        check_dependencies
        install_backend_deps
        install_frontend_deps
        start_backend
        start_frontend

        echo ""
        log_success "🎉 ZelaMapa iniciado com sucesso!"
        echo ""
        log_info "Acesse:"
        echo "  Frontend: http://localhost:$FRONTEND_PORT"
        echo "  Backend:  http://localhost:$BACKEND_PORT"
        echo "  API Docs: http://localhost:$BACKEND_PORT/docs"
        echo ""
        log_info "Use ./iniciar_projeto.sh --stop para parar"
        log_info "Use ./iniciar_projeto.sh --status para ver status"
        echo ""

        # Manter script ativo para capturar Ctrl+C
        trap 'stop_all; exit 0' SIGINT SIGTERM
        wait
        ;;
esac
