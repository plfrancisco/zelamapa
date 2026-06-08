"""
WebSocket Module — Socket.IO para notificações real-time
"""
import socketio
from typing import Dict, List
from fastapi import FastAPI
from contextlib import asynccontextmanager

# Criar Socket.IO server (async)
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins='*',  # Ajustar para produção
    logger=True,
    engineio_logger=True
)

# Namespace para motoristas e gestores
driver_namespace = '/driver'
manager_namespace = '/manager'

# Store de conexões ativas: {motorista_id: socket_id}
connected_drivers: Dict[int, str] = {}
# Store de gestores ativos: {usuario_id: socket_id}
connected_managers: Dict[int, str] = {}

def create_socket_app(app: FastAPI) -> FastAPI:
    """Monta Socket.IO no FastAPI  """
    # Aumentar timeout e buffer para lotes de GPS
    sio_app = socketio.ASGIApp(sio, other_asgi_app=app, socketio_path='/socket.io')
    return sio_app

# ============================================
# EVENTOS GESTOR (Dashboard)
# ============================================

@sio.on('connect', namespace=manager_namespace)
async def manager_connect(sid, environ, auth):
    """Gestor conectou ao dashboard."""
    user_id = auth.get('user_id') if auth else None
    if not user_id:
        print(f"[WS-Manager] Conexão sem auth recusada: {sid}")
        return False
    
    connected_managers[user_id] = sid
    # Entrar na sala de gestores para broadcast global
    await sio.enter_room(sid, 'managers', namespace=manager_namespace)
    print(f"[WS-Manager] Gestor {user_id} conectado e entrou na sala 'managers'")
    return True

@sio.on('disconnect', namespace=manager_namespace)
async def manager_disconnect(sid):
    user_id = next((uid for uid, s in connected_managers.items() if s == sid), None)
    if user_id:
        del connected_managers[user_id]
        print(f"[WS-Manager] Gestor {user_id} desconectado")

# ============================================
# EVENTOS MOTORISTA (App)
# ============================================

@sio.on('connect', namespace=driver_namespace)
async def connect(sid, environ, auth):
    """
    Cliente (motorista) conectou.
    Auth deve conter: {motorista_id: int}
    """
    motorista_id = auth.get('motorista_id') if auth else None
    if not motorista_id:
        print(f"[WS] Conexão sem auth recusada: {sid}")
        return False
    connected_drivers[motorista_id] = sid
    print(f"[WS] Motorista {motorista_id} conectado (sid: {sid})")
    return True

@sio.on('disconnect', namespace=driver_namespace)
async def disconnect(sid):
    """Cliente desconectou."""
    # Encontrar motorista pelo sid
    motorista_id = next((mid for mid, s in connected_drivers.items() if s == sid), None)
    if motorista_id:
        del connected_drivers[motorista_id]
        print(f"[WS] Motorista {motorista_id} desconectado")

# ============================================
# EVENTOS DO CLIENTE
# ============================================

@sio.on('motorista_online', namespace=driver_namespace)
async def motorista_online(sid, data: dict):
    """Motorista informa que está online/disponível."""
    motorista_id = data.get('motorista_id')
    if motorista_id:
        connected_drivers[motorista_id] = sid
        print(f"[WS] Motorista {motorista_id} marcou ONLINE")
        # TODO: update status no banco (motoristas.disponibilidade)
        # await sio.emit('status_updated', {...}, room=...)

@sio.on('motorista_offline', namespace=driver_namespace)
async def motorista_offline(sid, data: dict):
    """Motorista informa que está offline."""
    motorista_id = data.get('motorista_id')
    if motorista_id and motorista_id in connected_drivers:
        del connected_drivers[motorista_id]
        print(f"[WS] Motorista {motorista_id} marcou OFFLINE")

# ============================================
# EMISSÃO DO SERVIDOR (para frontend)
# ============================================

async def emitir_nova_ordem(motorista_id: int, ordem_data: dict):
    """
    Emite evento de nova ordem para motorista específico.
    Chamado pelo backend quando uma ordem é criada para o motorista.
    """
    sid = connected_drivers.get(motorista_id)
    if sid:
        await sio.emit('nova_ordem', {'ordem': ordem_data}, room=sid, namespace=driver_namespace)
        print(f"[WS] Emitida nova ordem para motorista {motorista_id}")
    else:
        print(f"[WS] Motorista {motorista_id} não conectado — ordem ficará pendente até login")

async def emitir_ordem_cancelada(motorista_id: int, ordem_id: int):
    """
    Emite evento de ordem cancelada.
    """
    sid = connected_drivers.get(motorista_id)
    if sid:
        await sio.emit('ordem_cancelada', {'ordem_id': ordem_id}, room=sid, namespace=driver_namespace)
        print(f"[WS] Ordem {ordem_id} cancelada notificada para motorista {motorista_id}")

async def emitir_movimentacao(motorista_id: int, loc_data: dict):
    """
    Broadcast de movimentação do motorista para todos os gestores.
    Chamado após salvar batch de localização.
    """
    # Enviar apenas para quem está na sala 'managers'
    await sio.emit('motorista_movimento', {
        'motorista_id': motorista_id,
        'localizacao': loc_data
    }, room='managers', namespace=manager_namespace)

# ============================================
# HELPERS
# ============================================

def get_connected_drivers() -> List[int]:
    """Retorna lista de motoristas conectados."""
    return list(connected_drivers.keys())

def is_motorista_connected(motorista_id: int) -> bool:
    """Verifica se motorista está online."""
    return motorista_id in connected_drivers
