declare var Enumerable: any;

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
    assists: number;
    winningGoals: number;

    get goalsPrMatch(): string {
        if (this.matches == 0) return '0';
        return (this.goals / this.matches).toFixed(2);
    }

    get assistsPrMatch(): string {
        if (this.matches == 0) return '0';
        return (this.assists / this.matches).toFixed(2);
    }

    get winsPercentageString(): string {
        return this.winsPercentage.toFixed(0);
    }

    get winsPercentage(): number {
        if (this.matches == 0) return 0;
        return (this.wins / this.matches * 100);
    }
}

export class Match {
    date: string;
    team1: string[];
    team2: string[];
    goals: string[];
    assists: string[];
    key: string; //firebase key

    constructor() {
        this.date = new Date().toDateString();
        this.key = "";
        this.ensureNoUndefined();
    }

    eat(match: any) {
        this.date = match.date
        this.team1 = match.team1;
        this.team2 = match.team2;
        this.goals = match.goals;
        this.assists = match.assists;
        this.key = match.key;
        this.ensureNoUndefined();
    }


    ensureNoUndefined() {
        if (!this.team1) {
            this.team1 = [];
        }
        if (!this.team2) {
            this.team2 = [];
        }
        if (!this.goals) {
            this.goals = [];
        }
        if (!this.assists) {
            this.assists = [];
        }
    }

}

export class Stats {
    matches: Match[];
    players: Player[];
    date: string;

    getPlayers(): Player[] {
        return this.transform(this.players);
    }

    constructor(matches: Match[], players: string[]) {
        this.matches = matches;
        this.players = players.map(p => new Player(p));

        var dates = Enumerable.From(this.matches).GroupBy(match => match.date).ToArray();
        if (dates.length == 1) {
            this.date = dates[0].Key();
        }
        this.init();
    }

    init() {
        // calculate wins
        var winnerNames = []
        this.matches.forEach(m => {
            winnerNames = winnerNames.concat(this.getWinnerNames(m));
        });

        var winnerCount = Enumerable.From(winnerNames).GroupBy(winnerNames => winnerNames).Select(group => ({ name: group.Key(), wins: group.source.length }));

        this.players.forEach(p => {
            var winsObject = winnerCount.FirstOrDefault(undefined, x => x.name === p.name);
            if (winsObject) {
                p.wins = winsObject.wins;
            }
        });

        //calculate goals
        var goalCount = Enumerable.From(this.matches).SelectMany(x => x.goals).GroupBy(name => name).Select(group => ({ name: group.Key(), goals: group.source.length }));
        var assistsCount = Enumerable.From(this.matches).SelectMany(x => x.assists).GroupBy(name => name).Select(group => ({ name: group.Key(), assists: group.source.length }));
        this.players.forEach(p => {
            var goalsObject = goalCount.FirstOrDefault(undefined, x => x.name === p.name);
            p.goals = goalsObject ? goalsObject.goals : 0;
            var assistsObject = assistsCount.FirstOrDefault(undefined, x => x.name === p.name);

            p.assists = assistsObject ? assistsObject.assists : 0;
            p.winningGoals = Enumerable.From(this.matches).Where(m => m.goals[m.goals.length - 1] == p.name).ToArray().length;
        });

        //calculate matches
        this.matches.forEach(m => {
            var team1AndTeam2 = m.team1.concat(m.team2);
            this.players.forEach(p => {
                if (team1AndTeam2.indexOf(p.name) > -1) p.matches++;
            })
        });
        this.players = Enumerable
            .From(this.players)
            .Where(p => p.matches > 0)
            .Where(p => this.include(p))
            .OrderBy(p => - (p.winsPercentage * 100))
            .ToArray();
    }

    include(p: any) : boolean{
        return true;
    }

    getWinnerNames(match: Match) {
        if (!match.goals) return [];
        var team1Score = 0;
        var team2Score = 0;
        match.goals.forEach(name => {
            if (match.team1.indexOf(name) > -1) team1Score++;
            else team2Score++;
        });

        if (team1Score == team2Score) return [];
        if (team1Score > team2Score) return match.team1;
        else return match.team2;
    }

    transform(value: any): any {
        return Object.keys(value).map(key => value[key]);
    }
}
