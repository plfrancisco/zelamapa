from fastapi import APIRouter, HTTPException
from ...database import get_db_connection
from datetime import datetime, timedelta

router = APIRouter()

def get_cursor(conn):
    if hasattr(conn, "ping"): # MySQL
        return conn.cursor(dictionary=True)
    else: # SQLite
        def dict_factory(cursor, row):
            d = {}
            for idx, col in enumerate(cursor.description):
                d[col[0]] = row[idx]
            return d
        conn.row_factory = dict_factory
        return conn.cursor()

@router.get("/summary")
async def get_bi_summary():
    conn = get_db_connection()
    cursor = get_cursor(conn)
    is_sqlite = not hasattr(conn, "ping")
    
    try:
        # 1. Performance dos Motoristas (Scorecard)
        current_month = datetime.now().strftime("%Y-%m")
        driver_query = f"""
            SELECT 
                u.nome as name,
                COUNT(DISTINCT os.id) as total_orders,
                AVG(os.distancia_km) as avg_km,
                SUM(os.distancia_km) as total_km,
                AVG(os.feedback_nota) as rating,
                AVG(TIMESTAMPDIFF(MINUTE, os.created_at, os.data_conclusao)) as tma_min,
                (SELECT SUM(duracao_minutos) FROM jornadas_trabalho WHERE usuario_id = u.id AND mes_referencia = '{current_month}') as online_min
            FROM motoristas m
            JOIN usuarios u ON m.usuario_id = u.id
            LEFT JOIN ordens_servico os ON os.motorista_id = m.id AND os.status = 'CONCLUIDA'
            GROUP BY u.id, u.nome
        """ if not is_sqlite else f"""
            SELECT 
                u.nome as name,
                COUNT(DISTINCT os.id) as total_orders,
                AVG(os.distancia_km) as avg_km,
                SUM(os.distancia_km) as total_km,
                AVG(os.feedback_nota) as rating,
                AVG((julianday(os.data_conclusao) - julianday(os.created_at)) * 1440) as tma_min,
                (SELECT SUM(duracao_minutos) FROM jornadas_trabalho WHERE usuario_id = u.id AND mes_referencia = '{current_month}') as online_min
            FROM motoristas m
            JOIN usuarios u ON m.usuario_id = u.id
            LEFT JOIN ordens_servico os ON os.motorista_id = m.id AND os.status = 'CONCLUIDA'
            GROUP BY u.id, u.nome
        """
        try:
            cursor.execute(driver_query)
            drivers = cursor.fetchall()
        except:
            drivers = []

        # 2. Configurações de Custo (Seguro)
        gas_price = 5.89
        consumo = 4.0
        try:
            cursor.execute("SELECT valor FROM configuracoes WHERE chave = 'preco_gasolina'")
            res_gas = cursor.fetchone()
            if res_gas: gas_price = float(res_gas['valor'] if isinstance(res_gas, dict) else res_gas[0])
            
            cursor.execute("SELECT valor FROM configuracoes WHERE chave = 'consumo_medio_km_l'")
            res_cons = cursor.fetchone()
            if res_cons: consumo = float(res_cons['valor'] if isinstance(res_cons, dict) else res_cons[0])
        except:
            pass

        # 3. Custo por Bairro
        cost_neighborhood_query = """
            SELECT 
                COALESCE(o.bairro, 'Centro') as name,
                SUM(os.distancia_km) as km
            FROM ocorrencias o
            JOIN ordens_servico os ON os.ocorrencia_id = o.id
            WHERE os.status = 'CONCLUIDA'
            GROUP BY o.bairro
            ORDER BY km DESC
        """
        cursor.execute(cost_neighborhood_query)
        neighborhoods_raw = cursor.fetchall()
        
        costs_by_bairro = []
        total_value = 0
        total_orders_count = 0
        
        for row in neighborhoods_raw:
            name = row['name'] if isinstance(row, dict) else row[0]
            km = float(row['km'] if isinstance(row, dict) else row[1] or 0)
            val = round((km / consumo) * gas_price, 2)
            total_value += val
            costs_by_bairro.append({
                "name": name,
                "value": val,
                "km": round(km, 1)
            })

        # 4. Eficiência por Categoria
        cost_category_query = """
            SELECT 
                t.nome as name,
                AVG(os.distancia_km) as avg_km,
                COUNT(os.id) as count
            FROM tipos_ocorrencia t
            JOIN ocorrencias o ON o.tipo_id = t.id
            JOIN ordens_servico os ON os.ocorrencia_id = o.id
            WHERE os.status = 'CONCLUIDA'
            GROUP BY t.nome
        """
        cursor.execute(cost_category_query)
        categories_raw = cursor.fetchall()
        
        efficiency_residuos = []
        for row in categories_raw:
            name = row['name'] if isinstance(row, dict) else row[0]
            avg_km = float(row['avg_km'] if isinstance(row, dict) else row[1] or 0)
            count = int(row['count'] if isinstance(row, dict) else row[2])
            total_orders_count += count
            efficiency_residuos.append({
                "name": name,
                "avg_cost": round((avg_km / consumo) * gas_price, 2),
                "total_orders": count
            })

        # 5. Métricas Globais Adicionais
        tma_query = """
            SELECT AVG(TIMESTAMPDIFF(MINUTE, created_at, data_conclusao)) as avg_tma
            FROM ordens_servico 
            WHERE status = 'CONCLUIDA' AND data_conclusao IS NOT NULL
        """ if not is_sqlite else """
            SELECT AVG((julianday(data_conclusao) - julianday(created_at)) * 1440) as avg_tma
            FROM ordens_servico 
            WHERE status = 'CONCLUIDA' AND data_conclusao IS NOT NULL
        """
        cursor.execute(tma_query)
        res_tma = cursor.fetchone()
        tma_val = res_tma['avg_tma'] if isinstance(res_tma, dict) else (res_tma[0] if res_tma else None)
        avg_fleet_tma = float(tma_val) if tma_val is not None else 0.0

        return {
            "driverScorecard": [dict(d) if not isinstance(d, dict) else d for d in drivers],
            "financialByNeighborhood": costs_by_bairro,
            "efficiencyByWaste": efficiency_residuos,
            "globalMetrics": {
                "avgCostPerOrder": round(total_value / (total_orders_count or 1), 2),
                "gasPrice": gas_price,
                "avgFleetTma": round(avg_fleet_tma, 1)
            }
        }
    finally:
        cursor.close()
        conn.close()
