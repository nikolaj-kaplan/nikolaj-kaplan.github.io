import { Component } from 'angular2/core';
import { RouteConfig, ROUTER_DIRECTIVES, ROUTER_PROVIDERS } from 'angular2/router';
import { FirebaseService } from './data/firebase.service';
import { StartComponent } from './start/start.component';
import { DayComponent } from './day/day.component';
import { MatchComponent } from './match/match.component';

@Component({
  selector: 'my-app',
  template: `
    <router-outlet></router-outlet>
  `,
  styleUrls: ['app/app.component.css'],
  directives: [ROUTER_DIRECTIVES],
  providers: [
    ROUTER_PROVIDERS,
    FirebaseService
  ]
})

@RouteConfig([
  {
    path: '/start',
    name: 'Start',
    component: StartComponent
  },
  {
    path: '/',
    name: 'Day',
    component: DayComponent,
    useAsDefault: true
  },
  {
    path: '/match',
    name: 'Match',
    component: MatchComponent,
  }
])

export class AppComponent {
  title = 'Tour of Heroes';
}
