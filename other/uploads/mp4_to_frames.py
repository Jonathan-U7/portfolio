#!/usr/bin/env python3
"""
mp4_to_frames.py — Extracts every frame from an MP4 (or any video) into a folder.

Usage:
    python mp4_to_frames.py video.mp4
    python mp4_to_frames.py video.mp4 --output my_frames
    python mp4_to_frames.py video.mp4 --format png --quality 95
    python mp4_to_frames.py video.mp4 --fps 1        # 1 frame per second instead of all frames

Dependencies:
    pip install opencv-python
"""

import argparse
import sys
from pathlib import Path


def extract_frames(
    video_path: Path,
    output_dir: Path,
    fmt: str = "jpg",
    quality: int = 95,
    fps: float | None = None,
) -> int:
    try:
        import cv2
    except ImportError:
        print("ERROR: opencv-python is not installed. Run: pip install opencv-python")
        sys.exit(1)

    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        print(f"ERROR: Cannot open video file: {video_path}")
        sys.exit(1)

    video_fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    duration = total_frames / video_fps if video_fps > 0 else 0

    print(f"Video : {video_path.name}")
    print(f"Size  : {width}x{height}  |  FPS: {video_fps:.2f}  |  Duration: {duration:.1f}s  |  Frames: {total_frames}")

    # Determine how many source frames to skip between saves
    frame_interval = 1
    if fps is not None and fps > 0:
        frame_interval = max(1, round(video_fps / fps))
        print(f"Mode  : 1 frame every {frame_interval} source frames (~{fps} fps output)")
    else:
        print("Mode  : all frames")

    output_dir.mkdir(parents=True, exist_ok=True)

    # Encode params for JPEG quality or PNG compression
    encode_params = []
    if fmt.lower() in ("jpg", "jpeg"):
        encode_params = [cv2.IMWRITE_JPEG_QUALITY, quality]
    elif fmt.lower() == "png":
        # PNG compression 0-9; map quality 0-100 → 9-0
        png_compression = max(0, min(9, 9 - round(quality / 100 * 9)))
        encode_params = [cv2.IMWRITE_PNG_COMPRESSION, png_compression]

    digits = len(str(total_frames))
    saved = 0
    source_index = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        if source_index % frame_interval == 0:
            filename = output_dir / f"frame_{saved:0{digits}d}.{fmt}"
            cv2.imwrite(str(filename), frame, encode_params)
            saved += 1

            if saved % 100 == 0:
                print(f"  Saved {saved} frames...", end="\r")

        source_index += 1

    cap.release()
    print(f"\nDone  : {saved} frames saved to '{output_dir}/'")
    return saved


def main():
    parser = argparse.ArgumentParser(
        description="Extract frames from an MP4 (or any video) into a folder."
    )
    parser.add_argument("video", type=Path, help="Path to the input video file")
    parser.add_argument(
        "--output", "-o", type=Path, default=None,
        help="Output directory (default: <video_stem>_frames/)"
    )
    parser.add_argument(
        "--format", "-f", dest="fmt", default="jpg", choices=["jpg", "jpeg", "png"],
        help="Image format for saved frames (default: jpg)"
    )
    parser.add_argument(
        "--quality", "-q", type=int, default=95, metavar="0-100",
        help="JPEG quality / PNG quality hint, 0-100 (default: 95)"
    )
    parser.add_argument(
        "--fps", type=float, default=None,
        help="Frames per second to extract (default: all frames)"
    )
    args = parser.parse_args()

    video_path = args.video.resolve()
    if not video_path.exists():
        print(f"ERROR: File not found: {video_path}")
        sys.exit(1)

    output_dir = args.output or video_path.parent / f"{video_path.stem}_frames"

    extract_frames(
        video_path=video_path,
        output_dir=output_dir,
        fmt=args.fmt,
        quality=args.quality,
        fps=args.fps,
    )


if __name__ == "__main__":
    main()
