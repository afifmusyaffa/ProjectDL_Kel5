from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db, DetectionHistory, SUCCESS_THRESHOLD

router = APIRouter(prefix="/history", tags=["history-stats"])

# Baseline performa model dari hasil validasi Ultralytics
MODEL_BASELINE = {
    "mAP50": 98.5,
    "mAP50_95": 82.0,
    "precision": 98.2,
    "recall": 95.8,
    "val_images": 126,
    "val_instances": 135,
    "num_classes": 21,
}


@router.get("/stats")
def get_history_stats(db: Session = Depends(get_db)):
    """
    Mengembalikan statistik agregat dari seluruh riwayat deteksi:
    - Model baseline (dari validasi)
    - Overall: total, sukses, gagal, success rate, avg confidence
    - Per sumber (image, video, camera)
    - Top 5 rambu terdeteksi
    - Distribusi confidence (very_high, high, medium, low)
    """

    # ── Overall Stats ─────────────────────────────────────────────
    total = db.query(func.count(DetectionHistory.id)).scalar() or 0

    if total == 0:
        return {
            "model_baseline": MODEL_BASELINE,
            "overall": {
                "total": 0,
                "success": 0,
                "failed": 0,
                "success_rate": 0.0,
                "avg_confidence": 0.0,
            },
            "by_source": {},
            "top_labels": [],
            "confidence_distribution": {
                "very_high": 0,
                "high": 0,
                "medium": 0,
                "low": 0,
            },
        }

    success = (
        db.query(func.count(DetectionHistory.id))
        .filter(DetectionHistory.confidence >= SUCCESS_THRESHOLD)
        .scalar()
        or 0
    )
    failed = total - success
    avg_confidence = (
        db.query(func.avg(DetectionHistory.confidence)).scalar() or 0.0
    )
    success_rate = (success / total * 100) if total > 0 else 0.0

    # ── Per-Source Stats ──────────────────────────────────────────
    sources = ["image", "video", "camera"]
    by_source = {}
    for src in sources:
        src_total = (
            db.query(func.count(DetectionHistory.id))
            .filter(DetectionHistory.source == src)
            .scalar()
            or 0
        )
        if src_total == 0:
            by_source[src] = {
                "total": 0,
                "success": 0,
                "failed": 0,
                "avg_confidence": 0.0,
            }
            continue

        src_success = (
            db.query(func.count(DetectionHistory.id))
            .filter(
                DetectionHistory.source == src,
                DetectionHistory.confidence >= SUCCESS_THRESHOLD,
            )
            .scalar()
            or 0
        )
        src_avg = (
            db.query(func.avg(DetectionHistory.confidence))
            .filter(DetectionHistory.source == src)
            .scalar()
            or 0.0
        )
        by_source[src] = {
            "total": src_total,
            "success": src_success,
            "failed": src_total - src_success,
            "avg_confidence": round(float(src_avg), 4),
        }

    # ── Top 5 Labels ─────────────────────────────────────────────
    top_labels_query = (
        db.query(
            DetectionHistory.class_name,
            func.count(DetectionHistory.id).label("count"),
            func.avg(DetectionHistory.confidence).label("avg_conf"),
        )
        .group_by(DetectionHistory.class_name)
        .order_by(func.count(DetectionHistory.id).desc())
        .limit(5)
        .all()
    )

    top_labels = [
        {
            "label": row[0],
            "count": row[1],
            "avg_confidence": round(float(row[2]), 4),
        }
        for row in top_labels_query
    ]

    # ── Confidence Distribution ──────────────────────────────────
    very_high = (
        db.query(func.count(DetectionHistory.id))
        .filter(DetectionHistory.confidence >= 0.90)
        .scalar()
        or 0
    )
    high = (
        db.query(func.count(DetectionHistory.id))
        .filter(
            DetectionHistory.confidence >= 0.70,
            DetectionHistory.confidence < 0.90,
        )
        .scalar()
        or 0
    )
    medium = (
        db.query(func.count(DetectionHistory.id))
        .filter(
            DetectionHistory.confidence >= 0.50,
            DetectionHistory.confidence < 0.70,
        )
        .scalar()
        or 0
    )
    low = (
        db.query(func.count(DetectionHistory.id))
        .filter(DetectionHistory.confidence < 0.50)
        .scalar()
        or 0
    )

    return {
        "model_baseline": MODEL_BASELINE,
        "overall": {
            "total": total,
            "success": success,
            "failed": failed,
            "success_rate": round(success_rate, 1),
            "avg_confidence": round(float(avg_confidence), 4),
        },
        "by_source": by_source,
        "top_labels": top_labels,
        "confidence_distribution": {
            "very_high": very_high,
            "high": high,
            "medium": medium,
            "low": low,
        },
    }
