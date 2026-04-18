#!/usr/bin/env python3
import requests, json, time

BASE = "http://127.0.0.1:8000"

# 1. Root
r = requests.get(f"{BASE}/")
print("GET /:", r.status_code, r.json())

# 2. Login
r = requests.post(f"{BASE}/api/auth/login", json={"email":"motorista1@zelamapa.com","senha":"senha123"})
print("POST /login:", r.status_code)
data = r.json()
token = data.get('access_token')
user = data.get('user')
print("   user:", user)
headers = {"Authorization": f"Bearer {token}"}

# 3. Perfil
r = requests.get(f"{BASE}/api/motorista/perfil", headers=headers)
print("GET /perfil:", r.status_code, r.json().get('perfil', {}).get('placa_caminhao'))

# 4. Status
r = requests.put(f"{BASE}/api/motorista/status", headers=headers, json={"disponibilidade":"DISPONIVEL"})
print("PUT /status:", r.status_code, r.json())

# 5. Pendentes
r = requests.get(f"{BASE}/api/ordens/pendentes", headers=headers)
print("GET /ordens/pendentes:", r.status_code, "count:", len(r.json()))
if r.json():
    print("   primeira:", r.json()[0].get('numero_os'))

# 6. Minhas ordens
r = requests.get(f"{BASE}/api/ordens/minhas", headers=headers)
print("GET /ordens/minhas:", r.status_code, "count:", len(r.json()))
if r.json():
    o = r.json()[0]
    print("   id:", o.get('id'), "status:", o.get('status'))

# 7. Detalhe ordem (id=1)
r = requests.get(f"{BASE}/api/ordens/1", headers=headers)
print("GET /ordens/1:", r.status_code, r.json().get('status'))

# 8. Aceitar ordem 1 (que está ACEITA, vai falhar)
r = requests.put(f"{BASE}/api/ordens/1/aceitar", headers=headers)
print("PUT /ordens/1/aceitar:", r.status_code, r.text[:100])

# 9. Se houver uma ordem ABERTA (id=2), tentar aceitar
r2 = requests.get(f"{BASE}/api/ordens/pendentes", headers=headers)
pendentes = r2.json()
if pendentes:
    oid = pendentes[0]['id']
    print(f"\nTentando aceitar ordem ABERTA id={oid}")
    r = requests.put(f"{BASE}/api/ordens/{oid}/aceitar", headers=headers)
    print("PUT /ordens/{oid}/aceitar:", r.status_code, r.json())

# 10. GPS batch
gps = {"localizacoes":[{"latitude":-22.108,"longitude":-50.175,"velocidade":50}]}
r = requests.post(f"{BASE}/api/localizacao/batch", headers=headers, json=gps)
print("\nPOST /localizacao/batch:", r.status_code, r.json())

# 11. Ultima localizacao
r = requests.get(f"{BASE}/api/localizacao/ultima/1", headers=headers)
print("GET /localizacao/ultima/1:", r.status_code, r.json())
