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

        constructor(_root: Object) {
            this._root = _root;
        }

        setCurrentRoot(name: string) {
            this._curr = <Array<Object>>
                (name == "" ? this._root : _.get(this._root, name));
        }
    }

    export class OverviewService {
        _tree: Tree;
        $scope: ng.IScope;
        $modal: Modal;
        Import: gwi.ImportService;
        editing: string;

        get root(): Object {
            return this._tree.root;
        }

        get current(): Array<Object> {
            return this._tree.current;
        }

        get tree(): Tree {
            return this._tree;
        }

        static $inject = ['$rootScope', '$uibModal', 'gwi.ImportService'];
        constructor($scope: ng.IScope, $modal: Modal, Import: gwi.ImportService) {
            this.$scope = $scope;
            this.$modal = $modal;
            this.Import = Import;
            this.editing = "";
            this.importLatest();
        }

        importLatest() {
            this._tree = new Tree(this.Import.object);
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
