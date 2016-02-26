import { Component, OnInit, } from 'angular2/core';
import { Router } from 'angular2/router';
import {RouteParams} from 'angular2/router';
import { Match } from '../objects';
import {FirebaseService} from '../data/firebase.service';

@Component({
  selector: 'day',
  templateUrl: 'app/day/day.component.html',
  styleUrls: ['app/day/day.component.css'],
})


export class DayComponent implements OnInit {
  team1: string[];
  team2: string[];
  inactivePlayers: string[] = [];
  allPlayers: string[];
  firebaseService: FirebaseService;
  mixing : boolean;

  constructor(
    private _firebaseService: FirebaseService,
    private _router: Router,
    private _routeParams: RouteParams
    ) {
      this.mixing = false;
  }

  ngOnInit() {
    this.firebaseService = this._firebaseService;
    this.firebaseService.club = "FBSMulti"; //default club
    this.internalInit();
  }

  internalInit() {
    // setup the teams. Either based on last match (if it is today) or random
    this._firebaseService.getAllPlayers().then(players => {
      this.allPlayers = players;
      this._firebaseService.getCurrentMatch().then(currentMatch => {
        if (currentMatch.date === new Date().toDateString()) {
          //we already have a match today. lets filter the players based on this match
          var validPlayers = currentMatch.team1.concat(currentMatch.team2);
          // fill up inactive players with the players that are NOT in the current match
          this.inactivePlayers = this.allPlayers.filter(player => validPlayers.indexOf(player) === -1);

          // set team 1 and 2 to be the same as the last match
          this.team1 = currentMatch.team1.slice();
          this.team2 = currentMatch.team2.slice();
        } else {
          this.team1 = this.allPlayers.slice();
          this.team2 = []
          this.shuffelTeams();
        }
      });
    });
  }

  switchClub($event) {
    this.firebaseService.club = $event.target.value;
    this.internalInit();
  }

  shuffelTeams() {
    this.mixing = true;
    var x = this;
    setTimeout(function(){
      var players = x.team1.concat(x.team2);
      // put all player names in team 1
      x.team1 = x.shuffle(players);
      // pull half of them to team 2
      x.team2 = x.team1.splice(0, x.team1.length / 2);
      x.mixing = false;
  }, 2000);
  }


  startMatch() {
    var match: Match =
      {
        date: new Date().toDateString(),
        team1: this.team1,
        team2: this.team2,
        goals: []
      };

    this._firebaseService.addMatch(match);
    this._router.navigate(['Match']);
  }

  continueMatch() {
    this._router.navigate(['Match']);
  }

  goToStats() {
    this._router.navigate(['Stat']);
  }


  switchTeam(player: string) {
    var i = this.team1.indexOf(player);
    if (i > -1) {
      this.team1.splice(i, 1);
      this.team2.push(player);
    } else {
      i = this.team2.indexOf(player);
      this.team2.splice(i, 1);
      this.team1.push(player);
    }
  }

  removePlayer(player: string) {
    this.removeElementFromArray(player, this.team1);
    this.removeElementFromArray(player, this.team2);
    this.inactivePlayers.push(player)
  }

  addPlayer(player: string) {
    this.team1.push(player);
    this.removeElementFromArray(player, this.inactivePlayers);
  }

  removeElementFromArray<T>(element: T, array: T[]) {
    var i = array.indexOf(element);
    if (i > -1) {
      array.splice(i, 1);
    }
  }

  shuffle(o) {
    for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
  }
}
