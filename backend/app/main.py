from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import auth, incidents

# Автоматически создаем таблицы в БД при старте (если они еще не созданы DDL)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Railway Safety API",
    description="Оперативный мониторинг инцидентов Ж/Д безопасности",
    version="1.0.0"
)

# Разрешаем запросы от будущего фронтенда на Vite
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1")
app.include_router(incidents.router, prefix="/api/v1")

@app.get("/health", tags=["Служебные"])
def health_check():
    return {"status": "ok", "service": "railway_safety_backend"}
