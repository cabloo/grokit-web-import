module gwi {
    export var app = angular.module('gwi', [
        'ngRoute', 'angular-json-tree', 'treeModule'
    ]).config(['$routeProvider', ($routeProvider) => {
        $routeProvider.when('/',
        {
            controller: 'gwi.MainController',
            templateUrl: 'views/main.html',
            controllerAs: 'page'
        })
        .when('/orders/:customerId',
        {
            controller: 'gwi.OrdersController',
            templateUrl: 'views/orders.html',
            controllerAs: 'page'
        });
    }]);
}
