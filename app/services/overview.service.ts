/// <reference path="../services/import.service.ts"/>

module gwi {
    interface ExportModalScope extends ng.IScope {
        code: string
    }

    interface Modal {
        open: Function
    }

    class Tree {
        _root: Object;
        _curr: Array<Object>;

        get current(): Array<Object> {
            return this._curr;
        }

        set root(tree: Object) {
            this._root = tree;
            this._curr = _.isArray(this._root) ? <Array<Object>>this._root : [];
        }

        get root(): Object {
            return this._root;
        }

        setCurrentRoot(name: string) {
            this._curr = <Array<Object>>
                (name == "" ? this._root : _.get(this._root, name));
        }
    }

    export class OverviewService {
        tree: Tree;
        $scope: ng.IScope;
        $modal: Modal;
        Import: gwi.ImportService;
        editing: string;

        get root(): Object {
            return this.tree.root;
        }

        get current(): Array<Object> {
            return this.tree.current;
        }

        static $inject = ['$scope', '$uibModal', 'gwi.ImportService'];
        constructor($scope: ng.IScope, $modal: Modal, Import: gwi.ImportService) {
            this.$scope = $scope;
            this.Import = Import;
            this.tree = new Tree;
            this.tree.root = this.Import.object;
            this.editing = "";
        }

        setCurrentRoot(name: string) {
            this.tree.setCurrentRoot(name);
        }

        editColumn(val: string) {
            this.editing = val;
            this.$modal.open({
                controller: 'gwi.ViewColumnModalController',
                templateUrl: 'views/edit-column.html',
            });
        }

        exportCode() {
            var scope = <ExportModalScope>this.$scope.$new();
            scope.code = "Sample R Export code";
            this.$modal.open({
                templateUrl: 'views/modal-export-code.html',
                scope: scope
            });
        }

        colBeingEdited(): string {
            return this.editing;
        }
    }

    app.service('gwi.OverviewService', OverviewService);
}
