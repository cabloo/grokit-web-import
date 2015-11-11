/// <reference path="../services/import.service.ts"/>

'use strict';

interface PageScope extends ng.IScope {
    pasted: string,
    submitPasted: Function
}

module gwi {
    class ImportController {
        $scope: PageScope;
        Import: gwi.ImportService;

        static $inject = ['$scope', 'gwi.ImportService'];
        constructor($scope: PageScope, Import: gwi.ImportService) {
            this.$scope = $scope;
            this.Import = Import;

            this.setupScope();
        }

        setupScope() {
            this.$scope.pasted = "";
            this.$scope.submitPasted = this.submitPasted.bind(this);
        }

        submitPasted() {
            this.Import.view(this.$scope.pasted);
        }
    }

    app.controller('gwi.ImportController', ImportController);
}
