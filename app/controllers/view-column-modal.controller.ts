/// <reference path="../services/dataType.service.ts"/>

interface PageScope extends ng.IScope {
    loading: boolean,
}

module gwi {
    class ViewColumnModalController {
        $scope: PageScope;
        Overview: OverviewService;
        DataType: DataTypeService;

        static $inject = ['$scope', 'gwi.OverviewService', 'gwi.DataTypeService'];
        constructor($scope: PageScope, Overview: OverviewService, DataType: DataTypeService) {
            this.$scope = $scope;
            this.Overview = Overview;
            this.DataType = DataType;
            this.setupScope();
        }

        setupScope() {
            this.$scope.loading = true;
            var editing = this.Overview.colBeingEdited();
            setTimeout(() => {
                console.log(this.DataType.getTypes(this.Overview.current, [editing]));
            }, 0);
        }
    }

    app.controller('gwi.ViewColumnModalController', ViewColumnModalController);
}
