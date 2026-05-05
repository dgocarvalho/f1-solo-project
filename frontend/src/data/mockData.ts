// Mock data simulating the FastAPI + MongoDB backend responses

export const mockYears = [2020, 2021, 2022, 2023, 2024];

export interface Race {
  raceId: string;
  name: string;
  round: number;
  date: string;
  circuit: {
    name: string;
    country: string;
    city: string;
  };
  winner?: string;
  winnerTeam?: string;
}

export interface RaceDetail extends Race {
  weather?: string;
  summary?: string;
  highlights?: string[];
  results: RaceResult[];
}

export interface RaceResult {
  position: number;
  driver: { driverId: string; name: string; code: string };
  team: { teamId: string; name: string };
  gridStart: number;
  points: number;
  fastestLap?: string;
}

export interface Driver {
  driverId: string;
  name: string;
  code: string;
  number: number;
  country: string;
  team: string;
  teamId: string;
  stats: { wins: number; podiums: number; poles: number; points: number };
  seasons: { year: number; team: string; races: number; wins: number; podiums: number; points: number }[];
}

export interface Team {
  teamId: string;
  name: string;
  country: string;
  drivers: { driverId: string; name: string; code: string; number: number }[];
  stats: { constructorTitles: number; raceWins: number; totalPoints: number };
  seasonPoints: { year: number; points: number }[];
}

export interface SearchResult {
  type: "race" | "driver" | "circuit";
  raceId?: string;
  name: string;
  year: number;
  circuit?: string;
  country?: string;
  highlight: string;
  score: number;
}

export const mockRaces: Record<number, Race[]> = {
  2024: [
    { raceId: "bah-2024", name: "Grande Prêmio do Bahrein", round: 1, date: "2024-03-02", circuit: { name: "Bahrain International Circuit", country: "Bahrein", city: "Sakhir" }, winner: "Max Verstappen", winnerTeam: "Red Bull Racing" },
    { raceId: "sau-2024", name: "Grande Prêmio da Arábia Saudita", round: 2, date: "2024-03-09", circuit: { name: "Jeddah Corniche Circuit", country: "Arábia Saudita", city: "Jeddah" }, winner: "Max Verstappen", winnerTeam: "Red Bull Racing" },
    { raceId: "aus-2024", name: "Grande Prêmio da Austrália", round: 3, date: "2024-03-24", circuit: { name: "Albert Park Circuit", country: "Austrália", city: "Melbourne" }, winner: "Carlos Sainz", winnerTeam: "Ferrari" },
    { raceId: "jpn-2024", name: "Grande Prêmio do Japão", round: 4, date: "2024-04-07", circuit: { name: "Suzuka International Racing Course", country: "Japão", city: "Suzuka" }, winner: "Max Verstappen", winnerTeam: "Red Bull Racing" },
    { raceId: "chn-2024", name: "Grande Prêmio da China", round: 5, date: "2024-04-21", circuit: { name: "Shanghai International Circuit", country: "China", city: "Shanghai" }, winner: "Max Verstappen", winnerTeam: "Red Bull Racing" },
    { raceId: "mia-2024", name: "Grande Prêmio de Miami", round: 6, date: "2024-05-05", circuit: { name: "Miami International Autodrome", country: "EUA", city: "Miami" }, winner: "Lando Norris", winnerTeam: "McLaren" },
    { raceId: "imo-2024", name: "Grande Prêmio da Emília-Romanha", round: 7, date: "2024-05-19", circuit: { name: "Autodromo Enzo e Dino Ferrari", country: "Itália", city: "Imola" }, winner: "Max Verstappen", winnerTeam: "Red Bull Racing" },
    { raceId: "mon-2024", name: "Grande Prêmio de Mônaco", round: 8, date: "2024-05-26", circuit: { name: "Circuit de Monaco", country: "Mônaco", city: "Monte Carlo" }, winner: "Charles Leclerc", winnerTeam: "Ferrari" },
  ],
  2023: [
    { raceId: "bah-2023", name: "Grande Prêmio do Bahrein", round: 1, date: "2023-03-05", circuit: { name: "Bahrain International Circuit", country: "Bahrein", city: "Sakhir" }, winner: "Max Verstappen", winnerTeam: "Red Bull Racing" },
    { raceId: "sau-2023", name: "Grande Prêmio da Arábia Saudita", round: 2, date: "2023-03-19", circuit: { name: "Jeddah Corniche Circuit", country: "Arábia Saudita", city: "Jeddah" }, winner: "Sergio Pérez", winnerTeam: "Red Bull Racing" },
    { raceId: "aus-2023", name: "Grande Prêmio da Austrália", round: 3, date: "2023-04-02", circuit: { name: "Albert Park Circuit", country: "Austrália", city: "Melbourne" }, winner: "Max Verstappen", winnerTeam: "Red Bull Racing" },
    { raceId: "mia-2023", name: "Grande Prêmio de Miami", round: 4, date: "2023-05-07", circuit: { name: "Miami International Autodrome", country: "EUA", city: "Miami" }, winner: "Sergio Pérez", winnerTeam: "Red Bull Racing" },
    { raceId: "mon-2023", name: "Grande Prêmio de Mônaco", round: 5, date: "2023-05-28", circuit: { name: "Circuit de Monaco", country: "Mônaco", city: "Monte Carlo" }, winner: "Max Verstappen", winnerTeam: "Red Bull Racing" },
  ],
  2022: [
    { raceId: "bah-2022", name: "Grande Prêmio do Bahrein", round: 1, date: "2022-03-20", circuit: { name: "Bahrain International Circuit", country: "Bahrein", city: "Sakhir" }, winner: "Charles Leclerc", winnerTeam: "Ferrari" },
    { raceId: "sau-2022", name: "Grande Prêmio da Arábia Saudita", round: 2, date: "2022-03-27", circuit: { name: "Jeddah Corniche Circuit", country: "Arábia Saudita", city: "Jeddah" }, winner: "Max Verstappen", winnerTeam: "Red Bull Racing" },
    { raceId: "aus-2022", name: "Grande Prêmio da Austrália", round: 3, date: "2022-04-10", circuit: { name: "Albert Park Circuit", country: "Austrália", city: "Melbourne" }, winner: "Charles Leclerc", winnerTeam: "Ferrari" },
    { raceId: "imo-2022", name: "Grande Prêmio da Emília-Romanha", round: 4, date: "2022-04-24", circuit: { name: "Autodromo Enzo e Dino Ferrari", country: "Itália", city: "Imola" }, winner: "Max Verstappen", winnerTeam: "Red Bull Racing" },
  ],
  2021: [
    { raceId: "bah-2021", name: "Grande Prêmio do Bahrein", round: 1, date: "2021-03-28", circuit: { name: "Bahrain International Circuit", country: "Bahrein", city: "Sakhir" }, winner: "Lewis Hamilton", winnerTeam: "Mercedes" },
    { raceId: "imo-2021", name: "Grande Prêmio da Emília-Romanha", round: 2, date: "2021-04-18", circuit: { name: "Autodromo Enzo e Dino Ferrari", country: "Itália", city: "Imola" }, winner: "Max Verstappen", winnerTeam: "Red Bull Racing" },
    { raceId: "por-2021", name: "Grande Prêmio de Portugal", round: 3, date: "2021-05-02", circuit: { name: "Autódromo Internacional do Algarve", country: "Portugal", city: "Portimão" }, winner: "Lewis Hamilton", winnerTeam: "Mercedes" },
  ],
  2020: [
    { raceId: "aut-2020", name: "Grande Prêmio da Áustria", round: 1, date: "2020-07-05", circuit: { name: "Red Bull Ring", country: "Áustria", city: "Spielberg" }, winner: "Valtteri Bottas", winnerTeam: "Mercedes" },
    { raceId: "sty-2020", name: "Grande Prêmio da Estíria", round: 2, date: "2020-07-12", circuit: { name: "Red Bull Ring", country: "Áustria", city: "Spielberg" }, winner: "Lewis Hamilton", winnerTeam: "Mercedes" },
  ],
};

export const mockRaceDetail: RaceDetail = {
  raceId: "mon-2024",
  name: "Grande Prêmio de Mônaco",
  round: 8,
  date: "2024-05-26",
  circuit: { name: "Circuit de Monaco", country: "Mônaco", city: "Monte Carlo" },
  weather: "Nublado, 22°C",
  winner: "Charles Leclerc",
  winnerTeam: "Ferrari",
  summary: "Charles Leclerc finalmente conquistou sua primeira vitória em casa no Grande Prêmio de Mônaco, liderando de ponta a ponta após largar da pole position. A corrida foi marcada por uma breve aparição do safety car na volta 1 após um incidente na Sainte Dévote.",
  highlights: [
    "Safety car na volta 1 após incidente na Sainte Dévote",
    "Leclerc liderou todas as 78 voltas da corrida",
    "Primeira vitória de Leclerc em seu GP de casa",
    "Piastri conquistou seu primeiro pódio em Mônaco",
    "Hamilton ultrapassou Sainz na volta 56 para o 4º lugar",
  ],
  results: [
    { position: 1, driver: { driverId: "leclerc", name: "Charles Leclerc", code: "LEC" }, team: { teamId: "ferrari", name: "Ferrari" }, gridStart: 1, points: 25, fastestLap: "1:14.250" },
    { position: 2, driver: { driverId: "piastri", name: "Oscar Piastri", code: "PIA" }, team: { teamId: "mclaren", name: "McLaren" }, gridStart: 2, points: 18 },
    { position: 3, driver: { driverId: "sainz", name: "Carlos Sainz", code: "SAI" }, team: { teamId: "ferrari", name: "Ferrari" }, gridStart: 3, points: 15 },
    { position: 4, driver: { driverId: "hamilton", name: "Lewis Hamilton", code: "HAM" }, team: { teamId: "mercedes", name: "Mercedes" }, gridStart: 7, points: 12, fastestLap: "1:13.980" },
    { position: 5, driver: { driverId: "norris", name: "Lando Norris", code: "NOR" }, team: { teamId: "mclaren", name: "McLaren" }, gridStart: 4, points: 10 },
    { position: 6, driver: { driverId: "russell", name: "George Russell", code: "RUS" }, team: { teamId: "mercedes", name: "Mercedes" }, gridStart: 5, points: 8 },
    { position: 7, driver: { driverId: "verstappen", name: "Max Verstappen", code: "VER" }, team: { teamId: "redbull", name: "Red Bull Racing" }, gridStart: 6, points: 6 },
    { position: 8, driver: { driverId: "alonso", name: "Fernando Alonso", code: "ALO" }, team: { teamId: "aston-martin", name: "Aston Martin" }, gridStart: 8, points: 4 },
    { position: 9, driver: { driverId: "tsunoda", name: "Yuki Tsunoda", code: "TSU" }, team: { teamId: "rb", name: "RB" }, gridStart: 10, points: 2 },
    { position: 10, driver: { driverId: "stroll", name: "Lance Stroll", code: "STR" }, team: { teamId: "aston-martin", name: "Aston Martin" }, gridStart: 11, points: 1 },
  ],
};

export const mockDrivers: Record<string, Driver> = {
  verstappen: {
    driverId: "verstappen",
    name: "Max Verstappen",
    code: "VER",
    number: 1,
    country: "Países Baixos",
    team: "Red Bull Racing",
    teamId: "redbull",
    stats: { wins: 62, podiums: 110, poles: 40, points: 2886 },
    seasons: [
      { year: 2024, team: "Red Bull Racing", races: 8, wins: 5, podiums: 7, points: 194 },
      { year: 2023, team: "Red Bull Racing", races: 22, wins: 19, podiums: 21, points: 575 },
      { year: 2022, team: "Red Bull Racing", races: 22, wins: 15, podiums: 18, points: 454 },
      { year: 2021, team: "Red Bull Racing", races: 22, wins: 10, podiums: 18, points: 395 },
    ],
  },
  hamilton: {
    driverId: "hamilton",
    name: "Lewis Hamilton",
    code: "HAM",
    number: 44,
    country: "Reino Unido",
    team: "Mercedes",
    teamId: "mercedes",
    stats: { wins: 104, podiums: 201, poles: 104, points: 4800 },
    seasons: [
      { year: 2024, team: "Mercedes", races: 8, wins: 0, podiums: 2, points: 55 },
      { year: 2023, team: "Mercedes", races: 22, wins: 0, podiums: 2, points: 234 },
      { year: 2022, team: "Mercedes", races: 22, wins: 0, podiums: 9, points: 240 },
      { year: 2021, team: "Mercedes", races: 22, wins: 8, podiums: 17, points: 387 },
    ],
  },
  leclerc: {
    driverId: "leclerc",
    name: "Charles Leclerc",
    code: "LEC",
    number: 16,
    country: "Mônaco",
    team: "Ferrari",
    teamId: "ferrari",
    stats: { wins: 8, podiums: 38, poles: 24, points: 1300 },
    seasons: [
      { year: 2024, team: "Ferrari", races: 8, wins: 2, podiums: 4, points: 120 },
      { year: 2023, team: "Ferrari", races: 22, wins: 0, podiums: 6, points: 206 },
      { year: 2022, team: "Ferrari", races: 22, wins: 3, podiums: 11, points: 308 },
    ],
  },
  norris: {
    driverId: "norris",
    name: "Lando Norris",
    code: "NOR",
    number: 4,
    country: "Reino Unido",
    team: "McLaren",
    teamId: "mclaren",
    stats: { wins: 2, podiums: 22, poles: 5, points: 780 },
    seasons: [
      { year: 2024, team: "McLaren", races: 8, wins: 1, podiums: 5, points: 113 },
      { year: 2023, team: "McLaren", races: 22, wins: 0, podiums: 2, points: 205 },
    ],
  },
};

export const mockTeams: Record<string, Team> = {
  redbull: {
    teamId: "redbull",
    name: "Red Bull Racing",
    country: "Áustria",
    drivers: [
      { driverId: "verstappen", name: "Max Verstappen", code: "VER", number: 1 },
      { driverId: "perez", name: "Sergio Pérez", code: "PER", number: 11 },
    ],
    stats: { constructorTitles: 6, raceWins: 120, totalPoints: 7500 },
    seasonPoints: [
      { year: 2024, points: 340 },
      { year: 2023, points: 860 },
      { year: 2022, points: 759 },
      { year: 2021, points: 585 },
    ],
  },
  ferrari: {
    teamId: "ferrari",
    name: "Ferrari",
    country: "Itália",
    drivers: [
      { driverId: "leclerc", name: "Charles Leclerc", code: "LEC", number: 16 },
      { driverId: "sainz", name: "Carlos Sainz", code: "SAI", number: 55 },
    ],
    stats: { constructorTitles: 16, raceWins: 245, totalPoints: 10200 },
    seasonPoints: [
      { year: 2024, points: 270 },
      { year: 2023, points: 406 },
      { year: 2022, points: 554 },
    ],
  },
  mclaren: {
    teamId: "mclaren",
    name: "McLaren",
    country: "Reino Unido",
    drivers: [
      { driverId: "norris", name: "Lando Norris", code: "NOR", number: 4 },
      { driverId: "piastri", name: "Oscar Piastri", code: "PIA", number: 81 },
    ],
    stats: { constructorTitles: 8, raceWins: 183, totalPoints: 6800 },
    seasonPoints: [
      { year: 2024, points: 220 },
      { year: 2023, points: 302 },
    ],
  },
  mercedes: {
    teamId: "mercedes",
    name: "Mercedes",
    country: "Alemanha",
    drivers: [
      { driverId: "hamilton", name: "Lewis Hamilton", code: "HAM", number: 44 },
      { driverId: "russell", name: "George Russell", code: "RUS", number: 63 },
    ],
    stats: { constructorTitles: 8, raceWins: 125, totalPoints: 7200 },
    seasonPoints: [
      { year: 2024, points: 150 },
      { year: 2023, points: 409 },
      { year: 2022, points: 515 },
    ],
  },
};

export const mockSearchResults: SearchResult[] = [
  { type: "race", raceId: "mon-2024", name: "Grande Prêmio de Mônaco 2024", year: 2024, circuit: "Circuit de Monaco", country: "Mônaco", highlight: "...aparição do <mark>safety car</mark> na volta 1 após incidente na Sainte Dévote...", score: 0.95 },
  { type: "race", raceId: "bah-2023", name: "Grande Prêmio do Bahrein 2023", year: 2023, circuit: "Bahrain International Circuit", country: "Bahrein", highlight: "...condição de <mark>safety car</mark> virtual acionada na volta 32 após debris na pista...", score: 0.82 },
  { type: "race", raceId: "imo-2022", name: "Grande Prêmio da Emília-Romanha 2022", year: 2022, circuit: "Autodromo Enzo e Dino Ferrari", country: "Itália", highlight: "...corrida disputada sob chuva intensa com <mark>safety car</mark> na largada...", score: 0.78 },
  { type: "race", raceId: "imo-2021", name: "Grande Prêmio da Emília-Romanha 2021", year: 2021, circuit: "Autodromo Enzo e Dino Ferrari", country: "Itália", highlight: "...bandeira vermelha e <mark>safety car</mark> após colisão entre Bottas e Russell...", score: 0.73 },
];

// Top drivers/teams per season (for sidebar stats)
export const mockSeasonTopDrivers: Record<number, { name: string; points: number }[]> = {
  2024: [
    { name: "Max Verstappen", points: 194 },
    { name: "Charles Leclerc", points: 120 },
    { name: "Lando Norris", points: 113 },
  ],
  2023: [
    { name: "Max Verstappen", points: 575 },
    { name: "Sergio Pérez", points: 285 },
    { name: "Lewis Hamilton", points: 234 },
  ],
  2022: [
    { name: "Max Verstappen", points: 454 },
    { name: "Charles Leclerc", points: 308 },
    { name: "Sergio Pérez", points: 305 },
  ],
  2021: [
    { name: "Max Verstappen", points: 395 },
    { name: "Lewis Hamilton", points: 387 },
    { name: "Valtteri Bottas", points: 226 },
  ],
  2020: [
    { name: "Lewis Hamilton", points: 347 },
    { name: "Valtteri Bottas", points: 223 },
    { name: "Max Verstappen", points: 214 },
  ],
};

export const mockSeasonTopTeams: Record<number, { name: string; points: number }[]> = {
  2024: [
    { name: "Red Bull Racing", points: 340 },
    { name: "Ferrari", points: 270 },
    { name: "McLaren", points: 220 },
  ],
  2023: [
    { name: "Red Bull Racing", points: 860 },
    { name: "Mercedes", points: 409 },
    { name: "Ferrari", points: 406 },
  ],
  2022: [
    { name: "Red Bull Racing", points: 759 },
    { name: "Ferrari", points: 554 },
    { name: "Mercedes", points: 515 },
  ],
  2021: [
    { name: "Mercedes", points: 613 },
    { name: "Red Bull Racing", points: 585 },
    { name: "McLaren", points: 275 },
  ],
  2020: [
    { name: "Mercedes", points: 573 },
    { name: "Red Bull Racing", points: 319 },
    { name: "McLaren", points: 202 },
  ],
};
