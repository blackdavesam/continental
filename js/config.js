// ============================================================
//  CONTINENTAL — config.js
//  Edit this file to change game settings, cities, airlines
// ============================================================

const CONFIG = {

  // --- MAP ---
  MAP_THEME: 'auto',            // 'auto' — simulated day/night cycle
  DAY_NIGHT_CYCLE_MS: 300000,   // 5 minutes per full 24-hour in-game cycle
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

  // Full pool of airlines — subset selected at game start based on home city region
  AIRLINE_POOL: {
    // --- US MAJORS (fly everywhere) ---
    delta: {
      label: 'Delta Air Lines',     cabin: 'Main Cabin',         modifier: 0,    speed: 480, color: '#9b2226', logoKey: 'DAL',
      coverage: ['us_domestic', 'us_canada', 'us_mexico', 'canada_mexico'],
    },
    united: {
      label: 'United Airlines',     cabin: 'Economy Plus',       modifier: 80,   speed: 520, color: '#1e40af', logoKey: 'UAL',
      coverage: ['us_domestic', 'us_canada', 'us_mexico', 'canada_mexico'],
    },
    american: {
      label: 'American Airlines',   cabin: 'Main Cabin',         modifier: 60,   speed: 510, color: '#b91c1c', logoKey: 'AAL',
      coverage: ['us_domestic', 'us_canada', 'us_mexico', 'canada_mexico'],
    },

    // --- US BUDGET (domestic + selective international) ---
    southwest: {
      label: 'Southwest Airlines',  cabin: 'Wanna Get Away',     modifier: -120, speed: 450, color: '#e87722', logoKey: 'SWA',
      coverage: ['us_domestic'],
    },
    jetblue: {
      label: 'JetBlue Airways',     cabin: 'Blue',               modifier: -40,  speed: 500, color: '#003876', logoKey: 'JBU',
      coverage: ['us_domestic', 'us_mexico_leisure'],
    },
    frontier: {
      label: 'Frontier Airlines',   cabin: 'Basic',              modifier: -160, speed: 430, color: '#4caf50', logoKey: 'FFT',
      coverage: ['us_domestic', 'us_mexico_leisure'],
    },
    spirit: {
      label: 'Spirit Airlines',     cabin: 'Main',               modifier: -200, speed: 410, color: '#f7e600', logoKey: 'NKS',
      coverage: ['us_domestic', 'us_mexico_leisure'],
    },

    // --- US REGIONAL ---
    alaska: {
      label: 'Alaska Airlines',     cabin: 'Main Cabin',         modifier: -30,  speed: 495, color: '#01426a', logoKey: 'ASA',
      coverage: ['us_pacific', 'us_canada_west'],
      // Pacific Coast + Western Canada only: SEA, SFO, LAX, LAS, PHX, DEN + YVR, YYC
    },

    // --- CANADIAN CARRIERS ---
    air_canada: {
      label: 'Air Canada',          cabin: 'Economy',            modifier: 40,   speed: 490, color: '#cc0000', logoKey: 'ACA',
      coverage: ['us_canada', 'canada_domestic', 'canada_mexico'],
    },
    westjet: {
      label: 'WestJet',             cabin: 'Economy',            modifier: -50,  speed: 465, color: '#00457c', logoKey: 'WJA',
      coverage: ['canada_domestic', 'us_canada_west', 'canada_mexico'],
      // Canada domestic + US West + Mexico leisure. Calgary hub.
    },
    porter: {
      label: 'Porter Airlines',     cabin: 'Economy',            modifier: -20,  speed: 440, color: '#4a1942', logoKey: 'POE',
      coverage: ['canada_east', 'us_canada_east'],
      // Eastern Canada only: YYZ, YUL, YOW + US Northeast: BOS, JFK, ORD
    },

    // --- MEXICAN CARRIERS ---
    aeromexico: {
      label: 'Aeroméxico',          cabin: 'AM Plus',            modifier: 30,   speed: 470, color: '#002a5c', logoKey: 'AMX',
      coverage: ['us_mexico', 'canada_mexico', 'mexico_domestic'],
    },
    volaris: {
      label: 'Volaris',             cabin: 'Basic',              modifier: -180, speed: 415, color: '#8b1a8b', logoKey: 'VOI',
      coverage: ['us_mexico_popular', 'mexico_domestic'],
      // US cities with large Mexican populations: LAX, DFW, IAH, ORD, LAS only
    },
  },

  // Maps coverage tags to which city-pair types they allow.
  // Used by getAvailableAirlines(origin, destination)
  ROUTE_COVERAGE_RULES: {
    us_domestic:       { originCountries: ['US'],      destCountries: ['US'] },
    us_canada:         { originCountries: ['US','CA'],  destCountries: ['US','CA'] },
    us_mexico:         { originCountries: ['US','MX'],  destCountries: ['US','MX'] },
    canada_domestic:   { originCountries: ['CA'],      destCountries: ['CA'] },
    canada_mexico:     { originCountries: ['CA','MX'],  destCountries: ['CA','MX'] },
    mexico_domestic:   { originCountries: ['MX'],      destCountries: ['MX'] },

    // Restricted regional coverage — checked separately by city id
    us_pacific:        { allowedCityIds: ['seattle','san_francisco','los_angeles','las_vegas','phoenix','denver','portland','san_diego','honolulu','anchorage'] },
    us_canada_west:    { allowedCityIds: ['seattle','san_francisco','los_angeles','las_vegas','phoenix','denver','portland','san_diego','anchorage','vancouver','calgary','edmonton','winnipeg'] },
    us_canada_east:    { allowedCityIds: ['new_york','boston','philadelphia','washington','chicago','toronto','montreal','ottawa','pittsburgh','baltimore','hartford','hamilton','halifax','quebec_city'] },
    canada_east:       { allowedCityIds: ['toronto','montreal','ottawa','hamilton','halifax','quebec_city'] },
    us_mexico_leisure: { allowedCityIds: ['miami','new_york','boston','chicago','dallas','houston','los_angeles','san_francisco','seattle','las_vegas','phoenix','denver','atlanta','tampa','orlando','jacksonville','san_antonio','austin','san_diego','cancun','mexico_city','guadalajara','puerto_vallarta','merida','monterrey','tijuana'] },
    us_mexico_popular: { allowedCityIds: ['los_angeles','dallas','houston','chicago','las_vegas','san_francisco','phoenix','san_antonio','san_diego','cancun','mexico_city','guadalajara','monterrey','tijuana','puebla'] },
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
    'vancouver', 'dallas', 'denver', 'cancun',
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

  // === NEW CITIES ===

  // --- CANADA (5 new) ---
  { id: 'edmonton',     name: 'Edmonton',      country: 'CA', region: 'prairies',     lat: 53.546, lng: -113.49, population: 1010000, tags: ['canada', 'landlocked', 'population_1m'], airport: 'YEG', dossier: { tagline: 'Gateway to the Canadian North', didYouKnow: "Edmonton is the northernmost city in North America with a population over one million." } },
  { id: 'winnipeg',     name: 'Winnipeg',      country: 'CA', region: 'prairies',     lat: 49.895, lng: -97.138, population: 749000,  tags: ['canada', 'landlocked'], airport: 'YWG', dossier: { tagline: 'Heart of the continent', didYouKnow: "Winnipeg is the Slurpee capital of the world — it sells more than any other city, even in winter." } },
  { id: 'halifax',      name: 'Halifax',       country: 'CA', region: 'northeast',    lat: 44.648, lng: -63.575, population: 439000,  tags: ['canada', 'coastal'],    airport: 'YHZ', dossier: { tagline: "The Atlantic's front porch", didYouKnow: "Halifax played a central role in the Titanic disaster — most of the recovered victims are buried here." } },
  { id: 'quebec_city',  name: 'Quebec City',   country: 'CA', region: 'northeast',    lat: 46.813, lng: -71.208, population: 549000,  tags: ['canada'],               airport: 'YQB', dossier: { tagline: 'A piece of old France in North America', didYouKnow: "Quebec City is the only walled city north of Mexico — its fortifications date to the 1600s." } },
  { id: 'hamilton',     name: 'Hamilton',      country: 'CA', region: 'great_lakes',  lat: 43.255, lng: -79.871, population: 569000,  tags: ['canada'],               airport: 'YHM', dossier: { tagline: 'Steel city with a waterfall heart', didYouKnow: "Hamilton has over 100 waterfalls — more than any other city in the world." } },

  // --- USA NORTHEAST (3 new) ---
  { id: 'pittsburgh',   name: 'Pittsburgh',    country: 'US', region: 'northeast',    lat: 40.440, lng: -79.995, population: 302000,  tags: ['landlocked'],           airport: 'PIT', dossier: { tagline: 'Steel city reborn as a tech hub', didYouKnow: "Pittsburgh has 446 bridges — more than any other city in the world, including Venice." } },
  { id: 'baltimore',    name: 'Baltimore',     country: 'US', region: 'northeast',    lat: 39.290, lng: -76.612, population: 585000,  tags: ['coastal'],              airport: 'BWI', dossier: { tagline: 'Charm City on the Chesapeake', didYouKnow: "Baltimore is home to the first passenger railroad in the United States — the B&O Railroad." } },
  { id: 'hartford',     name: 'Hartford',      country: 'US', region: 'northeast',    lat: 41.763, lng: -72.685, population: 121000,  tags: ['landlocked'],           airport: 'BDL', dossier: { tagline: 'Insurance capital of the world', didYouKnow: "Mark Twain wrote his most famous novels while living in Hartford, Connecticut." } },

  // --- USA SOUTHEAST (3 new) ---
  { id: 'tampa',        name: 'Tampa',         country: 'US', region: 'southeast',    lat: 27.950, lng: -82.457, population: 384000,  tags: ['coastal'],              airport: 'TPA', dossier: { tagline: 'Sun, sea, and the Sunshine Skyway', didYouKnow: "Tampa hosts the largest pirate invasion in the world every year — Gasparilla." } },
  { id: 'jacksonville', name: 'Jacksonville',  country: 'US', region: 'southeast',    lat: 30.332, lng: -81.655, population: 949000,  tags: ['coastal'],              airport: 'JAX', dossier: { tagline: 'The biggest city you haven\'t explored', didYouKnow: "Jacksonville is the largest city by area in the contiguous United States." } },
  { id: 'orlando',      name: 'Orlando',       country: 'US', region: 'southeast',    lat: 28.538, lng: -81.379, population: 307000,  tags: ['landlocked'],           airport: 'MCO', dossier: { tagline: 'Theme park capital of the world', didYouKnow: "Orlando welcomes more than 75 million visitors a year — more than any other US city." } },

  // --- USA MIDWEST (5 new) ---
  { id: 'kansas_city',  name: 'Kansas City',   country: 'US', region: 'midwest',      lat: 39.099, lng: -94.578, population: 508000,  tags: ['landlocked'],           airport: 'MCI', dossier: { tagline: 'Barbecue, jazz, and fountains', didYouKnow: "Kansas City has more fountains than any city except Rome." } },
  { id: 'cincinnati',   name: 'Cincinnati',    country: 'US', region: 'midwest',      lat: 39.103, lng: -84.512, population: 309000,  tags: ['landlocked'],           airport: 'CVG', dossier: { tagline: 'Queen City on the Ohio River', didYouKnow: "Cincinnati was the first US city to build a professional baseball team — the Red Stockings in 1869." } },
  { id: 'indianapolis', name: 'Indianapolis',  country: 'US', region: 'midwest',      lat: 39.768, lng: -86.158, population: 887000,  tags: ['landlocked'],           airport: 'IND', dossier: { tagline: 'Crossroads of America', didYouKnow: "The Indianapolis 500 is the largest single-day sporting event in the world." } },
  { id: 'milwaukee',    name: 'Milwaukee',     country: 'US', region: 'great_lakes',  lat: 43.038, lng: -87.906, population: 577000,  tags: ['coastal'],              airport: 'MKE', dossier: { tagline: 'Brew City on Lake Michigan', didYouKnow: "Milwaukee once had more breweries per capita than any city in the world." } },
  { id: 'columbus',     name: 'Columbus',      country: 'US', region: 'midwest',      lat: 39.961, lng: -82.998, population: 905000,  tags: ['landlocked'],           airport: 'CMH', dossier: { tagline: "Ohio's rising capital", didYouKnow: "Columbus is the largest city in Ohio and one of the fastest-growing in the Midwest." } },

  // --- USA SOUTH (3 new) ---
  { id: 'austin',       name: 'Austin',        country: 'US', region: 'south',        lat: 30.267, lng: -97.743, population: 978000,  tags: ['landlocked'],           airport: 'AUS', dossier: { tagline: 'Keep Austin weird', didYouKnow: "Austin is the live music capital of the world, with more than 250 live music venues." } },
  { id: 'san_antonio',  name: 'San Antonio',   country: 'US', region: 'south',        lat: 29.424, lng: -98.493, population: 1434000, tags: ['landlocked', 'population_1m'], airport: 'SAT', dossier: { tagline: 'Remember the Alamo', didYouKnow: "San Antonio's River Walk is 15 miles long and sits 20 feet below street level." } },
  { id: 'memphis',      name: 'Memphis',       country: 'US', region: 'south',        lat: 35.149, lng: -90.048, population: 633000,  tags: ['landlocked'],           airport: 'MEM', dossier: { tagline: 'Home of the Blues and birthplace of Rock \'n\' Roll', didYouKnow: "FedEx chose Memphis as its hub because it sits at the geographic center of the United States." } },

  // --- USA MOUNTAIN (3 new) ---
  { id: 'salt_lake_city', name: 'Salt Lake City', country: 'US', region: 'mountain',  lat: 40.760, lng: -111.89, population: 200000,  tags: ['landlocked'],           airport: 'SLC', dossier: { tagline: 'Mountain oasis by the Great Salt Lake', didYouKnow: "The Great Salt Lake is so salty that you can float in it without trying." } },
  { id: 'albuquerque',  name: 'Albuquerque',   country: 'US', region: 'mountain',     lat: 35.084, lng: -106.65, population: 564000,  tags: ['landlocked'],           airport: 'ABQ', dossier: { tagline: 'Hot air balloon capital of the world', didYouKnow: "Albuquerque hosts the world's largest hot air balloon festival every October." } },
  { id: 'tucson',       name: 'Tucson',        country: 'US', region: 'mountain',     lat: 32.221, lng: -110.97, population: 542000,  tags: ['landlocked'],           airport: 'TUS', dossier: { tagline: 'The Old Pueblo', didYouKnow: "Tucson has been continuously inhabited for over 4,000 years — longer than any other city in North America." } },

  // --- USA PACIFIC (3 new) ---
  { id: 'portland',     name: 'Portland',      country: 'US', region: 'pacific',      lat: 45.505, lng: -122.68, population: 652000,  tags: ['coastal'],              airport: 'PDX', dossier: { tagline: 'Keep Portland weird', didYouKnow: "Portland has more breweries per capita than any other city in the world." } },
  { id: 'san_diego',    name: 'San Diego',     country: 'US', region: 'pacific',      lat: 32.715, lng: -117.16, population: 1386000, tags: ['coastal', 'population_1m'], airport: 'SAN', dossier: { tagline: "America's Finest City", didYouKnow: "San Diego has the most perfect weather of any US city — averaging 266 sunny days per year." } },
  { id: 'honolulu',     name: 'Honolulu',      country: 'US', region: 'pacific',      lat: 21.306, lng: -157.86, population: 350000,  tags: ['coastal'],              airport: 'HNL', dossier: { tagline: 'Paradise in the middle of the Pacific', didYouKnow: "Honolulu is the most isolated major city on Earth — 2,390 miles from the nearest mainland." } },
  { id: 'anchorage',    name: 'Anchorage',     country: 'US', region: 'pacific',      lat: 61.218, lng: -149.90, population: 291000,  tags: ['coastal'],              airport: 'ANC', dossier: { tagline: "Alaska's urban frontier", didYouKnow: "Anchorage receives 19 hours of daylight on the summer solstice and only 5.5 hours in winter." } },

  // --- MEXICO (7 new) ---
  { id: 'monterrey',    name: 'Monterrey',     country: 'MX', region: 'mexico',       lat: 25.686, lng: -100.31, population: 1135000, tags: ['landlocked', 'population_1m'], airport: 'MTY', dossier: { tagline: 'Industrial powerhouse of Mexico', didYouKnow: "Monterrey produces more steel than any other city in Latin America." } },
  { id: 'tijuana',      name: 'Tijuana',       country: 'MX', region: 'mexico',       lat: 32.514, lng: -117.03, population: 1922000, tags: ['coastal', 'population_1m'],    airport: 'TIJ', dossier: { tagline: 'The busiest border crossing on Earth', didYouKnow: "The San Ysidro port of entry between Tijuana and San Diego sees over 70,000 crossings per day." } },
  { id: 'puerto_vallarta', name: 'Puerto Vallarta', country: 'MX', region: 'mexico',  lat: 20.653, lng: -105.22, population: 291000,  tags: ['coastal'],              airport: 'PVR', dossier: { tagline: 'Pacific jewel of the Mexican Riviera', didYouKnow: "Puerto Vallarta became famous after Elizabeth Taylor and Richard Burton filmed Night of the Iguana here in 1964." } },
  { id: 'merida',       name: 'Mérida',        country: 'MX', region: 'mexico',       lat: 20.967, lng: -89.592, population: 995000,  tags: ['landlocked'],           airport: 'MID', dossier: { tagline: 'White City of the Yucatán', didYouKnow: "Mérida was built on top of the ancient Maya city of T'hó and is one of the oldest cities in the Americas." } },
  { id: 'puebla',       name: 'Puebla',        country: 'MX', region: 'mexico',       lat: 19.041, lng: -98.206, population: 1576000, tags: ['landlocked', 'population_1m'], airport: 'PBC', dossier: { tagline: 'City of Angels and tiles', didYouKnow: "Puebla is where Cinco de Mayo actually happened — a Mexican victory over the French army in 1862." } },
  { id: 'leon',         name: 'León',          country: 'MX', region: 'mexico',       lat: 21.125, lng: -101.68, population: 1579000, tags: ['landlocked', 'population_1m'], airport: 'BJX', dossier: { tagline: 'Shoe capital of the world', didYouKnow: "León produces more shoes than any other city on Earth — over 60 million pairs per year." } },
  { id: 'oaxaca',       name: 'Oaxaca',        country: 'MX', region: 'mexico',       lat: 17.073, lng: -96.726, population: 300000,  tags: ['landlocked'],           airport: 'OAX', dossier: { tagline: 'Where ancient cultures and mezcal meet', didYouKnow: "Oaxaca is the birthplace of mezcal and has the most diverse cuisine in all of Mexico." } },
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

