'use strict';

var GulpConfig = (function () {
    function gulpConfig() {
        var APP = './app';
        var LESS = './less';
        var PUBLIC = './public';
        var ASSETS = PUBLIC + '/assets';

        this.source = PUBLIC + '/';
        this.sourceApp = APP + '/';

        this.tsOutputPath = ASSETS;
        this.allJavaScript = [ASSETS + '/**/*.js'];
        this.allTypeScript = APP + '/**/*.ts';

        var comp = this.sourceApp + "components/";
        var mod = this.sourceApp + "modules/";

        this.JS = {
            vendor: [
                comp + 'jquery/dist/jquery.min.js',
                comp + 'bootstrap/js/bootstrap.min.js',
                comp + 'angular/angular.min.js',
                comp + 'angular-json-tree/build/angular-json-tree.min.js',
                comp + 'angular-bootstrap/ui-bootstrap.min.js',
                comp + 'angular-bootstrap/ui-bootstrap-tpls.min.js',
                comp + 'angular-route/angular-route.min.js',
                comp + 'lodash/lodash.min.js',
                mod + 'tree/service.js',
                mod + 'tree/factory.js',
                mod + 'tree/treeModule.js',
                mod + 'contextMenu/contextMenuModule.js'
            ]
        };

        this.CSS = {
            output: ASSETS,
            input: [
                LESS + '/main.less'
            ],
            main_file: 'style.css',
            vendor: [
                comp + 'bootstrap/dist/css/bootstrap.min.css',
                comp + 'bootstrap/dist/css/bootstrap-theme.min.css',
                comp + 'angular-json-tree/build/angular-json-tree.css'
            ],
            vendor_file: 'vendor.css'
        };

        this.typings = './typings/';
        this.libraryTypeScriptDefinitions = './typings/**/*.ts';
    }
    return gulpConfig;
})();
module.exports = GulpConfig;
