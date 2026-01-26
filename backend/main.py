from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
import os
import hmac
import hashlib
import time
import asyncio
from dotenv import load_dotenv
from twitch_tracker import start_tracker_loop, tracker
from database import engine, Base, SessionLocal, Suggestion

load_dotenv()
# Список ID администраторов
ADMIN_IDS = [int(id.strip()) for id in os.getenv("ADMIN_IDS", "").split(",") if id.strip()]

# Создание таблиц (если они остались/изменились)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Akimary Hub API")

@app.on_event("startup")
async def startup_event():
    # Запуск фоновой задачи отслеживания Twitch
    asyncio.create_task(start_tracker_loop())


# Настройка CORS
frontend_url = os.getenv("FRONTEND_URL", "*") # В идеале указать конкретный URL в Render
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url] if frontend_url != "*" else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency для получения сессии БД
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class SuggestionCreate(BaseModel):
    content: str
    init_data: str # Для валидации



import urllib.parse

def verify_telegram_auth(init_data: str):
    # Валидация init_data от Telegram
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    if not token:
        print("ERROR: TELEGRAM_BOT_TOKEN is not set!")
        return False
    if not init_data:
        print("DEBUG: init_data is empty")
        return False
    
    try:
        # Используем parse_qsl для корректной обработки URL-кодированных параметров
        params = dict(urllib.parse.parse_qsl(init_data))
        if "hash" not in params:
            print("DEBUG: 'hash' not found in init_data")
            return False
            
        hash_val = params.pop("hash")
        # Формируем строку проверки согласно документации Telegram
        data_check_string = "\n".join(f"{k}={v}" for k, v in sorted(params.items()))
        
        # Расчет HMAC-SHA256
        secret_key = hmac.new(b"WebAppData", token.encode(), hashlib.sha256).digest()
        calculated_hash = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()
        
        if calculated_hash != hash_val:
            print(f"DEBUG: Hash mismatch! Calc: {calculated_hash}, Recv: {hash_val}")
            return False
            
        return True
    except Exception as e:
        print(f"ERROR: Exception in verify_telegram_auth: {str(e)}")
        return False

@app.get("/")
async def root():
    return {"status": "ok", "service": "Akimary Hub API"}



@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.post("/suggestions")
async def create_suggestion(suggestion: SuggestionCreate, db: Session = Depends(get_db)):
    if not verify_telegram_auth(suggestion.init_data):
        raise HTTPException(status_code=401, detail="Invalid auth")
    
    # Извлечение user_id и username из init_data
    try:
        params = dict(item.split("=") for item in suggestion.init_data.split("&"))
        # В init_data user обычно лежит в ключе user в формате JSON
        # Но простейший способ достать из initData - это распарсить user
        import json
        import urllib.parse
        user_data_raw = urllib.parse.unquote(params.get("user", "{}"))
        user_data = json.loads(user_data_raw)
        
        user_id = user_data.get("id")
        username = user_data.get("username") or user_data.get("first_name", "Unknown")
        
        if not user_id:
            raise HTTPException(status_code=400, detail="User ID not found")
            
        new_suggestion = Suggestion(
            user_id=user_id,
            username=username,
            content=suggestion.content
        )
        db.add(new_suggestion)
        db.commit()
        return {"status": "ok"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/suggestions")
async def list_suggestions(init_data: str = Header(None), db: Session = Depends(get_db)):
    if not init_data or not verify_telegram_auth(init_data):
        raise HTTPException(status_code=401, detail="Invalid auth")
        
    try:
        import json
        import urllib.parse
        params = dict(item.split("=") for item in init_data.split("&"))
        user_data_raw = urllib.parse.unquote(params.get("user", "{}"))
        user_data = json.loads(user_data_raw)
        user_id = user_data.get("id")
        
        if user_id not in ADMIN_IDS:
            raise HTTPException(status_code=403, detail="Access denied")
            
        suggestions = db.query(Suggestion).order_by(Suggestion.created_at.desc()).all()
        return suggestions
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
