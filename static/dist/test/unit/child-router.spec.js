define(["require", "exports", "../../src/child-router"], function (require, exports, child_router_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class RouterStub {
        configure(handler) {
            handler(this);
        }
        map(routes) {
            this.routes = routes;
        }
    }
    describe('the Child Router module', () => {
        var sut, mockedRouter;
        beforeEach(() => {
            mockedRouter = new RouterStub();
            sut = new child_router_1.ChildRouter();
            sut.configureRouter(mockedRouter, mockedRouter);
        });
        it('contains a router property', () => {
            expect(sut.router).toBeDefined();
        });
        it('configures the heading', () => {
            expect(sut.heading).toEqual('Child Router');
        });
        it('should have a welcome route', () => {
            expect(sut.router.routes).toContain({ route: ['', 'welcome'], name: 'welcome', moduleId: 'welcome', nav: true, title: 'Welcome' });
        });
        it('should have a users route', () => {
            expect(sut.router.routes).toContain({ route: 'users', name: 'users', moduleId: 'users', nav: true, title: 'Github Users' });
        });
        it('should have a child router route', () => {
            expect(sut.router.routes).toContain({ route: 'child-router', name: 'child-router', moduleId: 'child-router', nav: true, title: 'Child Router' });
        });
    });
});
//# sourceMappingURL=child-router.spec.js.map