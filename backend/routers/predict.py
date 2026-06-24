import os
import json
import base64
import time
import uuid
from io import BytesIO
from pathlib import Path
from typing import List

import cv2
import numpy as np
from PIL import Image
from fastapi import APIRouter, File, UploadFile, Depends, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from database import get_db, DetectionHistory
from schemas import Detection, PredictResponse

router = APIRouter(prefix="/predict", tags=["predict"])

# Model will be injected from main.py via app.state
_model = None

with open("traffic_signs.json", "r", encoding="utf-8") as f:
    TRAFFIC_SIGNS_DB = json.load(f)

# Buat kamus (dictionary) berdasarkan yolo_index sebagai Source of Truth
TRAFFIC_SIGNS_MAP = {item.get("yolo_index"): item for item in TRAFFIC_SIGNS_DB if "yolo_index" in item}


def get_model():
    if _model is None:
        raise HTTPException(status_code=503, detail="Model belum dimuat. Coba lagi beberapa saat.")
    return _model


def set_model(model):
    global _model
    _model = model


RESULTS_DIR = Path("results")
RESULTS_DIR.mkdir(exist_ok=True)


def run_inference(model, image: np.ndarray, conf_threshold: float = 0.25):
    """Run YOLO inference on a numpy image array."""
    results = model(image, conf=conf_threshold, verbose=False)
    detections = []

    for result in results:
        boxes = result.boxes
        if boxes is None:
            continue
        for box in boxes:
            cls_id = int(box.cls[0])
            confidence = float(box.conf[0])
            bbox = box.xyxy[0].tolist()
            raw_class_name = model.names.get(cls_id, f"class_{cls_id}")
            
            # Point 11: Validasi debugging
            print(f"[DEBUG] Output Asli Model -> Index YOLO: {cls_id}, Class String: '{raw_class_name}', Conf: {confidence:.2f}")

            if cls_id in TRAFFIC_SIGNS_MAP:
                mapped_name = TRAFFIC_SIGNS_MAP[cls_id]["name"]
                description = TRAFFIC_SIGNS_MAP[cls_id]["description"]
                category = TRAFFIC_SIGNS_MAP[cls_id]["category"]
                function = TRAFFIC_SIGNS_MAP[cls_id].get("function")
                rules = TRAFFIC_SIGNS_MAP[cls_id].get("rules")
                image_url = TRAFFIC_SIGNS_MAP[cls_id]["image"]
            else:
                mapped_name = "Rambu Tidak Dikenali"
                description = "Deskripsi tidak tersedia."
                category = "Unknown"
                function = None
                rules = None
                image_url = None

            print(f"[DEBUG] Mapping Berhasil -> {mapped_name}")

            detections.append(Detection(
                class_name=mapped_name,
                confidence=round(confidence, 4),
                bbox=[round(b, 2) for b in bbox],
                category=category,
                description=description,
                function=function,
                rules=rules,
                image=image_url
            ))

    return detections


def annotate_image(image: np.ndarray, detections: List[Detection]) -> np.ndarray:
    """Draw bounding boxes on image."""
    annotated = image.copy()
    for det in detections:
        x1, y1, x2, y2 = [int(b) for b in det.bbox]
        color = (17, 17, 17)  # Dark #111111
        cv2.rectangle(annotated, (x1, y1), (x2, y2), color, 2)
        label = f"{det.class_name} {det.confidence:.0%}"
        (tw, th), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
        cv2.rectangle(annotated, (x1, y1 - th - 8), (x1 + tw + 6, y1), color, -1)
        cv2.putText(annotated, label, (x1 + 3, y1 - 4),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1, cv2.LINE_AA)
    return annotated


def image_to_base64(image: np.ndarray) -> str:
    """Convert numpy BGR image to base64 JPEG string."""
    _, buffer = cv2.imencode(".jpg", image, [cv2.IMWRITE_JPEG_QUALITY, 90])
    return base64.b64encode(buffer).decode("utf-8")


def save_detection_history(db: Session, detections: List[Detection], source: str, image_path: str = None):
    """Save detections to SQLite history."""
    for det in detections:
        record = DetectionHistory(
            class_name=det.class_name,
            confidence=det.confidence,
            bbox=json.dumps(det.bbox),
            source=source,
            image_path=image_path
        )
        db.add(record)
    db.commit()


# ──────────────────────────────────────────────────────────────────────────────
# POST /predict/image
# ──────────────────────────────────────────────────────────────────────────────
@router.post("/image", response_model=PredictResponse)
async def predict_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=422, detail="File harus berupa gambar (JPEG, PNG, WebP).")

    start = time.time()

    try:
        content = await file.read()
        pil_image = Image.open(BytesIO(content)).convert("RGB")
        image_np = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)
    except Exception:
        raise HTTPException(status_code=422, detail="Gagal memproses gambar. Pastikan file tidak rusak.")

    model = get_model()

    try:
        detections = run_inference(model, image_np)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inferensi gagal: {str(e)}")

    annotated = annotate_image(image_np, detections)
    annotated_b64 = image_to_base64(annotated)
    processing_time = (time.time() - start) * 1000

    # Save history
    save_detection_history(db, detections, source="image")

    return PredictResponse(
        detections=detections,
        annotated_image=annotated_b64,
        total_detections=len(detections),
        processing_time_ms=round(processing_time, 1)
    )


# ──────────────────────────────────────────────────────────────────────────────
# POST /predict/video
# ──────────────────────────────────────────────────────────────────────────────
@router.post("/video")
async def predict_video(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    if not file.content_type.startswith("video/"):
        raise HTTPException(status_code=422, detail="File harus berupa video (MP4, AVI, MOV).")

    model = get_model()

    # Save uploaded video
    video_id = str(uuid.uuid4())[:8]
    input_path = RESULTS_DIR / f"input_{video_id}.mp4"
    output_path = RESULTS_DIR / f"output_{video_id}.mp4"

    try:
        content = await file.read()
        with open(input_path, "wb") as f:
            f.write(content)
    except Exception:
        raise HTTPException(status_code=500, detail="Gagal menyimpan video.")

    try:
        cap = cv2.VideoCapture(str(input_path))
        if not cap.isOpened():
            raise HTTPException(status_code=422, detail="Video tidak dapat dibuka. Pastikan format didukung.")

        fps = cap.get(cv2.CAP_PROP_FPS) or 25
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

        # Gunakan codec 'avc1' (H.264) agar video hasil anotasi bisa langsung diputar di browser.
        # Jika sistem tidak mendukung 'avc1', fallback ke 'mp4v'.
        fourcc = cv2.VideoWriter_fourcc(*"avc1")
        out = cv2.VideoWriter(str(output_path), fourcc, fps, (width, height))
        if not out.isOpened():
            print("[WARNING] Codec avc1 tidak didukung, menggunakan fallback mp4v.")
            fourcc = cv2.VideoWriter_fourcc(*"mp4v")
            out = cv2.VideoWriter(str(output_path), fourcc, fps, (width, height))

        all_detections = []
        frame_count = 0
        process_every = max(1, int(fps // 5))  # Process 5 frames/sec max
        last_detections = []

        while True:
            ret, frame = cap.read()
            if not ret:
                break
            frame_count += 1
            
            # Jalankan deteksi hanya pada frame pertama dan setiap interval frame_skip
            if frame_count == 1 or frame_count % process_every == 0:
                last_detections = run_inference(model, frame)
                all_detections.extend(last_detections)
            
            # Gambar bounding box di setiap frame (menggunakan deteksi terakhir) agar tidak berkedip
            if last_detections:
                frame = annotate_image(frame, last_detections)
                
            out.write(frame)

        cap.release()
        out.release()

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pemrosesan video gagal: {str(e)}")
    finally:
        if input_path.exists():
            os.remove(input_path)

    # Save history (unique class names only)
    seen = set()
    unique_detections = []
    for d in all_detections:
        if d.class_name not in seen:
            seen.add(d.class_name)
            unique_detections.append(d)
    save_detection_history(db, unique_detections, source="video")

    unique_detections_list = [
        {
            "class_name": d.class_name,
            "confidence": d.confidence,
            "bbox": d.bbox,
            "category": d.category,
            "description": d.description,
            "function": d.function,
            "rules": d.rules,
            "image": d.image
        }
        for d in unique_detections
    ]

    return {
        "video_id": video_id,
        "output_url": f"/predict/video/result/{video_id}",
        "total_frames": total_frames,
        "total_detections": len(all_detections),
        "unique_classes": list(seen),
        "unique_detections": unique_detections_list,
        "processing_time_ms": 0
    }


@router.get("/video/result/{video_id}")
async def get_video_result(video_id: str):
    output_path = RESULTS_DIR / f"output_{video_id}.mp4"
    if not output_path.exists():
        raise HTTPException(status_code=404, detail="Video hasil tidak ditemukan.")
    return FileResponse(str(output_path), media_type="video/mp4")


# ──────────────────────────────────────────────────────────────────────────────
# WebSocket /ws/camera
# ──────────────────────────────────────────────────────────────────────────────
@router.websocket("/ws/camera")
async def websocket_camera(websocket: WebSocket):
    await websocket.accept()
    model = get_model()

    try:
        while True:
            data = await websocket.receive_text()
            msg = json.loads(data)

            if msg.get("type") != "frame":
                continue

            frame_b64 = msg.get("data", "")
            if not frame_b64:
                continue

            try:
                # Decode base64 frame
                img_data = base64.b64decode(frame_b64)
                pil_img = Image.open(BytesIO(img_data)).convert("RGB")
                image_np = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)

                detections = run_inference(model, image_np, conf_threshold=0.30)

                await websocket.send_text(json.dumps({
                    "type": "detections",
                    "detections": [
                        {
                            "class_name": d.class_name,
                            "confidence": d.confidence,
                            "bbox": d.bbox,
                            "description": getattr(d, "description", None)
                        } for d in detections
                    ]
                }))
            except Exception as e:
                await websocket.send_text(json.dumps({
                    "type": "error",
                    "message": str(e)
                }))

    except WebSocketDisconnect:
        pass
