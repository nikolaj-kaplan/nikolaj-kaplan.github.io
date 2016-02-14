import { Component, OnInit} from 'angular2/core';
import { Router } from 'angular2/router';
import {RouteParams} from 'angular2/router';
import { Day, Match } from './objects';
import {FirebaseService} from './firebase.service';

@Component({
  selector: 'match',
  templateUrl: 'app/match.component.html',
  styleUrls:  ['app/match.component.css'],
})


export class MatchComponent implements OnInit {
  match : Match;
  team1Score : number;
  team2Score : number;
  currentTeam : string[];
  overlay : boolean;

  constructor(
    private _firebaseService: FirebaseService,
    private _router: Router,
    private _routeParams: RouteParams
  )
  {
    this.team1Score = 0;
    this.team2Score = 0;
    this.overlay = false;
  }

 ngOnInit() {
   this._firebaseService.getCurrentMatch().then(this.setMatch);
 }

 setMatch(match: Match) {
   this.match = match;
   match.goals.forEach(player => {
     this.updateScore(player);
   });
 }

showOverlay(team : number){
  if(team === 1){
    this.currentTeam = this.match.team1;
  } else {
    this.currentTeam = this.match.team2;
  }
  this.overlay = true;
}

addGoal(player){
   this.overlay = false;
   this.updateScore(player);
   this.match.goals.push(player);
   this._firebaseService.updateMatch(this.match);
 }

updateScore(player: string){
   if(this.match.team1.indexOf(player) > -1)
   {
     this.team1Score++;
   } else {
     this.team2Score++;
   }
 }
}
