#!/usr/bin/env python3
"""
Integration test: start server, run queries, stop.
"""
import subprocess, time, requests, json, sys

# Start server
print("🚀 Starting FastAPI server...")
proc = subprocess.Popen(
    ["python3", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"],
    cwd="/home/lucaspedro81/Área de trabalho/Projeto Integrador /ZelaMapa/backend",
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE
)
time.sleep(5)  # wait for startup

try:
    # Test root
    r = requests.get("http://localhost:8000/", timeout=5)
    print(f"✅ GET /: {r.status_code} {r.json()}")
    
    # Test login
    login_data = {"email":"motorista1@zelamapa.com","senha":"senha123"}
    r = requests.post("http://localhost:8000/api/auth/login", json=login_data, timeout=5)
    print(f"✅ POST /login: {r.status_code}")
    if r.ok:
        data = r.json()
        token = data.get('access_token')
        user = data.get('user')
        print(f"   Token: {token[:30]}...")
        print(f"   User: {user.get('nome')} ({user.get('papel')})")
        headers = {"Authorization": f"Bearer {token}"}
        
        # Test perfil
        r = requests.get("http://localhost:8000/api/motorista/perfil", headers=headers, timeout=5)
        print(f"✅ GET /motorista/perfil: {r.status_code}")
        if r.ok:
            perfil = r.json().get('perfil', {})
            print(f"   Placa: {perfil.get('placa_caminhao')}, Disponibilidade: {perfil.get('disponibilidade')}")
        
        # Test update status
        r = requests.put("http://localhost:8000/api/motorista/status", 
                         headers=headers, 
                         json={"disponibilidade": "DISPONIVEL"},
                         timeout=5)
        print(f"✅ PUT /motorista/status: {r.status_code} -> {r.json()}")
        
        # Test ordens pendentes
        r = requests.get("http://localhost:8000/api/ordens/pendentes", headers=headers, timeout=5)
        print(f"✅ GET /ordens/pendentes: {r.status_code} -> {len(r.json())} ordens")
        
        # Test minhas ordens
        r = requests.get("http://localhost:8000/api/ordens/minhas", headers=headers, timeout=5)
        print(f"✅ GET /ordens/minhas: {r.status_code} -> {len(r.json())} ordens")
        
        # Test detalhe ordem (se houver)
        ordens = r.json()
        if ordens:
            ordem_id = ordens[0]['id']
            r = requests.get(f"http://localhost:8000/api/ordens/{ordem_id}", headers=headers, timeout=5)
            print(f"✅ GET /ordens/{ordem_id}: {r.status_code}")
            
            # Test aceitar ordem
            r = requests.put(f"http://localhost:8000/api/ordens/{ordem_id}/aceitar", headers=headers, timeout=5)
            print(f"✅ PUT /ordens/{ordem_id}/aceitar: {r.status_code} -> {r.json().get('message')}")
            
            # Test iniciar rota
            r = requests.put(f"http://localhost:8000/api/ordens/{ordem_id}/iniciar", headers=headers, timeout=5)
            print(f"✅ PUT /ordens/{ordem_id}/iniciar: {r.status_code}")
            
            # Test concluir
            r = requests.put(f"http://localhost:8000/api/ordens/{ordem_id}/concluir", headers=headers, timeout=5)
            print(f"✅ PUT /ordens/{ordem_id}/concluir: {r.status_code}")
        
        # Test GPS batch endpoint
        gps_data = {
            "localizacoes": [
                {
                    "latitude": -22.1080,
                    "longitude": -50.1750,
                    "velocidade": 45.5,
                    "heading": 90.0,
                    "timestamp": "2026-04-17T20:00:00"
                }
            ]
        }
        r = requests.post("http://localhost:8000/api/localizacao/batch",
                          headers=headers,
                          json=gps_data,
                          timeout=5)
        print(f"✅ POST /localizacao/batch: {r.status_code} -> {r.json()}")
        
        # Test ultima localizacao
        r = requests.get("http://localhost:8000/api/localizacao/ultima/1", headers=headers, timeout=5)
        print(f"✅ GET /localizacao/ultima/1: {r.status_code}")
        
        # Test WebSocket emit (test endpoint)
        r = requests.post("http://localhost:8000/api/test/emit",
                          headers=headers,
                          json={"motorista_id": 2, "ordem_id": 1, "acao": "nova_ordem"},
                          timeout=5)
        print(f"✅ POST /test/emit: {r.status_code} -> {r.json()}")
        
    else:
        print(f"   Login error: {r.text}")
finally:
    # Stop server
    proc.terminate()
    stdout, stderr = proc.communicate(timeout=10)
    print("\n🔴 Server stopped.")
    if stderr:
        print("❌ Errors in server log:")
        print(stderr.decode())
    else:
        print("✅ No errors detected.")
