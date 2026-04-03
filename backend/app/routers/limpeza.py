from fastapi import APIRouter
import os

router = APIRouter()

@router.delete("/{filename}")
def deletar_imagem_temporaria(filename: str):
    """
    Remove fisicamente uma imagem temporária da pasta uploads.
    Será acionado pelo frontend quando marcar a ocorrência como 'Concluído'.
    """
    filepath = os.path.join(os.getcwd(), 'uploads', filename)
    if os.path.exists(filepath):
        try:
            os.remove(filepath)
            return {"status": "success", "message": f"{filename} removido com sucesso."}
        except Exception as e:
            return {"status": "error", "message": str(e)}
    return {"status": "not_found", "message": "Arquivo não encontrado."}
