from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from contextlib import asynccontextmanager

from database import init_db
from routers import predict, history, signs, history_stats, camera_history, history_verify


MODEL_PATH = Path("models/best.pt")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load YOLO model on startup."""
    init_db()

    if not MODEL_PATH.exists():
        print(f"[WARNING] Model tidak ditemukan di {MODEL_PATH}. Inferensi tidak akan berfungsi.")
        predict.set_model(None)
    else:
        try:
            import torch
            # Limit PyTorch threads to 1 to drastically reduce RAM usage on 512MB instances
            torch.set_num_threads(1)
            
            from ultralytics import YOLO
            print(f"[INFO] Memuat model dari {MODEL_PATH} ...")
            model = YOLO(str(MODEL_PATH))
            predict.set_model(model)
            print(f"[INFO] Model berhasil dimuat. Kelas: {list(model.names.values())}")
        except Exception as e:
            print(f"[ERROR] Gagal memuat model: {e}")
            predict.set_model(None)

    yield

    # Cleanup
    print("[INFO] Server shutdown.")


app = FastAPI(
    title="Sistem Deteksi Rambu Lalu Lintas Indonesia",
    description="API untuk deteksi dan klasifikasi rambu lalu lintas menggunakan YOLOv8",
    version="1.0.0",
    lifespan=lifespan
)

# CORS — allow all origins for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(predict.router)
app.include_router(history_stats.router)
app.include_router(history.router)
app.include_router(signs.router)
app.include_router(camera_history.router)
app.include_router(history_verify.router)

# Serve result videos
results_dir = Path("results")
results_dir.mkdir(exist_ok=True)


@app.get("/health")
def health_check():
    model_loaded = predict._model is not None
    return {
        "status": "ok",
        "model_loaded": model_loaded,
        "model_classes": list(predict._model.names.values()) if model_loaded else []
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
