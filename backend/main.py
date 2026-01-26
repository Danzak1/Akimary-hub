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
from database import engine, Base
from twitch_tracker import start_tracker_loop, tracker

load_dotenv()

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

class AdminNotifyRequest(BaseModel):
    message: str
    admin_id: str

def verify_telegram_auth(init_data: str):
    # Валидация init_data от Telegram
    # Требуется BOT_TOKEN
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    if not token or not init_data:
        return False
    
    try:
        params = dict(item.split("=") for item in init_data.split("&"))
        hash_val = params.pop("hash")
        data_check_string = "\n".join(f"{k}={v}" for k, v in sorted(params.items()))
        
        secret_key = hmac.new(b"WebAppData", token.encode(), hashlib.sha256).digest()
        calculated_hash = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()
        
        return calculated_hash == hash_val
    except Exception:
        return False

@app.get("/")
async def root():
    return {"status": "ok", "service": "Akimary Hub API"}

@app.post("/admin/notify")
async def admin_notify(req: AdminNotifyRequest):
    # Строгая проверка Admin ID только из переменных окружения
    allowed_admin_id = os.getenv("ADMIN_TG_ID")
    
    if not allowed_admin_id or req.admin_id != allowed_admin_id:
        raise HTTPException(status_code=403, detail="Доступ запрещен: неверный ID или настройки сервера")
    
    # Формируем объект для отправки (имитируем структуру из twitch_tracker если нужно, 
    # либо вызываем напрямую метод отправки текста)
    try:
        # В twitch_tracker.py добавим метод для отправки простого текста
        success = await tracker.send_custom_notification(req.message)
        if success:
            return {"status": "success", "message": "Уведомление отправлено!"}
        else:
            return {"status": "error", "message": "Ошибка при отправке"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
