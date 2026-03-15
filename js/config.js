// ============================================================
//  CONTINENTAL — config.js
//  Edit this file to change game settings, cities, airlines
// ============================================================

const CONFIG = {

  // --- MAP ---
  MAP_THEME: 'dark',           // 'dark' | 'light' | 'night'
  MAP_STYLE_URL: '../north-america.pmtiles',
  GLYPH_URL: '../assets/fonts/glyphs/{fontstack}/{range}.pbf',
  MAP_CENTER: [-96, 48],
  MAP_ZOOM: 3.2,

  // --- ECONOMY ---
  STARTING_CASH: 1500,
  FIRST_VISIT_BONUS: 200,

  CHALLENGE_PAYOUTS: {
    easy:   100,
    medium: 250,
    hard:   500,
  },

  FLIGHT_COSTS: {
    short:  300,   // < 500 miles
    medium: 600,   // 500–1500 miles
    long:   1000,  // > 1500 miles
  },

  // Full pool of airlines — 3 are randomly chosen at game start
  AIRLINE_POOL: {
    delta:    { label: 'Delta Air Lines',    cabin: 'Main Cabin',      modifier: 0,    speed: 480, color: '#9b2226', logoKey: 'DAL' },
    united:   { label: 'United Airlines',    cabin: 'Economy Plus',    modifier: 100,  speed: 530, color: '#1e40af', logoKey: 'UAL' },
    american: { label: 'American Airlines',  cabin: 'First Class',     modifier: 300,  speed: 590, color: '#b91c1c', logoKey: 'AAL' },
    southwest:{ label: 'Southwest Airlines', cabin: 'Wanna Get Away',  modifier: -100, speed: 450, color: '#e87722', logoKey: 'SWA' },
    jetblue:  { label: 'JetBlue Airways',    cabin: 'Blue',            modifier: 50,   speed: 510, color: '#003876', logoKey: 'JBU' },
    alaska:   { label: 'Alaska Airlines',    cabin: 'Main Cabin',      modifier: 75,   speed: 505, color: '#01426a', logoKey: 'ASA' },
    spirit:   { label: 'Spirit Airlines',    cabin: 'Main',            modifier: -200, speed: 410, color: '#f7e600', logoKey: 'NKS' },
    frontier: { label: 'Frontier Airlines',  cabin: 'Basic',           modifier: -150, speed: 430, color: '#4caf50', logoKey: 'FFT' },
  },

  // Active airlines for this game — populated at game start from AIRLINE_POOL
  AIRLINE_MODIFIERS: {},

  // Airline logo data URIs — injected by build.py (and js/logos.js in dev)
  AIRLINE_LOGOS: {},

  // --- FLIGHT ANIMATION ---
  FLIGHT_DURATION_MS: 6000,      // base duration, modified by airline speed
  FLIGHT_ARC_HEIGHT: 0.3,        // curve of the flight path (0 = straight)

  // --- TEAMS ---
  MAX_TEAMS: 4,
  TEAM_COLORS: ['#ef4444', '#3b82f6', '#22c55e', '#f0a500'],
  TEAM_NAMES:  ['Team Red', 'Team Blue', 'Team Green', 'Team Gold'],

  // --- HOME CITIES (rotating start) ---
  HOME_CITIES: [
    'toronto', 'chicago', 'los_angeles', 'miami',
    'seattle', 'new_york', 'mexico_city', 'montreal',
  ],

  // --- WIN CONDITIONS (randomly drawn at game start) ---
  WIN_CONDITIONS: [
    { id: 'race_10',    label: 'Race to 10 Cities',       description: 'First team to visit 10 unique cities wins!',                    type: 'race',       target: 10 },
    { id: 'race_15',    label: 'Race to 15 Cities',       description: 'First team to visit 15 unique cities wins!',                    type: 'race',       target: 15 },
    { id: 'coastal',    label: 'Coastal Explorer',         description: 'First team to visit 5 coastal cities wins!',                    type: 'collection', filter: 'coastal',   target: 5 },
    { id: 'regions',    label: 'Continental Domination',   description: 'First team to visit a city in every region wins!',              type: 'collection', filter: 'allRegions' },
    { id: 'distance',   label: 'Frequent Flyer',           description: 'Most unique cities after 8 rounds wins!',                       type: 'rounds',     rounds: 8 },
    { id: 'landlocked', label: 'Heartland Challenge',      description: 'First team to visit 5 landlocked cities wins!',                 type: 'collection', filter: 'landlocked', target: 5 },
    { id: 'big_cities', label: 'Megalopolis',              description: 'First team to visit 4 cities with 1M+ population wins!',        type: 'collection', filter: 'population_1m', target: 4 },
    { id: 'canada',     label: 'True North',               description: 'First team to visit 4 Canadian cities wins!',                   type: 'collection', filter: 'canada',    target: 4 },
  ],

};

// ============================================================
//  CITIES DATA
// ============================================================

const CITIES = [
  // --- CANADA ---
  { id: 'toronto',      name: 'Toronto',       country: 'CA', region: 'great_lakes',  lat: 43.651, lng: -79.347, population: 2930000, tags: ['canada'],                airport: 'YYZ', dossier: { tagline: 'Where the world meets in one city', didYouKnow: "Toronto is the most multicultural city on Earth — over 200 languages are spoken here." } },
  { id: 'montreal',     name: 'Montréal',      country: 'CA', region: 'northeast',    lat: 45.508, lng: -73.587, population: 1780000, tags: ['canada'],                airport: 'YUL', dossier: { tagline: 'The Paris of North America', didYouKnow: "Montréal has the world's largest underground city — 32km of tunnels." } },
  { id: 'vancouver',    name: 'Vancouver',     country: 'CA', region: 'pacific',      lat: 49.282, lng: -123.12, population: 675000,  tags: ['canada', 'coastal'],    airport: 'YVR', dossier: { tagline: 'Mountains meet the Pacific', didYouKnow: "Vancouver has never hosted a White Christmas — it rains more than it snows." } },
  { id: 'calgary',      name: 'Calgary',       country: 'CA', region: 'prairies',     lat: 51.044, lng: -114.07, population: 1336000, tags: ['canada', 'landlocked'], airport: 'YYC', dossier: { tagline: 'Stampede city at the foot of the Rockies', didYouKnow: "Calgary is one of the sunniest cities in Canada, with more sunshine than Miami." } },
  { id: 'ottawa',       name: 'Ottawa',        country: 'CA', region: 'northeast',    lat: 45.421, lng: -75.697, population: 994000,  tags: ['canada', 'landlocked'], airport: 'YOW', dossier: { tagline: "Canada's quietly extraordinary capital", didYouKnow: "Ottawa's Rideau Canal becomes the world's largest naturally frozen skating rink every winter." } },

  // --- USA NORTHEAST ---
  { id: 'new_york',     name: 'New York',      country: 'US', region: 'northeast',    lat: 40.712, lng: -74.006, population: 8336000, tags: ['coastal', 'population_1m'], airport: 'JFK', dossier: { tagline: 'The city that never sleeps', didYouKnow: "New York's subway system never closes — it has run 24/7 every day since 1904." } },
  { id: 'boston',       name: 'Boston',        country: 'US', region: 'northeast',    lat: 42.360, lng: -71.059, population: 695000,  tags: ['coastal'],              airport: 'BOS', dossier: { tagline: 'Where American history was made', didYouKnow: "Boston has the oldest public park in America — Boston Common, established in 1634." } },
  { id: 'philadelphia', name: 'Philadelphia',  country: 'US', region: 'northeast',    lat: 39.952, lng: -75.165, population: 1584000, tags: ['coastal', 'population_1m'], airport: 'PHL', dossier: { tagline: 'The city of brotherly love', didYouKnow: "Philadelphia was the capital of the United States before Washington D.C. was built." } },
  { id: 'washington',   name: 'Washington DC', country: 'US', region: 'northeast',    lat: 38.907, lng: -77.037, population: 705000,  tags: ['coastal'],              airport: 'DCA', dossier: { tagline: "The nation's capital", didYouKnow: "All Smithsonian museums in Washington D.C. are completely free to enter." } },

  // --- USA SOUTHEAST ---
  { id: 'miami',        name: 'Miami',         country: 'US', region: 'southeast',    lat: 25.761, lng: -80.191, population: 467000,  tags: ['coastal'],              airport: 'MIA', dossier: { tagline: 'Magic City where the Americas meet', didYouKnow: "Miami is the only major US city founded by a woman — Julia Tuttle in 1896." } },
  { id: 'atlanta',      name: 'Atlanta',       country: 'US', region: 'southeast',    lat: 33.748, lng: -84.387, population: 498000,  tags: ['landlocked'],           airport: 'ATL', dossier: { tagline: "The world's busiest airport calls it home", didYouKnow: "Hartsfield-Jackson Atlanta Airport has been the world's busiest airport for over 20 years." } },
  { id: 'new_orleans',  name: 'New Orleans',   country: 'US', region: 'southeast',    lat: 29.951, lng: -90.071, population: 383000,  tags: ['coastal'],              airport: 'MSY', dossier: { tagline: 'Where jazz was born and never left', didYouKnow: "New Orleans sits below sea level — the city is held up by a massive network of pumps running 24/7." } },
  { id: 'charlotte',    name: 'Charlotte',     country: 'US', region: 'southeast',    lat: 35.227, lng: -80.843, population: 874000,  tags: ['landlocked'],           airport: 'CLT', dossier: { tagline: 'Banking capital of the South', didYouKnow: "Charlotte is the second-largest US banking center after New York City." } },

  // --- USA MIDWEST ---
  { id: 'chicago',      name: 'Chicago',       country: 'US', region: 'great_lakes',  lat: 41.878, lng: -87.630, population: 2696000, tags: ['coastal', 'population_1m'], airport: 'ORD', dossier: { tagline: 'The city that built the modern world', didYouKnow: "Chicago invented the skyscraper — the world's first stood here in 1885." } },
  { id: 'detroit',      name: 'Detroit',       country: 'US', region: 'great_lakes',  lat: 42.331, lng: -83.045, population: 639000,  tags: ['coastal'],              airport: 'DTW', dossier: { tagline: 'Motor City, birthplace of Motown', didYouKnow: "Detroit is the only US city where Canada is to the south." } },
  { id: 'minneapolis',  name: 'Minneapolis',   country: 'US', region: 'midwest',      lat: 44.977, lng: -93.265, population: 429000,  tags: ['landlocked'],           airport: 'MSP', dossier: { tagline: 'City of lakes and fierce winters', didYouKnow: "Minneapolis has more miles of skyway than any other city — 80 blocks of enclosed bridges." } },
  { id: 'st_louis',     name: 'St. Louis',     country: 'US', region: 'midwest',      lat: 38.627, lng: -90.199, population: 301000,  tags: ['landlocked'],           airport: 'STL', dossier: { tagline: 'Gateway to the West', didYouKnow: "The Gateway Arch is taller than the Statue of Liberty and the Washington Monument." } },

  // --- USA SOUTH / CENTRAL ---
  { id: 'dallas',       name: 'Dallas',        country: 'US', region: 'south',        lat: 32.776, lng: -96.797, population: 1304000, tags: ['landlocked', 'population_1m'], airport: 'DFW', dossier: { tagline: 'Where the West begins', didYouKnow: "Dallas-Fort Worth airport is larger than Manhattan island." } },
  { id: 'houston',      name: 'Houston',       country: 'US', region: 'south',        lat: 29.760, lng: -95.370, population: 2304000, tags: ['coastal', 'population_1m'],    airport: 'IAH', dossier: { tagline: 'Space city, energy capital of the world', didYouKnow: "Houston has no zoning laws — the only major US city where you can build anything anywhere." } },
  { id: 'nashville',    name: 'Nashville',     country: 'US', region: 'south',        lat: 36.174, lng: -86.768, population: 689000,  tags: ['landlocked'],           airport: 'BNA', dossier: { tagline: 'Music City USA', didYouKnow: "Nashville has more than 180 music venues — more per capita than any city on Earth." } },
  { id: 'denver',       name: 'Denver',        country: 'US', region: 'mountain',     lat: 39.739, lng: -104.98, population: 715000,  tags: ['landlocked'],           airport: 'DEN', dossier: { tagline: 'Mile High City in the shadow of the Rockies', didYouKnow: "Denver's airport roof was designed to look like the Rocky Mountains — and is the largest airport in North America by land area." } },

  // --- USA WEST ---
  { id: 'los_angeles',  name: 'Los Angeles',   country: 'US', region: 'pacific',      lat: 34.052, lng: -118.24, population: 3979000, tags: ['coastal', 'population_1m'],    airport: 'LAX', dossier: { tagline: 'City of Angels, capital of dreams', didYouKnow: "Los Angeles has more cars than people — and the most freeway lanes of any city on Earth." } },
  { id: 'san_francisco',name: 'San Francisco', country: 'US', region: 'pacific',      lat: 37.774, lng: -122.42, population: 883000,  tags: ['coastal'],              airport: 'SFO', dossier: { tagline: 'The city that knows how', didYouKnow: "San Francisco's famous fog has a name — Karl. It even has its own Instagram account." } },
  { id: 'seattle',      name: 'Seattle',       country: 'US', region: 'pacific',      lat: 47.606, lng: -122.33, population: 737000,  tags: ['coastal'],              airport: 'SEA', dossier: { tagline: 'Emerald City between the mountains and the sea', didYouKnow: "Seattle gets 150 days of rain per year — yet has less total rainfall than New York City." } },
  { id: 'las_vegas',    name: 'Las Vegas',     country: 'US', region: 'mountain',     lat: 36.169, lng: -115.14, population: 641000,  tags: ['landlocked'],           airport: 'LAS', dossier: { tagline: 'The Entertainment Capital of the World', didYouKnow: "Las Vegas uses so much electricity that the Hoover Dam was built partly to power it." } },
  { id: 'phoenix',      name: 'Phoenix',       country: 'US', region: 'mountain',     lat: 33.448, lng: -112.07, population: 1608000, tags: ['landlocked', 'population_1m'], airport: 'PHX', dossier: { tagline: 'Valley of the Sun', didYouKnow: "Phoenix has more golf courses per capita than any other US city." } },

  // --- MEXICO ---
  { id: 'mexico_city',  name: 'Mexico City',   country: 'MX', region: 'mexico',       lat: 19.432, lng: -99.133, population: 9210000, tags: ['landlocked', 'population_1m'], airport: 'MEX', dossier: { tagline: 'Ancient heart of the Americas', didYouKnow: "Mexico City is sinking by up to 20cm a year — it was built on a drained lake." } },
  { id: 'cancun',       name: 'Cancún',        country: 'MX', region: 'mexico',       lat: 21.161, lng: -86.851, population: 888000,  tags: ['coastal'],              airport: 'CUN', dossier: { tagline: 'Caribbean turquoise on Mexican shores', didYouKnow: "Cancún was a tiny island of 117 people in 1970. The Mexican government planned it entirely from scratch." } },
  { id: 'guadalajara',  name: 'Guadalajara',   country: 'MX', region: 'mexico',       lat: 20.659, lng: -103.35, population: 1495000, tags: ['landlocked', 'population_1m'], airport: 'GDL', dossier: { tagline: 'Birthplace of mariachi and tequila', didYouKnow: "Tequila can only legally be produced in a small region around Guadalajara." } },
];

// ============================================================
//  REGIONS
// ============================================================

const REGIONS = {
  northeast:   { label: 'Northeast',     color: '#3b82f6' },
  southeast:   { label: 'Southeast',     color: '#22c55e' },
  great_lakes: { label: 'Great Lakes',   color: '#06b6d4' },
  midwest:     { label: 'Midwest',       color: '#8b5cf6' },
  south:       { label: 'South',         color: '#f59e0b' },
  mountain:    { label: 'Mountain West', color: '#ef4444' },
  pacific:     { label: 'Pacific',       color: '#10b981' },
  prairies:    { label: 'Prairies',      color: '#f97316' },
  mexico:      { label: 'Mexico',        color: '#ec4899' },
};

