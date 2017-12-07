define(["require", "exports", "aurelia-protractor-plugin/protractor"], function (require, exports, protractor_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class PageObject_Skeleton {
        constructor() {
        }
        getCurrentPageTitle() {
            return protractor_1.browser.getTitle();
        }
        navigateTo(href) {
            protractor_1.element(protractor_1.by.css('a[href="' + href + '"]')).click();
            return protractor_1.browser.waitForRouterComplete();
        }
    }
    exports.PageObject_Skeleton = PageObject_Skeleton;
});
//# sourceMappingURL=skeleton.po.js.map