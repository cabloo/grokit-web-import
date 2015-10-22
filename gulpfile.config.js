'use strict';
var GulpConfig = (function () {
    function gulpConfig() {
        var APP = './app',
            PUBLIC = './public',
            ASSETS = PUBLIC + '/assets';

        this.source = PUBLIC + '/';
        this.sourceApp = APP + '/';

        this.tsOutputPath = ASSETS;
        this.allJavaScript = [ASSETS + '/**/*.js'];
        this.allTypeScript = APP + '/**/*.ts';

        var comp = this.sourceApp + "components/";

        this.JS = {
            vendor: [
                comp + 'angular/angular.min.js',
                comp + 'angular-json-tree/build/angular-json-tree.min.js'
            ]
        };

        this.CSS = {
            output: ASSETS,
            vendor: [
                comp + 'angular-json-tree/build/angular-json-tree.css'
            ]
        };

        this.typings = './typings/';
        this.libraryTypeScriptDefinitions = './typings/**/*.ts';
    }
    return gulpConfig;
})();
module.exports = GulpConfig;
