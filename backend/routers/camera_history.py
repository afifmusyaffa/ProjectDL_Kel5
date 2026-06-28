"""
Router untuk menyimpan hasil deteksi kamera ke history.

Endpoint ini dipakai oleh tombol "Simpan Deteksi" di halaman kamera.
Tidak mengubah WebSocket existing — hanya menerima POST snapshot manual.
"""

from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db, DetectionHistory, SUCCESS_THRESHOLD

router = APIRouter(prefix="/history", tags=["history"])


# ── Request body schemas ─────────────────────────────────────────────────────

class CameraDetectionItem(BaseModel):
    label: str
    confidence: float


class SaveCameraRequest(BaseModel):
    detections: List[CameraDetectionItem]
    source_type: str = "camera"  # kept for frontend clarity; stored as "camera"


# ── POST /history/save-camera ────────────────────────────────────────────────

@router.post("/save-camera")
def save_camera_detections(
    body: SaveCameraRequest,
    db: Session = Depends(get_db),
):
    """Simpan snapshot deteksi kamera ke tabel history.

    Setiap item dalam array `detections` di-insert sebagai satu record,
    konsisten dengan pola `save_detection_history` di predict.py.
    """
    now = datetime.utcnow()
    records = []

    for det in body.detections:
        record = DetectionHistory(
            class_name=det.label,
            confidence=det.confidence,
            bbox=None,            # kamera realtime — bbox tidak disimpan
            source="camera",      # konsisten dengan "image" / "video"
            image_path=None,
            created_at=now,
            is_success=det.confidence >= SUCCESS_THRESHOLD,
        )
        db.add(record)
        records.append(record)

    db.commit()

    return {
        "message": "Deteksi kamera berhasil disimpan.",
        "saved_count": len(records),
        "saved_ids": [r.id for r in records],
    }
