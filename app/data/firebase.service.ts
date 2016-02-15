import { Injectable } from 'angular2/core';
import { Day, Match } from '../objects';

@Injectable()
export class FirebaseService {
  currentTeams: any;
  baserUrl = "https://multihockey.firebaseio.com/";
  daysRef: Firebase;
  playersRef: Firebase;
  matchRootRef: Firebase;

  currentDay: Day;
  currentMatch: Match;
  currentMatchKey: string;

  allMatches: Match[]


  constructor() {
    this.playersRef = new Firebase(this.baserUrl + "players");
    this.matchRootRef = new Firebase(this.baserUrl + "matches");
  }

  getAllPlayers() {
    return new Promise<string[]>(resolve =>
      this.playersRef.once("value", players => {
        return resolve(players.val());
      })
      );
  }

  getAllMatches() {
    return new Promise<Match[]>(resolve => {
      var ref = new Firebase("https://multihockey.firebaseio.com/matches");
      ref.once("value", result => {
        var matches: Match[] = [];
        result.forEach(x => {
          matches.push(x.val())
        })
        resolve(matches);
      })
    });
  }

  addMatch(match: Match) {
    this.currentMatch = match;
    var x = this.matchRootRef.push(match);
    this.currentMatchKey = x.key(); // save key to add goals later
    this.currentTeams = {
      team1: match.team1,
      team2: match.team2,
    };
  }

  updateMatch(match: Match) {
    var matchRef = this.matchRootRef.child(this.currentMatchKey);
    matchRef.update(match);
  }

  getCurrentMatch() {
    return new Promise<Match>(resolve =>
      this.matchRootRef.limitToLast(1).once("value", response => {
        var match: Match;
        response.forEach(x => {
          this.currentMatchKey = x.key();
          match = x.val();
        });
        if (!match.goals) {
          match.goals = []
        }
        resolve(match);
      })
      );
  }
}
