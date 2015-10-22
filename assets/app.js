var gwi;
(function (gwi) {
    gwi.app = angular.module('gwi', [
        'ngRoute', 'ngAnimate', 'angular-json-tree'
    ]).config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when('/', {
                controller: 'gwi.MainController',
                templateUrl: 'views/main.html',
                controllerAs: 'page'
            })
                .when('/orders/:customerId', {
                controller: 'gwi.OrdersController',
                templateUrl: 'views/orders.html',
                controllerAs: 'page'
            });
        }]);
})(gwi || (gwi = {}));

var gwi;
(function (gwi) {
    'use strict';
    var MainController = (function () {
        function MainController() {
            this.tree = {
                test: 'hi',
                nested: {
                    items: [
                        {
                            test: 'work'
                        },
                        {
                            test: 'well'
                        },
                        {
                            test: 'too'
                        }
                    ]
                }
            };
        }
        MainController.$inject = [];
        return MainController;
    })();
    gwi.app.controller('gwi.MainController', MainController);
})(gwi || (gwi = {}));

//# sourceMappingURL=app.js.map
