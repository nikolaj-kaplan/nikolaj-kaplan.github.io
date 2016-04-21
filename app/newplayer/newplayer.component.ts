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


export class NewPlayerComponent {
}