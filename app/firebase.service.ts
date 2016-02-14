import { Injectable } from 'angular2/core';
import { Day, Match } from './objects';

@Injectable()
export class FirebaseService {
  baserUrl = "https://multihockey.firebaseio.com/";
  daysRef: Firebase;
  playersRef: Firebase;
  matchRootRef: Firebase;

  currentDay: Day;
  currentMatch: Match;
  currentMatchKey: string;


  constructor(){
    this.daysRef = new Firebase(this.baserUrl + "days");
    this.playersRef = new Firebase(this.baserUrl + "players");
    this.matchRootRef = new Firebase(this.baserUrl + "matches");
    this.daysRef.on('value', snapshot => console.log(snapshot));
  }

  createDay(day:Day) {
    var x = this.daysRef.push(day);
    this.currentDay = day; //TODO: add id to day
  }

  getCurrentDay(){
    return new Promise<Day>(resolve =>
      this.daysRef.limitToLast(1).once("value", response => {
          var day;
          response.forEach(x => {
            day = x.val();
          });
          resolve(day);
        }
      )
    );
  }

  getAllPlayers() {
    return new Promise<string[]>(resolve =>
      this.playersRef.once("value", players => {
        return resolve(players.val());
      })
    );
  }

  addMatch(match : Match){
    this.currentMatch = match;
    var x = this.matchRootRef.push(match);
    this.currentMatchKey = x.key(); // save key to add goals later
  }

  updateMatch(match: Match){
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
        if(!match.goals) {
          match.goals = []
        }
        resolve(match);
      })
    );
  }
}
