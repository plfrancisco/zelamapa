from sqlalchemy.orm import Session
from sqlalchemy import func, text
from datetime import datetime, timedelta
from ..models.ocorrencia import Ocorrencia
from ..models.tipo_ocorrencia import TipoOcorrencia
from ..models.ordem import OrdemServico
from ..models.motorista import Motorista
from ..models.usuario import Usuario
from ..models.localizacao import Localizacao

def get_config_value(db: Session, key: str, default: str):
    try:
        res = db.execute(text("SELECT valor FROM configuracoes WHERE chave = :key"), {"key": key}).fetchone()
        return res[0] if res else default
    except:
        return default

def get_dashboard_stats(db: Session):
    # 1. Coletas recentes (Mapa)
    recent = (
        db.query(
            Ocorrencia.id,
            Ocorrencia.latitude,
            Ocorrencia.longitude,
            Ocorrencia.descricao,
            Ocorrencia.status,
            Ocorrencia.imagem_path,
            TipoOcorrencia.nome.label("type"),
            Ocorrencia.endereco,
            Ocorrencia.criado_em,
        )
        .join(TipoOcorrencia, Ocorrencia.tipo_id == TipoOcorrencia.id, isouter=True)
        .order_by(Ocorrencia.criado_em.desc())
        .limit(100)
        .all()
    )

    # 2. Caminhões ativos (Mapa Real-time)
    trucks = []
    all_motoristas = db.query(
        Motorista.id.label("motorista_id"),
        Usuario.nome.label("driver_name"),
        Motorista.disponibilidade
    ).join(Usuario, Motorista.usuario_id == Usuario.id).filter(Motorista.disponibilidade != "OFFLINE").all()

    for m in all_motoristas:
        # Pegar última localização
        loc = db.query(Localizacao).filter(Localizacao.motorista_id == m.motorista_id).order_by(Localizacao.created_at.desc()).first()
        # Contar serviços concluídos hoje por este motorista
        today = datetime.utcnow().date()
        completed_today = db.query(func.count(OrdemServico.id)).filter(
            OrdemServico.motorista_id == m.motorista_id,
            OrdemServico.status == "CONCLUIDA",
            func.date(OrdemServico.data_conclusao) == today
        ).scalar() or 0
        
        trucks.append({
            "motorista_id": m.motorista_id,
            "driver_name": m.driver_name,
            "disponibilidade": m.disponibilidade,
            "latitude": float(loc.latitude) if loc else None,
            "longitude": float(loc.longitude) if loc else None,
            "completed": completed_today
        })

    # 3. Categorias de Resíduos (Gráfico Pizza)
    waste_categories = (
        db.query(TipoOcorrencia.nome.label("name"), func.count(Ocorrencia.id).label("value"))
        .join(Ocorrencia, Ocorrencia.tipo_id == TipoOcorrencia.id)
        .group_by(TipoOcorrencia.nome)
        .all()
    )

    # 4. Dados por Bairro (Bar Chart)
    neighborhood_data = (
        db.query(Ocorrencia.bairro.label("name"), func.count(Ocorrencia.id).label("value"))
        .filter(Ocorrencia.bairro.isnot(None))
        .group_by(Ocorrencia.bairro)
        .order_by(text("value DESC"))
        .limit(5)
        .all()
    )

    # 5. Distribuição de Status
    status_dist = (
        db.query(Ocorrencia.status, func.count(Ocorrencia.id).label("count"))
        .group_by(Ocorrencia.status)
        .all()
    )

    # 6. Tendência Diária (Últimos 7 dias)
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    daily_trend = (
        db.query(func.date(Ocorrencia.criado_em).label("date"), func.count(Ocorrencia.id).label("count"))
        .filter(Ocorrencia.criado_em >= seven_days_ago)
        .group_by(text("date"))
        .order_by(text("date ASC"))
        .all()
    )

    # 7. Inteligência e Métricas
    total_ocorrencias = db.query(func.count(Ocorrencia.id)).scalar() or 0
    total_pendentes = db.query(func.count(Ocorrencia.id)).filter(Ocorrencia.status == "PENDENTE").scalar() or 0
    total_concluida = db.query(func.count(Ocorrencia.id)).filter(Ocorrencia.status == "CONCLUIDO").scalar() or 0
    total_geral = total_ocorrencias if total_ocorrencias > 0 else 1
    
    gas_price = float(get_config_value(db, "preco_gasolina", "5.89"))
    
    # Cálculo TMA (Cross-DB: MySQL TIMESTAMPDIFF vs SQLite julianday)
    bind = db.get_bind()
    is_sqlite = bind.dialect.name == "sqlite"
    
    if is_sqlite:
        avg_res_time = db.execute(text("""
            SELECT AVG((julianday(data_conclusao) - julianday(created_at)) * 1440)
            FROM ordens_servico
            WHERE status = 'CONCLUIDA' AND data_conclusao IS NOT NULL
        """)).scalar() or 0
    else:
        avg_res_time = db.execute(text("""
            SELECT AVG(TIMESTAMPDIFF(MINUTE, created_at, data_conclusao))
            FROM ordens_servico
            WHERE status = 'CONCLUIDA' AND data_conclusao IS NOT NULL
        """)).scalar() or 0

    return {
        "recentCollections": [dict(r._mapping) for r in recent],
        "totalCount": total_ocorrencias,
        "pendingCount": total_pendentes,
        "activeTrucks": trucks,
        "wasteCategories": [dict(w._mapping) for w in waste_categories],
        "neighborhoodData": [dict(n._mapping) for n in neighborhood_data],
        "statusDistribution": [dict(s._mapping) for s in status_dist],
        "dailyTrend": [dict(d._mapping) for d in daily_trend],
        "intelligence": {
            "avgResolutionTime": round(float(avg_res_time), 1),
            "weeklyCount": this_week_count(db),
            "criticalScore": round((total_geral - total_concluida) / total_geral * 100, 1),
            "resolutionRate": round(total_concluida / total_geral * 100, 1),
            "avgRating": 4.8, # Mock por enquanto
            "totalOperationalCost": calculate_cost(db),
            "gasPrice": gas_price
        }
    }

def this_week_count(db: Session):
    one_week_ago = datetime.utcnow() - timedelta(days=7)
    return db.query(func.count(Ocorrencia.id)).filter(Ocorrencia.criado_em >= one_week_ago).scalar() or 0

def calculate_cost(db: Session):
    # R$ TOTAL (Soma dos snapshots históricos das ordens concluídas)
    try:
        total_historico = db.query(func.sum(OrdemServico.valor_total_os)).filter(OrdemServico.status == "CONCLUIDA").scalar() or 0
        return round(float(total_historico), 2)
    except:
        # Fallback caso ocorra erro (ex: migração não concluída)
        total_km = db.query(func.sum(OrdemServico.distancia_km)).filter(OrdemServico.status == "CONCLUIDA").scalar() or 0
        return round(float(total_km) * 1.5, 2)

def create_ocorrencia(db: Session, obj_in, usuario_id: int = None):
    db_obj = Ocorrencia(
        **obj_in.dict(),
        usuario_id=usuario_id
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj
