#!/bin/bash

# ZelaMapa - Script de Inicialização Rápida
# Este arquivo roda o Backend e o Frontend ao mesmo tempo

echo "======================================================"
echo "🚀 Iniciando o Projeto ZelaMapa (Backend + Frontend)🚀"
echo "======================================================"

# Captura sinal de CTRL+C e mata os subprocessos em background
trap 'echo "Encerrando os servidores..."; kill 0' SIGINT SIGTERM EXIT

# 1. Iniciar o Backend
echo "-> Iniciando FastAPI Backend..."
cd backend
# Se existir o ambiente virtual venv, entramos nele
if [ -d "venv" ]; then
    source venv/bin/activate
elif [ -d ".venv" ]; then
    source .venv/bin/activate
fi
uvicorn app.main:app --reload --port 8000 &
BACKEND_PID=$!
cd ..

# 2. Iniciar o Frontend
echo "-> Iniciando Vite+React Frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo "======================================================"
echo "✅ Servidores rodando."
echo "✅ Backend (API) : http://localhost:8000"
echo "✅ Frontend (App) : http://localhost:5173"
echo "⚠️ Pressione [CTRL+C] para encerrar tudo."
echo "======================================================"

# Espera os processos para que o script não termine imediatamente
wait
