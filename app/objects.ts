export interface Day {
  date: string;
  players: string[];
}


export class Player {
  constructor(name: string) {
    this.name = name;
    this.matches = 0;
    this.wins = 0;
    this.goals = 0;
  }
  name: string;
  matches: number;
  wins: number;
  goals: number;

  get goalsPrMatch(): number {
    if (this.matches == 0) return 0;
    return this.goals / this.matches;
  }

  get winsPercentage(): number {
    if (this.matches == 0) return 0;
    return this.wins / this.matches * 100;
  }

}

export class Match {
  date: string;
  team1: string[];
  team2: string[];
  goals: string[];

}
