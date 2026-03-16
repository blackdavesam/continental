// ============================================================
//  CONTINENTAL — game.js
//  Core game state machine
// ============================================================

// Utility: haversine distance in km between two lat/lng points
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getFlightCost(origin, destination, airlineKey) {
  const dist = haversineKm(origin.lat, origin.lng, destination.lat, destination.lng);
  const airline = CONFIG.AIRLINE_POOL[airlineKey] || CONFIG.AIRLINE_MODIFIERS[airlineKey];

  // Base rate: $0.18 per km, minimum $150
  const baseRate = 0.18;
  const base = Math.max(150, Math.round(dist * baseRate));

  // Per-route variance: deterministic based on city pair so it's
  // consistent within a session but feels organic
  const seed = (origin.id + destination.id).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const variance = ((seed % 21) - 10) / 100; // -10% to +10%
  const varied = Math.round(base * (1 + variance));

  // Airline modifier
  const total = varied + airline.modifier;

  // Round to nearest $5 for clean display
  return Math.max(100, Math.round(total / 5) * 5);
}

// Returns array of airlineKeys available for a given origin→destination pair
function getAvailableAirlines(origin, destination) {
  const rules = CONFIG.ROUTE_COVERAGE_RULES;
  const pool = CONFIG.AIRLINE_POOL;

  return Object.entries(pool).filter(([key, airline]) => {
    return airline.coverage.some(tag => {
      const rule = rules[tag];
      if (!rule) return false;

      // Country-pair rule
      if (rule.originCountries) {
        return rule.originCountries.includes(origin.country) &&
               rule.destCountries.includes(destination.country);
      }

      // City-allowlist rule
      if (rule.allowedCityIds) {
        return rule.allowedCityIds.includes(origin.id) &&
               rule.allowedCityIds.includes(destination.id);
      }

      return false;
    });
  }).map(([key]) => key);
}

const GAME = {

  // --- STATE ---
  state: 'setup',
  teams: [],
  currentTeamIndex: 0,
  round: 0,
  winCondition: null,
  homeCity: null,
  firstVisits: {},     // { cityId: teamId }
  activeChallenge: null,
  activeFlight: null,
  mapReady: false,
  challengeTakenThisTurn: false,

  // --- COMPUTED ---
  get currentTeam() {
    return this.teams[this.currentTeamIndex];
  },

  // --- INIT ---
  init() {
    UI.showScreen('setup');
    UI.initSetup();
  },

  // --- SETUP ---
  async startGame(teamCount, teamNames) {
    this.teams = [];
    this.firstVisits = {};
    this.round = 0;
    this.currentTeamIndex = 0;

    for (let i = 0; i < teamCount; i++) {
      this.teams.push({
        id: i,
        name: teamNames[i] || CONFIG.TEAM_NAMES[i],
        color: CONFIG.TEAM_COLORS[i],
        cash: CONFIG.STARTING_CASH,
        cities: new Set(),
        badges: [],
        currentCity: null,
      });
    }

    // Pick random home city FIRST (needed for airline selection)
    const homeCityId = CONFIG.HOME_CITIES[Math.floor(Math.random() * CONFIG.HOME_CITIES.length)];
    this.homeCity = CITIES.find(c => c.id === homeCityId) || CITIES[0];

    // Pick 3-4 airlines relevant to the home city, always include at least one major
    const allKeys = Object.keys(CONFIG.AIRLINE_POOL);
    const majors = ['delta', 'united', 'american'];
    const others = allKeys.filter(k => !majors.includes(k));

    // Always include 1 random major
    const selectedMajor = majors[Math.floor(Math.random() * majors.length)];

    // Pick 2 others that serve the home city's region
    const homeAvailable = getAvailableAirlines(this.homeCity, this.homeCity);
    const relevantOthers = others
      .filter(k => homeAvailable.includes(k))
      .sort(() => Math.random() - 0.5)
      .slice(0, 2);

    CONFIG.AIRLINE_MODIFIERS = {};
    [selectedMajor, ...relevantOthers].forEach(k => {
      CONFIG.AIRLINE_MODIFIERS[k] = CONFIG.AIRLINE_POOL[k];
    });

    // All teams start at home city
    this.teams.forEach(team => {
      team.currentCity = this.homeCity;
      team.cities.add(this.homeCity.id);
    });
    this.firstVisits[this.homeCity.id] = 0; // no bonus for home city

    // Draw random win condition
    this.winCondition = CONFIG.WIN_CONDITIONS[
      Math.floor(Math.random() * CONFIG.WIN_CONDITIONS.length)
    ];

    UI.showScreen('game');
    UI.renderTeamStrip();
    UI.showWinCondition(this.winCondition);

    // Init map (may take a moment)
    await MAP.init();
    this.mapReady = true;
    MAP.flyTo(this.homeCity.lng, this.homeCity.lat, 3.5);

    // Place all team avatars at the home city
    this.teams.forEach(team => MAP.updateTeamMarker(team));

    // Show home city reveal, then start turn
    UI.showHomeCityReveal(this.homeCity);
  },

  // --- TURN MANAGEMENT ---
  startTurn() {
    this.state = 'playing';
    this.challengeTakenThisTurn = false;
    UI.expandTeamPanel(this.currentTeamIndex);
    UI.showTurnActions(this.currentTeam);
    if (this.mapReady) MAP.flyTo(this.currentTeam.currentCity.lng, this.currentTeam.currentCity.lat, 4);
  },

  nextTurn() {
    this.currentTeamIndex = (this.currentTeamIndex + 1) % this.teams.length;
    if (this.currentTeamIndex === 0) this.round++;
    this.startTurn();
  },

  // --- CHALLENGE ---
  drawChallenge() {
    if (this.challengeTakenThisTurn) return;
    const available = QUESTIONS.filter(q =>
      !this.activeChallenge || q.id !== this.activeChallenge.id
    );
    const q = available[Math.floor(Math.random() * available.length)];
    this.activeChallenge = q;
    this.challengeTakenThisTurn = true;
    this.state = 'challenge';
    UI.showChallenge(q);
  },

  answerChallenge(answer) {
    const q = this.activeChallenge;
    const team = this.currentTeam;

    if (answer === null) {
      // Time's up
      UI.showAnswerResult(false, q, 0);
      return;
    }

    if (q.type === 'bullseye') {
      const target = CITIES.find(c => c.id === q.targetCity);
      const distKm = haversineKm(answer.lat, answer.lng, target.lat, target.lng);
      const maxDist = 2000;
      const accuracy = Math.max(0, 1 - distKm / maxDist);
      const payout = Math.round(accuracy * CONFIG.CHALLENGE_PAYOUTS[q.difficulty]);
      const correct = distKm < 400;
      if (payout > 0) team.cash += payout;
      UI.showAnswerResult(correct, q, payout);
      return;
    }

    const correct = answer === q.answer;
    let payout = 0;
    if (correct) {
      payout = CONFIG.CHALLENGE_PAYOUTS[q.difficulty];
      team.cash += payout;
    }
    UI.showAnswerResult(correct, q, payout);
  },

  // --- FLIGHT ---
  bookFlight(destinationId, airlineKey) {
    const team = this.currentTeam;
    const origin = team.currentCity;
    const destination = CITIES.find(c => c.id === destinationId);
    if (!destination) return;

    const cost = getFlightCost(origin, destination, airlineKey);
    if (team.cash < cost) {
      UI.showNotification('Not enough Flight Points!', 'error');
      return;
    }

    team.cash -= cost;

    const distKm = haversineKm(origin.lat, origin.lng, destination.lat, destination.lng);
    const distMiles = Math.round(distKm * 0.621371);
    const airline = CONFIG.AIRLINE_MODIFIERS[airlineKey];

    this.activeFlight = {
      origin, destination,
      distanceMiles: distMiles,
      distanceKm: Math.round(distKm),
      airline, airlineKey,
      flightNumber: `CA${Math.floor(Math.random() * 900) + 100}`,
    };

    this.state = 'flight';
    UI.showBoardingPass(this.activeFlight, team);
  },

  launchFlight() {
    const flight = this.activeFlight;
    const team = this.currentTeam;
    UI.hideBoardingPass();
    UI.showFlightOverlay(flight);
    MAP.animateFlight(flight, () => {
      this.landAtCity(flight.destination, team);
    });
  },

  landAtCity(city, team) {
    UI.hideFlightOverlay();
    team.currentCity = city;

    const isNew = !team.cities.has(city.id);
    if (isNew) team.cities.add(city.id);

    // First visit bonus
    let bonus = 0;
    if (this.firstVisits[city.id] === undefined) {
      this.firstVisits[city.id] = team.id;
      bonus = CONFIG.FIRST_VISIT_BONUS;
      team.cash += bonus;
      team.badges.push({ type: 'first_visit', cityId: city.id });
    }

    MAP.placePin(city, team);
    MAP.updateTeamMarker(team);
    this.state = 'arrived';
    UI.showArrival(city, team, isNew, bonus);
    UI.updateTeamStrip();

    const winner = this.checkWin();
    if (winner) setTimeout(() => this.endGame(winner), 2500);
  },

  // --- WIN CHECK ---
  checkWin() {
    const wc = this.winCondition;
    for (const team of this.teams) {
      if (wc.type === 'race') {
        if (team.cities.size >= wc.target) return team;
      } else if (wc.type === 'collection') {
        if (wc.filter === 'allRegions') {
          const visitedRegions = new Set(
            [...team.cities].map(id => CITIES.find(c => c.id === id)?.region).filter(Boolean)
          );
          if (visitedRegions.size >= Object.keys(REGIONS).length) return team;
        } else {
          const matching = [...team.cities].filter(id =>
            CITIES.find(c => c.id === id)?.tags?.includes(wc.filter)
          );
          if (matching.length >= (wc.target || 1)) return team;
        }
      } else if (wc.type === 'rounds') {
        if (this.round >= wc.rounds) {
          return this.teams.reduce((a, b) => a.cities.size >= b.cities.size ? a : b);
        }
      }
    }
    return null;
  },

  endGame(winner) {
    this.state = 'gameover';
    UI.showWinScreen(winner, this.teams);
  },

  // Expose for ui.js
  getFlightCost(origin, destination, airlineKey) {
    return getFlightCost(origin, destination, airlineKey);
  },
};
