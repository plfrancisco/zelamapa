#!/usr/bin/env python3
import urllib.request
import json

try:
    req = urllib.request.Request("http://localhost:8000/")
    with urllib.request.urlopen(req, timeout=5) as resp:
        data = json.loads(resp.read().decode())
        print("✅ Backend respondeu:", data)
except Exception as e:
    print("❌ Erro:", e)
