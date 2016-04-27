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
    swapped: boolean;

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
}
