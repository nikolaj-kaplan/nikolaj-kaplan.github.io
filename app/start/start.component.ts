import { Component, OnInit} from 'angular2/core';
import { Router } from 'angular2/router';
import {RouteParams} from 'angular2/router';
import { Match } from '../objects';
import {FirebaseService} from '../data/firebase.service';

declare var Firebase: any;

@Component({
  selector: 'start',
  templateUrl: 'app/start/start.component.html',
  styleUrls: ['app/start/start.component.css'],
})

export class StartComponent implements OnInit {
  players: string[]
  goalsPrPlayer: any;
  matches: Match[];

  constructor(
    private _firebaseService: FirebaseService,
    private _router: Router,
    private _routeParams: RouteParams
    ) {
  }

  ngOnInit() {
    this._firebaseService.getAllMatches()
      .then(matches => {
      this.matches = matches;
      this._firebaseService.getAllPlayers()
        .then(players => {
        this.players = players
        this.calculateStats();
      })

    });
  }

  calculateStats() {
    var goalsArrays = this.matches.map(match => match.goals ? match.goals : []);
    var allGoals = [].concat.apply([], goalsArrays);
    this.goalsPrPlayer = {};
    this.players.forEach(player => this.goalsPrPlayer[player] = allGoals.filter(p => p === player).length);
  }
}
