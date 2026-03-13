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

  animateFlight(flight, onComplete) {
    const { origin, destination, airline } = flight;
    const map = this.instance;

    // Fit both cities in view first
    this.fitBounds([origin, destination]);

    const pathId = 'flight-path-' + Date.now();

    // Add dashed path source
    map.addSource(pathId, {
      type: 'geojson',
      data: { type: 'Feature', geometry: { type: 'LineString', coordinates: [[origin.lng, origin.lat]] } }
    });
    map.addLayer({
      id: pathId,
      type: 'line',
      source: pathId,
      paint: {
        'line-color': '#f0a500',
        'line-width': 2,
        'line-dasharray': [4, 4],
        'line-opacity': 0.6,
      }
    });

    // Plane marker
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
      .setLngLat([origin.lng, origin.lat])
      .addTo(map);

    const steps = 120;
    const duration = CONFIG.FLIGHT_DURATION_MS * (530 / airline.speed);
    const coords = [[origin.lng, origin.lat]];
    let step = 0;

    const interval = setInterval(() => {
      step++;
      const t = step / steps;

      const lng = origin.lng + (destination.lng - origin.lng) * t;
      const baseLat = origin.lat + (destination.lat - origin.lat) * t;
      const arcLift = Math.sin(t * Math.PI) * CONFIG.FLIGHT_ARC_HEIGHT * 12;
      const lat = baseLat + arcLift;

      coords.push([lng, lat]);

      map.getSource(pathId)?.setData({
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: coords }
      });

      // Rotate plane to face direction of travel
      if (coords.length >= 2) {
        const prev = coords[coords.length - 2];
        const curr = coords[coords.length - 1];
        const angle = Math.atan2(curr[0] - prev[0], curr[1] - prev[1]) * 180 / Math.PI;
        planeEl.style.transform = `rotate(${angle}deg)`;
      }

      this.planeMarker.setLngLat([lng, lat]);

      // Update flight overlay stats
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
