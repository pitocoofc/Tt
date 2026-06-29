from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import pipeline

app = FastAPI(title="Ghost Translation API (Yandex Style)")

# Carrega o modelo na memória assim que o servidor inicia
# O opus-mt-pt-en tem menos de 300MB, cabe raspando no Render Free!
try:
    translator = pipeline("translation_pt_to_en", model="Helsinki-NLP/opus-mt-pt-en")
except Exception as e:
    print(f"Erro ao carregar o modelo: {e}")
    translator = None

class TranslationRequest(BaseModel):
    text: str

@app.post("/translate")
async def translate_text(request: TranslationRequest):
    if not translator:
        raise HTTPException(status_code=500, detail="Modelo não carregado no servidor.")
    
    try:
        result = translator(request.text)
        return {"original": request.text, "translation": result[0]['translation_text']}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
