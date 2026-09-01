from pathlib import Path
import base64
import re

index_path = Path("index.html")
html = index_path.read_text(encoding="utf-8")

targets = {
    "videoMystery": Path("assets/video-mystery.mp4"),
    "videoFinale": Path("assets/video-finale.mp4"),
}

for key, output_path in targets.items():
    pattern = re.compile(rf'({re.escape(key)}\s*:\s*")data:video/mp4;base64,([^"]+)(")')
    match = pattern.search(html)
    if not match:
        raise RuntimeError(f"Embedded MP4 for {key} was not found")

    payload = base64.b64decode(match.group(2), validate=True)
    if len(payload) < 100_000 or b"ftyp" not in payload[:32]:
        raise RuntimeError(f"Decoded payload for {key} is not a valid-looking MP4")

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_bytes(payload)
    html = pattern.sub(lambda m: m.group(1) + output_path.as_posix() + m.group(3), html, count=1)
    print(f"{key}: wrote {output_path} ({len(payload):,} bytes)")

if "data:video/mp4;base64," in html:
    raise RuntimeError("An embedded MP4 data URI still remains in index.html")

index_path.write_text(html, encoding="utf-8")
print(f"index.html: {index_path.stat().st_size:,} bytes")
