// ============================================================
//  CONTINENTAL — map.js
//  MapLibre + PMTiles map logic
// ============================================================

// --- Day/Night Color Palettes ---
const MAP_THEMES = {
  day: {
    background:   '#b8d4e3',
    water:        '#6fa8c7',
    land:         '#c8b99a',
    landcover:    '#a3b87c',
    countries:    '#8a6e50',
    states:       '#a89880',
    roads:        '#b8a890',
    waterLabels:  '#2a6090',
    stateLabels:  '#6b5a48',
    placeLabels:  '#4a3828',
    labelHalo:    'rgba(200,185,154,0.7)',
    cityDotColor: '#7a6a55',   // neutral brown dot for unclaimed cities
    sweepColor:   'rgba(4,13,26,0.92)',  // dark sweep for day→night
  },
  night: {
    background:   '#040d1a',
    water:        '#071428',
    land:         '#1a2d1e',
    landcover:    '#1e3524',
    countries:    '#5a9060',
    states:       '#2a4a30',
    roads:        '#1e3020',
    waterLabels:  '#4e8ab5',
    stateLabels:  '#3a6840',
    placeLabels:  '#7ab090',
    labelHalo:    '#040d1a',
    cityDotColor: '#ffdd88',   // warm glow for unclaimed cities
    sweepColor:   'rgba(184,212,227,0.92)', // light sweep for night→day
  },
};

const MAP = {
  instance: null,
  pins: [],
  flightPaths: [],
  planeMarker: null,
  cityLabelMarkers: [],   // HTML markers for city names (offline)
  teamMarkers: {},        // teamId → maplibregl.Marker (current position)
  teamHeadings: {},       // teamId → bearing in degrees (0 = north)

  // Day/night cycle state
  currentTheme: 'day',
  gameHour: 8,            // simulated in-game hour (0–23)
  _cycleInterval: null,
  _pmtilesUrl: null,
  _base: null,
  _transitioning: false,  // true during day/night sweep animation

  // City ownership: cityId → team.color (set when a team visits)
  _cityOwners: {},

  async init() {
    if (this.instance) return;

    // Register PMTiles protocol
    const protocol = new pmtiles.Protocol();
    maplibregl.addProtocol('pmtiles', (params, abortController) =>
      protocol.tile(params, abortController)
    );

    // Resolve paths relative to the HTML file
    this._base = window.location.href.replace(/\/[^/]*$/, '/');
    this._pmtilesUrl = this._base + 'north-america.pmtiles';

    // Pick initial theme based on a random starting hour
    this.gameHour = Math.floor(Math.random() * 24);
    this.currentTheme = this._isNightHour(this.gameHour) ? 'night' : 'day';

    this.instance = new maplibregl.Map({
      container: 'map',
      style: this.buildStyle(this._pmtilesUrl, this._base, this.currentTheme),
      center: CONFIG.MAP_CENTER,
      zoom: CONFIG.MAP_ZOOM,
      attributionControl: false,
      interactive: true,
    });

    this.instance.on('error', (e) => {
      console.warn('Map error (non-fatal):', e.error?.message || e);
    });

    await new Promise((resolve) => {
      this.instance.on('load', resolve);
      setTimeout(resolve, 8000);
    });

    // Place HTML city-name labels for all game cities (fully offline)
    this.addCityLabels();

    // Add city dots/lights
    this._addCityOverlays();

    // Hide loading indicator
    const loader = document.getElementById('map-loading');
    if (loader) { loader.style.opacity = '0'; setTimeout(() => loader.remove(), 500); }

    // Ensure fade overlay exists
    this._ensureFadeOverlay();

    // Start the simulated day/night clock
    this.startDayNightClock();

    // Show initial time indicator
    this._updateTimeHUD();

    return this;
  },

  addCityLabels() {
    CITIES.forEach(city => {
      const el = document.createElement('div');
      el.className = 'city-label';
      el.textContent = city.name;
      new maplibregl.Marker({ element: el, anchor: 'top' })
        .setLngLat([city.lng, city.lat])
        .addTo(this.instance);
      this.cityLabelMarkers.push(el);
    });
  },

  // Place or move a team's current-position airplane avatar on the map.
  // heading: bearing in degrees (0=north, 90=east, etc). If omitted, keeps previous heading.
  updateTeamMarker(team, heading) {
    if (!this.instance || !team.currentCity) return;
    const { lng, lat } = team.currentCity;

    if (heading !== undefined) {
      this.teamHeadings[team.id] = heading;
    }
    const deg = this.teamHeadings[team.id] || 0;

    if (this.teamMarkers[team.id]) {
      this.teamMarkers[team.id].setLngLat([lng, lat]);
      // Update rotation on the SVG group
      const g = this.teamMarkers[team.id].getElement().querySelector('.tm-rotator');
      if (g) g.setAttribute('transform', `rotate(${deg} 16 16)`);
    } else {
      const el = document.createElement('div');
      el.className = 'team-map-marker';
      el.title = team.name;
      el.innerHTML = `<svg viewBox="0 0 32 32" width="32" height="32">
        <defs>
          <filter id="glow-${team.id}" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="0" stdDeviation="2" flood-color="${team.color}" flood-opacity="0.7"/>
          </filter>
        </defs>
        <g class="tm-rotator" transform="rotate(${deg} 16 16)">
          <g filter="url(#glow-${team.id})">
            <path d="M16 4 C14.5 4 14 5.5 14 7 L14 13 L6 17 L6 19 L14 17 L14 23 L11 25 L11 27 L16 26 L21 27 L21 25 L18 23 L18 17 L26 19 L26 17 L18 13 L18 7 C18 5.5 17.5 4 16 4Z"
              fill="${team.color}" stroke="rgba(255,255,255,0.9)" stroke-width="0.8"/>
          </g>
          <text x="16" y="16" text-anchor="middle" dominant-baseline="central"
            font-size="8" font-weight="bold" fill="white" font-family="sans-serif"
            style="text-shadow:0 0 2px rgba(0,0,0,0.6)">${team.name.charAt(0).toUpperCase()}</text>
        </g>
      </svg>`;
      this.teamMarkers[team.id] = new maplibregl.Marker({ element: el, anchor: 'center', pitchAlignment: 'map' })
        .setLngLat([lng, lat])
        .addTo(this.instance);
    }
  },

  // --- Day/Night helpers ---
  _isNightHour(h) {
    return h >= 19 || h < 7; // Night: 7PM–6:59AM
  },

  _formatGameTime(h) {
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${h12}:00 ${ampm}`;
  },

  _updateTimeHUD() {
    let el = document.getElementById('game-time-hud');
    if (!el) {
      el = document.createElement('div');
      el.id = 'game-time-hud';
      const gameScreen = document.getElementById('screen-game');
      if (gameScreen) gameScreen.appendChild(el);
    }
    const isNight = this._isNightHour(this.gameHour);
    const icon = isNight ? '🌙' : '☀️';
    el.textContent = `${icon} ${this._formatGameTime(this.gameHour)}`;
    el.className = isNight ? 'time-hud night' : 'time-hud day';
  },

  // ============================================================
  //  CITY DOTS (day) & CITY LIGHTS (night)
  // ============================================================

  // Deterministic pseudo-random from seed string
  _seededRandom(seed) {
    let h = 0;
    for (let i = 0; i < seed.length; i++) {
      h = ((h << 5) - h + seed.charCodeAt(i)) | 0;
    }
    return () => {
      h = (h * 16807 + 0) % 2147483647;
      return (h & 0x7fffffff) / 2147483647;
    };
  },

  // Generate scatter light points around a city for the night satellite look
  _generateScatterPoints(city) {
    const rng = this._seededRandom(city.id);
    const pop = city.population || 100000;
    // More populous cities get more scatter dots
    const count = Math.min(25, Math.max(4, Math.round(Math.log10(pop) * 4)));
    // Spread radius scales with population (in degrees, ~0.05–0.3)
    const spread = Math.min(0.3, Math.max(0.05, Math.log10(pop) * 0.04));
    const pts = [];
    for (let i = 0; i < count; i++) {
      const angle = rng() * Math.PI * 2;
      const dist = rng() * spread;
      pts.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [city.lng + Math.cos(angle) * dist, city.lat + Math.sin(angle) * dist * 0.7]
        },
        properties: { type: 'scatter', brightness: 0.3 + rng() * 0.5 },
      });
    }
    return pts;
  },

  // Build the GeoJSON data for city markers
  _buildCityGeoJSON() {
    const cities = typeof CITIES !== 'undefined' ? CITIES : [];
    const features = [];

    cities.forEach(c => {
      const ownerColor = this._cityOwners[c.id] || null;
      // Main city point
      features.push({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [c.lng, c.lat] },
        properties: {
          type: 'city',
          name: c.name,
          pop: c.population || 100000,
          color: ownerColor || '',   // '' = unclaimed
          id: c.id,
        },
      });

      // Scatter points for night mode (always include; layer visibility controls them)
      const scatter = this._generateScatterPoints(c);
      features.push(...scatter);
    });

    return { type: 'FeatureCollection', features };
  },

  // Add city dot/light layers after map style loads
  _addCityOverlays() {
    if (!this.instance) return;
    const map = this.instance;
    const isNight = this.currentTheme === 'night';
    const t = MAP_THEMES[this.currentTheme];

    if (map.getSource('city-overlay-src')) return;

    map.addSource('city-overlay-src', {
      type: 'geojson',
      data: this._buildCityGeoJSON(),
    });

    // Determine the "before" layer — insert before water-labels if it exists
    const before = map.getLayer('water-labels') ? 'water-labels' : undefined;

    if (isNight) {
      // --- NIGHT MODE ---

      // Scatter glow dots (the small ambient lights around cities)
      map.addLayer({
        id: 'city-scatter',
        type: 'circle',
        source: 'city-overlay-src',
        filter: ['==', ['get', 'type'], 'scatter'],
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 0.8, 5, 1.5, 8, 3],
          'circle-color': '#ffcc66',
          'circle-blur': 0.4,
          'circle-opacity': ['get', 'brightness'],
        }
      }, before);

      // Outer soft glow for main cities
      map.addLayer({
        id: 'city-glow',
        type: 'circle',
        source: 'city-overlay-src',
        filter: ['==', ['get', 'type'], 'city'],
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 8, 5, 16, 8, 28],
          'circle-color': '#ffcc44',
          'circle-blur': 1,
          'circle-opacity': 0.25,
        }
      }, before);

      // Bright core for main cities (uses team color if claimed, else warm yellow)
      map.addLayer({
        id: 'city-core',
        type: 'circle',
        source: 'city-overlay-src',
        filter: ['==', ['get', 'type'], 'city'],
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 2.5, 5, 5, 8, 8],
          'circle-color': [
            'case',
            ['!=', ['get', 'color'], ''], ['get', 'color'],
            t.cityDotColor
          ],
          'circle-blur': 0.2,
          'circle-opacity': 0.9,
        }
      }, before);

    } else {
      // --- DAY MODE ---

      // Simple solid dot for each city (team color if claimed, neutral brown if not)
      map.addLayer({
        id: 'city-dot',
        type: 'circle',
        source: 'city-overlay-src',
        filter: ['==', ['get', 'type'], 'city'],
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 3, 5, 5, 8, 7],
          'circle-color': [
            'case',
            ['!=', ['get', 'color'], ''], ['get', 'color'],
            t.cityDotColor
          ],
          'circle-stroke-width': 1.5,
          'circle-stroke-color': 'rgba(255,255,255,0.7)',
          'circle-opacity': 0.85,
        }
      }, before);
    }
  },

  // Remove all city overlay layers
  _removeCityOverlays() {
    if (!this.instance) return;
    const map = this.instance;
    ['city-scatter', 'city-glow', 'city-core', 'city-dot'].forEach(id => {
      try { map.removeLayer(id); } catch(e) {}
    });
    try { map.removeSource('city-overlay-src'); } catch(e) {}
  },

  // Call when a city is claimed by a team — updates the dot color
  claimCity(cityId, teamColor) {
    this._cityOwners[cityId] = teamColor;
    // Update GeoJSON source if it exists
    if (this.instance) {
      const src = this.instance.getSource('city-overlay-src');
      if (src) src.setData(this._buildCityGeoJSON());
    }
  },

  // ============================================================
  //  DAY/NIGHT SWEEP TRANSITION
  // ============================================================

  _ensureFadeOverlay() {
    if (document.getElementById('day-night-fade')) return;
    const el = document.createElement('div');
    el.id = 'day-night-fade';
    el.style.cssText = 'position:absolute;inset:0;z-index:3;pointer-events:none;opacity:0;';
    const mapEl = document.getElementById('map');
    if (mapEl) mapEl.parentElement.appendChild(el);
  },

  // Smooth crossfade for day↔night transition
  _playFade(toTheme, onMidpoint) {
    const fade = document.getElementById('day-night-fade');
    if (!fade) { onMidpoint(); return; }

    // Pick a color that blends between old and new theme
    const bg = toTheme === 'night'
      ? 'rgba(4,13,26,0.95)'      // dark wash for nightfall
      : 'rgba(200,215,228,0.95)'; // light wash for dawn

    fade.style.cssText = `
      position:absolute; inset:0; z-index:3; pointer-events:none;
      background: ${bg};
      opacity: 0;
      transition: opacity 1.4s ease-in-out;
    `;
    fade.offsetHeight; // force reflow

    // Phase 1: fade in (covers the map)
    fade.style.opacity = '1';

    // At peak opacity, swap the style underneath
    setTimeout(() => {
      onMidpoint();
    }, 1400);

    // Phase 2: fade out (reveals new style)
    setTimeout(() => {
      fade.style.transition = 'opacity 1.6s ease-in-out';
      fade.style.opacity = '0';
    }, 1800);

    // Cleanup
    setTimeout(() => {
      fade.style.cssText = 'position:absolute;inset:0;z-index:3;pointer-events:none;opacity:0;';
    }, 3500);
  },

  // ============================================================
  //  DAY/NIGHT CLOCK
  // ============================================================

  startDayNightClock() {
    if (this._cycleInterval) clearInterval(this._cycleInterval);

    // Full cycle = 5 min (300,000ms) = 24 in-game hours
    // Each in-game hour = 300000/24 ≈ 12500ms
    const msPerHour = (CONFIG.DAY_NIGHT_CYCLE_MS || 300000) / 24;

    this._cycleInterval = setInterval(() => {
      const prevTheme = this.currentTheme;
      this.gameHour = (this.gameHour + 1) % 24;
      const newTheme = this._isNightHour(this.gameHour) ? 'night' : 'day';

      this._updateTimeHUD();

      if (newTheme !== prevTheme && !this._transitioning) {
        this.setTheme(newTheme);
      }
    }, msPerHour);
  },

  stopDayNightClock() {
    if (this._cycleInterval) {
      clearInterval(this._cycleInterval);
      this._cycleInterval = null;
    }
  },

  setTheme(theme) {
    if (!this.instance || theme === this.currentTheme) return;
    this._transitioning = true;

    this._playFade(theme, () => {
      // --- Midpoint: swap style under the sweep ---
      this.currentTheme = theme;

      const center = this.instance.getCenter();
      const zoom = this.instance.getZoom();

      const newStyle = this.buildStyle(this._pmtilesUrl, this._base, theme);
      this.instance.setStyle(newStyle);

      this.instance.once('style.load', () => {
        this.instance.setCenter(center);
        this.instance.setZoom(zoom);

        // Re-add city labels
        this.cityLabelMarkers.forEach(el => el.remove?.());
        this.cityLabelMarkers = [];
        this.addCityLabels();

        // Re-add city overlays (dots or lights depending on theme)
        this._addCityOverlays();

        // Re-add team markers
        Object.values(this.teamMarkers).forEach(m => m.addTo(this.instance));

        // Re-add pins
        this.pins.forEach(p => {
          new maplibregl.Marker({ element: p.el })
            .setLngLat([p.city.lng, p.city.lat])
            .addTo(this.instance);
        });

        this._transitioning = false;
      });
    });
  },

  buildStyle(pmtilesUrl, base, theme) {
    const t = MAP_THEMES[theme] || MAP_THEMES.night;

    const layers = [
      // ---- BASE ----
      {
        id: 'background',
        type: 'background',
        paint: { 'background-color': t.background }
      },
      {
        id: 'water',
        type: 'fill',
        source: 'protomaps',
        'source-layer': 'water',
        paint: { 'fill-color': t.water }
      },
      {
        id: 'land',
        type: 'fill',
        source: 'protomaps',
        'source-layer': 'land',
        paint: { 'fill-color': t.land }
      },
      {
        id: 'landcover',
        type: 'fill',
        source: 'protomaps',
        'source-layer': 'landcover',
        paint: { 'fill-color': t.landcover, 'fill-opacity': 0.5 }
      },
      {
        id: 'countries',
        type: 'line',
        source: 'protomaps',
        'source-layer': 'boundaries',
        filter: ['==', ['get', 'kind'], 'country'],
        paint: { 'line-color': t.countries, 'line-width': 1.2 }
      },
      {
        id: 'states',
        type: 'line',
        source: 'protomaps',
        'source-layer': 'boundaries',
        filter: ['==', ['get', 'kind'], 'region'],
        paint: { 'line-color': t.states, 'line-width': 0.6, 'line-dasharray': [3, 3] }
      },
      {
        id: 'roads',
        type: 'line',
        source: 'protomaps',
        'source-layer': 'roads',
        minzoom: 6,
        paint: {
          'line-color': t.roads,
          'line-width': ['interpolate', ['linear'], ['zoom'], 6, 0.3, 12, 1.5]
        }
      },
    ];

    // City overlays are added dynamically via _addCityOverlays() after style loads

    // ---- LABELS ----
    layers.push(
      // Oceans, seas, gulfs, lakes, rivers, bays
      {
        id: 'water-labels',
        type: 'symbol',
        source: 'protomaps',
        'source-layer': 'places',
        filter: ['in', ['get', 'kind'], ['literal',
          ['ocean', 'sea', 'gulf', 'bay', 'strait', 'sound', 'lake', 'reservoir', 'river', 'canal', 'inlet']
        ]],
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['Noto Sans Regular'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 2, 10, 5, 13, 8, 15],
          'text-letter-spacing': 0.12,
          'text-max-width': 10,
        },
        paint: {
          'text-color': t.waterLabels,
          'text-halo-color': t.labelHalo,
          'text-halo-width': 1.5,
        }
      },

      // State / province names (always visible, fade slightly when zoomed in)
      {
        id: 'state-labels',
        type: 'symbol',
        source: 'protomaps',
        'source-layer': 'places',
        filter: ['==', ['get', 'kind'], 'state'],
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['Noto Sans Regular'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 2, 9, 5, 13, 8, 15],
          'text-letter-spacing': 0.18,
          'text-transform': 'uppercase',
          'text-max-width': 7,
        },
        paint: {
          'text-color': t.stateLabels,
          'text-halo-color': t.labelHalo,
          'text-halo-width': 1.5,
          'text-opacity': ['interpolate', ['linear'], ['zoom'], 3, 0.6, 6, 1, 9, 0.4],
        }
      },

      // All cities and towns
      {
        id: 'place-labels',
        type: 'symbol',
        source: 'protomaps',
        'source-layer': 'places',
        filter: ['in', ['get', 'kind'], ['literal', ['city', 'town', 'village', 'hamlet']]],
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['Noto Sans Regular'],
          'text-size': ['interpolate', ['linear'], ['zoom'],
            3, 9,
            5, 11,
            7, 12,
            9, 14
          ],
          'text-anchor': 'top',
          'text-offset': [0, 0.25],
          'text-max-width': 8,
        },
        paint: {
          'text-color': t.placeLabels,
          'text-halo-color': t.labelHalo,
          'text-halo-width': 1.2,
        }
      },
    );

    return {
      version: 8,
      glyphs: base + 'assets/fonts/glyphs/{fontstack}/{range}.pbf',
      sources: {
        protomaps: {
          type: 'vector',
          url: 'pmtiles://' + pmtilesUrl,
          attribution: '',
        },
      },
      layers,
    };
  },

  flyTo(lng, lat, zoom = 5) {
    this.instance?.flyTo({ center: [lng, lat], zoom, duration: 1800, essential: true });
  },

  fitBounds(cities) {
    if (!cities.length) return;
    const lngs = cities.map(c => c.lng);
    const lats = cities.map(c => c.lat);
    this.instance?.fitBounds(
      [[Math.min(...lngs) - 3, Math.min(...lats) - 2], [Math.max(...lngs) + 3, Math.max(...lats) + 2]],
      { duration: 1500, padding: { top: 60, bottom: 80, left: 60, right: 60 } }
    );
  },

  highlightCurrentCity(city) {
    if (!city) return;
    this.flyTo(city.lng, city.lat, 5);
  },

  placePin(city, team) {
    // Update city ownership for dot coloring
    this.claimCity(city.id, team.color);

    const el = document.createElement('div');
    el.className = 'city-pin';
    el.style.cssText = `
      width: 12px; height: 12px;
      border-radius: 50%;
      background: ${team.color};
      border: 2px solid rgba(255,255,255,0.8);
      box-shadow: 0 0 8px ${team.color}88;
      cursor: pointer;
      transition: transform 0.2s;
    `;
    el.title = `${city.name} — ${team.name}`;
    el.addEventListener('mouseenter', () => el.style.transform = 'scale(1.5)');
    el.addEventListener('mouseleave', () => el.style.transform = 'scale(1)');
    el.addEventListener('click', () => UI.showDossier(city.id));

    new maplibregl.Marker({ element: el })
      .setLngLat([city.lng, city.lat])
      .addTo(this.instance);

    this.pins.push({ city, team, el });
  },

  // Compute a great-circle (geodesic) path — east-west flights curve
  // toward the poles, matching how real airline routes look on a map.
  greatCirclePoints(origin, destination, steps) {
    const toRad = d => d * Math.PI / 180;
    const toDeg = r => r * 180 / Math.PI;
    const lat1 = toRad(origin.lat),  lng1 = toRad(origin.lng);
    const lat2 = toRad(destination.lat), lng2 = toRad(destination.lng);

    const d = 2 * Math.asin(Math.sqrt(
      Math.sin((lat2 - lat1) / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin((lng2 - lng1) / 2) ** 2
    ));
    if (d < 0.0001) return [[origin.lng, origin.lat], [destination.lng, destination.lat]];

    const pts = [];
    for (let i = 0; i <= steps; i++) {
      const f = i / steps;
      const A = Math.sin((1 - f) * d) / Math.sin(d);
      const B = Math.sin(f * d) / Math.sin(d);
      const x = A * Math.cos(lat1) * Math.cos(lng1) + B * Math.cos(lat2) * Math.cos(lng2);
      const y = A * Math.cos(lat1) * Math.sin(lng1) + B * Math.cos(lat2) * Math.sin(lng2);
      const z = A * Math.sin(lat1) + B * Math.sin(lat2);
      pts.push([toDeg(Math.atan2(y, x)), toDeg(Math.atan2(z, Math.sqrt(x * x + y * y)))]);
    }
    return pts;
  },

  // True compass bearing from p1→p2 ([lng,lat] pairs).
  bearingBetween(p1, p2) {
    const toRad = d => d * Math.PI / 180;
    const toDeg = r => r * 180 / Math.PI;
    const dLng = toRad(p2[0] - p1[0]);
    const lat1 = toRad(p1[1]), lat2 = toRad(p2[1]);
    const y = Math.sin(dLng) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
    return toDeg(Math.atan2(y, x));
  },

  animateFlight(flight, team, onComplete) {
    const { origin, destination, airline } = flight;
    const map = this.instance;

    // Smart zoom schedule (step thresholds for 120-step animation):
    //   Step 0 (start)  → brief zoom into takeoff city
    //   Step ~18 (15%)  → pull back to show full route
    //   Step ~96 (80%)  → zoom into destination for landing
    const ZOOM_TAKEOFF  = 5.5;
    const ZOOM_LANDING  = 5.5;
    const STEP_PULLBACK = 18;
    const STEP_APPROACH = 96;

    // Begin zoomed in on the departure city
    map.flyTo({ center: [origin.lng, origin.lat], zoom: ZOOM_TAKEOFF, duration: 1200, essential: true });

    // Pre-compute full geodesic path (no parabola — real great-circle arc)
    const steps = 120;
    const gcPath = this.greatCirclePoints(origin, destination, steps);

    const pathId = 'flight-path-' + Date.now();
    map.addSource(pathId, {
      type: 'geojson',
      data: { type: 'Feature', geometry: { type: 'LineString', coordinates: [gcPath[0]] } }
    });
    map.addLayer({
      id: pathId,
      type: 'line',
      source: pathId,
      paint: {
        'line-color': '#f0a500',
        'line-width': 2,
        'line-dasharray': [4, 4],
        'line-opacity': 0.8,
      }
    });

    // Use the team's own marker as the flying plane
    const teamMarker = this.teamMarkers[team.id];
    const rotatorEl = teamMarker ? teamMarker.getElement().querySelector('.tm-rotator') : null;

    // Set initial heading
    if (gcPath.length >= 2 && rotatorEl) {
      const initBearing = this.bearingBetween(gcPath[0], gcPath[1]);
      rotatorEl.setAttribute('transform', `rotate(${initBearing} 16 16)`);
    }

    // Remove the old separate yellow plane marker if it exists
    if (this.planeMarker) { this.planeMarker.remove(); this.planeMarker = null; }

    const duration = CONFIG.FLIGHT_DURATION_MS * (530 / airline.speed);
    let step = 0;

    const interval = setInterval(() => {
      step++;
      const pos = gcPath[Math.min(step, gcPath.length - 1)];
      const t = step / steps;

      map.getSource(pathId)?.setData({
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: gcPath.slice(0, step + 1) }
      });

      // Rotate team marker to face direction of travel
      if (step > 0 && rotatorEl) {
        const bearing = this.bearingBetween(gcPath[step - 1], pos);
        rotatorEl.setAttribute('transform', `rotate(${bearing} 16 16)`);
        this.teamHeadings[team.id] = bearing;
      }
      // Move team marker along the path
      if (teamMarker) teamMarker.setLngLat(pos);

      // Smart zoom: pull back to show full route, then zoom into landing
      if (step === STEP_PULLBACK) {
        this.fitBounds([origin, destination]);
      } else if (step === STEP_APPROACH) {
        map.flyTo({ center: gcPath[gcPath.length - 1], zoom: ZOOM_LANDING, duration: 2500, essential: true });
      }

      const distLeft = Math.round(flight.distanceMiles * (1 - t));
      const altitude = Math.round(Math.sin(t * Math.PI) * 35000);
      const speed = t < 0.05  ? Math.round(airline.speed * (t / 0.05))
                  : t > 0.95 ? Math.round(airline.speed * ((1 - t) / 0.05))
                  : airline.speed;
      const timeLeftMin = Math.round((1 - t) * (flight.distanceMiles / airline.speed) * 60);
      const outsideTemp = altitude > 10000
        ? Math.round(-55 - (altitude / 35000) * 10)
        : Math.round(20 - (altitude / 10000) * 35);

      UI.updateFlightData({ distLeft, altitude, speed, timeLeftMin, outsideTemp });

      if (step >= steps) {
        clearInterval(interval);
        setTimeout(() => {
          try { map.removeLayer(pathId); map.removeSource(pathId); } catch(e) {}
          onComplete();
        }, 600);
      }
    }, duration / steps);

    this.flightPaths.push(pathId);
  },

  enableBullseye(targetCity, callback) {
    const map = this.instance;
    map.getCanvas().style.cursor = 'crosshair';

    const onClick = (e) => {
      map.getCanvas().style.cursor = '';
      map.off('click', onClick);
      callback({ lat: e.lngLat.lat, lng: e.lngLat.lng });
    };
    map.on('click', onClick);
    this._bullseyeHandler = onClick;
  },

  disableBullseye() {
    if (this._bullseyeHandler) {
      this.instance?.off('click', this._bullseyeHandler);
      this._bullseyeHandler = null;
    }
    if (this.instance) this.instance.getCanvas().style.cursor = '';
  },
};
