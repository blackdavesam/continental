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
  // ============================================================
  //  CANADA (10)
  // ============================================================
  {
    id: 'toronto', name: 'Toronto', country: 'CA', region: 'great_lakes',
    lat: 43.651, lng: -79.347, population: 2930000,
    tags: ['canada'],
    airport: 'YYZ',
    dossier: {
      tagline: 'Where the world meets in one city',
      didYouKnow: 'Toronto is the most multicultural city on Earth — over 200 languages are spoken here.'
    }
  },
  {
    id: 'montreal', name: 'Montréal', country: 'CA', region: 'northeast',
    lat: 45.508, lng: -73.587, population: 1780000,
    tags: ['canada'],
    airport: 'YUL',
    dossier: {
      tagline: 'The Paris of North America',
      didYouKnow: 'Montréal has the world\'s largest underground city — 32km of tunnels connecting metro stations, malls, and office towers.'
    }
  },
  {
    id: 'vancouver', name: 'Vancouver', country: 'CA', region: 'pacific',
    lat: 49.282, lng: -123.120, population: 675000,
    tags: ['canada', 'coastal'],
    airport: 'YVR',
    dossier: {
      tagline: 'Mountains meet the Pacific',
      didYouKnow: 'Vancouver is the mildest major city in Canada — while the rest of the country is buried in snow, Vancouver residents are often playing golf in January. It is also one of the most ethnically diverse cities on Earth.'
    }
  },
  {
    id: 'calgary', name: 'Calgary', country: 'CA', region: 'prairies',
    lat: 51.044, lng: -114.070, population: 1336000,
    tags: ['canada', 'landlocked'],
    airport: 'YYC',
    dossier: {
      tagline: 'Stampede city at the foot of the Rockies',
      didYouKnow: 'Calgary is one of the sunniest cities in Canada, receiving more hours of sunshine per year than Miami, Florida.'
    }
  },
  {
    id: 'ottawa', name: 'Ottawa', country: 'CA', region: 'northeast',
    lat: 45.421, lng: -75.697, population: 994000,
    tags: ['canada', 'landlocked'],
    airport: 'YOW',
    dossier: {
      tagline: "Canada's quietly extraordinary capital",
      didYouKnow: "Ottawa's Rideau Canal becomes the world's largest naturally frozen skating rink every winter — stretching 7.8km through the city."
    }
  },
  {
    id: 'edmonton', name: 'Edmonton', country: 'CA', region: 'prairies',
    lat: 53.546, lng: -113.494, population: 1010000,
    tags: ['canada', 'landlocked'],
    airport: 'YEG',
    dossier: {
      tagline: "Canada's Festival City",
      didYouKnow: 'Edmonton hosts more festivals per capita than any other Canadian city — over 50 major festivals a year, including the largest folk music festival in North America.'
    }
  },
  {
    id: 'winnipeg', name: 'Winnipeg', country: 'CA', region: 'prairies',
    lat: 49.895, lng: -97.138, population: 749000,
    tags: ['canada', 'landlocked'],
    airport: 'YWG',
    dossier: {
      tagline: 'The heart of the continent',
      didYouKnow: 'Winnipeg sits almost exactly at the geographic centre of North America — and holds the record for the most days below -20°C of any major Canadian city.'
    }
  },
  {
    id: 'halifax', name: 'Halifax', country: 'CA', region: 'northeast',
    lat: 44.648, lng: -63.585, population: 439000,
    tags: ['canada', 'coastal'],
    airport: 'YHZ',
    dossier: {
      tagline: 'Where the Atlantic meets Canada',
      didYouKnow: 'Halifax Harbour is the second largest natural harbour in the world after Sydney, Australia — and played a key role as a naval base in both World Wars.'
    }
  },
  {
    id: 'quebec_city', name: 'Quebec City', country: 'CA', region: 'northeast',
    lat: 46.813, lng: -71.208, population: 531000,
    tags: ['canada'],
    airport: 'YQB',
    dossier: {
      tagline: 'The only walled city in North America north of Mexico',
      didYouKnow: 'Old Quebec is a UNESCO World Heritage Site — its stone fortification walls are the only remaining fortified city walls in North America north of Mexico.'
    }
  },
  {
    id: 'hamilton', name: 'Hamilton', country: 'CA', region: 'great_lakes',
    lat: 43.256, lng: -79.869, population: 537000,
    tags: ['canada'],
    airport: 'YHM',
    dossier: {
      tagline: 'The Waterfall Capital of the World',
      didYouKnow: 'Hamilton has over 100 waterfalls within city limits — more waterfalls than any other city on Earth, earning it the nickname "Waterfall Capital of the World."'
    }
  },
  // ============================================================
  //  USA NORTHEAST (7)
  // ============================================================
  {
    id: 'new_york', name: 'New York', country: 'US', region: 'northeast',
    lat: 40.712, lng: -74.006, population: 8336000,
    tags: ['coastal', 'population_1m'],
    airport: 'JFK',
    dossier: {
      tagline: 'The city that never sleeps',
      didYouKnow: "New York's subway system has run 24 hours a day, 7 days a week since it opened in 1904 — it has never once fully closed for an entire night."
    }
  },
  {
    id: 'boston', name: 'Boston', country: 'US', region: 'northeast',
    lat: 42.360, lng: -71.059, population: 695000,
    tags: ['coastal'],
    airport: 'BOS',
    dossier: {
      tagline: 'Where American history was made',
      didYouKnow: 'Boston has the oldest public park in America — Boston Common, established in 1634, predates the United States itself by over 140 years.'
    }
  },
  {
    id: 'philadelphia', name: 'Philadelphia', country: 'US', region: 'northeast',
    lat: 39.952, lng: -75.165, population: 1584000,
    tags: ['coastal', 'population_1m'],
    airport: 'PHL',
    dossier: {
      tagline: 'The city of brotherly love',
      didYouKnow: 'Philadelphia was the capital of the United States before Washington D.C. was built — and the Declaration of Independence was signed here in 1776.'
    }
  },
  {
    id: 'washington', name: 'Washington DC', country: 'US', region: 'northeast',
    lat: 38.907, lng: -77.037, population: 705000,
    tags: ['coastal'],
    airport: 'DCA',
    dossier: {
      tagline: "The nation's capital",
      didYouKnow: 'All 19 Smithsonian museums in Washington D.C. are completely free to enter — making it one of the most generous cultural cities on Earth.'
    }
  },
  {
    id: 'pittsburgh', name: 'Pittsburgh', country: 'US', region: 'northeast',
    lat: 40.440, lng: -79.996, population: 303000,
    tags: ['landlocked'],
    airport: 'PIT',
    dossier: {
      tagline: 'The city of bridges',
      didYouKnow: 'Pittsburgh has 446 bridges — more than any other city in the world, including Venice. It sits at the meeting point of three rivers.'
    }
  },
  {
    id: 'baltimore', name: 'Baltimore', country: 'US', region: 'northeast',
    lat: 39.290, lng: -76.612, population: 585000,
    tags: ['coastal'],
    airport: 'BWI',
    dossier: {
      tagline: 'Charm City on the Chesapeake',
      didYouKnow: "Baltimore's Inner Harbour was once one of the most important seaports in the US — and the Star-Spangled Banner was written here during the War of 1812."
    }
  },
  {
    id: 'hartford', name: 'Hartford', country: 'US', region: 'northeast',
    lat: 41.763, lng: -72.685, population: 121000,
    tags: ['landlocked'],
    airport: 'BDL',
    dossier: {
      tagline: 'The insurance capital of the world',
      didYouKnow: 'Hartford is home to more insurance company headquarters than any other city on Earth — a reputation it has held since the 1800s.'
    }
  },
  // ============================================================
  //  USA SOUTHEAST (7)
  // ============================================================
  {
    id: 'miami', name: 'Miami', country: 'US', region: 'southeast',
    lat: 25.761, lng: -80.191, population: 467000,
    tags: ['coastal'],
    airport: 'MIA',
    dossier: {
      tagline: 'Magic City where the Americas meet',
      didYouKnow: 'Miami is the only major US city founded by a woman — Julia Tuttle in 1896. It is also the only US city that sits between two national parks.'
    }
  },
  {
    id: 'atlanta', name: 'Atlanta', country: 'US', region: 'southeast',
    lat: 33.748, lng: -84.387, population: 498000,
    tags: ['landlocked'],
    airport: 'ATL',
    dossier: {
      tagline: "The world's busiest airport calls it home",
      didYouKnow: 'Hartsfield-Jackson Atlanta Airport has been the world\'s busiest airport for over 20 consecutive years — more passengers pass through it than any other airport on Earth.'
    }
  },
  {
    id: 'new_orleans', name: 'New Orleans', country: 'US', region: 'southeast',
    lat: 29.951, lng: -90.071, population: 383000,
    tags: ['coastal'],
    airport: 'MSY',
    dossier: {
      tagline: 'Where jazz was born and never left',
      didYouKnow: 'New Orleans sits below sea level — the city is kept dry by a massive network of pumps that run 24 hours a day, 365 days a year.'
    }
  },
  {
    id: 'charlotte', name: 'Charlotte', country: 'US', region: 'southeast',
    lat: 35.227, lng: -80.843, population: 874000,
    tags: ['landlocked'],
    airport: 'CLT',
    dossier: {
      tagline: 'Banking capital of the South',
      didYouKnow: 'Charlotte is the second-largest US banking centre after New York City — Bank of America and Wells Fargo both have major headquarters here.'
    }
  },
  {
    id: 'tampa', name: 'Tampa', country: 'US', region: 'southeast',
    lat: 27.947, lng: -82.459, population: 395000,
    tags: ['coastal'],
    airport: 'TPA',
    dossier: {
      tagline: 'Sunshine city on Tampa Bay',
      didYouKnow: "Tampa receives more lightning strikes per square mile than almost any other city in the United States, earning the region the nickname 'Lightning Capital of North America.'"
    }
  },
  {
    id: 'jacksonville', name: 'Jacksonville', country: 'US', region: 'southeast',
    lat: 30.332, lng: -81.656, population: 949000,
    tags: ['coastal'],
    airport: 'JAX',
    dossier: {
      tagline: 'The biggest city you never think about',
      didYouKnow: 'Jacksonville is the largest city by land area in the contiguous United States — bigger than Los Angeles, bigger than New York, covering over 1,900 square kilometres.'
    }
  },
  {
    id: 'orlando', name: 'Orlando', country: 'US', region: 'southeast',
    lat: 28.538, lng: -81.379, population: 307000,
    tags: ['landlocked'],
    airport: 'MCO',
    dossier: {
      tagline: 'Theme park capital of the world',
      didYouKnow: 'Orlando has more hotel rooms than any other city in the United States — Walt Disney World alone covers more land than San Francisco.'
    }
  },
  // ============================================================
  //  USA GREAT LAKES / MIDWEST (9)
  // ============================================================
  {
    id: 'chicago', name: 'Chicago', country: 'US', region: 'great_lakes',
    lat: 41.878, lng: -87.630, population: 2696000,
    tags: ['coastal', 'population_1m'],
    airport: 'ORD',
    dossier: {
      tagline: 'The city that built the modern world',
      didYouKnow: "Chicago invented the skyscraper — the world's first steel-framed skyscraper, the Home Insurance Building, stood here in 1885."
    }
  },
  {
    id: 'detroit', name: 'Detroit', country: 'US', region: 'great_lakes',
    lat: 42.331, lng: -83.045, population: 639000,
    tags: ['coastal'],
    airport: 'DTW',
    dossier: {
      tagline: 'Motor City, birthplace of Motown',
      didYouKnow: "Detroit is the only major US city where Canada is directly to the south — Windsor, Ontario sits across the Detroit River, making it a geographic oddity."
    }
  },
  {
    id: 'milwaukee', name: 'Milwaukee', country: 'US', region: 'great_lakes',
    lat: 43.038, lng: -87.906, population: 577000,
    tags: ['coastal'],
    airport: 'MKE',
    dossier: {
      tagline: 'Brew City on Lake Michigan',
      didYouKnow: 'Milwaukee was once the beer capital of the world — at its peak in the early 1900s, it had over 80 breweries and produced more beer per person than any other city on Earth.'
    }
  },
  {
    id: 'minneapolis', name: 'Minneapolis', country: 'US', region: 'midwest',
    lat: 44.977, lng: -93.265, population: 429000,
    tags: ['landlocked'],
    airport: 'MSP',
    dossier: {
      tagline: 'City of lakes and fierce winters',
      didYouKnow: 'Minneapolis has more miles of skyway than any other city in the world — 80 city blocks of enclosed, heated second-floor walkways so residents never have to go outside in winter.'
    }
  },
  {
    id: 'st_louis', name: 'St. Louis', country: 'US', region: 'midwest',
    lat: 38.627, lng: -90.199, population: 301000,
    tags: ['landlocked'],
    airport: 'STL',
    dossier: {
      tagline: 'Gateway to the West',
      didYouKnow: 'The Gateway Arch is taller than both the Statue of Liberty and the Washington Monument — and it was built without a single worker fatality.'
    }
  },
  {
    id: 'kansas_city', name: 'Kansas City', country: 'US', region: 'midwest',
    lat: 39.099, lng: -94.578, population: 508000,
    tags: ['landlocked'],
    airport: 'MCI',
    dossier: {
      tagline: 'BBQ capital of the world',
      didYouKnow: 'Kansas City has more BBQ restaurants per capita than any other city on Earth — and it sits in two states at once, split between Missouri and Kansas.'
    }
  },
  {
    id: 'cincinnati', name: 'Cincinnati', country: 'US', region: 'midwest',
    lat: 39.103, lng: -84.512, population: 309000,
    tags: ['landlocked'],
    airport: 'CVG',
    dossier: {
      tagline: 'The Queen City of the Ohio',
      didYouKnow: "Cincinnati was the first American city to have a professional baseball team — the Cincinnati Red Stockings in 1869. It's also home to a unique regional chili served over spaghetti."
    }
  },
  {
    id: 'indianapolis', name: 'Indianapolis', country: 'US', region: 'midwest',
    lat: 39.768, lng: -86.158, population: 887000,
    tags: ['landlocked'],
    airport: 'IND',
    dossier: {
      tagline: 'Racing capital of the world',
      didYouKnow: 'The Indianapolis Motor Speedway is the largest sports venue on Earth by capacity — it can hold over 250,000 spectators, more than any stadium in the world.'
    }
  },
  {
    id: 'columbus', name: 'Columbus', country: 'US', region: 'midwest',
    lat: 39.961, lng: -82.999, population: 905000,
    tags: ['landlocked'],
    airport: 'CMH',
    dossier: {
      tagline: "America's test market",
      didYouKnow: "Columbus is considered the most 'average' American city — companies test new products here first because its demographics so closely mirror the national average."
    }
  },
  // ============================================================
  //  USA SOUTH (6)
  // ============================================================
  {
    id: 'dallas', name: 'Dallas', country: 'US', region: 'south',
    lat: 32.776, lng: -96.797, population: 1304000,
    tags: ['landlocked', 'population_1m'],
    airport: 'DFW',
    dossier: {
      tagline: 'Where the West begins',
      didYouKnow: 'Dallas-Fort Worth Airport is larger than the entire island of Manhattan — covering 69 square kilometres, it is one of the largest airports in the world by area.'
    }
  },
  {
    id: 'houston', name: 'Houston', country: 'US', region: 'south',
    lat: 29.760, lng: -95.370, population: 2304000,
    tags: ['coastal', 'population_1m'],
    airport: 'IAH',
    dossier: {
      tagline: 'Space city, energy capital of the world',
      didYouKnow: "Houston is the only major US city with no zoning laws — you can legally build anything next to anything. A church next to a nightclub next to a oil refinery is perfectly legal."
    }
  },
  {
    id: 'nashville', name: 'Nashville', country: 'US', region: 'south',
    lat: 36.174, lng: -86.768, population: 689000,
    tags: ['landlocked'],
    airport: 'BNA',
    dossier: {
      tagline: 'Music City USA',
      didYouKnow: 'Nashville has more than 180 live music venues — more per capita than any other city on Earth. It is also one of the fastest-growing cities in the United States, adding roughly 100 new residents every single day.'
    }
  },
  {
    id: 'austin', name: 'Austin', country: 'US', region: 'south',
    lat: 30.267, lng: -97.743, population: 961000,
    tags: ['landlocked'],
    airport: 'AUS',
    dossier: {
      tagline: 'Keep Austin Weird',
      didYouKnow: "Austin is home to the world's largest urban bat colony — 1.5 million Mexican free-tailed bats live under the Congress Avenue Bridge and emerge every evening at sunset."
    }
  },
  {
    id: 'san_antonio', name: 'San Antonio', country: 'US', region: 'south',
    lat: 29.424, lng: -98.494, population: 1434000,
    tags: ['landlocked', 'population_1m'],
    airport: 'SAT',
    dossier: {
      tagline: 'Remember the Alamo',
      didYouKnow: "The Alamo, site of the famous 1836 battle, sits right in downtown San Antonio surrounded by modern hotels and restaurants — one of the most visited historic sites in the US."
    }
  },
  {
    id: 'memphis', name: 'Memphis', country: 'US', region: 'south',
    lat: 35.149, lng: -90.049, population: 633000,
    tags: ['landlocked'],
    airport: 'MEM',
    dossier: {
      tagline: 'Where the Mississippi meets the blues',
      didYouKnow: "The FedEx global hub in Memphis processes over 1.5 million packages every single night — more than any other single logistics facility on Earth. Memphis sits at the geographic heart of the US, making it the perfect shipping centre."
    }
  },
  // ============================================================
  //  USA MOUNTAIN (6)
  // ============================================================
  {
    id: 'denver', name: 'Denver', country: 'US', region: 'mountain',
    lat: 39.739, lng: -104.984, population: 715000,
    tags: ['landlocked'],
    airport: 'DEN',
    dossier: {
      tagline: 'Mile High City in the shadow of the Rockies',
      didYouKnow: "Denver's airport roof was designed to look like the Rocky Mountains — and at 140 square kilometres, it is the largest airport in North America by land area."
    }
  },
  {
    id: 'las_vegas', name: 'Las Vegas', country: 'US', region: 'mountain',
    lat: 36.169, lng: -115.140, population: 641000,
    tags: ['landlocked'],
    airport: 'LAS',
    dossier: {
      tagline: 'The neon city rising from the Nevada desert',
      didYouKnow: 'Las Vegas uses so much electricity that the Hoover Dam was built partly to power it. The Strip alone uses more electricity per kilometre than almost any other street on Earth.'
    }
  },
  {
    id: 'phoenix', name: 'Phoenix', country: 'US', region: 'mountain',
    lat: 33.448, lng: -112.074, population: 1608000,
    tags: ['landlocked', 'population_1m'],
    airport: 'PHX',
    dossier: {
      tagline: 'Valley of the Sun',
      didYouKnow: 'Phoenix gets 299 sunny days per year — more than almost any other major US city. It is also the hottest major city in North America, regularly exceeding 43°C in summer.'
    }
  },
  {
    id: 'salt_lake_city', name: 'Salt Lake City', country: 'US', region: 'mountain',
    lat: 40.760, lng: -111.891, population: 200000,
    tags: ['landlocked'],
    airport: 'SLC',
    dossier: {
      tagline: 'Crossroads of the West',
      didYouKnow: "The Great Salt Lake is saltier than the ocean and so buoyant that you cannot sink in it. Salt Lake City hosted the 2002 Winter Olympics and claims to have the 'Greatest Snow on Earth.'"
    }
  },
  {
    id: 'albuquerque', name: 'Albuquerque', country: 'US', region: 'mountain',
    lat: 35.085, lng: -106.651, population: 564000,
    tags: ['landlocked'],
    airport: 'ABQ',
    dossier: {
      tagline: 'Balloon capital of the world',
      didYouKnow: 'Albuquerque hosts the world\'s largest hot air balloon festival every October — over 500 balloons fill the sky. The unique "Albuquerque Box" wind pattern makes it the best ballooning location on Earth.'
    }
  },
  {
    id: 'tucson', name: 'Tucson', country: 'US', region: 'mountain',
    lat: 32.221, lng: -110.969, population: 542000,
    tags: ['landlocked'],
    airport: 'TUS',
    dossier: {
      tagline: 'The Old Pueblo',
      didYouKnow: "Tucson is home to the world's largest aircraft boneyard — Davis-Monthan Air Force Base stores over 4,000 retired military aircraft in the desert, where the dry air preserves them perfectly."
    }
  },
  // ============================================================
  //  USA PACIFIC (7)
  // ============================================================
  {
    id: 'los_angeles', name: 'Los Angeles', country: 'US', region: 'pacific',
    lat: 34.052, lng: -118.243, population: 3979000,
    tags: ['coastal', 'population_1m'],
    airport: 'LAX',
    dossier: {
      tagline: 'City of Angels, capital of dreams',
      didYouKnow: 'Los Angeles has more cars than people and the most freeway lanes of any city on Earth — yet still has some of the worst traffic in the world.'
    }
  },
  {
    id: 'san_francisco', name: 'San Francisco', country: 'US', region: 'pacific',
    lat: 37.774, lng: -122.419, population: 883000,
    tags: ['coastal'],
    airport: 'SFO',
    dossier: {
      tagline: 'The city that knows how',
      didYouKnow: "San Francisco's famous fog even has a name — Karl. It has its own Instagram account with over 350,000 followers. The Golden Gate Bridge is often completely hidden by Karl for days at a time."
    }
  },
  {
    id: 'seattle', name: 'Seattle', country: 'US', region: 'pacific',
    lat: 47.606, lng: -122.332, population: 737000,
    tags: ['coastal'],
    airport: 'SEA',
    dossier: {
      tagline: 'Emerald City between the mountains and the sea',
      didYouKnow: 'Seattle gets 150 days of rain per year — yet receives less total annual rainfall than New York City, Houston, or Miami. The rain is just spread out more evenly.'
    }
  },
  {
    id: 'portland', name: 'Portland', country: 'US', region: 'pacific',
    lat: 45.523, lng: -122.676, population: 652000,
    tags: ['coastal'],
    airport: 'PDX',
    dossier: {
      tagline: 'Keep Portland Weird',
      didYouKnow: "Portland has more microbreweries per capita than any other city in the world — over 70 within city limits. It also has the only dedicated food cart district of any major US city."
    }
  },
  {
    id: 'san_diego', name: 'San Diego', country: 'US', region: 'pacific',
    lat: 32.715, lng: -117.161, population: 1386000,
    tags: ['coastal', 'population_1m'],
    airport: 'SAN',
    dossier: {
      tagline: "America's finest city",
      didYouKnow: "San Diego has the best weather of any major US city — averaging 266 sunny days per year and rarely dropping below 10°C. It also shares a border crossing with Tijuana, Mexico, one of the world's busiest."
    }
  },
  {
    id: 'honolulu', name: 'Honolulu', country: 'US', region: 'pacific',
    lat: 21.306, lng: -157.858, population: 350000,
    tags: ['coastal'],
    airport: 'HNL',
    dossier: {
      tagline: 'Aloha from the middle of the Pacific',
      didYouKnow: "Honolulu is the most isolated major city on Earth — it is over 3,800km from the nearest continent. Hawaii is also the only US state that grows coffee commercially and the only one that was once a kingdom."
    }
  },
  {
    id: 'anchorage', name: 'Anchorage', country: 'US', region: 'pacific',
    lat: 61.218, lng: -149.900, population: 288000,
    tags: ['coastal'],
    airport: 'ANC',
    dossier: {
      tagline: 'Where the wilderness begins',
      didYouKnow: "Anchorage is closer to Tokyo than it is to New York City — making it one of the most strategically located airports in the world for polar flight routes. Moose regularly wander through city neighbourhoods."
    }
  },
  // ============================================================
  //  MEXICO (10)
  // ============================================================
  {
    id: 'mexico_city', name: 'Mexico City', country: 'MX', region: 'mexico',
    lat: 19.432, lng: -99.133, population: 9210000,
    tags: ['landlocked', 'population_1m'],
    airport: 'MEX',
    dossier: {
      tagline: 'Ancient heart of the Americas',
      didYouKnow: 'Mexico City is sinking by up to 20cm a year — it was built on a drained lake, and the soft ground beneath it compresses as the city pumps out groundwater.'
    }
  },
  {
    id: 'cancun', name: 'Cancún', country: 'MX', region: 'mexico',
    lat: 21.161, lng: -86.851, population: 888000,
    tags: ['coastal'],
    airport: 'CUN',
    dossier: {
      tagline: 'Caribbean turquoise on Mexican shores',
      didYouKnow: 'Cancún was a tiny island of 117 fishermen in 1970. A Mexican government computer selected it as the perfect tourist destination, and the entire city was planned and built from scratch.'
    }
  },
  {
    id: 'guadalajara', name: 'Guadalajara', country: 'MX', region: 'mexico',
    lat: 20.659, lng: -103.350, population: 1495000,
    tags: ['landlocked', 'population_1m'],
    airport: 'GDL',
    dossier: {
      tagline: 'Birthplace of mariachi and tequila',
      didYouKnow: "Tequila can only legally be produced in a specific region around Guadalajara — just as Champagne can only come from France. The nearby town of Tequila has been making it since the 1600s."
    }
  },
  {
    id: 'monterrey', name: 'Monterrey', country: 'MX', region: 'mexico',
    lat: 25.686, lng: -100.316, population: 1135000,
    tags: ['landlocked', 'population_1m'],
    airport: 'MTY',
    dossier: {
      tagline: "Mexico's industrial powerhouse",
      didYouKnow: "Monterrey is Mexico's wealthiest city and its industrial capital — it produces the majority of Mexico's steel and glass, and is home to some of Latin America's largest companies."
    }
  },
  {
    id: 'tijuana', name: 'Tijuana', country: 'MX', region: 'mexico',
    lat: 32.514, lng: -117.038, population: 1300000,
    tags: ['coastal', 'population_1m'],
    airport: 'TIJ',
    dossier: {
      tagline: 'The most crossed border in the world',
      didYouKnow: 'The San Diego–Tijuana border crossing is the busiest land border crossing on Earth — over 50 million people cross it every year. There is even an airport terminal you can reach by walking across the border.'
    }
  },
  {
    id: 'puerto_vallarta', name: 'Puerto Vallarta', country: 'MX', region: 'mexico',
    lat: 20.653, lng: -105.225, population: 255000,
    tags: ['coastal'],
    airport: 'PVR',
    dossier: {
      tagline: 'Where the Sierra Madre meets the Pacific',
      didYouKnow: "Puerto Vallarta sits where the Sierra Madre mountains plunge directly into the Pacific Ocean — creating one of the most dramatic coastlines in North America. The surrounding Banderas Bay is one of the largest natural bays in the world."
    }
  },
  {
    id: 'merida', name: 'Mérida', country: 'MX', region: 'mexico',
    lat: 20.967, lng: -89.623, population: 892000,
    tags: ['landlocked'],
    airport: 'MID',
    dossier: {
      tagline: 'The White City of the Yucatán',
      didYouKnow: "Mérida is the cultural capital of the Yucatán Peninsula and gateway to ancient Mayan ruins — Chichen Itza is just 2 hours away. It is consistently ranked one of the safest and most liveable cities in Mexico."
    }
  },
  {
    id: 'puebla', name: 'Puebla', country: 'MX', region: 'mexico',
    lat: 19.041, lng: -98.206, population: 1434000,
    tags: ['landlocked', 'population_1m'],
    airport: 'PBC',
    dossier: {
      tagline: 'City of angels and mole sauce',
      didYouKnow: "Puebla gave the world mole sauce and Cinco de Mayo — the famous Battle of Puebla in 1862 is what that holiday commemorates. The city's historic centre is a UNESCO World Heritage Site."
    }
  },
  {
    id: 'leon', name: 'León', country: 'MX', region: 'mexico',
    lat: 21.122, lng: -101.682, population: 1237000,
    tags: ['landlocked', 'population_1m'],
    airport: 'BJX',
    dossier: {
      tagline: 'Shoe capital of the world',
      didYouKnow: 'León produces nearly half of all shoes made in Mexico — over 250 million pairs a year — making it the shoe manufacturing capital of Latin America and one of the largest in the world.'
    }
  },
  {
    id: 'oaxaca', name: 'Oaxaca', country: 'MX', region: 'mexico',
    lat: 17.073, lng: -96.721, population: 264000,
    tags: ['landlocked'],
    airport: 'OAX',
    dossier: {
      tagline: 'Soul of Mexican culture',
      didYouKnow: "Oaxaca is considered the culinary and cultural heart of Mexico — it is home to seven distinct varieties of mole sauce, the world's oldest living tree (over 2,000 years old), and some of Mexico's best-preserved pre-Columbian ruins."
    }
  },
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

