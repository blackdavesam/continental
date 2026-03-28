#!/usr/bin/env python3
"""
Download city skyline/cityscape images from Wikimedia Commons.
Uses curl for downloads (urllib gets 403'd) and PIL for resizing.
"""

import os
import json
import time
import subprocess
import urllib.request
import urllib.parse
from pathlib import Path

try:
    from PIL import Image
    HAS_PIL = True
except ImportError:
    HAS_PIL = False
    print("WARNING: Pillow not installed. Images won't be resized.")

OUTPUT_DIR = Path(__file__).parent / "assets" / "city-images"
TARGET_W, TARGET_H = 800, 450

CITIES = [
    ("toronto", "Toronto skyline"),
    ("montreal", "Montreal skyline"),
    ("vancouver", "Vancouver skyline"),
    ("calgary", "Calgary skyline"),
    ("ottawa", "Ottawa Parliament Hill"),
    ("edmonton", "Edmonton skyline"),
    ("winnipeg", "Winnipeg skyline"),
    ("halifax", "Halifax waterfront Nova Scotia"),
    ("quebec_city", "Quebec City Chateau Frontenac"),
    ("hamilton", "Hamilton Ontario skyline"),
    ("new_york", "Manhattan skyline"),
    ("boston", "Boston skyline"),
    ("philadelphia", "Philadelphia skyline"),
    ("washington", "Washington DC Capitol building"),
    ("pittsburgh", "Pittsburgh skyline"),
    ("baltimore", "Baltimore Inner Harbor"),
    ("hartford", "Hartford Connecticut skyline"),
    ("miami", "Miami skyline"),
    ("atlanta", "Atlanta skyline"),
    ("new_orleans", "New Orleans French Quarter"),
    ("charlotte", "Charlotte North Carolina skyline"),
    ("tampa", "Tampa skyline Florida"),
    ("jacksonville", "Jacksonville Florida skyline"),
    ("orlando", "Orlando Florida skyline"),
    ("chicago", "Chicago skyline"),
    ("detroit", "Detroit skyline"),
    ("milwaukee", "Milwaukee skyline"),
    ("minneapolis", "Minneapolis skyline"),
    ("st_louis", "St Louis Gateway Arch"),
    ("kansas_city", "Kansas City Missouri skyline"),
    ("cincinnati", "Cincinnati skyline"),
    ("indianapolis", "Indianapolis skyline"),
    ("columbus", "Columbus Ohio skyline"),
    ("dallas", "Dallas Texas skyline"),
    ("houston", "Houston Texas skyline"),
    ("nashville", "Nashville skyline"),
    ("austin", "Austin Texas skyline"),
    ("san_antonio", "San Antonio River Walk"),
    ("memphis", "Memphis Tennessee skyline"),
    ("denver", "Denver skyline"),
    ("las_vegas", "Las Vegas Strip"),
    ("phoenix", "Phoenix Arizona skyline"),
    ("salt_lake_city", "Salt Lake City skyline"),
    ("albuquerque", "Albuquerque New Mexico skyline"),
    ("tucson", "Tucson Arizona skyline"),
    ("los_angeles", "Los Angeles skyline"),
    ("san_francisco", "San Francisco Golden Gate Bridge"),
    ("seattle", "Seattle skyline Space Needle"),
    ("portland", "Portland Oregon skyline"),
    ("san_diego", "San Diego skyline"),
    ("honolulu", "Honolulu Waikiki skyline"),
    ("anchorage", "Anchorage Alaska skyline"),
    ("mexico_city", "Mexico City skyline"),
    ("cancun", "Cancun beach aerial"),
    ("guadalajara", "Guadalajara Mexico skyline"),
    ("monterrey", "Monterrey Mexico skyline"),
    ("tijuana", "Tijuana Mexico cityscape"),
    ("puerto_vallarta", "Puerto Vallarta Mexico"),
    ("merida", "Merida Yucatan Mexico cathedral"),
    ("puebla", "Puebla Mexico cityscape"),
    ("leon", "Leon Guanajuato Mexico"),
    ("oaxaca", "Oaxaca Mexico city"),
]


def wikimedia_search(query, limit=5):
    """Search Wikimedia Commons for images. Uses urllib for API only."""
    params = {
        "action": "query",
        "format": "json",
        "generator": "search",
        "gsrnamespace": "6",
        "gsrsearch": f"{query} filetype:bitmap",
        "gsrlimit": str(limit),
        "prop": "imageinfo",
        "iiprop": "url|size|mime",
    }
    url = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(params)

    try:
        result = subprocess.run(
            ["curl", "-s", "-A", "ContinentalDriftGame/1.0", url],
            capture_output=True, text=True, timeout=15
        )
        data = json.loads(result.stdout)
    except Exception as e:
        print(f"    API error: {e}")
        return []

    pages = data.get("query", {}).get("pages", {})
    results = []
    for page_id, page in pages.items():
        ii = page.get("imageinfo", [{}])[0]
        mime = ii.get("mime", "")
        width = ii.get("width", 0)
        height = ii.get("height", 0)
        original_url = ii.get("url", "")

        if mime not in ("image/jpeg", "image/png"):
            continue
        if width < 600 or height < 300:
            continue
        if not original_url:
            continue

        # Build a thumbnail URL at 1200px wide (much smaller download)
        # Format: .../commons/X/XX/Filename.jpg -> .../commons/thumb/X/XX/Filename.jpg/1200px-Filename.jpg
        thumb_url = original_url.replace("/commons/", "/commons/thumb/")
        filename = original_url.split("/")[-1]
        thumb_url += f"/1200px-{filename}"

        results.append({
            "title": page.get("title", ""),
            "url": thumb_url,
            "original_url": original_url,
            "width": width,
            "height": height,
            "mime": mime,
        })

    results.sort(key=lambda r: r["width"] * r["height"], reverse=True)
    return results


def download_with_curl(url, dest_path):
    """Download using curl (bypasses Python urllib 403 issues)."""
    try:
        result = subprocess.run(
            ["curl", "-s", "-L", "-o", str(dest_path),
             "-w", "%{http_code}",
             "-A", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
             url],
            capture_output=True, text=True, timeout=30
        )
        code = result.stdout.strip()
        if code == "200" and dest_path.exists() and dest_path.stat().st_size > 1000:
            return True
        else:
            dest_path.unlink(missing_ok=True)
            return False
    except Exception as e:
        print(f"    curl error: {e}")
        return False


def resize_and_crop(src_path, dest_path, target_w, target_h):
    """Resize and center-crop image to exact target dimensions."""
    if not HAS_PIL:
        return True  # skip resize

    try:
        img = Image.open(src_path)
        if img.mode in ("RGBA", "P", "LA"):
            img = img.convert("RGB")

        target_ratio = target_w / target_h
        img_ratio = img.width / img.height

        if img_ratio > target_ratio:
            new_w = int(img.height * target_ratio)
            offset = (img.width - new_w) // 2
            img = img.crop((offset, 0, offset + new_w, img.height))
        else:
            new_h = int(img.width / target_ratio)
            offset = (img.height - new_h) // 2
            img = img.crop((0, offset, img.width, offset + new_h))

        img = img.resize((target_w, target_h), Image.LANCZOS)
        img.save(dest_path, "JPEG", quality=82, optimize=True)
        return True
    except Exception as e:
        print(f"    Resize error: {e}")
        return False


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    total = len(CITIES)
    success = 0
    failed = []

    for i, (city_id, query) in enumerate(CITIES):
        dest = OUTPUT_DIR / f"{city_id}.jpg"

        if dest.exists() and dest.stat().st_size > 5000:
            print(f"[{i+1}/{total}] {city_id} - already exists, skipping")
            success += 1
            continue

        print(f"[{i+1}/{total}] {city_id} - searching: {query}")

        results = wikimedia_search(query)

        if not results:
            simple_query = query.split()[0] + " city"
            print(f"    No results, trying: {simple_query}")
            results = wikimedia_search(simple_query)

        if not results:
            print(f"    FAILED - no suitable images found")
            failed.append(city_id)
            continue

        downloaded = False
        for result in results[:3]:
            tmp_path = OUTPUT_DIR / f"{city_id}_tmp"
            short_title = result['title'][:60]
            print(f"    Trying: {short_title}...")

            if download_with_curl(result["url"], tmp_path):
                if HAS_PIL:
                    if resize_and_crop(tmp_path, dest, TARGET_W, TARGET_H):
                        tmp_path.unlink(missing_ok=True)
                        size_kb = dest.stat().st_size // 1024
                        print(f"    OK ({size_kb} KB)")
                        downloaded = True
                        break
                    else:
                        tmp_path.unlink(missing_ok=True)
                else:
                    tmp_path.rename(dest)
                    downloaded = True
                    break
            else:
                # Try original (full-size) URL as fallback
                if download_with_curl(result["original_url"], tmp_path):
                    if HAS_PIL:
                        if resize_and_crop(tmp_path, dest, TARGET_W, TARGET_H):
                            tmp_path.unlink(missing_ok=True)
                            size_kb = dest.stat().st_size // 1024
                            print(f"    OK ({size_kb} KB) [full-size fallback]")
                            downloaded = True
                            break
                        else:
                            tmp_path.unlink(missing_ok=True)
                    else:
                        tmp_path.rename(dest)
                        downloaded = True
                        break

        if downloaded:
            success += 1
        else:
            print(f"    FAILED")
            failed.append(city_id)

        time.sleep(0.3)

    print(f"\n{'='*50}")
    print(f"Done! {success}/{total} cities downloaded.")
    if failed:
        print(f"Failed ({len(failed)}): {', '.join(failed)}")
    print(f"Images saved to: {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
