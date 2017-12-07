import {NavigationInstruction, Router, RouterConfiguration} from 'aurelia-router';
import {singleton} from "aurelia-dependency-injection";
import {Positions} from "./positions";


@singleton()
export class App {
    public router: Router;
    public positionVM: Positions;

    public constructor() {
         //this.positionVM = new Positions();
    }

    public configureRouter(config: RouterConfiguration, router: Router) {
        config.title = 'Heren 5';
        config.map([
            { route: [ 'welcome'], name: 'welcome', moduleId: './welcome', nav: true, title: 'Welcome'},
            { route: ['', 'position'], name: 'position', moduleId: './positions', nav: true, title: 'positions',
                settings: {data: 'blah'}},
            { route: 'test', redirect: 'http://www.google.com', nav: true, title: 'test' }
        ]);
        this.router = router;
    }
}
