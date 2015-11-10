'use strict';

interface PageScope extends ng.IScope {
    pasted: string,
    submitPasted: Function
}

module gwi {
    class ImportController {
        $scope: PageScope;
        $location: any;
        Import: gwi.ImportService;

        static $inject = ['$scope', '$location', 'gwi.ImportService'];
        constructor($scope: PageScope, $location, Import: gwi.ImportService) {
            this.$scope = $scope;
            this.$location = $location;
            this.Import = Import;

            this.setupScope();
        }

        setupScope() {
            this.$scope.pasted = "";
            this.$scope.submitPasted = this.submitPasted.bind(this);
        }

        submitPasted() {
            this.Import.object = JSON.parse(this.$scope.pasted);
            this.$location.path('/');
        }

    }

    app.controller('gwi.ImportController', ImportController);
}
