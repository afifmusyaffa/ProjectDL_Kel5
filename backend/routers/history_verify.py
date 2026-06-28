"""
Router untuk verifikasi manual hasil deteksi oleh user.

Endpoint PATCH /history/verify menerima array verifikasi dan
mengupdate kolom is_verified, is_correct, corrected_label
di tabel detection_history.
"""

from typing import List, Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db, DetectionHistory

router = APIRouter(prefix="/history", tags=["history-verify"])


# ── Request body schemas ─────────────────────────────────────────────────────

class VerificationItem(BaseModel):
    id: int
    is_correct: bool
    corrected_label: Optional[str] = None


class VerifyRequest(BaseModel):
    verifications: List[VerificationItem]


# ── PATCH /history/verify ────────────────────────────────────────────────────

@router.patch("/verify")
def verify_detections(
    body: VerifyRequest,
    db: Session = Depends(get_db),
):
    """Verifikasi manual hasil deteksi.

    Setiap item dalam array `verifications` mengupdate satu record:
    - is_verified = True
    - is_correct = nilai dari request
    - corrected_label = nilai dari request (None jika is_correct = True)
    """
    updated = 0

    for v in body.verifications:
        record = db.query(DetectionHistory).filter(
            DetectionHistory.id == v.id
        ).first()

        if record is None:
            # ID tidak ditemukan — skip, jangan error keseluruhan
            continue

        record.is_verified = True
        record.is_correct = v.is_correct
        record.corrected_label = v.corrected_label if not v.is_correct else None
        updated += 1

    db.commit()

    return {
        "updated": updated,
        "message": f"{updated} deteksi berhasil diverifikasi.",
    }
