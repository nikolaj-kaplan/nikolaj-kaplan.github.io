import { Injectable } from 'angular2/core';
import { Day, Match } from '../objects';

@Injectable()
export class FirebaseService {
  currentTeams: any;
  baserUrl = "https://multihockey.firebaseio.com/";
  club: string;

  currentDay: Day;
  currentMatch: Match;
  currentMatchKey: string;

  allMatches: Match[]

  constructor() {
    this.club = "FBSMulti";
  }

  getPlayersRef(){
    return new Firebase(this.baserUrl + this.club + "/players");
  }
  getDaysRef(){};
  getMatchRootRef(){
    return new Firebase(this.baserUrl + this.club + "/matches");
  };


  getAllPlayers() {
    return new Promise<string[]>(resolve =>
      this.getPlayersRef().once("value", players => {
        return resolve(players.val());
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
    this.currentMatch = match;
    var x = this.getMatchRootRef().push(match);
    this.currentMatchKey = x.key(); // save key to add goals later
    this.currentTeams = {
      team1: match.team1,
      team2: match.team2,
    };
  }

  updateMatch(match: Match) {
    var matchRef = this.getMatchRootRef().child(this.currentMatchKey);
    matchRef.update(match);
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