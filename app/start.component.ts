import { Component, OnInit} from 'angular2/core';
import { Router } from 'angular2/router';
import {RouteParams} from 'angular2/router';
import { Day } from './objects';
import {FirebaseService} from './firebase.service';

declare var Firebase: any;

@Component({
  selector: 'start',
  templateUrl: 'app/start.component.html',
  styleUrls:  ['app/start.component.css'],
})


export class StartComponent implements OnInit {
  players : any[];

  constructor(
    private _firebaseService: FirebaseService,
    private _router: Router,
    private _routeParams: RouteParams
  )
  {
  }

 ngOnInit() {
   this._firebaseService.getAllPlayers()
   .then(players => this.players = players.map(player => ({name:player, selected: false})));
 }

   createDay() {
     var players = this.players.filter(player => player.selected).map(player => player.name);
     var day: Day = {date: new Date().toDateString(), players: players};
     this._firebaseService.createDay(day);
     this._router.navigate(['Day']);
  }
}
