define(["require", "exports", "src/users"], function (require, exports, users_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class HttpStub {
        fetch(url) {
            return new Promise(resolve => {
                resolve({ json: () => this.items });
            });
        }
        configure(func) { }
    }
    function createHttpStub() {
        return new HttpStub();
    }
    describe('the Users module', () => {
        it('sets fetch response to users', (done) => {
            var http = createHttpStub(), sut = new users_1.Users(http), itemStubs = [1], itemFake = [2];
            http.items = itemStubs;
            sut.activate().then(() => {
                expect(sut.users).toBe(itemStubs);
                expect(sut.users).not.toBe(itemFake);
                done();
            });
        });
    });
});
//# sourceMappingURL=users.spec.js.map