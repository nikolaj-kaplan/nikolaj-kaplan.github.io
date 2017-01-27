import { Component, OnInit, } from 'angular2/core';
import { Router } from 'angular2/router';
import {RouteParams} from 'angular2/router';
import { Match } from '../objects';
import {FirebaseService} from '../data/firebase.service';

@Component({
    selector: 'login',
    templateUrl: 'app/login/login.component.html',
    styleUrls: ['app/login/login.component.css'],
})


export class LoginComponent implements OnInit {

    constructor(
        private _firebaseService: FirebaseService,
        private _router: Router,
        private _routeParams: RouteParams
    ) {
    }

    ref: any;

    ngOnInit() {
        this.ref = new Firebase("https://multihockey.firebaseio.com");
        this.ref.onAuth(authData => this.authDataCallback(authData, this._firebaseService));
    }

    // Create a callback which logs the current auth state
    authDataCallback(authData, firebaseService: FirebaseService) {
        var this1 = this;
        if (authData) {
            console.log("User " + authData.uid + " is logged in with " + authData.provider);
            localStorage.setItem("user", authData.facebook.email);
            var mail = authData.facebook.email;
            var imageUrl = authData.facebook.cachedUserProfile.picture.data.url;
            firebaseService.selectClub(mail).then(success => {
                if (!success) {
                    alert("Vi kender dig ikke");
                } else {
                    this1._router.navigate(["Day"]);
                }
            });
        }
    }

    login() {
        debugger;
        //skip login:
        localStorage.setItem("user", "nikolaj.kaplan@gmail.com");
        this._router.navigate(["Day"]);
/*

        this.ref.authWithOAuthPopup("facebook", this.authDataCallback, {
            scope: "email"
        });*/
    }
}
