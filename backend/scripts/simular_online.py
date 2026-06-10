#!/usr/bin/env python3
import os
import sys
import random
from datetime import datetime

# Adicionar o diretório da API ao path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'api'))
from database import get_db_connection

def simulate_online_trucks():
    conn = get_db_connection()
    if not conn:
        print("❌ Falha ao conectar ao banco")
        sys.exit(1)
    cursor = conn.cursor(dictionary=True)
    
    try:
        # 1. Pegar todos os motoristas
        cursor.execute("SELECT id FROM motoristas")
        motoristas = cursor.fetchall()
        
        # Coordenadas base de Pompéia
        base_lat, base_lng = -22.1062, -50.1740
        
        print(f"📡 Simulando localização para {len(motoristas)} motoristas...")
        
        for m in motoristas:
            m_id = m['id']
            lat = base_lat + random.uniform(-0.01, 0.01)
            lng = base_lng + random.uniform(-0.01, 0.01)
            
            # Atualizar status para EM_ROTA ou DISPONIVEL
            status = random.choice(["EM_ROTA", "DISPONIVEL"])
            cursor.execute("UPDATE motoristas SET disponibilidade = %s WHERE id = %s", (status, m_id))
            
            # Inserir localização "atual"
            cursor.execute("""
                INSERT INTO localizacoes (motorista_id, latitude, longitude, created_at, modulo_tipo)
                VALUES (%s, %s, %s, NOW(), 'APP')
            """, (m_id, lat, lng))
            
        conn.commit()
        print("✅ Localizações simuladas! Os motoristas devem aparecer agora.")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ ERRO: {e}")
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    simulate_online_trucks()
