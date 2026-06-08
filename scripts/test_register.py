#!/usr/bin/env python3
import requests
import sys

API_BASE = "http://localhost:8000/api/v1"

def test_registration():
    print("🧪 Iniciando teste de criação de conta...")
    
    # 1. Login como Admin para pegar o token
    print("🔑 Autenticando como Admin...")
    try:
        login_res = requests.post(f"{API_BASE}/auth/login", data={
            "username": "admin@zelamapa.com",
            "password": "senha123"
        })
        if login_res.status_code != 200:
            print(f"❌ Falha no login: {login_res.text}")
            return
        
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print("✅ Autenticado!")

        # 2. Criar um novo motorista de teste
        test_user = {
            "nome": "Motorista de Teste",
            "email": "teste_novo@zelamapa.com",
            "senha": "senha_segura_123",
            "papel": "MOTORISTA",
            "caminhao_id": "TEST-2026"
        }
        
        print(f"🚛 Tentando cadastrar {test_user['email']}...")
        reg_res = requests.post(f"{API_BASE}/auth/register", json=test_user, headers=headers)
        
        if reg_res.status_code == 200:
            print("✅ Usuário cadastrado com sucesso via API!")
            print(f"📡 Resposta: {reg_res.json()}")
        else:
            print(f"❌ Erro ao cadastrar: {reg_res.status_code} - {reg_res.text}")

    except Exception as e:
        print(f"❌ Erro de conexão: {e}")

if __name__ == "__main__":
    test_registration()
