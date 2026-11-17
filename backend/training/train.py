"""Train a YOLO road-damage detector from an annotated YOLO-format dataset."""
import argparse
from pathlib import Path
from ultralytics import YOLO


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", default="training/data.yaml")
    parser.add_argument("--model", default="yolo11n.pt")
    parser.add_argument("--epochs", type=int, default=100)
    parser.add_argument("--imgsz", type=int, default=640)
    parser.add_argument("--batch", type=int, default=8)
    parser.add_argument("--device", default=None, help="Examples: 0 or cpu")
    parser.add_argument("--project", default="runs/roadguard")
    parser.add_argument("--name", default="road-damage")
    args = parser.parse_args()
    if not Path(args.data).exists():
        raise SystemExit(f"Dataset YAML not found: {args.data}. Read training/README.md.")
    model = YOLO(args.model)
    result = model.train(data=args.data, epochs=args.epochs, imgsz=args.imgsz,
                         batch=args.batch, device=args.device,
                         project=args.project, name=args.name, patience=25)
    best = Path(result.save_dir) / "weights" / "best.pt"
    print(f"Training complete. Best weights: {best.resolve()}")
    print("Evaluate on a held-out test set before production use.")


if __name__ == "__main__":
    main()
