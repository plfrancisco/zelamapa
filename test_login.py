#!/usr/bin/env python3
import requests

BASE = "http://localhost:8000"

print("=== TESTE DE LOGIN ===")
resp = requests.post(
    f"{BASE}/api/auth/login",
    json={"email": "joao.silva@pompeia.sp.gov.br", "senha": "123456"},
    timeout=5
)
print(f"Status: {resp.status_code}")
print(f"Resposta: {resp.json()}")
