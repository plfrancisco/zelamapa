#!/usr/bin/env python3
"""Teste rápido da API ZelaMapa"""

import requests
import json

BASE = "http://localhost:8000"

print("🔍 Testando API ZelaMapa...\n")

# 1. Testar root
try:
    r = requests.get(f"{BASE}/", timeout=3)
    print(f"✅ Root: {r.status_code} - {r.json()}")
except Exception as e:
    print(f"❌ Root: {e}")

# 2. Testar login
try:
    r = requests.post(
        f"{BASE}/api/auth/login",
        json={"email": "joao.silva@pompeia.sp.gov.br", "senha": "123456"},
        timeout=3
    )
    print(f"✅ Login: {r.status_code}")
    data = r.json()
    print(f"   Token: {data.get('access_token', 'NÃO RECEBIDO')[:30]}...")
    print(f"   User: {data.get('user', {}).get('nome', 'N/A')}")
    token = data.get('access_token')
except Exception as e:
    print(f"❌ Login: {e}")
    token = None

# 3. Testar /me (se tiver token)
if token:
    try:
        r = requests.get(
            f"{BASE}/api/auth/me",
            headers={"Authorization": f"Bearer {token}"},
            timeout=3
        )
        print(f"✅ /me: {r.status_code} - {r.json().get('user', {}).get('nome')}")
    except Exception as e:
        print(f"❌ /me: {e}")

# 4. Testar ocorrências pendentes
if token:
    try:
        r = requests.get(
            f"{BASE}/api/ocorrencias/pendentes",
            headers={"Authorization": f"Bearer {token}"},
            timeout=3
        )
        print(f"✅ Pendentes: {r.status_code} - {len(r.json()) if r.ok else r.text[:100]}")
    except Exception as e:
        print(f"❌ Pendentes: {e}")

print("\n🎯 Teste concluído!")
