import { Injectable } from 'angular2/core';
import { Day, Match } from '../objects';

@Injectable()
export class FirebaseService {
    currentTeams: any;
    baserUrl = "https://multihockey.firebaseio.com/";
    club: string;

    currentDay: Day;
    currentMatchKey: string;

    constructor() {
      this.club = "FBSMulti"
    }

    selectClub(mail: string) {
        return new Promise<boolean>(resolve => {
            var clubsRef = new Firebase(this.baserUrl);
            clubsRef.once("value", clubs => {
                clubs.forEach(club => {
                    club.child("players").forEach(player => {
                        if (player.val().mail == mail) {
                            this.club = club.key();
                            return resolve(true);
                        }
                    });
                });
                return resolve(false);
            })
        });
    }

    getPlayersRef() {
        return new Firebase(this.baserUrl + this.club + "/players");
    }

    getDaysRef() { };

    getMatchRootRef() {
        return new Firebase(this.baserUrl + this.club + "/matches");
    };


    getAllPlayers() {
        return new Promise<string[]>(resolve =>
            this.getPlayersRef().once("value", players => {
                var players2 = [];
                players.forEach(p => {
                    players2.push(p.val().name);
                });
                return resolve(players2);
            })
        );
    }

    getAllMatches() {
        return new Promise<Match[]>(resolve => {
            this.getMatchRootRef().once("value", result => {
                var matches: Match[] = [];
                result.forEach(x => {
                    matches.push(x.val())
                })
                resolve(matches);
            })
        });
    }

    addMatch(match: Match) {
        var x = this.getMatchRootRef().push(match);
        this.currentMatchKey = x.key(); // save key to add goals later
        this.currentTeams = {
            team1: match.team1,
            team2: match.team2,
        };
    }
    
    addPlayer(name: string,mail: string){
        this.getPlayersRef().push({mail:mail, name:name});
    }

    updateMatchGoals(match: Match) {
        var goalsRef = this.getMatchRootRef().child(this.currentMatchKey).child("goals");
        goalsRef.set(match.goals);
    }

    addCallback(callback: any) {
        var matchRef = this.getMatchRootRef().child(this.currentMatchKey);
        matchRef.on("value", callback);
    }

    getCurrentMatch() {
        return new Promise<Match>(resolve =>
            this.getMatchRootRef().limitToLast(1).once("value", response => {
                var match: Match;
                response.forEach(x => {
                    this.currentMatchKey = x.key();
                    match = x.val();
                });
                if (!match) {
                    var match: Match = {
                        date: new Date().toDateString(),
                        team1: [],
                        team2: [],
                        goals: []
                    };
                }
                if (!match.goals) {
                    match.goals = []
                }
                resolve(match);
            })
        );
    }
}
