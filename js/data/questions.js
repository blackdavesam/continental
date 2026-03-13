// ============================================================
//  CONTINENTAL — questions.js
//  Add questions here. Types: multiple_choice | odd_one_out | bullseye
// ============================================================

const QUESTIONS = [

  // --- MULTIPLE CHOICE ---
  {
    id: 'q1', type: 'multiple_choice', difficulty: 'easy',
    question: 'Which city is the capital of Canada?',
    options: ['Toronto', 'Ottawa', 'Montreal', 'Vancouver'],
    answer: 'Ottawa',
    revealCity: 'ottawa',
    fact: 'Ottawa was chosen as capital in 1857 by Queen Victoria — partly because it was far from the US border.'
  },
  {
    id: 'q2', type: 'multiple_choice', difficulty: 'easy',
    question: 'What is the largest city in Canada by population?',
    options: ['Vancouver', 'Ottawa', 'Toronto', 'Calgary'],
    answer: 'Toronto',
    revealCity: 'toronto',
    fact: 'Toronto has over 2.9 million people in the city proper, and 6.4 million in the metro area.'
  },
  {
    id: 'q3', type: 'multiple_choice', difficulty: 'medium',
    question: 'Which US city is known as the "Gateway to the West"?',
    options: ['Kansas City', 'Denver', 'St. Louis', 'Chicago'],
    answer: 'St. Louis',
    revealCity: 'st_louis',
    fact: "St. Louis earned this nickname because it was the launching point for the Lewis and Clark Expedition in 1804."
  },
  {
    id: 'q4', type: 'multiple_choice', difficulty: 'easy',
    question: 'In which US state is Miami located?',
    options: ['Georgia', 'Texas', 'Florida', 'Louisiana'],
    answer: 'Florida',
    revealCity: 'miami',
    fact: 'Miami is so far south that it sits at the same latitude as the Sahara Desert.'
  },
  {
    id: 'q5', type: 'multiple_choice', difficulty: 'medium',
    question: 'Which city has the busiest airport in the world?',
    options: ['Chicago', 'Dallas', 'Atlanta', 'Los Angeles'],
    answer: 'Atlanta',
    revealCity: 'atlanta',
    fact: 'Hartsfield-Jackson Atlanta International Airport has held the title of world\'s busiest airport for over 20 consecutive years.'
  },
  {
    id: 'q6', type: 'multiple_choice', difficulty: 'hard',
    question: 'Detroit is unusual because Canada is to its ___?',
    options: ['North', 'East', 'South', 'West'],
    answer: 'South',
    revealCity: 'detroit',
    fact: 'Windsor, Ontario sits directly south of Detroit across the Detroit River — making it the only place in the continental US where Canada is to the south.'
  },
  {
    id: 'q7', type: 'multiple_choice', difficulty: 'medium',
    question: 'Which city is built on a drained lake and is slowly sinking?',
    options: ['Houston', 'New Orleans', 'Mexico City', 'Miami'],
    answer: 'Mexico City',
    revealCity: 'mexico_city',
    fact: 'The Aztec capital Tenochtitlan was built on an island in Lake Texcoco. When the Spanish drained the lake, the city was left on unstable ground — and it sinks up to 20cm per year.'
  },
  {
    id: 'q8', type: 'multiple_choice', difficulty: 'easy',
    question: 'What is the IATA airport code for Los Angeles?',
    options: ['LOS', 'LAX', 'LAN', 'LGA'],
    answer: 'LAX',
    revealCity: 'los_angeles',
    fact: 'The X in LAX has no specific meaning — in the 1930s the US added X to short 2-letter codes to make them 3 letters.'
  },
  {
    id: 'q9', type: 'multiple_choice', difficulty: 'hard',
    question: 'Which city has no zoning laws — the only major US city where you can build anything anywhere?',
    options: ['Dallas', 'Phoenix', 'Houston', 'Las Vegas'],
    answer: 'Houston',
    revealCity: 'houston',
    fact: 'Houston voters rejected zoning three times. The result is a chaotic, sprawling city where a nail salon can open next to a church next to a stadium.'
  },
  {
    id: 'q10', type: 'multiple_choice', difficulty: 'medium',
    question: 'Which Canadian city has the world\'s largest underground pedestrian network?',
    options: ['Toronto', 'Vancouver', 'Ottawa', 'Montreal'],
    answer: 'Montreal',
    revealCity: 'montreal',
    fact: 'The RÉSO underground city in Montreal stretches 32km and connects 60 residential and commercial complexes, 10 metro stations, and 2 train stations.'
  },
  {
    id: 'q11', type: 'multiple_choice', difficulty: 'easy',
    question: 'Which of these cities is on the Pacific Ocean?',
    options: ['Denver', 'Phoenix', 'Seattle', 'Las Vegas'],
    answer: 'Seattle',
    revealCity: 'seattle',
    fact: 'Seattle sits on Puget Sound, an inlet of the Pacific Ocean, with the Olympic Mountains to the west and the Cascades to the east.'
  },
  {
    id: 'q12', type: 'multiple_choice', difficulty: 'hard',
    question: 'Which city was founded entirely from scratch by the Mexican government in 1970?',
    options: ['Guadalajara', 'Tijuana', 'Cancún', 'Monterrey'],
    answer: 'Cancún',
    revealCity: 'cancun',
    fact: 'In 1970, Cancún was a tiny island with 117 fishermen. A government computer selected it as the ideal tourist location, and the city was built entirely to plan.'
  },

  // --- ODD ONE OUT ---
  {
    id: 'q20', type: 'odd_one_out', difficulty: 'easy',
    question: 'Which of these is NOT a Canadian city?',
    items: ['Toronto', 'Montreal', 'Seattle', 'Calgary'],
    answer: 'Seattle',
    revealCity: 'seattle',
    fact: 'Seattle is in Washington State, USA — though it sits very close to the Canadian border.'
  },
  {
    id: 'q21', type: 'odd_one_out', difficulty: 'medium',
    question: 'Which of these cities is NOT on a coast?',
    items: ['Miami', 'Seattle', 'Denver', 'Houston'],
    answer: 'Denver',
    revealCity: 'denver',
    fact: 'Denver is nicknamed the Mile High City — it sits exactly 5,280 feet above sea level, deep in the Rocky Mountains, far from any ocean.'
  },
  {
    id: 'q22', type: 'odd_one_out', difficulty: 'medium',
    question: 'Which of these cities is NOT in the southeastern United States?',
    items: ['Atlanta', 'Miami', 'New Orleans', 'St. Louis'],
    answer: 'St. Louis',
    revealCity: 'st_louis',
    fact: 'St. Louis is in Missouri, which is considered part of the Midwest — it sits at the confluence of the Missouri and Mississippi Rivers.'
  },
  {
    id: 'q23', type: 'odd_one_out', difficulty: 'hard',
    question: 'Which of these cities has a population UNDER 500,000?',
    items: ['Houston', 'Phoenix', 'Miami', 'Dallas'],
    answer: 'Miami',
    revealCity: 'miami',
    fact: 'Miami\'s city proper has only about 467,000 people — but its metro area has 6.2 million. The city limits are tiny compared to its sprawling suburbs.'
  },

  // --- BULLSEYE (map tap) ---
  {
    id: 'q30', type: 'bullseye', difficulty: 'easy',
    question: 'Tap where you think Chicago is on the map.',
    targetCity: 'chicago',
    fact: 'Chicago sits on the southwestern shore of Lake Michigan — the only Great Lake that lies entirely within the United States.'
  },
  {
    id: 'q31', type: 'bullseye', difficulty: 'medium',
    question: 'Tap where you think Denver is on the map.',
    targetCity: 'denver',
    fact: 'Denver sits at exactly 5,280 feet — one mile — above sea level, right where the Great Plains meet the Rocky Mountains.'
  },
  {
    id: 'q32', type: 'bullseye', difficulty: 'hard',
    question: 'Tap where you think Calgary is on the map.',
    targetCity: 'calgary',
    fact: 'Calgary sits in Alberta, just east of the Canadian Rockies. It hosted the 1988 Winter Olympics.'
  },
  {
    id: 'q33', type: 'bullseye', difficulty: 'medium',
    question: 'Tap where you think New Orleans is on the map.',
    targetCity: 'new_orleans',
    fact: 'New Orleans sits where the Mississippi River meets the Gulf of Mexico — and much of the city is actually below sea level.'
  },

];

