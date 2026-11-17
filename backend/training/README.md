# ROADGUARD AI — road damage model training

The repository includes a real Ultralytics YOLO inference endpoint and a reproducible training entry point. **It does not include trained weights or claim that a model has already been trained.**

## 1. Prepare an annotated dataset

Use a road-damage dataset with bounding-box annotations in YOLO format. The default class mapping in `data.yaml` is:

| ID | Class |
|---|---|
| 0 | longitudinal_crack |
| 1 | transverse_crack |
| 2 | alligator_crack |
| 3 | pothole |

If your dataset uses different labels or IDs, update `data.yaml` and ensure labels are converted to YOLO detection format. Keep train, validation, and test sets separate.

Expected structure:

```
backend/training/datasets/road-damage/
  images/{train,val,test}/
  labels/{train,val,test}/
```

## 2. Install dependencies and train

From the `backend` directory:

```bash
pip install -r requirements.txt
python training/train.py --data training/data.yaml --model yolo11n.pt --epochs 100 --imgsz 640 --batch 8
```

For a machine without a supported GPU, use `--device cpu` and a smaller batch. Training time depends on hardware and dataset size. The script prints the location of `best.pt`.

## 3. Configure inference

Set `ROAD_DAMAGE_MODEL_PATH=/absolute/path/to/best.pt` in the API environment and restart FastAPI. Check `GET /api/v1/model/status` to confirm the weights file exists.

## 4. API

- `GET /api/v1/model/status`
- `POST /api/v1/inspections/analyze` — multipart field named `image`; returns class, confidence and pixel bounding boxes.

The endpoint returns HTTP 503 when weights are not configured. It never substitutes mock predictions. The browser UI needs `NEXT_PUBLIC_API_BASE_URL` set to the deployed FastAPI origin.

## 5. Validate before deployment

Evaluate on the held-out test set and record precision, recall, mAP50 and mAP50-95. Inspect false positives across lighting, weather, road materials, camera angles and geographic regions. A single image cannot reliably establish pothole depth. Treat detections as inspection leads, not engineering severity or repair decisions; require human review.

Do not publish accuracy claims until they come from a reproducible evaluation run.
