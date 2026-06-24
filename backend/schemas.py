from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class BBox(BaseModel):
    x1: float
    y1: float
    x2: float
    y2: float


class Detection(BaseModel):
    class_name: str
    confidence: float
    bbox: List[float]
    category: Optional[str] = None
    description: Optional[str] = None
    function: Optional[str] = None
    rules: Optional[str] = None
    image: Optional[str] = None


class PredictResponse(BaseModel):
    detections: List[Detection]
    annotated_image: Optional[str] = None  # base64 encoded
    total_detections: int
    processing_time_ms: float


class HistoryItem(BaseModel):
    id: int
    class_name: str
    confidence: float
    bbox: Optional[str]
    source: str
    image_path: Optional[str]
    created_at: datetime
    is_success: Optional[bool] = None

    class Config:
        from_attributes = True


class TrafficSign(BaseModel):
    id: str
    yolo_index: Optional[int] = None
    name: str
    category: str
    description: str
    function: Optional[str] = None
    rules: Optional[str] = None
    image: Optional[str] = None
    regulation: Optional[str] = None
