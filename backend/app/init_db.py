import os
from app.database import SessionLocal
from app.models.user import User
from app.models.incident import RailwayObject
from app.core.security import hash_password

def init_db():
    db = SessionLocal()
    try:
        # 1. Проверяем наличие станции по коду или по id
        station = db.query(RailwayObject).filter(
            (RailwayObject.id == 1) | (RailwayObject.code == "NSK-01")
        ).first()

        if not station:
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
            print("[DB-INIT] Станция NSK-01 создана (id=1).")
        else:
            # Если станция была создана под другим id, выравниваем на 1
            if station.id != 1:
                station.id = 1
                db.commit()
            print(f"[DB-INIT] Опорная станция найдена (id={station.id}).")

        # 2. Проверяем и создаем суперпользователя
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
            print(f"[DB-INIT] Администратор {admin_email} создан.")
        else:
            print(f"[DB-INIT] Администратор {admin_email} активен.")
    except Exception as e:
        db.rollback()
        print(f"[DB-INIT] Ошибка инициализации: {e}")
    finally:
        db.close()
