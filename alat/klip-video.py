"""Potong video Harinesia jadi MP4 kecil tanpa suara, buat diputar otomatis di hero.

    python alat/klip-video.py <ID YouTube atau file .mp4> <nama> [--mulai 0] [--durasi 6]

Tanpa --durasi, videonya diambil utuh. Hasilnya di assets/video/:
    <nama>.mp4                     360x640, 30 fps, tanpa suara
    <nama>-360.webp, <nama>-540.webp   poster (frame pertama), tampil sebelum videonya jalan

Butuh Python 3 dan tiga paket (cukup sekali, di folder mana saja):
    python -m venv .venv-alat
    .venv-alat/Scripts/python -m pip install yt-dlp imageio-ffmpeg pillow    (Windows)
    .venv-alat/bin/python -m pip install yt-dlp imageio-ffmpeg pillow        (Mac/Linux)
lalu jalankan skrip ini pakai python dari .venv-alat tadi.
"""
import argparse
import os
import subprocess
import tempfile

import imageio_ffmpeg
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()


def unduh(sumber, folder):
    if os.path.isfile(sumber):
        return sumber
    import yt_dlp

    opsi = {
        "format": "bv*[height<=1280][ext=mp4]/bv*[height<=1280]/b",
        "outtmpl": os.path.join(folder, "video.%(ext)s"),
        "quiet": True,
        "no_warnings": True,
        "ffmpeg_location": FFMPEG,
    }
    with yt_dlp.YoutubeDL(opsi) as ydl:
        info = ydl.extract_info(f"https://www.youtube.com/shorts/{sumber}", download=True)
        return ydl.prepare_filename(info)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("sumber", help="ID YouTube Shorts atau path file video")
    ap.add_argument("nama", help="nama file, mis. klip-pelangi -> assets/video/klip-pelangi.mp4")
    ap.add_argument("--mulai", type=float, default=0)
    ap.add_argument("--durasi", type=float)
    ap.add_argument("--crf", type=int, default=28)
    a = ap.parse_args()

    tujuan = os.path.join(ROOT, "assets", "video")
    os.makedirs(tujuan, exist_ok=True)
    mp4 = os.path.join(tujuan, f"{a.nama}.mp4")
    with tempfile.TemporaryDirectory() as tmp:
        video = unduh(a.sumber, tmp)
        potong = ["-t", str(a.durasi)] if a.durasi else []
        subprocess.run([FFMPEG, "-hide_banner", "-loglevel", "error", "-y", "-ss", str(a.mulai), "-i", video, *potong,
                        "-an", "-vf", "scale=360:-2:flags=lanczos,fps=30",
                        "-c:v", "libx264", "-profile:v", "main", "-pix_fmt", "yuv420p",
                        "-crf", str(a.crf), "-preset", "slow", "-movflags", "+faststart", mp4], check=True)
        png = os.path.join(tmp, "poster.png")
        subprocess.run([FFMPEG, "-hide_banner", "-loglevel", "error", "-y", "-ss", str(a.mulai + 0.05), "-i", video,
                        "-frames:v", "1", "-vf", "scale=540:-2:flags=lanczos", png], check=True)
        poster = Image.open(png).convert("RGB")
        for w in (360, 540):
            poster.resize((w, round(w * poster.height / poster.width)), Image.LANCZOS).save(
                os.path.join(tujuan, f"{a.nama}-{w}.webp"), quality=75, method=6)

    print(f"OK: {os.path.relpath(mp4, ROOT)} {os.path.getsize(mp4) / 1024:.0f} KB")


if __name__ == "__main__":
    main()
