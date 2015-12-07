/// <reference path="../services/dataType.service.ts"/>
/// <reference path="../contracts/data.type.ts"/>

module gwi {
    interface Column {
        path: string,
        type: Data.Type,
        code: string,
    }

    interface PageScope extends ng.IScope {
        loading: boolean,
        cols: Array<Column>,
    }

    class ExportModalController {
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

        $applyDeferred() {
            _.defer(this.$scope.$apply.bind(this.$scope));
        }

        setupScope() {
            this.$scope.loading = true;
            this.$scope.code = "Loading...";
        }

        loadCode() {
            
            this.$scope.code = "R Code goes here";
        }
    }

    app.controller('gwi.ExportModalController', ExportModalController);
}
