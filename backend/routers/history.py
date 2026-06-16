from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional

from database import get_db, DetectionHistory
from schemas import HistoryItem

router = APIRouter(prefix="/history", tags=["history"])


@router.get("", response_model=List[HistoryItem])
def get_history(
    db: Session = Depends(get_db),
    limit: int = Query(default=100, le=500),
    source: Optional[str] = Query(default=None),
    class_name: Optional[str] = Query(default=None)
):
    query = db.query(DetectionHistory).order_by(desc(DetectionHistory.created_at))

    if source:
        query = query.filter(DetectionHistory.source == source)
    if class_name:
        query = query.filter(DetectionHistory.class_name.ilike(f"%{class_name}%"))

    return query.limit(limit).all()


@router.delete("/{item_id}")
def delete_history_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(DetectionHistory).filter(DetectionHistory.id == item_id).first()
    if not item:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Riwayat tidak ditemukan.")
    db.delete(item)
    db.commit()
    return {"message": "Riwayat berhasil dihapus."}


@router.delete("")
def clear_all_history(db: Session = Depends(get_db)):
    db.query(DetectionHistory).delete()
    db.commit()
    return {"message": "Seluruh riwayat berhasil dihapus."}
