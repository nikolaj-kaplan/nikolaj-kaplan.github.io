import { Component, OnInit} from 'angular2/core';
import { Router } from 'angular2/router';
import {RouteParams} from 'angular2/router';
import { Day, Match } from '../objects';
import {FirebaseService} from '../data/firebase.service';


@Component({
  selector: 'match',
  templateUrl: 'app/match/match.component.html',
  styleUrls: ['app/match/match.component.css']
})


export class MatchComponent implements OnInit {
  match: Match;
  team1Score: number;
  team2Score: number;
  currentTeam: string[];
  overlay: boolean;

  constructor(
    private _firebaseService: FirebaseService,
    private _router: Router,
    private _routeParams: RouteParams
    ) {
    this.team1Score = 0;
    this.team2Score = 0;
    this.overlay = false;
  }

  ngOnInit() {
    var promise = this._firebaseService.getCurrentMatch();
    promise.then(match => this.match = match)
      .then(() => this.countGoals());
    return promise;
  }

  countGoals() {
    this.match.goals.forEach(player => this.updateScore(player));
  }

  getScore(player: string) : number{
    return this.match.goals.filter(p => p === player).length;
  }

  showOverlay(team: number) {
    if (team === 1) {
      this.currentTeam = this.match.team1;
    } else {
      this.currentTeam = this.match.team2;
    }
    this.overlay = true;
  }

  addGoal(player) {
    this.overlay = false;
    this.updateScore(player);
    this.match.goals.push(player);
    this._firebaseService.updateMatch(this.match);
  }

  removeLastGoal(){
    this.match.goals.splice(this.match.goals.length - 1, 1);
    this.team1Score = 0;
    this.team2Score = 0;
    this.match.goals.forEach(player => this.updateScore(player));
    this._firebaseService.updateMatch(this.match);
  }

  updateScore(player: string) {
    if (this.match.team1.indexOf(player) > -1) {
      this.team1Score++;
    } else {
      this.team2Score++;
    }
  }

  newMatch(){
    this._router.navigate(['Day']);
  }
}
