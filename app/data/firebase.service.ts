import { Injectable } from 'angular2/core';
import { Day, Match } from '../objects';

@Injectable()
export class FirebaseService {
    baserUrl = "https://multihockey.firebaseio.com/";
    club: string;
    weeks: number = 10;


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
                    var match: Match = new Match()
                    match.eat(x.val());
                    matches.push(match);
                })
                var date = new Date(new Date().getTime() - 1000*60*60*24*7*this.weeks);
                matches = matches.filter(m => new Date(m.date) > date);
                resolve(matches);
            })
        });
    }

    addMatch(match: Match) {
        var this1 = this;
        var promise = new Promise(resolve => {
            var x = this1.getMatchRootRef().push(match, () => {
                // save key to add goals later
                match.key = x.key();
                x.child("key").set(x.key(), () => {
                    resolve();
                });
            });
        });
        return promise;
    }

    addPlayer(name: string, mail: string) {
        if(mail === undefined){
            mail = "";
        }
        this.getPlayersRef().push({ mail: mail, name: name });
    }

    updateMatchGoals(match: Match) {
        var matchRef = this.getMatchRootRef().child(match.key);
        matchRef.child("goals").set(match.goals);
    }

    addCallback(match: Match, callback: any) {
        var matchRef = this.getMatchRootRef().child(match.key);
        matchRef.on("value", callback);
    }

    getCurrentMatch() {
        var this1 = this;
        return new Promise<Match>(resolve =>
            this1.getMatchRootRef().limitToLast(1).once("value", response => {
                var match = new Match();
                var firebaseHadAMatch = false;
                response.forEach(x => {
                    match.eat(x.val());
                    firebaseHadAMatch = true;
                });
                if (firebaseHadAMatch) {
                    resolve(match);
                } else {
                    this1.addMatch(match).then(() => resolve(match));
                }
            })
        );
    }

    deleteCurrentMatch() {
        var this1 = this;
        return new Promise<any>(resolve => {
            this1.getCurrentMatch().then(match => {
                this1.getMatchRootRef().child(match.key).remove(() => {
                    resolve();
                });
            });
        });
    }

    updateCurrentMatch(updatedMatch: Match) {
        var this1 = this;
        return new Promise<any>(resolve => {
            this1.getMatchRootRef().child(updatedMatch.key).update(updatedMatch, () => {
                resolve();
            });
        });
    }
}
