import { Component, OnInit} from 'angular2/core';
import { Router } from 'angular2/router';
import {RouteParams} from 'angular2/router';
import { Match, Player} from '../objects';
import {FirebaseService} from '../data/firebase.service';

declare var Firebase: any;
declare var Enumerable: any;

@Component({
  selector: 'stat',
  templateUrl: 'app/stat/stat.component.html',
  styleUrls: ['app/stat/stat.component.css'],
})



export class StatComponent implements OnInit {
  players: Player[]
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
        this.players = players.map(p => {
          return new Player(p);
        })
        this.calculateStats();
        this.players = Enumerable.From(this.players).OrderBy(p => - ((p.winsPercentage * 100) + p.goalsPrMatch)).ToArray();
      })

    });
  }

  calculateStats() {
    // calculate wins
    var winnerNames = []
    this.matches.forEach(m => {
      winnerNames = winnerNames.concat(this.getWinnerNames(m));
    });

    var winnerCount = Enumerable.From(winnerNames).GroupBy(winnerNames => winnerNames).Select(group => ({name: group.Key(), wins: group.source.length}));
    this.players.forEach(p => {
      var winsObject = winnerCount.FirstOrDefault(undefined, x => x.name === p.name);
      if(winsObject) {
        p.wins = winsObject.wins;
      }
    });

    //calculate goals
    var goalCount =Enumerable.From(this.matches).SelectMany(x => x.goals).GroupBy(name => name).Select(group => ({name: group.Key(), goals: group.source.length}));
    this.players.forEach(p => {
      var goalsObject = goalCount.FirstOrDefault(undefined, x => x.name === p.name);
      if(goalsObject) {
        p.goals = goalsObject.goals;
      }
    });

    //calculate matches
    this.matches.forEach(m => {
      var team1AndTeam2 = m.team1.concat(m.team2);
      this.players.forEach(p => {
        if(team1AndTeam2.indexOf(p.name) > -1) p.matches++;
      })
    });
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

  back() {
    this._router.navigate(['Day']);
  }
}
