export interface ICharacter {
  firstname: string;
  lastname: string;
  patronymic: string;
  age: string;
  weight: string;
  height: string;
  build: string;
  location: string;
  contacts: IContacts;
  skills: ISkills;
}

export interface IContacts {
  phone: string;
  telegram: string;
  email: string;
  github: string;
}

export interface ISkills {
  technical: string[];
  magical: string[];
}

export interface IScene {
  scene_number: number;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  technical_details: ITechnicalDetails;
  character_state: string;
}

export interface ITechnicalDetails {
  project?: string;
  stack?: string[];
  anomaly?: string;
  observation?: string;
  reaction?: string;
  discovery?: string;
  authentication?: string;
  vision?: string;
  diagnosis?: string;
  heritage?: string;
  skills_transfer?: string;
  mentorship?: string;
  mission?: string;
  principle?: string;
  reward?: string;
  lesson?: string;
  defense?: string;
  method?: string;
  integration?: string;
  transformation?: string;
  network?: string;
  coordination?: string;
  crisis?: string;
  response?: string;
  strategy?: string;
  deployment?: string;
  power_source?: string;
  agreement?: string;
  status?: string;
  environment?: string;
  changes?: string;
  role?: string;
}

export interface IDivineConnection {
  god: string;
  user: string;
  timestamp: Date;
  connectionStrength: number;
  gift: any;
}

export interface IRitualResult {
  success: boolean;
  ritualName: string;
  energyCost: number;
  actualCost: number;
  effects: any[];
  successRate: number;
  duration: string;
  powerLevel: string;
  message: string;
}

export interface IBalancePoint {
  id: string;
  location: string;
  lightEnergy: number;
  darknessEnergy: number;
  equilibrium: number;
  creatorId: string;
  createdAt: Date;
  lastUpdated: Date;
  stability: string;
  realms: string[];
  adjustments?: any[];
}
