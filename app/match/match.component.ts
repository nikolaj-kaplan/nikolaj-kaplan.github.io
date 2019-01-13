import { Component, OnInit} from 'angular2/core';
import { Router } from 'angular2/router';
import {RouteParams} from 'angular2/router';
import { Day, Match } from '../objects';
import {FirebaseService} from '../data/firebase.service';
import { StaticKeys } from 'angular2/src/core/linker/element';

declare var Enumerable: any;


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
    swapped: boolean;
    stateObject: any = {};

    get teamL() {
        if (!this.match) return [];
        if (this.swapped) return this.match.team2;
        else return this.match.team1
    }

    get teamR() {
        if (!this.match) return [];
        if (this.swapped) return this.match.team1;
        else return this.match.team2
    }

    constructor(
        private _firebaseService: FirebaseService,
        private _router: Router,
        private _routeParams: RouteParams
    ) {
        this.swapped = false;
    }

    ngOnInit() {
        if (!this._firebaseService.club) {
            this._router.navigate(["Login"]);
            return;
        }

        var promise = this._firebaseService.getCurrentMatch();
        var this1 = this;
        promise.then(match => {
            this1.match = match;
            this1.countGoals();
            this1._firebaseService.addCallback(this1.match, matchRef => {
                var callbackMatch = matchRef.val();
                if (callbackMatch) {
                    match.eat(callbackMatch);
                    this1.countGoals();
                }
            })
        });

        return promise;
    }

    countGoals() {
        this.teamLScore = 0;
        this.teamRScore = 0;
        if (this.match) {
            this.match.goals.forEach(player => this.updateScore(player));
        }
    }

    getScore(player: string): number {
        if (!this.match) return 0;
        return this.match.goals.filter(p => p === player).length;
    }

    addGoal(player) {
        this.match.goals.push(player);
        this._firebaseService.updateMatchGoals(this.match);

        var team = this.match.team1.indexOf(player) >= 0 ? this.match.team1 : this.match.team2;
        this.stateObject.state = "addingAssist";
        this.stateObject.team = team;
        this.stateObject.goalScorer = player;
        this.stateObject.assistPlayers = Enumerable.From(this.stateObject.team).Where(x => x != player).ToArray();
        this.stateObject.countdown = 10;
        this.doCountdown();
    }

    doCountdown(){
        setTimeout(() => {
            if(!this.stateObject.countdown || this.stateObject.countdown < 0){
                return;
            }
            this.stateObject.countdown--;
            if(this.stateObject.countdown == 0) {
                this.cancel();
                return;
            }
            this.doCountdown();
        }, 1000);
    }

    removeLastGoal() {
        this.match.goals.splice(this.match.goals.length - 1, 1);
        this._firebaseService.updateMatchGoals(this.match);
    }

    updateScore(player: string) {
        if (this.match.team1.indexOf(player) > -1) {
            if (!this.swapped) this.teamLScore++;
            else this.teamRScore++;
        } else {
            if (this.swapped) this.teamLScore++;
            else this.teamRScore++;
        }
    }

    newMatch() {
        this._router.navigate(['Day']);
    }

    swap() {
        this.swapped = !this.swapped;
        this.countGoals();
    }

    deleteGame() {
        if (confirm("Vil du slette denne kamp?")) {
            if (confirm("Er du helt sikker??")) {
                this._firebaseService.deleteCurrentMatch().then(() => this._router.navigate(['Day']));
            }
        }
    }

    startAddGoal(team) {
        this.stateObject.state = "addingScorer";
        this.stateObject.team = team;
    }

    cancel() {
        this.stateObject = {};
    }

    addAssist(player){
        this.match.assists.push(player);
        this._firebaseService.updateMatchAssists(this.match);
        this.stateObject.countdown = -1;
        this.cancel();
    }

    stopCounting(){
        this.stateObject.countdown = -1;
    }
}
