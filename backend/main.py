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



@app.get("/health")
async def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
