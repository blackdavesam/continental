// ============================================================
//  CONTINENTAL — ui.js
//  All screen rendering, panels, overlays
// ============================================================

const UI = {

  showScreen(name) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(`screen-${name}`)?.classList.add('active');
  },

  // ============================================================
  //  SETUP SCREEN
  // ============================================================
  initSetup() {
    const form = document.getElementById('setup-form');
    const teamCountInput = document.getElementById('team-count');
    const teamNamesDiv = document.getElementById('team-name-inputs');

    const renderNameInputs = (count) => {
      teamNamesDiv.innerHTML = '';
      for (let i = 0; i < count; i++) {
        const div = document.createElement('div');
        div.className = 'name-input-row';
        div.innerHTML = `
          <span class="team-dot" style="background:${CONFIG.TEAM_COLORS[i]}"></span>
          <input type="text" placeholder="${CONFIG.TEAM_NAMES[i]}" maxlength="20" class="team-name-input" data-index="${i}">
        `;
        teamNamesDiv.appendChild(div);
      }
    };

    renderNameInputs(parseInt(teamCountInput.value));
    teamCountInput.addEventListener('input', () => renderNameInputs(parseInt(teamCountInput.value)));

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const count = parseInt(teamCountInput.value);
      const names = [...document.querySelectorAll('.team-name-input')].map((el, i) =>
        el.value.trim() || CONFIG.TEAM_NAMES[i]
      );
      GAME.startGame(count, names);
    });
  },

  // ============================================================
  //  TEAM STRIP (bottom bar)
  // ============================================================
  renderTeamStrip() {
    const strip = document.getElementById('team-strip');
    strip.innerHTML = '';
    GAME.teams.forEach((team, i) => {
      const div = document.createElement('div');
      div.className = 'team-chip';
      div.id = `team-chip-${i}`;
      div.style.setProperty('--team-color', team.color);
      div.innerHTML = `
        <div class="team-avatar" style="--team-color:${team.color}">${team.name.charAt(0).toUpperCase()}</div>
        <div class="team-chip-name">${team.name}</div>
        <div class="team-chip-cash">$<span id="team-cash-${i}">${team.cash.toLocaleString()}</span></div>
        <div class="team-chip-cities"><span id="team-cities-${i}">${team.cities.size}</span> cities</div>
      `;
      strip.appendChild(div);
    });
  },

  updateTeamStrip() {
    GAME.teams.forEach((team, i) => {
      const cashEl = document.getElementById(`team-cash-${i}`);
      const citiesEl = document.getElementById(`team-cities-${i}`);
      if (cashEl) cashEl.textContent = team.cash.toLocaleString();
      if (citiesEl) citiesEl.textContent = team.cities.size;
    });
  },

  expandTeamPanel(teamIndex) {
    document.querySelectorAll('.team-chip').forEach((chip, i) => {
      chip.classList.toggle('active', i === teamIndex);
      chip.classList.toggle('inactive', i !== teamIndex);
    });
  },

  // ============================================================
  //  WIN CONDITION BADGE
  // ============================================================
  showWinCondition(wc) {
    const el = document.getElementById('win-condition-badge');
    el.textContent = wc.label;
    el.title = wc.description;
    el.style.opacity = '1';
  },

  // ============================================================
  //  HOME CITY REVEAL
  // ============================================================
  showHomeCityReveal(city) {
    const overlay = document.getElementById('overlay-reveal');
    overlay.innerHTML = `
      <div class="reveal-card">
        <div class="reveal-label">TODAY'S HOME CITY</div>
        <div class="reveal-city">${city.name}</div>
        <div class="reveal-airport">${city.airport} · ${city.country === 'CA' ? 'Canada' : city.country === 'MX' ? 'Mexico' : 'United States'}</div>
        <div class="reveal-tagline">${city.dossier.tagline}</div>
        <button class="btn-primary" onclick="UI.hideReveal(); GAME.startTurn()">Let's Go ✈</button>
      </div>
    `;
    overlay.classList.add('active');
  },

  hideReveal() {
    document.getElementById('overlay-reveal').classList.remove('active');
  },

  // ============================================================
  //  TURN ACTIONS PANEL
  // ============================================================
  showTurnActions(team) {
    const panel = document.getElementById('action-panel');
    panel.innerHTML = `
      <div class="action-header">
        <span class="action-team-dot" style="background:${team.color}"></span>
        <span class="action-team-name">${team.name}'s Turn</span>
        <span class="action-cash">$${team.cash.toLocaleString()}</span>
      </div>
      <div class="action-buttons">
        <button class="action-btn btn-challenge ${GAME.challengeTakenThisTurn ? 'used' : ''}"
          onclick="GAME.drawChallenge()" ${GAME.challengeTakenThisTurn ? 'disabled' : ''}>
          <span class="action-icon">🎯</span>
          <span class="action-label">Take a Challenge</span>
          <span class="action-sub">${GAME.challengeTakenThisTurn ? 'Already used this turn' : 'Earn Flight Points'}</span>
        </button>
        <button class="action-btn btn-fly" onclick="UI.showFlightPicker()">
          <span class="action-icon">✈</span>
          <span class="action-label">Book a Flight</span>
          <span class="action-sub">Spend Flight Points</span>
        </button>
      </div>
      <button class="btn-end-turn" onclick="UI.hideActionPanel(); GAME.nextTurn()">
        End Turn →
      </button>
    `;
    panel.classList.add('active');
  },

  hideActionPanel() {
    document.getElementById('action-panel').classList.remove('active');
  },

  // ============================================================
  //  FLIGHT PICKER
  // ============================================================
  showFlightPicker() {
    const team = GAME.currentTeam;
    const origin = team.currentCity;
    const overlay = document.getElementById('overlay-flight-picker');

    const cityOptions = CITIES
      .filter(c => c.id !== origin?.id)
      .map(c => {
        const distKm = haversineKm(origin.lat, origin.lng, c.lat, c.lng);
        const distMi = Math.round(distKm * 0.621371);
        const costs = Object.entries(CONFIG.AIRLINE_MODIFIERS).map(([key, airline]) => {
          const cost = GAME.getFlightCost(origin, c, key);
          return `<button class="airline-btn ${team.cash >= cost ? '' : 'disabled'}" 
            onclick="GAME.bookFlight('${c.id}', '${key}')"
            ${team.cash < cost ? 'disabled' : ''}>
            <span class="airline-name">${airline.label}</span>
            <span class="airline-cost">$${cost.toLocaleString()}</span>
          </button>`;
        }).join('');

        return `
          <div class="flight-row">
            <div class="flight-dest">
              <span class="flight-city">${c.name}</span>
              <span class="flight-meta">${c.airport} · ${distMi} mi</span>
            </div>
            <div class="flight-airlines">${costs}</div>
          </div>
        `;
      }).join('');

    overlay.innerHTML = `
      <div class="picker-panel">
        <div class="picker-header">
          <div class="picker-title">Book a Flight from ${origin.name}</div>
          <div class="picker-balance">Balance: $${team.cash.toLocaleString()}</div>
          <button class="picker-close" onclick="UI.hideFlightPicker()">✕</button>
        </div>
        <div class="picker-search">
          <input type="text" placeholder="Search destinations..." id="dest-search" oninput="UI.filterDestinations(this.value)">
        </div>
        <div class="picker-cities" id="picker-cities-list">
          ${cityOptions}
        </div>
      </div>
    `;
    overlay.classList.add('active');
  },

  filterDestinations(query) {
    const rows = document.querySelectorAll('.flight-row');
    rows.forEach(row => {
      const name = row.querySelector('.flight-city').textContent.toLowerCase();
      row.style.display = name.includes(query.toLowerCase()) ? '' : 'none';
    });
  },

  hideFlightPicker() {
    document.getElementById('overlay-flight-picker').classList.remove('active');
  },

  // ============================================================
  //  BOARDING PASS
  // ============================================================
  showBoardingPass(flight, team) {
    this.hideFlightPicker();
    this.hideActionPanel();

    const overlay = document.getElementById('overlay-boarding-pass');
    const deptTime = new Date();
    const arrTime = new Date(deptTime.getTime() + (flight.distanceMiles / flight.airline.speed) * 3600000);
    const fmt = (d) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    overlay.innerHTML = `
      <div class="boarding-pass" style="--team-color:${team.color}">
        <div class="bp-header">
          ${CONFIG.AIRLINE_LOGOS[flight.airline.logoKey]
            ? `<img class="bp-logo" src="${CONFIG.AIRLINE_LOGOS[flight.airline.logoKey]}" alt="${flight.airline.label}">`
            : `<div class="bp-airline">${flight.airline.label}</div>`}
          <div class="bp-flight-num">Flight ${flight.flightNumber}</div>
        </div>
        <div class="bp-route">
          <div class="bp-city-block">
            <div class="bp-iata">${flight.origin.airport}</div>
            <div class="bp-city-name">${flight.origin.name}</div>
            <div class="bp-time">${fmt(deptTime)}</div>
          </div>
          <div class="bp-arrow">
            <div class="bp-arrow-line"></div>
            <div class="bp-plane-icon">✈</div>
            <div class="bp-distance">${flight.distanceMiles.toLocaleString()} mi</div>
          </div>
          <div class="bp-city-block">
            <div class="bp-iata">${flight.destination.airport}</div>
            <div class="bp-city-name">${flight.destination.name}</div>
            <div class="bp-time">${fmt(arrTime)}</div>
          </div>
        </div>
        <div class="bp-footer">
          <div class="bp-detail"><span>PASSENGER</span><strong>${team.name}</strong></div>
          <div class="bp-detail"><span>CABIN</span><strong>${flight.airline.cabin}</strong></div>
          <div class="bp-detail"><span>GATE</span><strong>${String.fromCharCode(65 + Math.floor(Math.random()*6))}${Math.floor(Math.random()*30)+1}</strong></div>
          <div class="bp-barcode">|||  |||  || |||  ||  ||| ||</div>
        </div>
        <button class="btn-primary bp-launch" onclick="GAME.launchFlight()">Board Flight →</button>
      </div>
    `;
    overlay.classList.add('active');
  },

  hideBoardingPass() {
    document.getElementById('overlay-boarding-pass').classList.remove('active');
  },

  // ============================================================
  //  FLIGHT OVERLAY (airline screen)
  // ============================================================
  showFlightOverlay(flight) {
    const overlay = document.getElementById('overlay-flight');
    overlay.innerHTML = `
      <div class="flight-screen">
        <div class="fs-header">
          ${CONFIG.AIRLINE_LOGOS[flight.airline.logoKey]
            ? `<img class="fs-logo" src="${CONFIG.AIRLINE_LOGOS[flight.airline.logoKey]}" alt="${flight.airline.label}">`
            : `<span class="fs-airline">${flight.airline.label}</span>`}
          <span class="fs-flight">${flight.flightNumber}</span>
          <span class="fs-route">${flight.origin.airport} → ${flight.destination.airport}</span>
        </div>
        <div class="fs-grid">
          <div class="fs-stat">
            <div class="fs-stat-label">ALTITUDE</div>
            <div class="fs-stat-value" id="fs-altitude">0 ft</div>
          </div>
          <div class="fs-stat">
            <div class="fs-stat-label">AIRSPEED</div>
            <div class="fs-stat-value" id="fs-speed">0 mph</div>
          </div>
          <div class="fs-stat">
            <div class="fs-stat-label">DISTANCE LEFT</div>
            <div class="fs-stat-value" id="fs-distance">${flight.distanceMiles.toLocaleString()} mi</div>
          </div>
          <div class="fs-stat">
            <div class="fs-stat-label">TIME LEFT</div>
            <div class="fs-stat-value" id="fs-time">--</div>
          </div>
          <div class="fs-stat">
            <div class="fs-stat-label">OUTSIDE TEMP</div>
            <div class="fs-stat-value" id="fs-temp">20°C</div>
          </div>
          <div class="fs-stat">
            <div class="fs-stat-label">DESTINATION</div>
            <div class="fs-stat-value fs-dest">${flight.destination.name}</div>
          </div>
        </div>
        <div class="fs-progress-bar">
          <div class="fs-progress-fill" id="fs-progress"></div>
        </div>
      </div>
    `;
    overlay.classList.add('active');
  },

  updateFlightData({ distLeft, altitude, speed, timeLeftMin, outsideTemp }) {
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('fs-altitude', `${altitude.toLocaleString()} ft`);
    set('fs-speed', `${speed.toLocaleString()} mph`);
    set('fs-distance', `${distLeft.toLocaleString()} mi`);
    set('fs-time', `${Math.floor(timeLeftMin/60)}h ${timeLeftMin%60}m`);
    set('fs-temp', `${outsideTemp}°C`);
    const total = GAME.activeFlight?.distanceMiles || 1;
    const progress = Math.round((1 - distLeft / total) * 100);
    const bar = document.getElementById('fs-progress');
    if (bar) bar.style.width = `${progress}%`;
  },

  hideFlightOverlay() {
    document.getElementById('overlay-flight').classList.remove('active');
  },

  // ============================================================
  //  CHALLENGE
  // ============================================================
  showChallenge(q) {
    this.hideActionPanel();
    const overlay = document.getElementById('overlay-challenge');
    let content = '';

    if (q.type === 'multiple_choice') {
      content = `
        <div class="challenge-options">
          ${q.options.map(opt => `
            <button class="option-btn" onclick="GAME.answerChallenge('${opt}')">
              ${opt}
            </button>
          `).join('')}
        </div>
      `;
    } else if (q.type === 'odd_one_out') {
      content = `
        <div class="challenge-options odd-one-out">
          ${q.items.map(item => `
            <button class="option-btn" onclick="GAME.answerChallenge('${item}')">
              ${item}
            </button>
          `).join('')}
        </div>
      `;
    } else if (q.type === 'bullseye') {
      content = `
        <div class="bullseye-instruction">
          <div class="bullseye-icon">🎯</div>
          <div class="bullseye-text">Tap the city on the map!</div>
        </div>
      `;
    }

    const payout = CONFIG.CHALLENGE_PAYOUTS[q.difficulty];
    overlay.innerHTML = `
      <div class="challenge-card">
        <div class="challenge-meta">
          <span class="challenge-diff diff-${q.difficulty}">${q.difficulty}</span>
          <span class="challenge-payout">+$${payout.toLocaleString()}</span>
          <div class="challenge-timer-bar"><div class="challenge-timer-fill" id="challenge-timer"></div></div>
        </div>
        <div class="challenge-question">${q.question}</div>
        ${content}
      </div>
    `;
    overlay.classList.add('active');

    if (q.type === 'bullseye') {
      overlay.classList.add('transparent');
      const target = CITIES.find(c => c.id === q.targetCity);
      // Start a 25 s timer so the game can't get permanently stuck
      this.startChallengeTimer(25);
      MAP.enableBullseye(target, (lngLat) => {
        clearInterval(this._timerInterval);   // cancel timer on successful click
        overlay.classList.remove('transparent');
        GAME.answerChallenge(lngLat);
      });
    } else {
      overlay.classList.remove('transparent');
      this.startChallengeTimer(q.difficulty === 'easy' ? 15 : q.difficulty === 'medium' ? 20 : 30);
    }
  },

  startChallengeTimer(seconds) {
    const bar = document.getElementById('challenge-timer');
    if (!bar) return;
    let elapsed = 0;
    const total = seconds * 1000;
    const step = 100;
    this._timerInterval = setInterval(() => {
      elapsed += step;
      const pct = Math.max(0, 100 - (elapsed / total * 100));
      bar.style.width = `${pct}%`;
      if (pct === 0) {
        clearInterval(this._timerInterval);
        GAME.answerChallenge(null); // time's up
      }
    }, step);
  },

  hideChallenge() {
    clearInterval(this._timerInterval);
    document.getElementById('overlay-challenge').classList.remove('active', 'transparent');
    MAP.disableBullseye();
  },

  showAnswerResult(correct, q, payout) {
    this.hideChallenge();
    const overlay = document.getElementById('overlay-result');
    overlay.innerHTML = `
      <div class="result-card ${correct ? 'correct' : 'incorrect'}">
        <div class="result-icon">${correct ? '✓' : '✗'}</div>
        <div class="result-label">${correct ? 'Correct!' : 'Not quite!'}</div>
        ${correct ? `<div class="result-payout">+$${payout.toLocaleString()}</div>` : ''}
        <div class="result-fact">${q.fact}</div>
        <button class="btn-primary" onclick="UI.hideResult(); UI.showTurnActions(GAME.currentTeam)">
          Continue
        </button>
      </div>
    `;
    overlay.classList.add('active');
    this.updateTeamStrip();

    // Show city reveal on map
    const revealCityId = q.revealCity || q.targetCity;
    if (revealCityId) {
      const city = CITIES.find(c => c.id === revealCityId);
      if (city) MAP.flyTo(city.lng, city.lat, 5.5);
    }
  },

  hideResult() {
    document.getElementById('overlay-result').classList.remove('active');
  },

  // ============================================================
  //  ARRIVAL
  // ============================================================
  showArrival(city, team, isNew, bonus) {
    const overlay = document.getElementById('overlay-arrival');
    overlay.innerHTML = `
      <div class="arrival-card">
        <div class="arrival-label">NOW ARRIVING</div>
        <div class="arrival-city">${city.name}</div>
        <div class="arrival-airport">${city.airport} International Airport</div>
        ${isNew ? `<div class="arrival-new">✦ New city! +${team.cities.size} total</div>` : ''}
        ${bonus > 0 ? `<div class="arrival-bonus">🥇 First arrival bonus! +$${bonus.toLocaleString()}</div>` : ''}
        <div class="arrival-fact">${city.dossier.didYouKnow}</div>
        <div class="arrival-actions">
          <button class="btn-secondary" onclick="UI.showDossier('${city.id}')">📖 Travel Guide</button>
          <button class="btn-primary" onclick="UI.hideArrival(); GAME.nextTurn()">End Turn →</button>
        </div>
      </div>
    `;
    overlay.classList.add('active');
    this.updateTeamStrip();
  },

  hideArrival() {
    document.getElementById('overlay-arrival').classList.remove('active');
  },

  // ============================================================
  //  CITY DOSSIER
  // ============================================================
  showDossier(cityId) {
    const city = CITIES.find(c => c.id === cityId);
    if (!city) return;
    const overlay = document.getElementById('overlay-dossier');
    overlay.innerHTML = `
      <div class="dossier-panel">
        <button class="dossier-close" onclick="UI.hideDossier()">✕</button>
        <div class="dossier-header">
          <div class="dossier-iata">${city.airport}</div>
          <div class="dossier-city">${city.name}</div>
          <div class="dossier-tagline">${city.dossier.tagline}</div>
        </div>
        <div class="dossier-facts">
          <div class="dossier-stat"><span>Country</span><strong>${city.country === 'CA' ? 'Canada' : city.country === 'MX' ? 'Mexico' : 'USA'}</strong></div>
          <div class="dossier-stat"><span>Region</span><strong>${REGIONS[city.region]?.label || city.region}</strong></div>
          <div class="dossier-stat"><span>Population</span><strong>${(city.population / 1000000).toFixed(1)}M</strong></div>
          <div class="dossier-stat"><span>Airport Code</span><strong>${city.airport}</strong></div>
        </div>
        <div class="dossier-did-you-know">
          <div class="dossier-dyk-label">Did you know?</div>
          <div class="dossier-dyk-text">${city.dossier.didYouKnow}</div>
        </div>
      </div>
    `;
    overlay.classList.add('active');
  },

  hideDossier() {
    document.getElementById('overlay-dossier').classList.remove('active');
  },

  // ============================================================
  //  WIN SCREEN
  // ============================================================
  showWinScreen(winner, allTeams) {
    const overlay = document.getElementById('overlay-win');
    const sorted = [...allTeams].sort((a, b) => b.cities.size - a.cities.size);
    overlay.innerHTML = `
      <div class="win-screen">
        <div class="win-label">WINNER!</div>
        <div class="win-team" style="color:${winner.color}">${winner.name}</div>
        <div class="win-stat">${winner.cities.size} cities visited</div>
        <div class="win-leaderboard">
          ${sorted.map((t, i) => `
            <div class="win-lb-row ${t.id === winner.id ? 'winner' : ''}">
              <span class="win-lb-rank">${i+1}</span>
              <span class="win-lb-dot" style="background:${t.color}"></span>
              <span class="win-lb-name">${t.name}</span>
              <span class="win-lb-cities">${t.cities.size} cities</span>
              <span class="win-lb-cash">$${t.cash.toLocaleString()}</span>
            </div>
          `).join('')}
        </div>
        <button class="btn-primary" onclick="location.reload()">Play Again</button>
      </div>
    `;
    overlay.classList.add('active');
  },

  // ============================================================
  //  NOTIFICATIONS
  // ============================================================
  showNotification(msg, type = 'info') {
    const el = document.createElement('div');
    el.className = `notification notif-${type}`;
    el.textContent = msg;
    document.getElementById('notifications').appendChild(el);
    setTimeout(() => el.classList.add('show'), 10);
    setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 400); }, 3000);
  },
};
