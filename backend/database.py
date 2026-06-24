from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, Boolean, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from datetime import datetime

DATABASE_URL = "sqlite:///./detection_history.db"

# Threshold untuk menentukan deteksi sukses vs gagal
SUCCESS_THRESHOLD = 0.70

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    pass


class DetectionHistory(Base):
    __tablename__ = "detection_history"

    id = Column(Integer, primary_key=True, index=True)
    class_name = Column(String, nullable=False)
    confidence = Column(Float, nullable=False)
    bbox = Column(Text, nullable=True)  # JSON string
    source = Column(String, default="image")  # image, video, camera
    image_path = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_success = Column(Boolean, default=False)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    Base.metadata.create_all(bind=engine)
    _migrate_is_success()


def _migrate_is_success():
    """Safely add is_success column to existing database and backfill."""
    with engine.connect() as conn:
        # Check if column already exists
        try:
            conn.execute(text("SELECT is_success FROM detection_history LIMIT 1"))
        except Exception:
            # Column doesn't exist — add it
            conn.execute(text(
                "ALTER TABLE detection_history ADD COLUMN is_success BOOLEAN DEFAULT 0"
            ))
            # Backfill existing records based on confidence threshold
            conn.execute(text(
                f"UPDATE detection_history SET is_success = CASE "
                f"WHEN confidence >= {SUCCESS_THRESHOLD} THEN 1 ELSE 0 END"
            ))
            conn.commit()
            print("[MIGRATION] Kolom is_success berhasil ditambahkan dan di-backfill.")
