@echo off
echo Starting Akimary Hub...

:: Запуск бэкенда в новом окне
start cmd /k "cd backend && venv\Scripts\activate && pip install fastapi uvicorn pydantic python-dotenv sqlalchemy httpx && uvicorn main:app --reload --port 8000"


:: Запуск фронтенда в новом окне
start cmd /k "cd frontend && npm install && npm run dev"

echo Backend and Frontend are starting.
echo Backend: http://127.0.0.1:8000
echo Frontend: http://localhost:5173
pause
