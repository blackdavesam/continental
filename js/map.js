// ============================================================
//  CONTINENTAL — map.js
//  MapLibre + PMTiles map logic
// ============================================================

const MAP = {
  instance: null,
  pins: [],
  flightPaths: [],
  planeMarker: null,

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
    // Use Protomaps CDN for glyphs — no local font files needed
    const glyphBase = 'https://protomaps.github.io/basemaps-assets/fonts/';

    this.instance = new maplibregl.Map({
      container: 'map',
      style: this.buildStyle(glyphBase, pmtilesUrl),
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

    // Hide loading indicator
    const loader = document.getElementById('map-loading');
    if (loader) { loader.style.opacity = '0'; setTimeout(() => loader.remove(), 500); }

    return this;
  },

  buildStyle(glyphBase, pmtilesUrl) {
    return {
      version: 8,
      glyphs: glyphBase + '{fontstack}/{range}.pbf',
      sources: {
        protomaps: {
          type: 'vector',
          url: 'pmtiles://' + pmtilesUrl,
          attribution: '',
        },
      },
      layers: [
        {
          id: 'background',
          type: 'background',
          paint: { 'background-color': '#071525' }        // deep ocean
        },
        {
          id: 'water',
          type: 'fill',
          source: 'protomaps',
          'source-layer': 'water',
          paint: { 'fill-color': '#09192e' }              // lakes / rivers
        },
        {
          id: 'land',
          type: 'fill',
          source: 'protomaps',
          'source-layer': 'land',
          paint: { 'fill-color': '#1e3550' }              // landmass — clearly brighter than ocean
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
          paint: {
            'line-color': '#2e5070',
            'line-width': 0.6,
            'line-dasharray': [3, 3]
          }
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
        {
          id: 'place-labels',
          type: 'symbol',
          source: 'protomaps',
          'source-layer': 'places',
          filter: ['in', ['get', 'kind'], ['literal', ['city', 'town']]],
          layout: {
            'text-field': ['get', 'name'],
            'text-font': ['Noto Sans Regular'],
            'text-size': ['interpolate', ['linear'], ['zoom'], 3, 10, 6, 12, 9, 14],
            'text-max-width': 8,
            'text-anchor': 'top',
            'text-offset': [0, 0.3],
          },
          paint: {
            'text-color': '#b8d4f0',
            'text-halo-color': '#071525',
            'text-halo-width': 1.5,
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

    this.fitBounds([origin, destination]);

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

    const planeEl = document.createElement('div');
    planeEl.textContent = '✈';
    planeEl.style.cssText = `
      font-size: 22px;
      color: #f0a500;
      filter: drop-shadow(0 0 6px rgba(240,165,0,0.8));
      transform-origin: center center;
      display: block;
      line-height: 1;
    `;

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
        planeEl.style.transform = `rotate(${bearing}deg)`;
      }
      this.planeMarker.setLngLat(pos);

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
