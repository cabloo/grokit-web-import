/// <reference path="../services/dataType.service.ts"/>
/// <reference path="../contracts/data.type.ts"/>

module gwi {
    interface Column {
        path: string,
        type: Data.Type,
    }

    interface PageScope extends ng.IScope {
        loading: boolean,
        code: string,
    }

    class ExportModalController {
        $scope: PageScope;
        Overview: OverviewService;
        DataType: DataTypeService;
        columns: Array<Column>;

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
            setTimeout(this.loadCode.bind(this), 50);
        }

        loadCode() {
            this.Overview.getColsWithTypes()
                .then((columns: Array<Data.Column>) => {
                    this.$scope.code = "";
                    _.each(columns, (column: Data.Column) => {
                        this.$scope.code += column.name + ": " + column.type.grokitName + " (" +
                            (column.type.nullable ? 'nullable' : 'not nullable')
                        + ")\n";
                    });
                    this.$applyDeferred();
                });
        }
    }

    app.controller('gwi.ExportModalController', ExportModalController);
}
