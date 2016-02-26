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
  teamLScore: number;
  teamRScore: number;
  currentTeam: string[];
  overlay: boolean;
  swapped: boolean;
  get teamL(){
    if(this.swapped) return this.match.team2;
    else return this.match.team1
  }

  get teamR(){
    if(this.swapped) return this.match.team1;
    else return this.match.team2
  }

  constructor(
    private _firebaseService: FirebaseService,
    private _router: Router,
    private _routeParams: RouteParams
    ) {
    this.teamLScore = 0;
    this.teamRScore = 0;
    this.overlay = false;
    this.swapped = false;
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
    if (team === 1) this.currentTeam = this.teamL;
    else this.currentTeam = this.teamR;
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
    this.teamLScore = 0;
    this.teamRScore = 0;
    this.match.goals.forEach(player => this.updateScore(player));
    this._firebaseService.updateMatch(this.match);
  }

  updateScore(player: string) {
    if (this.match.team1.indexOf(player) > -1) {
      if(!this.swapped) this.teamLScore++;
      else this.teamRScore++;
    } else {
      if(this.swapped) this.teamLScore++;
      else this.teamRScore++;
    }
  }

  newMatch(){
    this._router.navigate(['Day']);
  }

  swap(){
    this.swapped = !this.swapped;
    this.teamLScore = 0;
    this.teamRScore = 0;
    this.match.goals.forEach(player => this.updateScore(player));
  }
}
