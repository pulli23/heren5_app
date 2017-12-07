define(["require", "exports", "aurelia-protractor-plugin/protractor"], function (require, exports, protractor_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class PageObject_Welcome {
        getGreeting() {
            return protractor_1.element(protractor_1.by.tagName('h2')).getText();
        }
        setFirstname(value) {
            let firstName = protractor_1.element(protractor_1.by.valueBind('firstName'));
            return firstName.clear().then(() => firstName.sendKeys(value));
        }
        setLastname(value) {
            let lastName = protractor_1.element(protractor_1.by.valueBind('lastName'));
            return lastName.clear().then(() => lastName.sendKeys(value));
        }
        getFullname() {
            return protractor_1.element(protractor_1.by.css('.help-block')).getText();
        }
        pressSubmitButton() {
            return protractor_1.element(protractor_1.by.css('button[type="submit"]')).click();
        }
        openAlertDialog() {
            return protractor_1.browser.wait(() => {
                this.pressSubmitButton();
                return protractor_1.browser.switchTo().alert().then(function (alert) { alert.accept(); return true; }, function () { return false; });
            });
        }
    }
    exports.PageObject_Welcome = PageObject_Welcome;
});
//# sourceMappingURL=welcome.po.js.map