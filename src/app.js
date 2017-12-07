define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class App {
        configureRouter(config, router) {
            config.title = 'Heren 5';
            config.map([
                { route: ['welcome'], name: 'welcome', moduleId: './welcome', nav: true, title: 'Welcome' },
                { route: ['', 'opstelling'], name: 'opstelling', moduleId: './positions', nav: true, title: 'Opstelling komende' },
                { route: 'test', redirect: 'http://www.google.com', nav: true, title: 'test' }
            ]);
            this.router = router;
        }
    }
    exports.App = App;
});
//# sourceMappingURL=app.js.map