import os
import tempfile
from io import BytesIO
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile
from PIL import Image, UnidentifiedImageError

router = APIRouter()
MAX_IMAGE_BYTES = 12 * 1024 * 1024
ALLOWED_FORMATS = {"JPEG", "PNG", "WEBP"}


@router.get("/model/status")
def model_status():
    model_path = Path(os.getenv("ROAD_DAMAGE_MODEL_PATH", "models/road_damage/best.pt"))
    return {
        "provider": "ultralytics-yolo",
        "configured": model_path.is_file(),
        "weights_path": str(model_path),
        "message": "Model weights available." if model_path.is_file()
        else "No trained weights found. Train a model and set ROAD_DAMAGE_MODEL_PATH.",
    }


@router.post("/inspections/analyze")
async def analyze_road_image(image: UploadFile = File(...)):
    model_path = Path(os.getenv("ROAD_DAMAGE_MODEL_PATH", "models/road_damage/best.pt"))
    if not model_path.is_file():
        raise HTTPException(status_code=503, detail="Road-damage model is not trained or configured. Follow backend/training/README.md, then set ROAD_DAMAGE_MODEL_PATH.")
    payload = await image.read(MAX_IMAGE_BYTES + 1)
    if not payload or len(payload) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=413, detail="Image must be non-empty and no larger than 12 MB.")
    try:
        with Image.open(BytesIO(payload)) as img:
            if img.format not in ALLOWED_FORMATS:
                raise HTTPException(status_code=415, detail="Only JPEG, PNG, and WEBP images are supported.")
            img.verify()
    except UnidentifiedImageError:
        raise HTTPException(status_code=415, detail="Uploaded file is not a valid image.")
    try:
        from ultralytics import YOLO
    except ImportError:
        raise HTTPException(status_code=503, detail="Inference dependencies are missing. Install backend/requirements.txt.")
    try:
        with tempfile.NamedTemporaryFile(suffix=".jpg") as temp:
            with Image.open(BytesIO(payload)) as img:
                img.convert("RGB").save(temp.name, format="JPEG")
            model = YOLO(str(model_path))
            result = model.predict(source=temp.name, conf=0.25, iou=0.45, verbose=False)[0]
            names = result.names
            detections = []
            if result.boxes is not None:
                for box in result.boxes:
                    class_id = int(box.cls.item())
                    detections.append({
                        "class_id": class_id,
                        "class_name": str(names.get(class_id, class_id)),
                        "confidence": round(float(box.conf.item()), 4),
                        "bbox_xyxy": [round(float(v), 2) for v in box.xyxy[0].tolist()],
                    })
            return {
                "status": "completed",
                "model": model_path.name,
                "image": {"filename": image.filename, "width": int(result.orig_shape[1]), "height": int(result.orig_shape[0])},
                "detection_count": len(detections),
                "detections": detections,
                "note": "Model outputs require human verification before creating an incident.",
            }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Inference failed: {type(exc).__name__}. Check model weights and server logs.")
