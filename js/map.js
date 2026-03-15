// ============================================================
//  CONTINENTAL — map.js
//  MapLibre + PMTiles map logic
// ============================================================

const MAP = {
  instance: null,
  pins: [],
  flightPaths: [],
  planeMarker: null,
  cityLabelMarkers: [],   // HTML markers for city names (offline)
  teamMarkers: {},        // teamId → maplibregl.Marker (current position)

  async init() {
    if (this.instance) return;

    // Register PMTiles protocol
    const protocol = new pmtiles.Protocol();
    maplibregl.addProtocol('pmtiles', (params, abortController) =>
      protocol.tile(params, abortController)
    );

    // Resolve paths relative to the HTML file
    const base = window.location.href.replace(/\/[^/]*$/, '/');
    const pmtilesUrl = base + 'north-america.pmtiles';
    this.instance = new maplibregl.Map({
      container: 'map',
      style: this.buildStyle(pmtilesUrl),
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

    // Place HTML city-name labels for all 28 game cities (fully offline)
    this.addCityLabels();

    // Hide loading indicator
    const loader = document.getElementById('map-loading');
    if (loader) { loader.style.opacity = '0'; setTimeout(() => loader.remove(), 500); }

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

  // Place or move a team's current-position avatar on the map.
  updateTeamMarker(team) {
    if (!this.instance || !team.currentCity) return;
    const { lng, lat } = team.currentCity;

    if (this.teamMarkers[team.id]) {
      this.teamMarkers[team.id].setLngLat([lng, lat]);
    } else {
      const el = document.createElement('div');
      el.className = 'team-map-marker';
      el.style.background = team.color;
      el.style.boxShadow = `0 0 10px ${team.color}88`;
      el.textContent = team.name.charAt(0).toUpperCase();
      el.title = team.name;
      this.teamMarkers[team.id] = new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([lng, lat])
        .addTo(this.instance);
    }
  },

  buildStyle(pmtilesUrl) {
    return {
      version: 8,
      // Protomaps CDN glyphs — enables all text symbol layers.
      // Falls back gracefully (no text) if offline.
      glyphs: 'https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf',
      sources: {
        protomaps: {
          type: 'vector',
          url: 'pmtiles://' + pmtilesUrl,
          attribution: '',
        },
      },
      layers: [
        // ---- BASE ----
        {
          id: 'background',
          type: 'background',
          paint: { 'background-color': '#071525' }
        },
        {
          id: 'water',
          type: 'fill',
          source: 'protomaps',
          'source-layer': 'water',
          paint: { 'fill-color': '#09192e' }
        },
        {
          id: 'land',
          type: 'fill',
          source: 'protomaps',
          'source-layer': 'land',
          paint: { 'fill-color': '#1e3550' }
        },
        {
          id: 'landcover',
          type: 'fill',
          source: 'protomaps',
          'source-layer': 'landcover',
          paint: { 'fill-color': '#1a3048', 'fill-opacity': 0.5 }
        },
        {
          id: 'countries',
          type: 'line',
          source: 'protomaps',
          'source-layer': 'boundaries',
          filter: ['==', ['get', 'kind'], 'country'],
          paint: { 'line-color': '#5080a8', 'line-width': 1.2 }
        },
        {
          id: 'states',
          type: 'line',
          source: 'protomaps',
          'source-layer': 'boundaries',
          filter: ['==', ['get', 'kind'], 'region'],
          paint: { 'line-color': '#2e5070', 'line-width': 0.6, 'line-dasharray': [3, 3] }
        },
        {
          id: 'roads',
          type: 'line',
          source: 'protomaps',
          'source-layer': 'roads',
          minzoom: 6,
          paint: {
            'line-color': '#243f5c',
            'line-width': ['interpolate', ['linear'], ['zoom'], 6, 0.3, 12, 1.5]
          }
        },

        // ---- LABELS (CDN glyphs — italic for water, upright for land) ----

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
            'text-color': '#4e8ab5',
            'text-halo-color': '#071525',
            'text-halo-width': 1.5,
          }
        },

        // State / province names (visible at low zoom, fade out when zoomed in)
        {
          id: 'state-labels',
          type: 'symbol',
          source: 'protomaps',
          'source-layer': 'places',
          filter: ['==', ['get', 'kind'], 'state'],
          maxzoom: 6.5,
          layout: {
            'text-field': ['get', 'name'],
            'text-font': ['Noto Sans Regular'],
            'text-size': ['interpolate', ['linear'], ['zoom'], 2, 9, 5, 13],
            'text-letter-spacing': 0.18,
            'text-transform': 'uppercase',
            'text-max-width': 7,
          },
          paint: {
            'text-color': '#3d6080',
            'text-halo-color': '#071525',
            'text-halo-width': 1.5,
            'text-opacity': ['interpolate', ['linear'], ['zoom'], 3, 0.6, 6, 1],
          }
        },

        // All cities and towns (non-game cities show here; game cities get HTML markers on top)
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
            'text-color': '#8ab0d0',
            'text-halo-color': '#071525',
            'text-halo-width': 1.2,
          }
        },
      ],
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

  animateFlight(flight, onComplete) {
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

    // SVG plane pointing NORTH (up) at 0°.
    // Rotation is applied via SVG transform attribute (rotate(deg cx cy)) — this is
    // immune to MapLibre's CSS transform on the marker wrapper, unlike style.transform.
    const planeEl = document.createElement('div');
    planeEl.style.cssText = 'filter:drop-shadow(0 0 6px rgba(240,165,0,0.8));display:block;width:28px;height:28px;';
    const planeSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    planeSvg.setAttribute('viewBox', '0 0 24 24');
    planeSvg.setAttribute('width', '28');
    planeSvg.setAttribute('height', '28');
    planeSvg.innerHTML = `
      <path d="M12 2 C10.5 2 10 4 10 6 L10 20 C10 21 11 22 12 22 C13 22 14 21 14 20 L14 6 C14 4 13.5 2 12 2Z" fill="#f0a500"/>
      <polygon points="12,9 12,13 2,17 1,15" fill="#f0a500"/>
      <polygon points="12,9 12,13 22,17 23,15" fill="#f0a500"/>
      <polygon points="12,19 12,21 8,23 7,22" fill="#f0a500"/>
      <polygon points="12,19 12,21 16,23 17,22" fill="#f0a500"/>
    `;
    // Set initial heading before first animation tick
    if (gcPath.length >= 2) {
      planeSvg.setAttribute('transform', `rotate(${this.bearingBetween(gcPath[0], gcPath[1])} 12 12)`);
    }
    planeEl.appendChild(planeSvg);

    if (this.planeMarker) this.planeMarker.remove();
    this.planeMarker = new maplibregl.Marker({ element: planeEl, anchor: 'center' })
      .setLngLat(gcPath[0])
      .addTo(map);

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

      if (step > 0) {
        const bearing = this.bearingBetween(gcPath[step - 1], pos);
        // SVG transform: rotate(angleDeg centerX centerY) — rotates around viewBox center
        planeSvg.setAttribute('transform', `rotate(${bearing} 12 12)`);
      }
      this.planeMarker.setLngLat(pos);

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
