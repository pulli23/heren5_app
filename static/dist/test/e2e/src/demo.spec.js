define(["require", "exports", "./welcome.po", "./skeleton.po", "aurelia-protractor-plugin/protractor"], function (require, exports, welcome_po_1, skeleton_po_1, protractor_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    describe('aurelia skeleton app', function () {
        let po_welcome;
        let po_skeleton;
        beforeEach(() => {
            po_skeleton = new skeleton_po_1.PageObject_Skeleton();
            po_welcome = new welcome_po_1.PageObject_Welcome();
            protractor_1.browser.loadAndWaitForAureliaPage("http://localhost:9000");
        });
        it('should load the page and display the initial page title', () => {
            expect(po_skeleton.getCurrentPageTitle()).toBe('Welcome | Aurelia');
        });
        it('should display greeting', () => {
            expect(po_welcome.getGreeting()).toBe('Welcome to the Aurelia Navigation App!');
        });
        it('should automatically write down the fullname', () => {
            po_welcome.setFirstname('Rob');
            po_welcome.setLastname('Eisenberg');
            protractor_1.browser.sleep(200);
            expect(po_welcome.getFullname()).toBe('ROB EISENBERG');
        });
        it('should show alert message when clicking submit button', () => {
            expect(po_welcome.openAlertDialog()).toBe(true);
        });
        it('should navigate to users page', () => {
            po_skeleton.navigateTo('#/users');
            expect(po_skeleton.getCurrentPageTitle()).toBe('Github Users | Aurelia');
        });
    });
});
//# sourceMappingURL=demo.spec.js.map