import { Component, OnInit} from 'angular2/core';
import { Router } from 'angular2/router';
import {RouteParams} from 'angular2/router';
import { Day, Match } from './objects';
import {FirebaseService} from './firebase.service';

@Component({
  selector: 'day',
  templateUrl: 'app/day.component.html',
  styleUrls:  ['app/day.component.css'],
})


export class DayComponent implements OnInit {
  day : Day;
  team1 : string[];
  team2 : string[];

  constructor(
    private _firebaseService: FirebaseService,
    private _router: Router,
    private _routeParams: RouteParams
  )
  {
  }

 ngOnInit() {
    this._firebaseService.getCurrentDay().then(day => this.day = day);
 }

  createTeams() {
     var players = this.day.players;
     // put all player names in team 1
     this.team1 = this.shuffle(players);
     // pull half of them to team 2
     this.team2 = this.team1.splice(0,this.team1.length/2)
  }

  startMatch(){
    var match : Match =
    {
      date: this.day.date,
      team1: this.team1,
      team2: this.team2,
      goals: []
    };

    this._firebaseService.addMatch(match);
    this._router.navigate(['Match']);
  }

  shuffle(o) {
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
  }
}
