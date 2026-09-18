from app.database import SessionLocal
from app.models.user import User
from app.models.incident import RailwayObject
from app.core.security import hash_password
import os

def init_db():
    db = SessionLocal()
    try:
        # 1. Проверяем и создаем опорную узловую станцию
        default_station = db.query(RailwayObject).filter(RailwayObject.id == 1).first()
        if not default_station:
            station = RailwayObject(
                id=1,
                code="NSK-01",
                name="Новосибирск-Главный",
                object_type="station",
                railway_line="Транссибирская магистраль",
                latitude=55.0354,
                longitude=82.8992,
            )
            db.add(station)
            db.commit()
            print("[DB-INIT] Опорная станция Новосибирск-Главный инициализирована (id=1).")

        # 2. Создаем администратора из переменных окружения
        admin_email = os.getenv("ADMIN_EMAIL", "admin@railway.ru")
        admin_pass = os.getenv("ADMIN_PASSWORD", "admin123")

        admin = db.query(User).filter(User.email == admin_email).first()
        if not admin:
            new_admin = User(
                email=admin_email,
                password_hash=hash_password(admin_pass),
                full_name="Главный Диспетчер Безопасности",
                role="admin",
                is_active=True,
            )
            db.add(new_admin)
            db.commit()
            print(f"[DB-INIT] Создана учетная запись суперпользователя: {admin_email}")
        else:
            print(f"[DB-INIT] Суперпользователь {admin_email} уже активен.")
    finally:
        db.close()
