#!/usr/bin/env python3
"""
CONTINENTAL DRIFT — build.py
Assembles CONTINENTAL.html (single-file build) from source files.

Source layout expected:
  css/style.css               ← game styles
  libs/maplibre-gl.css        ← MapLibre styles
  libs/pmtiles.js             ← PMTiles library
  libs/maplibre-gl.min.js     ← MapLibre GL JS
  js/config.js                ← cities, win conditions, economy settings
  js/data/questions.js        ← trivia questions
  js/map.js                   ← MapLibre + PMTiles map logic
  js/ui.js                    ← all screens and overlays
  js/game.js                  ← core game state machine

Run:
  python3 build.py
"""

import base64
import os
import re

OUTPUT = 'CONTINENTAL.html'
BASE = os.path.dirname(os.path.abspath(__file__))

# Airline logo PNGs to embed as base64 data URIs.
# key = logoKey used in CONFIG.AIRLINE_MODIFIERS
AIRLINE_LOGO_FILES = {
    'DAL': 'airline-logos-main/flightaware_logos/DAL.png',
    'UAL': 'airline-logos-main/flightaware_logos/UAL.png',
    'AAL': 'airline-logos-main/flightaware_logos/AAL.png',
}


def airline_logos_js():
    """Return a JS snippet that populates CONFIG.AIRLINE_LOGOS with base64 data URIs."""
    entries = []
    for key, rel_path in AIRLINE_LOGO_FILES.items():
        full = os.path.join(BASE, rel_path)
        if os.path.exists(full):
            with open(full, 'rb') as f:
                b64 = base64.b64encode(f.read()).decode()
            entries.append(f'  {key}: "data:image/png;base64,{b64}"')
            print(f'  Embedded logo: {key} ({os.path.getsize(full) // 1024 + 1} KB)')
        else:
            print(f'  WARNING: logo not found: {rel_path}')
    return 'CONFIG.AIRLINE_LOGOS = {\n' + ',\n'.join(entries) + '\n};'


def read(path):
    with open(os.path.join(BASE, path), encoding='utf-8') as f:
        return f.read()


def read_html_structure():
    """Read the HTML structure from CONTINENTAL.html (everything between </style> and <script>)."""
    src = read(OUTPUT)
    # Extract from <body> tag to just before the first <script>
    match = re.search(r'(<body>.*?)(\s*<script>)', src, re.DOTALL)
    if match:
        return match.group(1)
    raise ValueError('Could not find HTML body structure in ' + OUTPUT)


def build():
    print('Building CONTINENTAL.html...')

    maplibre_css  = read('libs/maplibre-gl.css').strip()
    game_css      = read('css/style.css').strip()
    pmtiles_js    = read('libs/pmtiles.js').strip()
    maplibre_js   = read('libs/maplibre-gl.min.js').strip()
    config_js     = read('js/config.js').strip()
    questions_js  = read('js/data/questions.js').strip()
    map_js        = read('js/map.js').strip()
    ui_js         = read('js/ui.js').strip()
    game_js       = read('js/game.js').strip()
    html_body     = read_html_structure()
    logos_js      = airline_logos_js()

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CONTINENTAL DRIFT</title>
  <style>
{maplibre_css}
  </style>
  <style>
{game_css}
  </style>
</head>
{html_body}

  <!-- ========================================================
       SCRIPTS — libs first, then game modules
       ======================================================== -->

  <script>
{pmtiles_js}
  </script>
  <script>
{maplibre_js}
  </script>
  <script>
{config_js}
  </script>
  <script>
{questions_js}
  </script>
  <script>
{map_js}
  </script>
  <script>
{ui_js}
  </script>
  <script>
{game_js}
  </script>
  <script>
{logos_js}
  </script>
  <script>
    document.addEventListener('DOMContentLoaded', () => {{
      GAME.init();
    }});
  </script>
</body>
</html>"""

    with open(os.path.join(BASE, OUTPUT), 'w', encoding='utf-8') as f:
        f.write(html)

    size_kb = os.path.getsize(os.path.join(BASE, OUTPUT)) / 1024
    print(f'  Done → {OUTPUT} ({size_kb:.0f} KB)')


if __name__ == '__main__':
    build()
