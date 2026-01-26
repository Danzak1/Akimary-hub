from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
import os
import hmac
import hashlib
import time
from dotenv import load_dotenv
from database import get_db, Subscriber as DBSubscriber

load_dotenv()

app = FastAPI(title="Akimary Hub API")

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # В продакшне стоит ограничить
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SubscriberRequest(BaseModel):
    email: EmailStr

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

@app.post("/subscribe")
async def subscribe(req: SubscriberRequest, db: Session = Depends(get_db)):
    # Проверяем, существует ли уже такой email
    existing = db.query(DBSubscriber).filter(DBSubscriber.email == req.email).first()
    if existing:
        return {"status": "already_subscribed", "message": "Вы уже подписаны!"}
    
    new_sub = DBSubscriber(email=req.email)
    db.add(new_sub)
    db.commit()
    
    return {"status": "success", "message": "Подписка оформлена!"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
