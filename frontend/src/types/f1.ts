// src/types/f1.ts

export type Circuit = {
  circuit_key: number;
  short_name: string;
  type: string;
  image: string;
};

export type Country = {
  name: string;
  code: string;
  flag: string;
};


export type RaceResult = {
  driver_number: number;
  position: number | null;
  driver_name: string;
  driver_code: string;
  number_of_laps: number;
  duration: number | null;       // tempo total ou null
  gap_to_leader: number | string | null; // 0, +1 LAP, +2 LAPS, etc.
  dnf: boolean;
  dns: boolean;
  dsq: boolean;
};

export type Session = {
  session_key: number;
  session_name: string;
  session_type: "Qualifying" | "Race" | string;
  date_start: string;
  date_end: string;
  // results pode ser quali ou corrida; se quiser algo mais simples, usa any[]
  results: RaceResult[];
};

export type Driver = {
  //driver_number: number;
  full_name: string;
  broadcast_name: string;
  name_acronym: string;
  country_code: string;
  team_name: string;
  headshot_url: string;
}

export type MeetingSummary = {
  meeting_key: number;
  meeting_name: string;
  short_name: string;
  location: string;
  date_start: string;   // vem como ISO string do backend
  date_end: string;
  country_name: string;
  country_flag: string;
  winner: Driver;
};

export type Seasons = {
  id: string;
  name: string;
  year: number;
  meetings: MeetingSummary[];
  circuit:Circuit;
  meeting_count: number;
  driver_count: number;
  points?: MeetingPoints[];

};

export type Race = {
  meeting_key: number;
  circuit: Circuit;
  country: Country;
  date_end: string;
  date_start: string;
  gmt_offset: string;
  location: string;
  meeting_name: string;
  meeting_official_name: string;
  sessions: Session[];
  year: number;
  
  race_session:RaceSession
}

export type RaceSessionResult = {
  driver_number: number;
  position?: number;
  number_of_laps?: number;
  duration?: number | null;
  gap_to_leader?: number | string;
  dnf?: boolean;
  dns?: boolean;
  dsq?: boolean;

  broadcast_name?: string;
  full_name?: string;
  name_acronym?: string;
  team_name?: string;
  headshot_url?: string;
};

export type RaceSession = {
  session_key: number;
  session_name: string;
  session_type: string; // "Race" | "Sprint" se quiser tipar melhor
  date_start: string;
  date_end: string;
  results: RaceSessionResult[];
  winner: Driver;
};

export type MeetingPoints = {
  driver_number: number;
  full_name: string;
  team_name: string;
  headshot_url?: string;
  points_meeting: number; // já somado Race + Sprint no backend
};

export type RacePipeline = {
  id: string;

  meeting_key: number;
  circuit: {
    circuit_key: number;
    short_name: string;
    type?: string;
    image?: string;
  };
  country: {
    name: string;
    code: string;
    flag?: string;
  };

  date_start: string;
  date_end: string;
  gmt_offset: string;
  location: string;
  meeting_name: string;
  meeting_official_name: string;
  race_session?: RaceSession;
  sprint_session?: RaceSession;
  year: number;

  points?: MeetingPoints[];
};